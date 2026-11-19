require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB();

// Start Express Server
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(` Listening on port: ${PORT}`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` API Endpoint: http://localhost:${PORT}/api/products`);
  console.log(`====================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // Keep server running in dev or server.close(() => process.exit(1));
});
