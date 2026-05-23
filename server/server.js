const crypto = require('node:crypto');
const http = require('node:http');
const sql = require('mssql');

const PORT = Number(process.env.API_PORT || 3000);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:4200';
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24;
const sessions = new Map();
const [dbServer, dbInstanceFromServer] = (process.env.DB_SERVER || 'localhost').split('\\');

const sqlConfig = {
  server: dbServer,
  database: process.env.DB_NAME || 'Votre_Scent',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    instanceName: process.env.DB_INSTANCE || dbInstanceFromServer,
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
  },
};

if (process.env.DB_PORT) {
  sqlConfig.port = Number(process.env.DB_PORT);
}

const poolPromise = sql.connect(sqlConfig);

function sendJson(response, statusCode, body = {}) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': CORS_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  });

  response.end(statusCode === 204 ? '' : JSON.stringify(body));
}

function routeKey(method, pathname) {
  return `${method.toUpperCase()} ${pathname}`;
}

function toInt(value, fallback = null) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toNumber(value, fallback = null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function cleanString(value) {
  return String(value || '').trim();
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy(new Error('Request body is too large.'));
      }
    });

    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON body.'));
      }
    });

    request.on('error', reject);
  });
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function isValidPassword(password, savedPassword) {
  const [algorithm, salt, savedHash] = String(savedPassword || '').split('$');

  if (algorithm !== 'scrypt' || !salt || !savedHash) {
    return false;
  }

  const incomingHash = hashPassword(password, salt).split('$')[2];
  const saved = Buffer.from(savedHash, 'hex');
  const incoming = Buffer.from(incomingHash, 'hex');

  return saved.length === incoming.length && crypto.timingSafeEqual(saved, incoming);
}

function createToken(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { userId, expiresAt: Date.now() + TOKEN_TTL_MS });
  return token;
}

function getBearerToken(request) {
  const authorization = request.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');
  return scheme === 'Bearer' ? token : '';
}

async function getCurrentUser(request, requiredRole = null) {
  const token = getBearerToken(request);
  const session = sessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token);
    const error = new Error('Session expired. Please log in again.');
    error.statusCode = 401;
    throw error;
  }

  const pool = await poolPromise;
  const result = await pool
    .request()
    .input('userId', sql.Int, session.userId)
    .query(`
      SELECT
        ua.user_id,
        ua.username,
        ar.role_name,
        ast.status_name,
        ui.email,
        ui.address,
        ui.city_id,
        ui.province_id,
        ui.phone_no
      FROM dbo.user_accounts ua
      JOIN dbo.account_roles ar ON ar.role_id = ua.role_id
      JOIN dbo.account_statuses ast ON ast.status_id = ua.status_id
      LEFT JOIN dbo.user_informations ui ON ui.user_id = ua.user_id
      WHERE ua.user_id = @userId
    `);

  const user = result.recordset[0];

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  if (user.status_name !== 'Active') {
    const error = new Error('This account is not active.');
    error.statusCode = 403;
    throw error;
  }

  if (requiredRole && user.role_name !== requiredRole) {
    const error = new Error('You do not have permission to perform this action.');
    error.statusCode = 403;
    throw error;
  }

  return user;
}

function publicUser(user) {
  return {
    id: user.user_id,
    username: user.username,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || user.username,
    role: user.role_name,
    status: user.status_name,
    profile: {
      address: user.address || '',
      cityId: user.city_id || null,
      provinceId: user.province_id || null,
      phoneNo: user.phone_no || '',
    },
  };
}

async function getLookupId(table, idColumn, nameColumn, value) {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input('value', sql.VarChar(50), value)
    .query(`SELECT ${idColumn} AS id FROM dbo.${table} WHERE ${nameColumn} = @value`);
  return result.recordset[0]?.id;
}

async function ensureCart(userId, executor = null) {
  const request = executor ? new sql.Request(executor) : (await poolPromise).request();
  const existing = await request
    .input('userId', sql.Int, userId)
    .query('SELECT cart_id FROM dbo.carts WHERE user_id = @userId');

  if (existing.recordset[0]) {
    return existing.recordset[0].cart_id;
  }

  const insertRequest = executor ? new sql.Request(executor) : (await poolPromise).request();
  const inserted = await insertRequest
    .input('userId', sql.Int, userId)
    .query(`
      INSERT INTO dbo.carts (user_id)
      OUTPUT inserted.cart_id
      VALUES (@userId)
    `);

  return inserted.recordset[0].cart_id;
}

