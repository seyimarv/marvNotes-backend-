const mongoose = require("mongoose")

const Schema = mongoose.Schema


const noteSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
  
    }, //storing reference to a user
    likes: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }]
}, {timestamps: true})





module.exports = mongoose.model('Note', noteSchema)