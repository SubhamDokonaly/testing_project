let mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId
//bookingDocs
let bookingDocsSchema = mongoose.Schema({
    bookingId: {
        type: ObjectId,
        require: true,
        ref: "booking"
    },
    shippingBill: {
        type: Array,
        default: []
    },
    packingList: {
        type: Array,
        require: true,
        default: []
    },
    legalName: {
        type: String,
        require: true,
        ref: "userDetail"
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

module.exports = mongoose.model("bookingDocs", bookingDocsSchema); 