async function handleSignup(request, response) {
  const payload = await readRequestBody(request);
  const email = cleanString(payload.email).toLowerCase();
  const password = String(payload.password || '');
  const firstName = cleanString(payload.firstName);
  const lastName = cleanString(payload.lastName);
  const username = cleanString(payload.username) || email;

  if (!email || !password || !firstName || !lastName) {
    sendJson(response, 400, { message: 'Please complete all required fields.' });
    return;
  }

  if (password.length < 6) {
    sendJson(response, 400, { message: 'Password must be at least 6 characters.' });
    return;
  }

  const pool = await poolPromise;
  const roleId = await getLookupId('account_roles', 'role_id', 'role_name', 'customer');
  const statusId = await getLookupId('account_statuses', 'status_id', 'status_name', 'Active');

  if (!roleId || !statusId) {
    sendJson(response, 500, { message: 'Account lookup data is missing. Seed roles and statuses first.' });
    return;
  }

  const existing = await pool
    .request()
    .input('username', sql.VarChar(50), username)
    .input('email', sql.VarChar(50), email)
    .query(`
      SELECT ua.user_id
      FROM dbo.user_accounts ua
      LEFT JOIN dbo.user_informations ui ON ui.user_id = ua.user_id
      WHERE ua.username = @username OR ui.email = @email
    `);

  if (existing.recordset.length > 0) {
    sendJson(response, 409, { message: 'This email already has an account.' });
    return;
  }

  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    const inserted = await new sql.Request(transaction)
      .input('username', sql.VarChar(50), username)
      .input('password', sql.VarChar(225), hashPassword(password))
      .input('roleId', sql.Int, roleId)
      .input('statusId', sql.Int, statusId)
      .query(`
        INSERT INTO dbo.user_accounts (username, password, role_id, status_id)
        OUTPUT inserted.user_id, inserted.username
        VALUES (@username, @password, @roleId, @statusId)
      `);

    const user = inserted.recordset[0];
    await ensureCart(user.user_id, transaction);
    await transaction.commit();

    sendJson(response, 201, {
      message: 'Account created successfully.',
      user: publicUser({ ...user, email, role_name: 'customer', status_name: 'Active' }),
    });
  } catch (error) {
    await transaction.rollback();

    if (error.number === 2627 || error.number === 2601) {
      sendJson(response, 409, { message: 'This email already has an account.' });
      return;
    }

    throw error;
  }
}

async function handleLogin(request, response) {
  const payload = await readRequestBody(request);
  const email = cleanString(payload.email).toLowerCase();
  const password = String(payload.password || '');

  if (!email || !password) {
    sendJson(response, 400, { message: 'Please enter your email and password.' });
    return;
  }

  const pool = await poolPromise;
  const result = await pool
    .request()
    .input('login', sql.VarChar(50), email)
    .query(`
      SELECT TOP 1
        ua.user_id,
        ua.username,
        ua.password,
        ar.role_name,
        ast.status_name,
        ui.email,
        ui.address,
        ui.city_id,
        ui.province_id,
        ui.phone_no
      FROM dbo.user_accounts ua
      JOIN dbo.account_roles ar ON ar.role_id = ua.role_id
      JOIN dbo.account_statuses ast ON ast.status_id = ua.status_id
      LEFT JOIN dbo.user_informations ui ON ui.user_id = ua.user_id
      WHERE ua.username = @login OR ui.email = @login
    `);
  const user = result.recordset[0];

  if (!user || !isValidPassword(password, user.password)) {
    sendJson(response, 401, { message: 'Invalid email or password.' });
    return;
  }

  if (user.status_name !== 'Active') {
    sendJson(response, 403, { message: 'This account is not active.' });
    return;
  }

  await ensureCart(user.user_id);

  sendJson(response, 200, {
    token: createToken(user.user_id),
    user: publicUser(user),
  });
}

async function handleMe(request, response) {
  const user = await getCurrentUser(request);
  sendJson(response, 200, { user: publicUser(user) });
}

async function handleProfileUpsert(request, response) {
  const user = await getCurrentUser(request);
  const payload = await readRequestBody(request);
  const email = cleanString(payload.email).toLowerCase() || user.username;
  const address = cleanString(payload.address);
  const cityId = toInt(payload.cityId);
  const provinceId = toInt(payload.provinceId);
  const phoneNo = cleanString(payload.phoneNo);

  if (!email || !address || !cityId || !provinceId || !phoneNo) {
    sendJson(response, 400, { message: 'Email, address, city, province, and phone number are required.' });
    return;
  }

  const pool = await poolPromise;
  await pool
    .request()
    .input('userId', sql.Int, user.user_id)
    .input('email', sql.VarChar(50), email)
    .input('address', sql.VarChar(100), address)
    .input('cityId', sql.Int, cityId)
    .input('provinceId', sql.Int, provinceId)
    .input('phoneNo', sql.VarChar(20), phoneNo)
    .query(`
      IF EXISTS (SELECT 1 FROM dbo.user_informations WHERE user_id = @userId)
        UPDATE dbo.user_informations
        SET email = @email, address = @address, city_id = @cityId, province_id = @provinceId, phone_no = @phoneNo
        WHERE user_id = @userId
      ELSE
        INSERT INTO dbo.user_informations (user_id, email, address, city_id, province_id, phone_no)
        VALUES (@userId, @email, @address, @cityId, @provinceId, @phoneNo)
    `);

  sendJson(response, 200, { message: 'Profile saved successfully.' });
}

