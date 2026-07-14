require('dotenv').config();
const mongoose = require('mongoose');
const config = require('config');
const Product = require('./models/product-model');

process.env.NODE_ENV = 'development';

mongoose.connect(`${config.get('MONGODB_URI')}/shopSphere`)
  .then(async () => {
    console.log('Connected to MongoDB. Fixing image paths...');
    
    const products = await Product.find({});
    let count = 0;
    
    for (let product of products) {
        if (product.image && !product.image.startsWith('/images/products/') && product.image.startsWith('laptop-bag')) {
            product.image = `/images/products/${product.image}`;
            await product.save();
            count++;
        }
    }
    
    console.log(`Successfully fixed image paths for ${count} laptop bags.`);
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
