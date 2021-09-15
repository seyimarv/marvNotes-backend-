const express = require('express')

const { body } = require('express-validator/check') //for validation

const User = require('../models/user')

const isAuth = require('../middleware/is-auth')

const noteController = require('../controllers/notes')

const router = express.Router();

router.get('/note', isAuth, noteController.getNotes)

router.get("/note/:noteId", isAuth, noteController.getNote)

router.post('/note',isAuth,noteController.createNote)

router.put('/note/:noteId',isAuth, noteController.updateNote)

router.delete('/note/:noteId',isAuth, noteController.deleteNote)

router.post('/note/:noteId', isAuth, noteController.likeNote)

// router.post('/unlike-note/:noteId',isAuth, noteController.unLikeNote)



module.exports = router