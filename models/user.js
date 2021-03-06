//creating a user model

const mongoose = require("mongoose")
const Schema = mongoose.Schema


const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    notes:  [{
        type: Schema.Types.ObjectId,
        ref: 'Note' //store reference to the Post model
    }],
    resetToken: String, //needed to reset password in case user forget password
    resetTokenExpiration: Date,
    favorites: [{
        type: Schema.Types.ObjectId,
        ref: 'Note'
    }]
})

module.exports = mongoose.model('User', userSchema)