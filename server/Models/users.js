const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        userEmail: {type: String, required: true},
        userName: {type: String, required: true},
        questionsSolved: {type: [String], required: true},
        experience: {type: Number, required: true},
        level: {type: Number, required: true, default: 0}
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('Users', userSchema, 'compPrUsers')

module.exports = User;