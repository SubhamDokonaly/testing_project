let mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId
//UserDetails Schema
let userDetailSchema = mongoose.Schema({
    userId: {
        type: ObjectId,
        require: true,
        ref: "user"
    },
    legalName: {
        type: String,
        require: true,
        trim: true,
        lowercase: true
    },
    country: {
        type: ObjectId,
        require: true,
        ref: "country"
    },
    state: {
        type: String,
        require: true,
        trim: true,
    },
    city: {
        type: String,
        require: true,
        trim: true,
    },
    preferredGateway: {
        type: ObjectId,
        ref: "lane"
    },
    gstNumber: {
        type: String,
        require: true,
        trim: true,
        lowercase: true
    },
    gstFileName: {
        type: String,
        require: true
    },
    gstFilePath: {
        type: String,
        require: true
    },
    pan: {
        type: String,
        require: true,
        trim: true,
        lowercase: true
    },
    mto: {
        type: String,
        require: true,
        trim: true,
        lowercase: true
    },
    groupName: {
        type: String,
        trim: true,
    },
    blCopyName: {
        type: String,
        require: true
    },
    blCopyPath: {
        type: String,
        require: true
    },
    reason: {
        type: Array
    },
    createdBy: {
        type: ObjectId
    },
    systemInfo: {
        type: Object
    },
    status: {
        type: Number,
        default: 1
    },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("userDetail", userDetailSchema);
