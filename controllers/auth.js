const User = require('../models/user');

const { validationResult } = require('express-validator/check')

const jwt = require('jsonwebtoken')

const bcrypt = require('bcryptjs')

const nodemailer = require("nodemailer");



const transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
      user: "seyimarv09@outlook.com",
      pass: "Tomilayo1!"
    }
  }) //for sending emails



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

exports.forgotPassword = async (req, res, next) => {
    const email = req.body.email
    console.log(email)
    try {
        const user = await User.findOne({email: email})
        loadedUser = user
        if (!user) {
            const error = new Error('User email doesnt exist')
            error.statusCode = 401
            throw error
        }
        const token = jwt.sign(
            {
              email: user.email,
              userId: user._id.toString()
            },
            'somesupersecretsecret',
            { expiresIn: '24h' }
          );
          user.resetToken = token;
          user.resetTokenExpiration = Date.now() + 3600000;
          const result = await user.save()
          transporter.sendMail({
            to: email,
            from: "seyimarv09@outlook.com",
            subject: "Reset password",
            html: `
            <p>You requested a password reset</p>
            <p>click this <a href="http://localhost:3000/reset/${token}">Link</a> to set a new password. </p>
            `
          }) //sends the reset password email to the user
          res.status(200).json({ message: 'reset password email sent!', user: result });
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
    const password = req.body.password
    const token = req.params.token
    const userId = req.userId
    
   
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
   let resetUser;
    try {
        const user = await  User.findOne(
            {resetToken: token, _id:userId}
          )
        if (!user) {
            const error = new Error('User doesnt exist')
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

