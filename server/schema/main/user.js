let mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId

//User Schema
let userSchema = mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: "user"
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    designation: {
        type: String,
        required: true,
        trim: true,
    },
    legalName: {
        type: String,
        trim: true,
        lowercase: true
    },
    mobileCode: {
        type: String,
        required: true,
        trim: true
    },
    mobileNumber: {
        type: Number,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    otp: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: Number,                // 1 - Freight Forwarder
        default: 1
    },
    createdBy: {
        type: ObjectId
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
        default: 0
    },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("user", userSchema);


//Status

// 0	base register with out email verification
// 1	Approved
// 2	Base register with email verification done
// 3	KYC Submitted/ Register
// 4	Approve for OT
// 5	Revalidate for OT
// 6	Revalidate for Admin
// 7	Rejected for Admin
// 7	Rejected for OT
// 8    User Deleted
// 9    Sub User Created