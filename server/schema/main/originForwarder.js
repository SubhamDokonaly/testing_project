let mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId
//originForwarder
let originForwarderSchema = mongoose.Schema({
    bookingId: {
        type: ObjectId,
        require: true,
        ref: "booking"
    },
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
    },
    mobile: {
        type: String,
        require: true,
    },
    legalName: {
        type: String,
        require: true,
        ref: "userDetail"
    },
    companyName: {
        type: String,
        require: true
    },
    doorNo: {
        type: String,
        require: true,
    },
    building: {
        type: String,
        require: true,
    },
    street: {
        type: String,
        require: true,
    },
    area: {
        type: String,
        require: true,
    },
    city: {
        type: String,
        require: true,
    },
    state: {
        type: String,
        require: true,
    },
    pincode: {
        type: String,
        require: true,
    },
    country: {
        type: ObjectId,
        require: true,
        ref: "country"
    },
    gstName: {
        type: String,
        require: true,
    },
    gstPath: {
        type: String,
        require: true,
    },
    hblName: {
        type: String,
        require: true,
    },
    saveFlag: {
        type: Number,
    },
    createdBy: {
        type: ObjectId,
        require: true,
        ref: "user"
    },
    systemInfo: {
        type: Object
    },
    status: {
        type: Number,
        default: 1
    },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("originForwarder", originForwarderSchema); 