async function handleLookups(response, table, idColumn, nameColumn, extra = '') {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT ${idColumn} AS id, ${nameColumn} AS name ${extra}
    FROM dbo.${table}
    ORDER BY ${nameColumn}
  `);
  sendJson(response, 200, { data: result.recordset });
}

async function handleCities(url, response) {
  const provinceId = toInt(url.searchParams.get('provinceId'));
  const pool = await poolPromise;
  const dbRequest = pool.request();
  let where = '';

  if (provinceId) {
    dbRequest.input('provinceId', sql.Int, provinceId);
    where = 'WHERE c.province_id = @provinceId';
  }

  const result = await dbRequest.query(`
    SELECT c.city_id AS id, c.city_name AS name, c.province_id AS provinceId, p.province_name AS provinceName
    FROM dbo.cities c
    JOIN dbo.provinces p ON p.province_id = c.province_id
    ${where}
    ORDER BY c.city_name
  `);
  sendJson(response, 200, { data: result.recordset });
}

function mapProduct(row) {
  return {
    id: row.product_id,
    image: row.product_image,
    name: row.product_name,
    description: row.product_description,
    gender: { id: row.gender_id, name: row.gender_name },
    brand: { id: row.brand_id, name: row.brand_name },
    concentration: { id: row.concentration_id, name: row.concentration_name },
    size: { id: row.size_id, value: row.size_value },
    stock: row.stock,
    price: Number(row.price),
    launchedDate: row.launched_date,
    isActive: Boolean(row.is_active),
    accords: row.accords ? row.accords.split(', ') : [],
    occasions: row.occasions ? row.occasions.split(', ') : [],
  };
}

async function handleProducts(url, response) {
  const search = cleanString(url.searchParams.get('search'));
  const genderId = toInt(url.searchParams.get('genderId'));
  const brandId = toInt(url.searchParams.get('brandId'));
  const accordId = toInt(url.searchParams.get('accordId'));
  const occasionId = toInt(url.searchParams.get('occasionId'));
  const limit = Math.min(toInt(url.searchParams.get('limit'), 50), 100);
  const offset = Math.max(toInt(url.searchParams.get('offset'), 0), 0);
  const pool = await poolPromise;
  const dbRequest = pool
    .request()
    .input('limit', sql.Int, limit)
    .input('offset', sql.Int, offset);
  const where = ['p.is_active = 1'];

  if (search) {
    dbRequest.input('search', sql.VarChar(100), `%${search}%`);
    where.push('(p.product_name LIKE @search OR p.product_description LIKE @search)');
  }

  if (genderId) {
    dbRequest.input('genderId', sql.Int, genderId);
    where.push('p.gender_id = @genderId');
  }

  if (brandId) {
    dbRequest.input('brandId', sql.Int, brandId);
    where.push('p.brand_id = @brandId');
  }

  if (accordId) {
    dbRequest.input('accordId', sql.Int, accordId);
    where.push('EXISTS (SELECT 1 FROM dbo.product_accords pa WHERE pa.product_id = p.product_id AND pa.accord_id = @accordId)');
  }

  if (occasionId) {
    dbRequest.input('occasionId', sql.Int, occasionId);
    where.push('EXISTS (SELECT 1 FROM dbo.product_occasions po WHERE po.product_id = p.product_id AND po.occasion_id = @occasionId)');
  }

  const result = await dbRequest.query(`
    SELECT
      p.product_id,
      p.product_image,
      p.product_name,
      p.product_description,
      p.gender_id,
      g.gender_name,
      p.brand_id,
      b.brand_name,
      p.concentration_id,
      c.concentration_name,
      p.size_id,
      bs.size_value,
      p.stock,
      p.price,
      p.launched_date,
      p.is_active,
      STRING_AGG(CAST(fa.accord_name AS VARCHAR(MAX)), ', ') AS accords,
      STRING_AGG(CAST(fo.occasion_name AS VARCHAR(MAX)), ', ') AS occasions
    FROM dbo.products p
    JOIN dbo.genders g ON g.gender_id = p.gender_id
    JOIN dbo.brands b ON b.brand_id = p.brand_id
    JOIN dbo.concentrations c ON c.concentration_id = p.concentration_id
    JOIN dbo.bottle_sizes bs ON bs.size_id = p.size_id
    LEFT JOIN dbo.product_accords pa ON pa.product_id = p.product_id
    LEFT JOIN dbo.fragrance_accords fa ON fa.accord_id = pa.accord_id
    LEFT JOIN dbo.product_occasions po ON po.product_id = p.product_id
    LEFT JOIN dbo.fragrance_occasions fo ON fo.occasion_id = po.occasion_id
    WHERE ${where.join(' AND ')}
    GROUP BY
      p.product_id, p.product_image, p.product_name, p.product_description, p.gender_id, g.gender_name,
      p.brand_id, b.brand_name, p.concentration_id, c.concentration_name, p.size_id, bs.size_value,
      p.stock, p.price, p.launched_date, p.is_active
    ORDER BY p.product_id DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);

  sendJson(response, 200, { data: result.recordset.map(mapProduct) });
}

