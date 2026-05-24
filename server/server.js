const crypto = require('crypto');
const http = require('http');
const {
  createUserAccount,
  getProducts,
  loginUser,
  resetUserPassword,
  testConnection,
} = require('../databse');

const PORT = 3000;

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': 'http://localhost:4200',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
    });

    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });

    request.on('error', reject);
  });
}

async function handleLogin(request, response) {
  const { email, password } = await readBody(request);

  if (!email || !password) {
    sendJson(response, 400, { message: 'Email and password are required.' });
    return;
  }

  const loginResult = await loginUser(String(email).trim(), String(password));

  if (loginResult.status === 'not_found') {
    sendJson(response, 404, { message: 'Account does not exist.' });
    return;
  }

  if (loginResult.status === 'invalid_password') {
    sendJson(response, 401, { message: 'Incorrect password.' });
    return;
  }

  if (loginResult.status === 'inactive') {
    sendJson(response, 403, { message: `Account is ${loginResult.accountStatus}.` });
    return;
  }

  const user = loginResult.user;

  sendJson(response, 200, {
    token: crypto.randomBytes(32).toString('hex'),
    user: {
      id: String(user.id),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: String(user.role || 'customer').toLowerCase(),
    },
  });
}

async function handleSignup(request, response) {
  const { firstName, lastName, email, password } = await readBody(request);

  if (!firstName || !lastName || !email || !password) {
    sendJson(response, 400, { message: 'Please complete all required fields.' });
    return;
  }

  const result = await createUserAccount({
    firstName: String(firstName).trim(),
    lastName: String(lastName).trim(),
    email: String(email).trim(),
    password: String(password),
  });

  if (result.status === 'exists') {
    sendJson(response, 409, { message: 'Account already exists.' });
    return;
  }

  sendJson(response, 201, {
    message: 'Account created successfully.',
    user: {
      ...result.user,
      id: String(result.user.id),
    },
  });
}

async function handleResetPassword(request, response) {
  const { email, password } = await readBody(request);

  if (!email || !password) {
    sendJson(response, 400, { message: 'Email/username and new password are required.' });
    return;
  }

  const result = await resetUserPassword(String(email).trim(), String(password));

  if (result.status === 'not_found') {
    sendJson(response, 404, { message: 'No account found with that email or username.' });
    return;
  }

  sendJson(response, 200, { message: 'Password updated successfully.' });
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  try {
    if (request.method === 'GET' && request.url === '/api/health') {
      sendJson(response, 200, await testConnection());
      return;
    }

    if (request.method === 'POST' && request.url === '/api/auth/login') {
      await handleLogin(request, response);
      return;
    }

    if (request.method === 'POST' && request.url === '/api/auth/signup') {
      await handleSignup(request, response);
      return;
    }

    if (request.method === 'POST' && request.url === '/api/auth/reset-password') {
      await handleResetPassword(request, response);
      return;
    }

    if (request.method === 'GET' && request.url === '/api/products') {
      sendJson(response, 200, await getProducts());
      return;
    }

    sendJson(response, 404, { message: 'Route not found.' });
  } catch (error) {
    console.error('API Error:', error.message);
    sendJson(response, 500, { message: 'Server error. Please try again.' });
  }
});

server.listen(PORT, () => {
  console.log(`Auth API running at http://localhost:${PORT}`);
});
