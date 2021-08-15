const express = require('express'); //import express

const path = require('path')

const User = require('./models/user')
const bodyParser = require('body-parser')  //import body-parser

const mongoose = require('mongoose') //importing mongoose

const authRoutes = require('./routes/auth')  //needed to register the route

const noteRoutes = require('./routes/notes')  //needed to register the route

const app = express(); //create the express app.

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
    next();
});  //used to solve the Cors Error to allow client(frontend) and server(backend) run on different domains


app.use('/auth', authRoutes) // /auth is added to filter requests that start with 'auth'
app.use('/note', noteRoutes)


app.use((error, req, next) => {
    console.log(error)
    const status = error.statusCode || 500
    const message = error.message;
    const data = error.data
    res.status(status).join({message: message, data: data})

}) //the speaciall error handling middleware

mongoose.connect('mongodb+srv://Marvelous:Tomilayo1@cluster0.yopfs.mongodb.net/notesapp')
.then(result => {
    console.log('connected')
   app.listen(8081)
}).catch(err => {
    console.log(err)
})//establish a mongoose connection

// app.listen(8081); //listen to incoming request on the specified port.