async function getProductNotes(productId) {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input('productId', sql.Int, productId)
    .query(`
      SELECT nt.type_name AS type, fn.note_id AS id, fn.note_name AS name
      FROM dbo.product_notes pn
      JOIN dbo.fragrance_notes fn ON fn.note_id = pn.note_id
      JOIN dbo.note_types nt ON nt.type_id = pn.type_id
      WHERE pn.product_id = @productId
      ORDER BY nt.type_id, fn.note_name
    `);

  return result.recordset.reduce((notes, note) => {
    const key = note.type.toLowerCase();
    notes[key] = notes[key] || [];
    notes[key].push({ id: note.id, name: note.name });
    return notes;
  }, {});
}

async function handleProductById(productId, response) {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input('productId', sql.Int, productId)
    .query(`
      SELECT
        p.product_id,
        p.product_image,
        p.product_name,
        p.product_description,
        p.gender_id,
        g.gender_name,
        p.brand_id,
        b.brand_name,
        p.concentration_id,
        c.concentration_name,
        p.size_id,
        bs.size_value,
        p.stock,
        p.price,
        p.launched_date,
        p.is_active,
        STRING_AGG(CAST(fa.accord_name AS VARCHAR(MAX)), ', ') AS accords,
        STRING_AGG(CAST(fo.occasion_name AS VARCHAR(MAX)), ', ') AS occasions
      FROM dbo.products p
      JOIN dbo.genders g ON g.gender_id = p.gender_id
      JOIN dbo.brands b ON b.brand_id = p.brand_id
      JOIN dbo.concentrations c ON c.concentration_id = p.concentration_id
      JOIN dbo.bottle_sizes bs ON bs.size_id = p.size_id
      LEFT JOIN dbo.product_accords pa ON pa.product_id = p.product_id
      LEFT JOIN dbo.fragrance_accords fa ON fa.accord_id = pa.accord_id
      LEFT JOIN dbo.product_occasions po ON po.product_id = p.product_id
      LEFT JOIN dbo.fragrance_occasions fo ON fo.occasion_id = po.occasion_id
      WHERE p.product_id = @productId
      GROUP BY
        p.product_id, p.product_image, p.product_name, p.product_description, p.gender_id, g.gender_name,
        p.brand_id, b.brand_name, p.concentration_id, c.concentration_name, p.size_id, bs.size_value,
        p.stock, p.price, p.launched_date, p.is_active
    `);

  if (!result.recordset[0]) {
    sendJson(response, 404, { message: 'Product not found.' });
    return;
  }

  sendJson(response, 200, {
    product: {
      ...mapProduct(result.recordset[0]),
      notes: await getProductNotes(productId),
    },
  });
}

async function handleProductSave(request, response, productId = null) {
  await getCurrentUser(request, 'admin');
  const payload = await readRequestBody(request);
  const name = cleanString(payload.name);
  const description = cleanString(payload.description);
  const stock = toInt(payload.stock);
  const price = toNumber(payload.price);

  if (!name || !description || !payload.genderId || !payload.brandId || !payload.concentrationId || !payload.sizeId || stock === null || price === null) {
    sendJson(response, 400, { message: 'Product name, description, attributes, stock, and price are required.' });
    return;
  }

  const pool = await poolPromise;
  const dbRequest = pool
    .request()
    .input('image', sql.VarChar(255), cleanString(payload.image) || null)
    .input('name', sql.VarChar(50), name)
    .input('description', sql.VarChar(300), description)
    .input('genderId', sql.Int, toInt(payload.genderId))
    .input('brandId', sql.Int, toInt(payload.brandId))
    .input('concentrationId', sql.Int, toInt(payload.concentrationId))
    .input('sizeId', sql.Int, toInt(payload.sizeId))
    .input('stock', sql.Int, stock)
    .input('price', sql.Decimal(12, 2), price)
    .input('launchedDate', sql.DateTime2, payload.launchedDate ? new Date(payload.launchedDate) : new Date());

  if (productId) {
    dbRequest.input('productId', sql.Int, productId);
    await dbRequest.query(`
      UPDATE dbo.products
      SET product_image = @image,
          product_name = @name,
          product_description = @description,
          gender_id = @genderId,
          brand_id = @brandId,
          concentration_id = @concentrationId,
          size_id = @sizeId,
          stock = @stock,
          price = @price,
          launched_date = @launchedDate
      WHERE product_id = @productId
    `);
    sendJson(response, 200, { message: 'Product updated successfully.' });
    return;
  }

  const inserted = await dbRequest.query(`
    INSERT INTO dbo.products
      (product_image, product_name, product_description, gender_id, brand_id, concentration_id, size_id, stock, price, launched_date)
    OUTPUT inserted.product_id AS id
    VALUES
      (@image, @name, @description, @genderId, @brandId, @concentrationId, @sizeId, @stock, @price, @launchedDate)
  `);

  sendJson(response, 201, { message: 'Product created successfully.', id: inserted.recordset[0].id });
}

