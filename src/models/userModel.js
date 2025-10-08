const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    verifyCode: String,
    resetPasswordCode: String,
    isVerified: {
        type: Boolean,
        default: false
    }

})
const Users = mongoose.model("authentication_system_user", userSchema)
module.exports = Users