const crypto = require('crypto');
const http = require('http');
const {
  createOrder,
  createUserAccount,
  getLocations,
  getProducts,
  getUserCart,
  loginUser,
  resetUserPassword,
  saveUserCart,
  testConnection,
  updateUserProfile,
} = require('../databse');

const PORT = 3000;

function getAllowedOrigin(request) {
  const origin = request.headers.origin;

  return origin || 'http://localhost:4200';
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': response.allowedOrigin || 'http://localhost:4200',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
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
      address: user.address,
      cityId: user.cityId,
      cityName: user.cityName,
      provinceId: user.provinceId,
      provinceName: user.provinceName,
      phoneNumber: user.phoneNumber,
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

async function handleUpdateProfile(request, response) {
  const profile = await readBody(request);

  if (!profile.id || !profile.firstName || !profile.lastName || !profile.email) {
    sendJson(response, 400, { message: 'Please complete all required profile fields.' });
    return;
  }

  if (profile.newPassword && String(profile.newPassword).trim().length < 6) {
    sendJson(response, 400, { message: 'New password must be at least 6 characters.' });
    return;
  }

  const updatedUser = await updateUserProfile(profile.id, profile);

  if (!updatedUser) {
    sendJson(response, 404, { message: 'Account not found.' });
    return;
  }

  sendJson(response, 200, { message: 'Profile updated successfully.', user: updatedUser });
}

async function handleCreateOrder(request, response) {
  const order = await readBody(request);

  if (
    !order.userId ||
    !order.customer?.name ||
    !order.customer?.contact ||
    !order.customer?.province ||
    !order.customer?.city ||
    !order.customer?.address ||
    !Array.isArray(order.items) ||
    order.items.length === 0
  ) {
    sendJson(response, 400, { message: 'Please log in, complete checkout details, and select at least one item.' });
    return;
  }

  if (
    order.items.some(
      (item) =>
        !item?.id ||
        !String(item.name || '').trim() ||
        !Number.isFinite(Number(item.quantity)) ||
        Number(item.quantity) <= 0 ||
        !Number.isFinite(Number(item.price)) ||
        Number(item.price) <= 0,
    )
  ) {
    sendJson(response, 400, { message: 'One or more selected items are missing valid product details.' });
    return;
  }

  const createdOrder = await createOrder(order);

  sendJson(response, 201, {
    message: 'Order created successfully.',
    order: createdOrder,
  });
}

async function handleGetCart(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const userId = url.searchParams.get('userId');

  if (!userId || !Number.isFinite(Number(userId))) {
    sendJson(response, 400, { message: 'A valid user ID is required.' });
    return;
  }

  sendJson(response, 200, { items: await getUserCart(Number(userId)) });
}

async function handleSaveCart(request, response) {
  const cart = await readBody(request);

  if (!cart.userId || !Number.isFinite(Number(cart.userId)) || !Array.isArray(cart.items)) {
    sendJson(response, 400, { message: 'A valid user ID and cart items are required.' });
    return;
  }

  const invalidItem = cart.items.some(
    (item) =>
      !item?.id ||
      !String(item.name || item.perfName || '').trim() ||
      !Number.isFinite(Number(item.quantity)) ||
      Number(item.quantity) < 0 ||
      !Number.isFinite(Number(item.price)) ||
      Number(item.price) <= 0,
  );

  if (invalidItem) {
    sendJson(response, 400, { message: 'One or more cart items are missing valid product details.' });
    return;
  }

  sendJson(response, 200, { items: await saveUserCart(Number(cart.userId), cart.items) });
}

const server = http.createServer(async (request, response) => {
  response.allowedOrigin = getAllowedOrigin(request);

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

    if (request.method === 'PUT' && request.url === '/api/auth/profile') {
      await handleUpdateProfile(request, response);
      return;
    }

    if (request.method === 'GET' && request.url === '/api/locations') {
      sendJson(response, 200, await getLocations());
      return;
    }

    if (request.method === 'GET' && request.url === '/api/products') {
      sendJson(response, 200, await getProducts());
      return;
    }

    if (request.method === 'GET' && request.url.startsWith('/api/cart')) {
      await handleGetCart(request, response);
      return;
    }

    if (request.method === 'PUT' && request.url === '/api/cart') {
      await handleSaveCart(request, response);
      return;
    }

    if (request.method === 'POST' && request.url === '/api/orders') {
      await handleCreateOrder(request, response);
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
