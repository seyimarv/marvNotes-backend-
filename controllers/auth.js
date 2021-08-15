const User = require('../models/user');

const { validationResult } = require('express-validator/check')

const jwt = require('jsonwebtoken')

const bcrypt = require('bcryptjs')



exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    bcrypt.hash(password, 12).then(hashedpass => {
        const user = new User({
           email: email,
           password: hashedpass,
           name: name 
        });
        return user.save();
    }).then(result => {
        res.status(201).json({message: 'User created', user: result})
    }).catch(err => {
        if(!error.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    })
    
}


exports.login = async (req, res, next) => {
    const email = req.body.email
    const password = req.body.password



    try {
        const user = await User.findOne({email: email})
        if (!user) {
            const error = new Error('User email doesnt exist')
            error.statusCode = 401
            throw error
        }
        loadedUser = user
        console.log(user)
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        console.log(password, "os", user.password)
        console.log(isPasswordCorrect)
        if(!isPasswordCorrect) {
            const error = new Error('Password is incorrect')
            error.statusCode = 401;
            throw error
        }
        // set a user token
        const token = jwt.sign(
            {
              email: user.email,
              userId: user._id.toString()
            },
            'somesupersecretsecret',
            { expiresIn: '1h' }
          );
         console.log(loadedUser) 
      res.status(200).json({ token: token, userId: loadedUser._id.toString(), userName: loadedUser._doc.name });

    } catch (err) {
        console.log(err)
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    }
}

exports.resetPassword = async (req, res, next) => {
    const errors = validationResult(req);
    const email = req.body.email
    const password = req.body.password

    if(!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
   let resetUser;
    try {
        const user = await User.findOne({email: email})
        if (!user) {
            const error = new Error('User email doesnt exist')
            error.statusCode = 401
            throw error
        }
        resetUser = user
        const hashedpass = await bcrypt.hash(password, 12)
        resetUser.password = hashedpass
        const result = await resetUser.save()
        res.status(200).json({ message: 'Password updated!', user: result });
       
    } catch(err) {
       console.log(err)
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    }
}

