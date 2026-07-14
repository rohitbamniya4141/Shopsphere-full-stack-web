require('dotenv').config();
const mongoose = require('mongoose');
const config = require('config');
const dbgr = require('debug')('development:mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('./models/product-model');

process.env.NODE_ENV = 'development';

mongoose.connect(`${config.get('MONGODB_URI')}/shopSphere`)
  .then(async () => {
    console.log('Connected to MongoDB. Starting seed...');
    
    // Read the laptop-bags.json file
    const dataPath = path.join(__dirname, 'laptop-bags.json');
    const productsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
    // Clear existing products if needed? Let's just add these as new products.
    // Or maybe it's better to clear them? The user might have other products. Let's not delete existing ones.
    
    try {
        const inserted = await Product.insertMany(productsData);
        console.log(`Successfully added ${inserted.length} laptop bags to the database!`);
    } catch (err) {
        console.error('Error inserting products:', err);
    }
    
    mongoose.disconnect();
    console.log('Database disconnected.');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
