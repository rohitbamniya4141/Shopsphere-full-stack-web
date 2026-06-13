const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Owner route is working!');
});

module.exports = router;