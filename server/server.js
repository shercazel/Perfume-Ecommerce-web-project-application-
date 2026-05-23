const crypto = require('node:crypto');
const http = require('node:http');
const sql = require('mssql');

const PORT = 3000;
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24;
const sessions = new Map();
const [dbServer, dbInstanceFromServer] = (process.env.DB_SERVER || 'localhost').split('\\');

const sqlConfig = {
  server: dbServer,
  database: process.env.DB_NAME || 'VotrescentDb',
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

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': 'http://localhost:4200',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  });
  response.end(JSON.stringify(body));
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
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
  return { hash, salt };
}

function isValidPassword(password, user) {
  const { hash } = hashPassword(password, user.PasswordSalt);
  const savedHash = Buffer.from(user.PasswordHash, 'hex');
  const incomingHash = Buffer.from(hash, 'hex');

  return savedHash.length === incomingHash.length && crypto.timingSafeEqual(savedHash, incomingHash);
}

function buildPublicUser(user) {
  return {
    id: user.Id,
    firstName: user.FirstName,
    lastName: user.LastName,
    email: user.Email,
  };
}

function createToken(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, {
    userId,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  });
  return token;
}

function getBearerToken(request) {
  const authorization = request.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  return scheme === 'Bearer' ? token : '';
}

async function handleSignup(request, response) {
  const payload = await readRequestBody(request);
  const firstName = String(payload.firstName || '').trim();
  const lastName = String(payload.lastName || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const password = String(payload.password || '');

  if (!firstName || !lastName || !email || !password) {
    sendJson(response, 400, { message: 'Please complete all required fields.' });
    return;
  }

  if (password.length < 6) {
    sendJson(response, 400, { message: 'Password must be at least 6 characters.' });
    return;
  }

  const pool = await poolPromise;
  const existingUser = await pool
    .request()
    .input('email', sql.NVarChar(255), email)
    .query('SELECT Id FROM dbo.Users WHERE Email = @email');

  if (existingUser.recordset.length > 0) {
    sendJson(response, 409, { message: 'This email already has an account.' });
    return;
  }

  const { hash, salt } = hashPassword(password);
  const id = crypto.randomUUID();
  const insertedUser = await pool
    .request()
    .input('id', sql.UniqueIdentifier, id)
    .input('firstName', sql.NVarChar(100), firstName)
    .input('lastName', sql.NVarChar(100), lastName)
    .input('email', sql.NVarChar(255), email)
    .input('passwordHash', sql.NVarChar(128), hash)
    .input('passwordSalt', sql.NVarChar(32), salt)
    .query(`
      INSERT INTO dbo.Users (Id, FirstName, LastName, Email, PasswordHash, PasswordSalt)
      OUTPUT inserted.Id, inserted.FirstName, inserted.LastName, inserted.Email
      VALUES (@id, @firstName, @lastName, @email, @passwordHash, @passwordSalt)
    `);

  sendJson(response, 201, {
    message: 'Account created successfully.',
    user: buildPublicUser(insertedUser.recordset[0]),
  });
}

async function handleLogin(request, response) {
  const payload = await readRequestBody(request);
  const email = String(payload.email || '').trim().toLowerCase();
  const password = String(payload.password || '');

  if (!email || !password) {
    sendJson(response, 400, { message: 'Please enter your email and password.' });
    return;
  }

  const pool = await poolPromise;
  const result = await pool
    .request()
    .input('email', sql.NVarChar(255), email)
    .query(`
      SELECT Id, FirstName, LastName, Email, PasswordHash, PasswordSalt
      FROM dbo.Users
      WHERE Email = @email
    `);
  const user = result.recordset[0];

  if (!user || !isValidPassword(password, user)) {
    sendJson(response, 401, { message: 'Invalid email or password.' });
    return;
  }

  sendJson(response, 200, {
    token: createToken(user.Id),
    user: buildPublicUser(user),
  });
}

async function handleMe(request, response) {
  const token = getBearerToken(request);
  const session = sessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token);
    sendJson(response, 401, { message: 'Session expired. Please log in again.' });
    return;
  }

  const pool = await poolPromise;
  const result = await pool
    .request()
    .input('id', sql.UniqueIdentifier, session.userId)
    .query(`
      SELECT Id, FirstName, LastName, Email
      FROM dbo.Users
      WHERE Id = @id
    `);
  const user = result.recordset[0];

  if (!user) {
    sendJson(response, 404, { message: 'User not found.' });
    return;
  }

  sendJson(response, 200, { user: buildPublicUser(user) });
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  try {
    if (request.method === 'POST' && request.url === '/api/auth/signup') {
      await handleSignup(request, response);
      return;
    }

    if (request.method === 'POST' && request.url === '/api/auth/login') {
      await handleLogin(request, response);
      return;
    }

    if (request.method === 'GET' && request.url === '/api/auth/me') {
      await handleMe(request, response);
      return;
    }

    sendJson(response, 404, { message: 'Route not found.' });
  } catch (error) {
    sendJson(response, 500, { message: error.message || 'Server error.' });
  }
});

server.listen(PORT, () => {
  console.log(`Auth API running at http://localhost:${PORT}`);
});
