const crypto = require('crypto');
const sql = require('msnodesqlv8');

const database = {
  sql,
  connectionString:
    'Server=LAPTOP-0H5D4O0M;Database=Votre_Scent;Trusted_Connection=yes;Driver={SQL Server};Connection Timeout=5;',
};

function queryDatabase(query, params = []) {
  return new Promise((resolve, reject) => {
    const callback = (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(rows);
    };

    if (params.length) {
      database.sql.query(database.connectionString, query, params, callback);
      return;
    }

    database.sql.query(database.connectionString, query, callback);
  });
}

async function province(provinceId = 20) {
  return queryDatabase('SELECT * FROM provinces WHERE province_id = ?', [provinceId]);
}

async function ensureUserInformationNameColumns() {
  await queryDatabase(`
    IF COL_LENGTH('user_informations', 'first_name') IS NULL
      ALTER TABLE user_informations ADD first_name VARCHAR(50) NULL;

    IF COL_LENGTH('user_informations', 'last_name') IS NULL
      ALTER TABLE user_informations ADD last_name VARCHAR(50) NULL;
  `);
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password)).digest('hex');
}

function verifyPassword(password, savedPassword) {
  const saved = String(savedPassword || '');
  const enteredHash = hashPassword(password);

  if (!isHashedPassword(saved)) {
    return saved === String(password);
  }

  const savedBuffer = Buffer.from(saved, 'hex');
  const enteredBuffer = Buffer.from(enteredHash, 'hex');

  return savedBuffer.length === enteredBuffer.length && crypto.timingSafeEqual(savedBuffer, enteredBuffer);
}

function isHashedPassword(password) {
  return /^[a-f0-9]{64}$/i.test(String(password || ''));
}

const accountSelect = `
  SELECT TOP 1
    ua.user_id AS id,
    ua.username,
    ua.password,
    COALESCE(ui.email, ua.username) AS email,
    COALESCE(ui.first_name, '') AS firstName,
    COALESCE(ui.last_name, '') AS lastName,
    COALESCE(ui.address, '') AS address,
    ui.city_id AS cityId,
    c.city_name AS cityName,
    ui.province_id AS provinceId,
    p.province_name AS provinceName,
    COALESCE(ui.phone_no, '') AS phoneNumber,
    COALESCE(ar.role_name, 'customer') AS role,
    COALESCE(acs.status_name, 'Active') AS status
  FROM user_accounts ua
  LEFT JOIN user_informations ui ON ui.user_id = ua.user_id
  LEFT JOIN cities c ON c.city_id = ui.city_id
  LEFT JOIN provinces p ON p.province_id = ui.province_id
  LEFT JOIN account_roles ar ON ar.role_id = ua.role_id
  LEFT JOIN account_statuses acs ON acs.status_id = ua.status_id
  WHERE LOWER(COALESCE(ui.email, '')) = LOWER(?)
    OR LOWER(ua.username) = LOWER(?)
`;

const accountByIdSelect = `
  SELECT TOP 1
    ua.user_id AS id,
    ua.username,
    ua.password,
    COALESCE(ui.email, ua.username) AS email,
    COALESCE(ui.first_name, '') AS firstName,
    COALESCE(ui.last_name, '') AS lastName,
    COALESCE(ui.address, '') AS address,
    ui.city_id AS cityId,
    c.city_name AS cityName,
    ui.province_id AS provinceId,
    p.province_name AS provinceName,
    COALESCE(ui.phone_no, '') AS phoneNumber,
    COALESCE(ar.role_name, 'customer') AS role,
    COALESCE(acs.status_name, 'Active') AS status
  FROM user_accounts ua
  LEFT JOIN user_informations ui ON ui.user_id = ua.user_id
  LEFT JOIN cities c ON c.city_id = ui.city_id
  LEFT JOIN provinces p ON p.province_id = ui.province_id
  LEFT JOIN account_roles ar ON ar.role_id = ua.role_id
  LEFT JOIN account_statuses acs ON acs.status_id = ua.status_id
  WHERE ua.user_id = ?
`;

