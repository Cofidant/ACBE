const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Enter your Name'],
      minlength: 4,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Enter your Email Address'],
      match: [
        /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
        'Enter a Valid Email Address',
      ],
      unique: [true, 'Email already Exist'],
    },
    image: String,
    bookmarks: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
      },
    ],
    noOfPosts: {
      type: Number,
      default: 0,
    },
    provider: {
      type: String,
      default: 'default',
    },
    password: {
      type: String,
      required: [true, 'Enter your Password'],
      minlength: 6,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
      default: Date.now(),
    },
    passwordResetToken: String,
    resetTokenExpiresAt: Date,
  },

  {
    timestamps: true,
    discriminatorKey: '_kind',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// indexes
UserSchema.index({ email: 1 }, { unique: true })

// hooks
UserSchema.pre('save', async function (next) {
  /* If password is not modified skip */
  if (!this.isModified('password')) {
    return next()
  }
  const salt = await bcrypt.genSaltSync(10)
  this.password = await bcrypt.hash(this.password, salt)
  this.passwordChangedAt = Date.now() - 1000
  next()
})

// Methods
UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, name: this.name, iat: Date.now() + 1000 },
    process.env.jwtSecret,
    {
      expiresIn: process.env.jwtLifetime,
    }
  )
}

UserSchema.methods.comparePassword = async function (userpassword) {
  const isMatched = await bcrypt.compare(userpassword, this.password)
  return isMatched
}

UserSchema.methods.changesPasswordAfter = function (tokenTimeStamp) {
  if (this.passwordChangedAt) {
    const lastPassChangedAt = parseInt(this.passwordChangedAt.getTime() / 1000)
    return tokenTimeStamp < lastPassChangedAt
  }
  return false
}

UserSchema.methods.getPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex')

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  //token expires after 15 minutes
  this.resetTokenExpiresAt = Date.now() + 15 * 60 * 1000
  return resetToken
}

module.exports = mongoose.model('User', UserSchema)