async function handleProductDelete(request, response, productId) {
  await getCurrentUser(request, 'admin');
  const pool = await poolPromise;
  await pool.request().input('productId', sql.Int, productId).query('UPDATE dbo.products SET is_active = 0 WHERE product_id = @productId');
  sendJson(response, 200, { message: 'Product archived successfully.' });
}

async function handleCartGet(request, response) {
  const user = await getCurrentUser(request);
  const cartId = await ensureCart(user.user_id);
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input('cartId', sql.Int, cartId)
    .query(`
      SELECT
        ci.product_id AS productId,
        p.product_name AS name,
        p.product_image AS image,
        ci.quantity,
        p.stock,
        p.price,
        CAST(ci.quantity * p.price AS DECIMAL(12,2)) AS subtotal
      FROM dbo.cart_items ci
      JOIN dbo.products p ON p.product_id = ci.product_id
      WHERE ci.cart_id = @cartId
      ORDER BY p.product_name
    `);

  const items = result.recordset.map((item) => ({
    ...item,
    price: Number(item.price),
    subtotal: Number(item.subtotal),
  }));

  sendJson(response, 200, {
    cartId,
    items,
    total: items.reduce((sum, item) => sum + item.subtotal, 0),
  });
}

async function handleCartAdd(request, response) {
  const user = await getCurrentUser(request);
  const payload = await readRequestBody(request);
  const productId = toInt(payload.productId);
  const quantity = Math.max(toInt(payload.quantity, 1), 1);

  if (!productId) {
    sendJson(response, 400, { message: 'Product is required.' });
    return;
  }

  const cartId = await ensureCart(user.user_id);
  const pool = await poolPromise;
  await pool
    .request()
    .input('cartId', sql.Int, cartId)
    .input('productId', sql.Int, productId)
    .input('quantity', sql.Int, quantity)
    .query(`
      IF EXISTS (SELECT 1 FROM dbo.cart_items WHERE cart_id = @cartId AND product_id = @productId)
        UPDATE dbo.cart_items
        SET quantity = quantity + @quantity
        WHERE cart_id = @cartId AND product_id = @productId
      ELSE
        INSERT INTO dbo.cart_items (cart_id, product_id, quantity)
        VALUES (@cartId, @productId, @quantity)
    `);

  sendJson(response, 200, { message: 'Product added to cart.' });
}

async function handleCartUpdate(request, response, productId) {
  const user = await getCurrentUser(request);
  const payload = await readRequestBody(request);
  const quantity = toInt(payload.quantity);

  if (!quantity || quantity < 1) {
    sendJson(response, 400, { message: 'Quantity must be at least 1.' });
    return;
  }

  const cartId = await ensureCart(user.user_id);
  const pool = await poolPromise;
  await pool
    .request()
    .input('cartId', sql.Int, cartId)
    .input('productId', sql.Int, productId)
    .input('quantity', sql.Int, quantity)
    .query('UPDATE dbo.cart_items SET quantity = @quantity WHERE cart_id = @cartId AND product_id = @productId');

  sendJson(response, 200, { message: 'Cart updated.' });
}

async function handleCartDelete(request, response, productId = null) {
  const user = await getCurrentUser(request);
  const cartId = await ensureCart(user.user_id);
  const pool = await poolPromise;
  const dbRequest = pool.request().input('cartId', sql.Int, cartId);
  let query = 'DELETE FROM dbo.cart_items WHERE cart_id = @cartId';

  if (productId) {
    dbRequest.input('productId', sql.Int, productId);
    query += ' AND product_id = @productId';
  }

  await dbRequest.query(query);
  sendJson(response, 200, { message: productId ? 'Item removed from cart.' : 'Cart cleared.' });
}