function splitUsername(username = '') {
  const parts = String(username).trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] || username || '',
    lastName: parts.slice(1).join(' '),
  };
}

function mapAccount(row) {
  const name = splitUsername(row.username);

  return {
    id: row.id,
    firstName: row.firstName || name.firstName,
    lastName: row.lastName || name.lastName,
    email: row.email,
    address: row.address,
    cityId: row.cityId,
    cityName: row.cityName,
    provinceId: row.provinceId,
    provinceName: row.provinceName,
    phoneNumber: row.phoneNumber,
    role: String(row.role || 'customer').toLowerCase(),
    status: row.status,
    password: row.password,
  };
}

async function findUserByEmail(emailOrUsername) {
  await ensureUserInformationNameColumns();
  const users = await queryDatabase(accountSelect, [emailOrUsername, emailOrUsername]);
  return users.length ? mapAccount(users[0]) : null;
}

async function createUserAccount({ firstName, lastName, email, password }) {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    return {
      status: 'exists',
      user: null,
    };
  }

  const username = String(email).trim();
  const customerRoleId = 2;
  const activeStatusId = 1;
  const createdAccounts = await queryDatabase(
    `
      INSERT INTO user_accounts (username, password, role_id, status_id, created_Date)
      OUTPUT INSERTED.user_id AS id
      VALUES (?, ?, ?, ?, SYSDATETIME())
    `,
    [username, hashPassword(password), customerRoleId, activeStatusId]
  );

  const userId = createdAccounts[0].id;

  await queryDatabase(
    `
      INSERT INTO user_informations (
        user_id,
        email,
        first_name,
        last_name,
        address,
        city_id,
        province_id,
        phone_no
      )
      VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        (SELECT TOP 1 city_id FROM cities ORDER BY city_id),
        (SELECT TOP 1 province_id FROM provinces ORDER BY province_id),
        ?
      )
    `,
    [userId, email, String(firstName).trim(), String(lastName).trim(), 'Not provided', 'Not provided']
  );

  return {
    status: 'success',
    user: {
      id: userId,
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email,
      role: 'customer',
    },
  };
}

function toPublicUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    address: user.address || '',
    cityId: user.cityId || null,
    cityName: user.cityName || '',
    provinceId: user.provinceId || null,
    provinceName: user.provinceName || '',
    phoneNumber: user.phoneNumber || '',
    role: user.role,
  };
}

async function loginUser(emailOrUsername, password) {
  const user = await findUserByEmail(emailOrUsername);

  if (!user) {
    return {
      status: 'not_found',
      user: null,
    };
  }

  if (String(user.status).toLowerCase() !== 'active') {
    return {
      status: 'inactive',
      user: null,
      accountStatus: user.status,
    };
  }

  if (!verifyPassword(password, user.password)) {
    return {
      status: 'invalid_password',
      user: null,
    };
  }

  if (!isHashedPassword(user.password)) {
    await queryDatabase('UPDATE user_accounts SET password = ? WHERE user_id = ?', [
      hashPassword(password),
      user.id,
    ]);
  }

  return {
    status: 'success',
    user: toPublicUser(user),
  };
}

async function resetUserPassword(emailOrUsername, password) {
  const user = await findUserByEmail(emailOrUsername);

  if (!user) {
    return {
      status: 'not_found',
    };
  }

  await queryDatabase('UPDATE user_accounts SET password = ? WHERE user_id = ?', [
    hashPassword(password),
    user.id,
  ]);

  return {
    status: 'success',
  };
}

