const express = require('express');
const router = express.Router();
const{registerUser, loginUser} = require('../controllers/authController');

router.get('/', (req, res) => {
    res.send('user route is working!');
});

router.post('/register', registerUser);

router.post('/login', loginUser);

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

module.exports = router;