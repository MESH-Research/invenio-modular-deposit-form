/** Stub axios for Jest: real package is ESM-only in recent majors and breaks CJS/Jest without full transform. */
module.exports = {
  create: jest.fn(() => module.exports),
  defaults: { headers: {} },
  delete: jest.fn(),
  get: jest.fn(),
  head: jest.fn(),
  interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  patch: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
};