async function updateUserProfile(userId, profile) {
  await ensureUserInformationNameColumns();

  const firstName = String(profile.firstName || '').trim();
  const lastName = String(profile.lastName || '').trim();
  const email = String(profile.email || '').trim();
  const address = String(profile.address || '').trim();
  const phoneNumber = String(profile.phoneNumber || '').trim();
  const newPassword = String(profile.newPassword || '').trim();
  const cityId = profile.cityId ? Number(profile.cityId) : null;
  const provinceId = profile.provinceId ? Number(profile.provinceId) : null;
  const username = email;

  await queryDatabase('UPDATE user_accounts SET username = ? WHERE user_id = ?', [username, userId]);

  if (newPassword) {
    await queryDatabase('UPDATE user_accounts SET password = ? WHERE user_id = ?', [
      hashPassword(newPassword),
      userId,
    ]);
  }

  await queryDatabase(
    `
      IF EXISTS (SELECT 1 FROM user_informations WHERE user_id = ?)
      BEGIN
        UPDATE user_informations
        SET
          email = ?,
          first_name = ?,
          last_name = ?,
          address = ?,
          city_id = COALESCE(?, city_id),
          province_id = COALESCE(?, province_id),
          phone_no = ?
        WHERE user_id = ?
      END
      ELSE
      BEGIN
        INSERT INTO user_informations (
          user_id,
          email,
          first_name,
          last_name,
          address,
          city_id,
          province_id,
          phone_no
        )
        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          COALESCE(?, (SELECT TOP 1 city_id FROM cities ORDER BY city_id)),
          COALESCE(?, (SELECT TOP 1 province_id FROM provinces ORDER BY province_id)),
          ?
        )
      END
    `,
    [
      userId,
      email,
      firstName,
      lastName,
      address,
      cityId,
      provinceId,
      phoneNumber,
      userId,
      userId,
      email,
      firstName,
      lastName,
      address,
      cityId,
      provinceId,
      phoneNumber,
    ]
  );

  const updatedUsers = await queryDatabase(accountByIdSelect, [userId]);
  return updatedUsers.length ? toPublicUser(mapAccount(updatedUsers[0])) : null;
}

async function getLocations() {
  const [cities, provinces] = await Promise.all([
    queryDatabase('SELECT city_id AS id, city_name AS name, province_id AS provinceId FROM cities ORDER BY city_name'),
    queryDatabase('SELECT province_id AS id, province_name AS name FROM provinces ORDER BY province_name'),
  ]);

  return { cities, provinces };
}

async function getProducts() {
  return queryDatabase(`
    SELECT
      p.product_id AS id,
      p.product_image AS image,
      p.product_name AS name,
      p.product_description AS description,
      p.stock,
      p.price,
      b.brand_name AS brand,
      bs.size_value AS size
    FROM products p
    LEFT JOIN brands b ON b.brand_id = p.brand_id
    LEFT JOIN bottle_sizes bs ON bs.size_id = p.size_id
    WHERE p.is_active = 1
    ORDER BY p.product_name
  `);
}

