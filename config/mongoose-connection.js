const mongoose = require('mongoose');
const config = require('config');
const dbgr = require('debug')('development:mongoose');

mongoose
.connect(`${config.get('MONGODB_URI')}/shopSphere`)
.then(() => {
    dbgr('Connected to MongoDB');
})
.catch((err) => {
    dbgr ('Error in connecting to MongoDB:', err);
});

module.exports = mongoose.connection;