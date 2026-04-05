const express=require('express');
const router = express.Router();
const authController=require('../controllers/authController');
// const User = require('../models/user');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');  

router.post('/register',authController.register);

router.post('/login',authController.login);

module.exports=router;