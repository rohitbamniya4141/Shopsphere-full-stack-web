const express = require('express');
const router = express.Router();
const isLoggedIn = require('../middlewares/isLoggedIn');
const aiController = require('../controllers/aiController');

router.post('/chat', isLoggedIn, aiController.chat);

module.exports = router;
