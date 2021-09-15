const Note = require('../models/notes')
const User = require('../models/user');
const io = require('../socket');

exports.createNote = async (req, res, next) => {
    const title = req.body.title
    const content = req.body.content
    const privacy = req.body.privacy
    console.log(privacy)
    let creator;

    const note = new Note({
        title: title,
        content: content,
        private: privacy,
        creator: req.userId
    })

    try {
        await note.save()
        const user = await User.findById(req.userId)
        console.log(user)
        creator = user
        user.notes.push(note)
        await user.save()
        io.getIo().emit('notes', {
            action: 'create',
            note: { ...note._doc, creator: { _id: req.userId, name: user.name } }
        }) //send a message to all connected users, send to all connected clients whenever a posts is created anywhere(from any other user)
        res.status(201).json({
            message: 'Note created',
            note: {
                ...note._doc,
                creator: { _id: creator._id, name: creator.name }
            }
           
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
    const{ noteId} = req.params
    const title = req.body.title
    const content = req.body.content
    const privacy = req.body.privacy
    try {
        const note = await Note.findById(noteId).populate('creator')
        const user = await User.findById(req.userId)
        console.log(note)
        if (!note) {
            const error = new Error('Note not Found')
            error.statusCode = 404
            throw error
        }
        if (note.creator._id.toString() !== req.userId) {
            const error = new Error('Not authorized')
            error.statusCode = 403;
            throw error
        }
        note.title = title,
        note.content = content
        note.private = privacy

        const result = await note.save()
        io.getIo().emit('notes', {
            action: 'update',
            note: { ...note._doc, creator: { _id: req.userId, name: user.name } }
        }) 
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
    const { noteId } = req.params
    console.log(noteId)
    console.log('clicked')
    try {
        const note = await Note.findById(noteId).populate('creator')
        if (!note) {
            const error = new Error('Note not Found')
            error.statusCode = 404
            throw error
        }

        if (note.creator._id.toString() !== req.userId) {
            const error = new Error('Not authorized')
            error.statusCode = 403;
            throw error
        }
        await Note.findByIdAndRemove(noteId)
        const user = await User.findById(req.userId)
        user.notes.pull(noteId)
        await user.save()
        io.getIo().emit('notes', { action: 'delete', note: note });
        res.status(200).json({ message: 'Note deleted' })


    } catch (err) {

        console.log(err)
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)


    }

}

exports.getNotes = async (req, res, next) => {
    const privacy = req.get('Privacy')
    let notes;
    try {
        if(privacy == 'favorites') {
            notes = await Note.find().sort({createdAt: -1}).populate('creator')
            res.status(201).json({
                message: 'Notes fetched',
                notes: notes
            })
            return
        }
          notes = await Note.find({private: privacy }).sort({createdAt: -1}).populate('creator')
          if(privacy === 'true') {
            notes = notes.filter(note => {
                note.creator._id.toString() === req.userId
                return notes
            })
        //   return notes
          
        }
            if (!notes) {
                const error = new Error('Notes not Found')
                error.statusCode = 404
                throw error
            }
           console.log(notes)
            res.status(201).json({
                message: 'Notes fetched',
                notes: notes
            })
       
      
    } catch (err) {
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

        if (!post) {
            const error = new Error('Could not find post')
            error.statusCode = 404;
            throw error
        }

        res.status(201).json({
            message: 'Note fetched',
            note: note
        })


    } catch (err) {
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
    const { noteId } = req.params
    const userId = req.userId
    try {
        const note = await Note.findById(noteId).populate('creator')
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
        if (!note.likes.includes(userId) && !user.favorites.includes(noteId)) {
            note.likes.push(userId)
            await note.save()
            user.favorites.push(noteId)
            await user.save()
            io.getIo().emit('notes', { action: 'like', note: note });
            res.status(200).json({ message: 'Note Liked' })
            return
        }

        note.likes.pull(userId)
        await note.save()
        user.favorites.pull(noteId)
        await user.save()

        io.getIo().emit('notes', { action: 'like', note: note });
        res.status(200).json({ message: 'Note unLiked' })


    } catch (err) {

        console.log(err)
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)


    }
}

// exports.unLikeNote = async (req, res, next) => {
//     // const noteId = req.params 
//     // const userId = req.userId
//     const noteId = req.params
//     const userId = req.userId
//     try {
//         const note = await Note.findById(noteId)
//         const user = await User.findById(userId)
//         if (!note) {
//             const error = new Error('No note found')
//             error.statusCode = 403;
//             throw error
//         }
//         if (!userId) {
//             const error = new Error('User not authorized')
//             error.statusCode = 403;
//             throw error
//         }
//         note.likes.pull(userId)
//         await note.save()
//         user.favorites.pull(noteId)
//         await user.save()
//         res.status(200).json({message: 'Note unLiked'})

//     } catch(err) {

//         console.log(err)
//         if (!err.statusCode) {
//             err.statusCode = 500;
//         }
//         next(err)


//     }
// }