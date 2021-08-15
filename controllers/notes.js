const Note = require('../models/notes')
const User = require('../models/user');

exports.createNote = async (req, res, next) => {
    const title = req.body.title
    const content = req.body.content
    let creator;

    const note = new Note({
        title: title,
        content: content,
        creator: req.body.userId
    })

    try {
        await note.save()
        const user = await User.findById(req.body.userId)
        console.log(user)
        creator = user
        user.notes.push(note)
        await user.save()
        res.status(201).json({
            message: 'Note created',
            note: note,
            creator: { _id: creator._id, name: creator.name }
        })

    } catch (err) {
        console.log(err)
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    }
}

exports.updateNote = async (req, res, next) => {
    const noteId = req.params
    const title = req.body.title
    const content = req.body.content

    try {
        const note = await Note.findById(noteId).populate('creator')
        console.log(note)
        if (!note) {
            const error = new Error('Note not Found')
            error.statusCode = 404
            throw error
        }
        if (note.creator._id.toString() !== req.body.userId) {
            const error = new Error('Not authorized')
            error.statusCode = 403;
            throw error
        }
        note.title = title,
            note.content = content

        const result = await note.save()
        res.status(201).json({ message: 'Note updated', note: result })
    } catch (err) {
        console.log(err)
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)

    }
}

exports.deleteNote = async (req, res, next) => {
    const noteId = req.params
    try {
        const note = await Note.findById(noteId).populate('creator')
        if (!note) {
            const error = new Error('Note not Found')
            error.statusCode = 404
            throw error
        }
        if (note.creator._id.toString() !== req.body.userId) {
            const error = new Error('Not authorized')
            error.statusCode = 403;
            throw error
        }
        await Note.findByIdAndRemove(noteId)
        const user = await User.findById(req.body.userId)
        user.notes.pull(noteId)
        await user.save()
        res.status(200).json({message: 'Note deleted'})


    } catch (err) {

        console.log(err)
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)


    }

}

exports.getNotes = async (req, res, next) => {
    try {
        const notes = await Note.find()

        res.status(201).json({
            message: 'Notes fetched',
            notes: notes
        })

    } catch(err) {
        console.log(err)
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    }
}

exports.getNote = async (req, res, next) => {
    const noteId = req.params
    try {
        const note = await Note.findById(noteId)

        if(!post) {
            const error = new Error('Could not find post')
            error.statusCode = 404;
            throw error
        }

        res.status(201).json({
            message: 'Note fetched',
            note: note
        })


    } catch(err) {
        console.log(err)
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    }
} 

exports.likeNote = async (req, res, next) => {
      // const noteId = req.params 
    // const userId = req.userId
    const noteId = req.params
    const userId = req.userId
    try {
        const note = await Note.findById(noteId)
        const user = await User.findById(userId)
        if (!note) {
            const error = new Error('No note found')
            error.statusCode = 403;
            throw error
        }
        if (!userId) {
            const error = new Error('User not authorized')
            error.statusCode = 403;
            throw error
        }
        note.likes.push(userId)
        await note.save()
        user.favorites.push(noteId)
        await user.save()
        res.status(200).json({message: 'Note Liked'})


    } catch(err) {

        console.log(err)
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)


    }
}

exports.unLikeNote = async (req, res, next) => {
    // const noteId = req.params 
    // const userId = req.userId
    const noteId = req.params
    const userId = req.userId
    try {
        const note = await Note.findById(noteId)
        const user = await User.findById(userId)
        if (!note) {
            const error = new Error('No note found')
            error.statusCode = 403;
            throw error
        }
        if (!userId) {
            const error = new Error('User not authorized')
            error.statusCode = 403;
            throw error
        }
        note.likes.pull(userId)
        await note.save()
        user.favorites.pull(noteId)
        await user.save()
        res.status(200).json({message: 'Note unLiked'})

    } catch(err) {

        console.log(err)
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)


    }
}