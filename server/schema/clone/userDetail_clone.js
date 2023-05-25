let mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId
//UserDetails Schema
let userDetailSchemaClone = mongoose.Schema({
    originalId: {
        type: ObjectId,
        required: true,
        ref: "userDetail"
    },
    actionType: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    data: {
        type: Object,
        required: true,
        trim: true
    },
    status: {
        type: Number
    }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("userDetailClone", userDetailSchemaClone);
