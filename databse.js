const sql = require('msnodesqlv8');

const database = {
  sql,
  connectionString:
    'Server=LAPTOP-0H5D4O0M;Database=Votre_Scent;Trusted_Connection=yes;Driver={ODBC Driver 17 for SQL Server};TrustServerCertificate=yes;',
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

const accountSelect = `
  SELECT TOP 1
    ua.user_id AS id,
    ua.username,
    ua.password,
    COALESCE(ui.email, ua.username) AS email,
    COALESCE(ar.role_name, 'customer') AS role,
    COALESCE(acs.status_name, 'Active') AS status
  FROM user_accounts ua
  LEFT JOIN user_informations ui ON ui.user_id = ua.user_id
  LEFT JOIN account_roles ar ON ar.role_id = ua.role_id
  LEFT JOIN account_statuses acs ON acs.status_id = ua.status_id
  WHERE LOWER(COALESCE(ui.email, '')) = LOWER(?)
    OR LOWER(ua.username) = LOWER(?)
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
    firstName: name.firstName,
    lastName: name.lastName,
    email: row.email,
    role: String(row.role || 'customer').toLowerCase(),
    status: row.status,
    password: row.password,
  };
}

async function findUserByEmail(emailOrUsername) {
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

  const username = `${String(firstName).trim()} ${String(lastName).trim()}`.trim();
  const customerRoleId = 2;
  const activeStatusId = 1;
  const createdAccounts = await queryDatabase(
    `
      INSERT INTO user_accounts (username, password, role_id, status_id, created_Date)
      OUTPUT INSERTED.user_id AS id
      VALUES (?, ?, ?, ?, SYSDATETIME())
    `,
    [username, password, customerRoleId, activeStatusId]
  );

  const userId = createdAccounts[0].id;

  await queryDatabase(
    `
      INSERT INTO user_informations (user_id, email, address, city_id, province_id, phone_no)
      VALUES (
        ?,
        ?,
        ?,
        (SELECT TOP 1 city_id FROM cities ORDER BY city_id),
        (SELECT TOP 1 province_id FROM provinces ORDER BY province_id),
        ?
      )
    `,
    [userId, email, 'Not provided', 'Not provided']
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

  if (String(user.password) !== String(password)) {
    return {
      status: 'invalid_password',
      user: null,
    };
  }

  return {
    status: 'success',
    user: toPublicUser(user),
  };
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

async function testConnection() {
  const result = await queryDatabase('SELECT DB_NAME() AS databaseName, @@SERVERNAME AS serverName');
  return result[0];
}

module.exports = {
  database,
  queryDatabase,
  province,
  createUserAccount,
  findUserByEmail,
  getProducts,
  loginUser,
  testConnection,
};
