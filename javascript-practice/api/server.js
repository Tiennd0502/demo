const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');  // Points to your mock DB
const middlewares = jsonServer.defaults();

// Set up the middlewares (logging, CORS, etc.)
server.use(middlewares);

// Attach the router to handle API requests
server.use(router);

// Export the serverless function for Vercel
module.exports = server;