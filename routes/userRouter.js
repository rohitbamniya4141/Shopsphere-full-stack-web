const express = require('express');
const router = express.Router();
const{registerUser, loginUser} = require('../controllers/authController');

router.get('/', (req, res) => {
    res.send('user route is working!');
});

router.post('/register', registerUser);

router.post('/login', loginUser);

module.exports = router;