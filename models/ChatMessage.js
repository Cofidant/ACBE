const mongoose = require('mongoose')

const MESSAGE_TYPES = {
  TYPE_TEXT: 'text',
  TYPE_IMAGE: 'image',
  TYPE_LINK: 'link',
}

const readByRecipientSchema = new mongoose.Schema(
  {
    _id: false,
    readByUserId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    readAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: false,
  }
)

const chatMessageSchema = new mongoose.Schema(
  {
    sessionID: {
      type: mongoose.Schema.ObjectId,
      ref: 'Session',
      required: [true, 'Please provide the sessionID'],
    },
    message: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Please provide the message content'],
    },
    type: {
      type: String,
      default: () => MESSAGE_TYPES.TYPE_TEXT,
    },
    postedBy: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'Please provide your ID'],
    },
    date:{
      type: Date,
      default: Date.now()
    },
    readByRecipients: [readByRecipientSchema],
  },
  {
    timestamps: true,
    collection: 'chatmessages',
  }
)

chatMessageSchema.pre(/^find/, function (next) {
  this.populate('postedBy', 'username image name').sort('-createdAt')
  next()
})

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema)
module.exports = ChatMessage