function limitText(value, fallback, maxLength) {
  const text = String(value || fallback || '').trim() || String(fallback || '').trim();
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

function parseBottleSize(size) {
  const match = String(size || '').match(/\d+/);
  return match ? Number(match[0]) : 50;
}

async function ensureNamedLookup(tableName, idColumn, nameColumn, value) {
  await queryDatabase(
    `
      IF NOT EXISTS (SELECT 1 FROM ${tableName} WHERE LOWER(${nameColumn}) = LOWER(?))
        INSERT INTO ${tableName} (${nameColumn}) VALUES (?);
    `,
    [value, value]
  );

  const rows = await queryDatabase(
    `
      SELECT TOP 1 ${idColumn} AS id
      FROM ${tableName}
      WHERE LOWER(${nameColumn}) = LOWER(?)
    `,
    [value]
  );

  return rows[0].id;
}

async function ensureBottleSize(sizeValue) {
  await queryDatabase(
    `
      IF NOT EXISTS (SELECT 1 FROM bottle_sizes WHERE size_value = ?)
        INSERT INTO bottle_sizes (size_value) VALUES (?);
    `,
    [sizeValue, sizeValue]
  );

  const rows = await queryDatabase(
    `
      SELECT TOP 1 size_id AS id
      FROM bottle_sizes
      WHERE size_value = ?
    `,
    [sizeValue]
  );

  return rows[0].id;
}

async function findProductById(productId) {
  const rows = await queryDatabase(
    'SELECT TOP 1 product_id AS id FROM products WHERE product_id = ?',
    [productId]
  );

  return rows.length ? rows[0].id : null;
}

async function findProductByName(productName) {
  const rows = await queryDatabase(
    'SELECT TOP 1 product_id AS id FROM products WHERE LOWER(product_name) = LOWER(?) ORDER BY product_id',
    [productName]
  );

  return rows.length ? rows[0].id : null;
}

async function createPlaceholderProduct(item) {
  const productName = limitText(item.name, `Product ${item.id}`, 50);
  const description = limitText(
    item.description,
    `${productName} placeholder product created from checkout.`,
    300
  );
  const image = limitText(item.imagePath || item.image, null, 255);
  const price = Math.max(Number(item.price || 0), 1);
  const quantity = Math.max(Number(item.quantity || 0), 1);
  const stock = Math.max(quantity, 25);
  const genderId = await ensureNamedLookup('genders', 'gender_id', 'gender_name', 'Unisex');
  const brandId = await ensureNamedLookup('brands', 'brand_id', 'brand_name', 'Votre Scent');
  const concentrationId = await ensureNamedLookup(
    'concentrations',
    'concentration_id',
    'concentration_name',
    'Eau de Parfum'
  );
  const sizeId = await ensureBottleSize(parseBottleSize(item.size));

  const createdProducts = await queryDatabase(
    `
      INSERT INTO products (
        product_image,
        product_name,
        product_description,
        gender_id,
        brand_id,
        concentration_id,
        size_id,
        stock,
        price,
        launched_date,
        is_active
      )
      OUTPUT INSERTED.product_id AS id
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, SYSDATETIME(), 1)
    `,
    [image, productName, description, genderId, brandId, concentrationId, sizeId, stock, price]
  );

  const productId = createdProducts[0].id;

  await queryDatabase(
    `
      INSERT INTO product_batches (product_id, quantity, expiration_date)
      VALUES (?, ?, DATEADD(year, 3, CAST(GETDATE() AS date)));

      INSERT INTO inventory_adjustments (product_id, adjustment_type, quantity, reason)
      VALUES (?, 'NEW STOCK', ?, 'Created automatically during checkout');
    `,
    [productId, stock, productId, stock]
  );

  return productId;
}

async function resolveOrderProduct(item) {
  const numericId = Number(item.id);
  const productName = limitText(item.name, `Product ${item.id}`, 50);

  if (Number.isInteger(numericId) && numericId > 0) {
    const existingById = await findProductById(numericId);

    if (existingById) {
      return existingById;
    }
  }

  const existingByName = await findProductByName(productName);

  if (existingByName) {
    return existingByName;
  }

  return createPlaceholderProduct({ ...item, name: productName });
}

async function ensureUserCart(userId) {
  await queryDatabase(
    `
      IF NOT EXISTS (SELECT 1 FROM carts WHERE user_id = ?)
        INSERT INTO carts (user_id) VALUES (?);
    `,
    [userId, userId]
  );

  const rows = await queryDatabase(
    'SELECT TOP 1 cart_id AS id FROM carts WHERE user_id = ? ORDER BY cart_id',
    [userId]
  );

  return rows[0].id;
}

async function getUserCart(userId) {
  const cartId = await ensureUserCart(Number(userId));

  const rows = await queryDatabase(
    `
      SELECT
        p.product_id AS id,
        p.product_image AS imagePath,
        p.product_name AS perfName,
        p.product_description AS description,
        bs.size_value AS size,
        p.price,
        ci.quantity
      FROM cart_items ci
      INNER JOIN products p ON p.product_id = ci.product_id
      LEFT JOIN bottle_sizes bs ON bs.size_id = p.size_id
      WHERE ci.cart_id = ?
      ORDER BY p.product_name
    `,
    [cartId]
  );

  return rows.map((row) => ({
    id: String(row.id),
    perfName: row.perfName,
    description: row.description,
    imagePath: row.imagePath || 'assets/images/carouselImage/perfBlue.png',
    size: row.size ? `${row.size}mL` : 'Size unavailable',
    price: Number(row.price),
    originalPrice: Number(row.price),
    discountRate: 0,
    quantity: Number(row.quantity),
    addedAt: new Date().toISOString(),
  }));
}

async function saveUserCart(userId, items) {
  const cartId = await ensureUserCart(Number(userId));
  const cartItemsByProduct = new Map();

  for (const item of Array.isArray(items) ? items : []) {
    const quantity = Math.max(Number(item.quantity || 0), 0);

    if (quantity <= 0) {
      continue;
    }

    const productId = await resolveOrderProduct({
      ...item,
      name: item.name || item.perfName,
      image: item.image || item.imagePath,
    });
    const existingQuantity = cartItemsByProduct.get(productId) || 0;
    cartItemsByProduct.set(productId, existingQuantity + quantity);
  }

  await queryDatabase('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

  for (const [productId, quantity] of cartItemsByProduct.entries()) {
    await queryDatabase(
      `
        INSERT INTO cart_items (cart_id, product_id, quantity)
        VALUES (?, ?, ?)
      `,
      [cartId, productId, quantity]
    );
  }

  return getUserCart(userId);
}

async function createOrder(order) {
  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = items.reduce(
    (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  const totalAmount = subtotal;
  const userId = Number(order.userId);
  const orderItemsByProduct = new Map();

  for (const item of items) {
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.price || 0);
    const productId = await resolveOrderProduct(item);
    const existingItem = orderItemsByProduct.get(productId);

    if (existingItem) {
      existingItem.quantity += quantity;
      continue;
    }

    orderItemsByProduct.set(productId, {
      quantity,
      price: unitPrice,
    });
  }

  await queryDatabase(`
    IF NOT EXISTS (SELECT 1 FROM order_statuses WHERE LOWER(status_name) = 'pending')
      INSERT INTO order_statuses (status_name) VALUES ('Pending');

    IF NOT EXISTS (SELECT 1 FROM payment_methods WHERE LOWER(method_name) = 'cod')
      INSERT INTO payment_methods (method_name) VALUES ('COD');

    IF NOT EXISTS (SELECT 1 FROM payment_statuses WHERE LOWER(status_name) = 'pending')
      INSERT INTO payment_statuses (status_name) VALUES ('Pending');
  `);

  const statusRows = await queryDatabase(
    "SELECT TOP 1 status_id AS id FROM order_statuses WHERE LOWER(status_name) = 'pending'"
  );
  const methodRows = await queryDatabase(
    "SELECT TOP 1 method_id AS id FROM payment_methods WHERE LOWER(method_name) = 'cod'"
  );
  const paymentStatusRows = await queryDatabase(
    "SELECT TOP 1 status_id AS id FROM payment_statuses WHERE LOWER(status_name) = 'pending'"
  );

  const createdOrders = await queryDatabase(
    `
      INSERT INTO orders (
        user_id,
        total,
        status_id
      )
      OUTPUT INSERTED.order_id AS id
      VALUES (?, ?, ?)
    `,
    [userId, totalAmount, statusRows[0].id]
  );

  const createdOrder = createdOrders[0];

  for (const [productId, item] of orderItemsByProduct.entries()) {

    await queryDatabase(
      `
        INSERT INTO order_items (
          order_id,
          product_id,
          quantity,
          price
        )
        VALUES (?, ?, ?, ?)
      `,
      [createdOrder.id, productId, item.quantity, item.price]
    );
  }

  await queryDatabase(
    `
      INSERT INTO order_payments (
        order_id,
        method_id,
        status_id
      )
      VALUES (?, ?, ?)
    `,
    [createdOrder.id, methodRows[0].id, paymentStatusRows[0].id]
  );

  return {
    id: createdOrder.id,
    reference: `VC-${createdOrder.id}`,
    total: totalAmount,
  };
}

async function testConnection() {
  const result = await queryDatabase('SELECT DB_NAME() AS databaseName, @@SERVERNAME AS serverName');
  return result[0];
}

module.exports = {
  database,
  queryDatabase,
  province,
  createOrder,
  createUserAccount,
  findUserByEmail,
  getLocations,
  getProducts,
  getUserCart,
  loginUser,
  resetUserPassword,
  saveUserCart,
  testConnection,
  updateUserProfile,
};
