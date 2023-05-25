let mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId
//CFS Schema
let cfsSchema = mongoose.Schema({
    countryName: {
        type: ObjectId,
        require: true,
        trim: true,
        ref: "country"
    },
    type: {
        type: Number,                  // type: 1 : originCFS, 2 : destinationCFS, 3: registered
        require: true
    },
    gateway: {
        type: String,
        trim: true
    },
    destination: {
        type: String,
        trim: true,
    },
    cfsBranch: {
        type: String,
        trim: true,
        require: true,
    },
    cfsName: {
        type: String,
        require: true,
        trim: true,
    },
    fullName: {
        type: String,
        trim: true,
        require: true,
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        require: true,
    },
    address: {
        type: String,
        trim: true,
        require: true,
    },
    mobileNo: {
        type: String,
        trim: true,
        require: true,
    },
    cfsCertificate: {
        type: Array,
        trim: true,
        default: []
    },
    password: {
        type: String,
        trim: true,
        require: true,
    },
    role: {
        type: Number,                      // 6 - Origin CFS, 7 - Destination CFS
    },
    createdBy: {
        type: ObjectId,
        require: true,
        ref: "user"
    },
    systemInfo: {
        type: Object
    },
    loginTime: {
        type: Date
    },
    logoutTime: {
        type: Date
    },
    status: {
        type: Number,
        default: 3
    },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("cfs", cfsSchema);

