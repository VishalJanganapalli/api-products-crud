require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const productsData = require('./productsData');

const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    console.error('================================================================');
    console.error(' [ERROR] MongoDB Atlas Connection String missing or incomplete!');
    console.error(' Please update the MONGODB_URI in your .env file with your valid Atlas URI.');
    console.error(' Example:');
    console.error(' MONGODB_URI=mongodb+srv://admin:myPassword@cluster0.abcde.mongodb.net/products_db?retryWrites=true&w=majority');
    console.error('================================================================');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });
    console.log(`Connected to MongoDB Atlas: ${conn.connection.host} / ${conn.connection.name}`);

    // Clean existing collection
    console.log('Clearing existing products collection...');
    const deleteResult = await Product.deleteMany({});
    console.log(`Removed ${deleteResult.deletedCount} existing products.`);

    // Insert new seed data
    console.log(`Inserting ${productsData.length} rich product records (each with 25+ fields)...`);
    const inserted = await Product.insertMany(productsData);

    console.log('----------------------------------------------------');
    console.log(` SUCCESS: Seeded ${inserted.length} products successfully!`);
    console.log('----------------------------------------------------');

    // Display summary of key conditional rendering fields and categories
    const categories = [...new Set(inserted.map((p) => p.category))];
    const featuredCount = inserted.filter((p) => p.isFeatured).length;
    const saleCount = inserted.filter((p) => p.isOnSale).length;
    const bestSellerCount = inserted.filter((p) => p.isBestSeller).length;
    const freeShippingCount = inserted.filter((p) => p.hasFreeShipping).length;

    console.log(`Distinct Categories (${categories.length}):`, categories.join(', '));
    console.log(`Products with isFeatured: true    -> ${featuredCount}`);
    console.log(`Products with isOnSale: true       -> ${saleCount}`);
    console.log(`Products with isBestSeller: true   -> ${bestSellerCount}`);
    console.log(`Products with hasFreeShipping: true-> ${freeShippingCount}`);
    console.log('----------------------------------------------------');

    await mongoose.connection.close();
    console.log('MongoDB connection closed cleanly.');
    process.exit(0);
  } catch (error) {
    console.error('----------------------------------------------------');
    console.error(' Seeding Failed:', error.message);
    if (error.name === 'MongooseServerSelectionError') {
      console.error('Tip: Check your Atlas IP Whitelist (Network Access) in MongoDB Atlas and your database username/password.');
    }
    console.error('----------------------------------------------------');
    process.exit(1);
  }
};

seedDatabase();
