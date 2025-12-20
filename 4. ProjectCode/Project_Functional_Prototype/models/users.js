const mongoose = require("mongoose")
const userSchema = new mongoose.Schema(
    {
    username: {type: String},
    email: {type:String},
    passwordHash: {type:String},
    name: {type:String},
    role: {type:String, enum:['ADMIN', 'REGISTERED', 'USER'], default: 'USER'},
    status: {type:String, enum:['ACTIVE', 'INACTIVE'], default: 'ACTIVE'},
    tz: {type:String},
    googleId: {type: String, unique: true, sparse: true},
    picture: {type: String},
    createdAt: {type: Date, default: Date.now}
    },
    {collection: "users"}
);
module.exports = mongoose.model("User", userSchema);