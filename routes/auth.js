const express = require('express')

const { body } = require('express-validator/check') //for validation

const User = require('../models/user')

const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');

const router = express.Router();


//signup user
router.put('/signup', [
    body('email').isEmail().withMessage("Please enter a valid email").custom((value, {req}) => {
        return User.findOne({email: value}).then(userDoc => {
            if (userDoc) {
                return Promise.reject('E-mail already exists')
            }
        }) //custom validation to check if email already exists in the database
    }).normalizeEmail(),
    body('password').trim().isLength({min: 6}),
    body('name').trim().not().isEmpty().isLength({min: 5})
], authController.signup)

router.post('/login', authController.login)
router.put('/forgot-password',
 authController.forgotPassword)
 router.put('/reset-password/:token', isAuth,
 authController.resetPassword)
module.exports = router