async function handleCheckout(request, response) {
  const user = await getCurrentUser(request);
  const payload = await readRequestBody(request);
  const methodId = toInt(payload.methodId);

  if (!methodId) {
    sendJson(response, 400, { message: 'Payment method is required.' });
    return;
  }

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    const cartId = await ensureCart(user.user_id, transaction);
    const cart = await new sql.Request(transaction)
      .input('cartId', sql.Int, cartId)
      .query(`
        SELECT ci.product_id, ci.quantity, p.price, p.stock, p.product_name
        FROM dbo.cart_items ci
        JOIN dbo.products p WITH (UPDLOCK, ROWLOCK) ON p.product_id = ci.product_id
        WHERE ci.cart_id = @cartId AND p.is_active = 1
      `);

    if (cart.recordset.length === 0) {
      await transaction.rollback();
      sendJson(response, 400, { message: 'Your cart is empty.' });
      return;
    }

    const insufficient = cart.recordset.find((item) => item.quantity > item.stock);
    if (insufficient) {
      await transaction.rollback();
      sendJson(response, 409, { message: `${insufficient.product_name} does not have enough stock.` });
      return;
    }

    const total = cart.recordset.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const pendingOrderStatusId = await new sql.Request(transaction)
      .query("SELECT status_id FROM dbo.order_statuses WHERE status_name = 'pending'");
    const pendingPaymentStatusId = await new sql.Request(transaction)
      .query("SELECT status_id FROM dbo.payment_statuses WHERE status_name = 'Pending'");

    const order = await new sql.Request(transaction)
      .input('userId', sql.Int, user.user_id)
      .input('total', sql.Decimal(12, 2), total)
      .input('statusId', sql.Int, pendingOrderStatusId.recordset[0].status_id)
      .query(`
        INSERT INTO dbo.orders (user_id, total, status_id)
        OUTPUT inserted.order_id
        VALUES (@userId, @total, @statusId)
      `);
    const orderId = order.recordset[0].order_id;

    for (const item of cart.recordset) {
      await new sql.Request(transaction)
        .input('orderId', sql.Int, orderId)
        .input('productId', sql.Int, item.product_id)
        .input('quantity', sql.Int, item.quantity)
        .input('price', sql.Decimal(12, 2), item.price)
        .query(`
          INSERT INTO dbo.order_items (order_id, product_id, quantity, price)
          VALUES (@orderId, @productId, @quantity, @price);

          UPDATE dbo.products
          SET stock = stock - @quantity
          WHERE product_id = @productId;
        `);
    }

    await new sql.Request(transaction)
      .input('orderId', sql.Int, orderId)
      .input('methodId', sql.Int, methodId)
      .input('statusId', sql.Int, pendingPaymentStatusId.recordset[0].status_id)
      .query(`
        INSERT INTO dbo.order_payments (order_id, method_id, status_id)
        VALUES (@orderId, @methodId, @statusId)
      `);

    await new sql.Request(transaction)
      .input('cartId', sql.Int, cartId)
      .query('DELETE FROM dbo.cart_items WHERE cart_id = @cartId');

    await transaction.commit();
    sendJson(response, 201, { message: 'Order placed successfully.', orderId, total });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function handleOrders(request, response) {
  const user = await getCurrentUser(request);
  const pool = await poolPromise;
  const dbRequest = pool.request();
  let where = '';

  if (user.role_name !== 'admin') {
    dbRequest.input('userId', sql.Int, user.user_id);
    where = 'WHERE o.user_id = @userId';
  }

  const result = await dbRequest.query(`
    SELECT
      o.order_id AS id,
      o.user_id AS userId,
      o.total,
      os.status_name AS status,
      o.created_at AS createdAt,
      pm.method_name AS paymentMethod,
      ps.status_name AS paymentStatus
    FROM dbo.orders o
    JOIN dbo.order_statuses os ON os.status_id = o.status_id
    LEFT JOIN dbo.order_payments op ON op.order_id = o.order_id
    LEFT JOIN dbo.payment_methods pm ON pm.method_id = op.method_id
    LEFT JOIN dbo.payment_statuses ps ON ps.status_id = op.status_id
    ${where}
    ORDER BY o.created_at DESC
  `);

  sendJson(response, 200, {
    data: result.recordset.map((order) => ({ ...order, total: Number(order.total) })),
  });
}

async function handleOrderById(request, response, orderId) {
  const user = await getCurrentUser(request);
  const pool = await poolPromise;
  const ownerCheck = user.role_name === 'admin' ? '' : 'AND o.user_id = @userId';
  const dbRequest = pool.request().input('orderId', sql.Int, orderId);

  if (user.role_name !== 'admin') {
    dbRequest.input('userId', sql.Int, user.user_id);
  }

  const orderResult = await dbRequest.query(`
    SELECT o.order_id AS id, o.user_id AS userId, o.total, os.status_name AS status, o.created_at AS createdAt
    FROM dbo.orders o
    JOIN dbo.order_statuses os ON os.status_id = o.status_id
    WHERE o.order_id = @orderId ${ownerCheck}
  `);

  if (!orderResult.recordset[0]) {
    sendJson(response, 404, { message: 'Order not found.' });
    return;
  }

  const items = await pool
    .request()
    .input('orderId', sql.Int, orderId)
    .query(`
      SELECT oi.product_id AS productId, p.product_name AS name, oi.quantity, oi.price
      FROM dbo.order_items oi
      JOIN dbo.products p ON p.product_id = oi.product_id
      WHERE oi.order_id = @orderId
      ORDER BY p.product_name
    `);

  sendJson(response, 200, {
    order: {
      ...orderResult.recordset[0],
      total: Number(orderResult.recordset[0].total),
      items: items.recordset.map((item) => ({ ...item, price: Number(item.price) })),
    },
  });
}

async function handleOrderStatus(request, response, orderId) {
  await getCurrentUser(request, 'admin');
  const payload = await readRequestBody(request);
  const status = cleanString(payload.status);

  if (!status) {
    sendJson(response, 400, { message: 'Status is required.' });
    return;
  }

  const pool = await poolPromise;
  const result = await pool
    .request()
    .input('orderId', sql.Int, orderId)
    .input('status', sql.VarChar(20), status)
    .query(`
      UPDATE o
      SET status_id = os.status_id
      FROM dbo.orders o
      JOIN dbo.order_statuses os ON os.status_name = @status
      WHERE o.order_id = @orderId
    `);

  if (result.rowsAffected[0] === 0) {
    sendJson(response, 404, { message: 'Order or status not found.' });
    return;
  }

  sendJson(response, 200, { message: 'Order status updated.' });
}

async function handleReviews(request, response, productId) {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input('productId', sql.Int, productId)
    .query(`
      SELECT pr.review_id AS id, pr.user_id AS userId, ua.username, pr.rate, pr.review_description AS description
      FROM dbo.product_reviews pr
      JOIN dbo.user_accounts ua ON ua.user_id = pr.user_id
      WHERE pr.product_id = @productId
      ORDER BY pr.review_id DESC
    `);

  sendJson(response, 200, { data: result.recordset });
}

async function handleReviewCreate(request, response, productId) {
  const user = await getCurrentUser(request);
  const payload = await readRequestBody(request);
  const rate = toInt(payload.rate);
  const description = cleanString(payload.description);

  if (!rate || rate < 1 || rate > 5) {
    sendJson(response, 400, { message: 'Rate must be between 1 and 5.' });
    return;
  }

  const pool = await poolPromise;
  const inserted = await pool
    .request()
    .input('userId', sql.Int, user.user_id)
    .input('productId', sql.Int, productId)
    .input('rate', sql.Int, rate)
    .input('description', sql.VarChar(200), description || null)
    .query(`
      INSERT INTO dbo.product_reviews (user_id, product_id, rate, review_description)
      OUTPUT inserted.review_id AS id
      VALUES (@userId, @productId, @rate, @description)
    `);

  sendJson(response, 201, { message: 'Review added successfully.', id: inserted.recordset[0].id });
}

async function handleInventory(request, response) {
  await getCurrentUser(request, 'admin');
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT
      p.product_id AS productId,
      p.product_name AS productName,
      p.stock,
      b.brand_name AS brand,
      c.concentration_name AS concentration,
      bs.size_value AS size,
      MAX(ia.created_date) AS lastAdjustedAt
    FROM dbo.products p
    JOIN dbo.brands b ON b.brand_id = p.brand_id
    JOIN dbo.concentrations c ON c.concentration_id = p.concentration_id
    JOIN dbo.bottle_sizes bs ON bs.size_id = p.size_id
    LEFT JOIN dbo.inventory_adjustments ia ON ia.product_id = p.product_id
    GROUP BY p.product_id, p.product_name, p.stock, b.brand_name, c.concentration_name, bs.size_value
    ORDER BY p.product_name
  `);

  sendJson(response, 200, { data: result.recordset });
}

async function handleInventoryAdjust(request, response) {
  await getCurrentUser(request, 'admin');
  const payload = await readRequestBody(request);
  const productId = toInt(payload.productId);
  const adjustmentType = cleanString(payload.adjustmentType).toUpperCase();
  const quantity = toInt(payload.quantity);
  const reason = cleanString(payload.reason);
  const allowedTypes = new Set(['NEW STOCK', 'RESTOCK', 'DAMAGE', 'RETURN', 'EXPIRED', 'MANUAL', 'LOST', 'SALE CANCELLED']);

  if (!productId || !allowedTypes.has(adjustmentType) || !quantity || quantity < 1) {
    sendJson(response, 400, { message: 'Product, valid adjustment type, and positive quantity are required.' });
    return;
  }

  const stockIncreaseTypes = new Set(['NEW STOCK', 'RESTOCK', 'RETURN', 'SALE CANCELLED']);
  const stockDelta = stockIncreaseTypes.has(adjustmentType) ? quantity : -quantity;
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    const updated = await new sql.Request(transaction)
      .input('productId', sql.Int, productId)
      .input('stockDelta', sql.Int, stockDelta)
      .query(`
        UPDATE dbo.products
        SET stock = stock + @stockDelta
        WHERE product_id = @productId AND stock + @stockDelta >= 0
      `);

    if (updated.rowsAffected[0] === 0) {
      await transaction.rollback();
      sendJson(response, 409, { message: 'Inventory adjustment would make stock negative, or product was not found.' });
      return;
    }

    await new sql.Request(transaction)
      .input('productId', sql.Int, productId)
      .input('adjustmentType', sql.VarChar(20), adjustmentType)
      .input('quantity', sql.Int, quantity)
      .input('reason', sql.VarChar(100), reason || null)
      .query(`
        INSERT INTO dbo.inventory_adjustments (product_id, adjustment_type, quantity, reason)
        VALUES (@productId, @adjustmentType, @quantity, @reason)
      `);

    await transaction.commit();
    sendJson(response, 201, { message: 'Inventory adjusted successfully.' });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';

  if (request.method === 'OPTIONS') {
    sendJson(response, 204);
    return;
  }

  try {
    const key = routeKey(request.method, pathname);

    if (key === 'GET /api/health') {
      sendJson(response, 200, { status: 'ok', database: sqlConfig.database });
      return;
    }

    if (key === 'POST /api/auth/signup') return await handleSignup(request, response);
    if (key === 'POST /api/auth/login') return await handleLogin(request, response);
    if (key === 'GET /api/auth/me') return await handleMe(request, response);
    if (key === 'PUT /api/auth/profile') return await handleProfileUpsert(request, response);

    if (key === 'GET /api/lookups/provinces') return await handleLookups(response, 'provinces', 'province_id', 'province_name');
    if (key === 'GET /api/lookups/cities') return await handleCities(url, response);
    if (key === 'GET /api/lookups/genders') return await handleLookups(response, 'genders', 'gender_id', 'gender_name');
    if (key === 'GET /api/lookups/brands') return await handleLookups(response, 'brands', 'brand_id', 'brand_name');
    if (key === 'GET /api/lookups/concentrations') return await handleLookups(response, 'concentrations', 'concentration_id', 'concentration_name');
    if (key === 'GET /api/lookups/bottle-sizes') return await handleLookups(response, 'bottle_sizes', 'size_id', 'size_value');
    if (key === 'GET /api/lookups/accords') return await handleLookups(response, 'fragrance_accords', 'accord_id', 'accord_name');
    if (key === 'GET /api/lookups/notes') return await handleLookups(response, 'fragrance_notes', 'note_id', 'note_name');
    if (key === 'GET /api/lookups/occasions') return await handleLookups(response, 'fragrance_occasions', 'occasion_id', 'occasion_name');
    if (key === 'GET /api/lookups/payment-methods') return await handleLookups(response, 'payment_methods', 'method_id', 'method_name');

    if (key === 'GET /api/products') return await handleProducts(url, response);
    if (key === 'POST /api/products') return await handleProductSave(request, response);

    const productMatch = pathname.match(/^\/api\/products\/(\d+)$/);
    if (productMatch && request.method === 'GET') return await handleProductById(toInt(productMatch[1]), response);
    if (productMatch && request.method === 'PUT') return await handleProductSave(request, response, toInt(productMatch[1]));
    if (productMatch && request.method === 'DELETE') return await handleProductDelete(request, response, toInt(productMatch[1]));

    const reviewsMatch = pathname.match(/^\/api\/products\/(\d+)\/reviews$/);
    if (reviewsMatch && request.method === 'GET') return await handleReviews(request, response, toInt(reviewsMatch[1]));
    if (reviewsMatch && request.method === 'POST') return await handleReviewCreate(request, response, toInt(reviewsMatch[1]));

    if (key === 'GET /api/cart') return await handleCartGet(request, response);
    if (key === 'POST /api/cart/items') return await handleCartAdd(request, response);
    if (key === 'DELETE /api/cart') return await handleCartDelete(request, response);

    const cartItemMatch = pathname.match(/^\/api\/cart\/items\/(\d+)$/);
    if (cartItemMatch && request.method === 'PUT') return await handleCartUpdate(request, response, toInt(cartItemMatch[1]));
    if (cartItemMatch && request.method === 'DELETE') return await handleCartDelete(request, response, toInt(cartItemMatch[1]));

    if (key === 'GET /api/orders') return await handleOrders(request, response);
    if (key === 'POST /api/orders/checkout') return await handleCheckout(request, response);
    if (key === 'GET /api/admin/inventory') return await handleInventory(request, response);
    if (key === 'POST /api/admin/inventory/adjustments') return await handleInventoryAdjust(request, response);

    const orderMatch = pathname.match(/^\/api\/orders\/(\d+)$/);
    if (orderMatch && request.method === 'GET') return await handleOrderById(request, response, toInt(orderMatch[1]));

    const orderStatusMatch = pathname.match(/^\/api\/orders\/(\d+)\/status$/);
    if (orderStatusMatch && request.method === 'PATCH') return await handleOrderStatus(request, response, toInt(orderStatusMatch[1]));

    sendJson(response, 404, { message: 'Route not found.' });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    sendJson(response, statusCode, { message: error.message || 'Server error.' });
  }
});

server.listen(PORT, () => {
  console.log(`Votre Scent API running at http://localhost:${PORT}`);
});
