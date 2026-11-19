const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    console.error('------------------------------------------------------------');
    console.error(' [MongoDB Atlas Error]: Invalid or missing MONGODB_URI!');
    console.error(' Please update your .env file with your valid MongoDB Atlas URI:');
    console.error(' Example: mongodb+srv://user:pass@cluster0.abcde.mongodb.net/products_db?retryWrites=true&w=majority');
    console.error('------------------------------------------------------------');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(` MongoDB Atlas Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(` Error connecting to MongoDB: ${error.message}`);
    console.error('Tip: Check your Atlas IP Whitelist (Network Access) and database credentials.');
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
