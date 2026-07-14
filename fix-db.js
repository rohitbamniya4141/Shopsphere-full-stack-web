const mongoose = require('mongoose');
const config = require('config');

mongoose.connect(config.get('MONGODB_URI') + '/shopSphere')
  .then(async () => {
    const Product = require('./models/product-model.js');
    
    // Fetch all travel bags to see what they look like
    const bags = await Product.find({ category: 'Travel Bags' });
    console.log(`Found ${bags.length} Travel Bags.`);
    
    for (let bag of bags) {
      if (bag.image && bag.image.endsWith('.png')) {
        bag.image = bag.image.replace('.png', '.jpg');
        await bag.save();
        console.log(`Fixed ${bag.name}`);
      }
    }
    
    console.log('Done fixing database images.');
    mongoose.disconnect();
  })
  .catch(console.error);
