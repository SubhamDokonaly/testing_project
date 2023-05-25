let mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId
//checkOutDetails
let checkOutDetailsSchema = mongoose.Schema({
    bookingId: {
        type: ObjectId,
        require: true,
        ref: "booking"
    },
    cargoDetails: {
        type: Array,
        require: true
    },
    shipperDetails: {
        type: Object,
        require: true
    },
    consigneeDetails: {
        type: Object,
        require: true
    },
    notifyPartyDetails: {
        type: Object,
        require: true
    },
    bookingDocsDetails: {
        type: Object,
        require: true
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

module.exports = mongoose.model("checkOutDetails", checkOutDetailsSchema); 
