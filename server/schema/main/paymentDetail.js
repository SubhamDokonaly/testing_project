let mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId
//paymentDetail
let paymentDetailSchema = mongoose.Schema({
    bookingId: {
        type: ObjectId,
        require: true,
        ref: "booking"
    },
    bId: {
        type: String,
        require: true,
        unique:true
    },
    invoiceName: {
        type: String,
        require: true,
    },
    invoicePath: {
        type: String,
        require: true,
    },
    utrNo: {
        type: String,
    },
    utrDate: {
        type: Date
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
        type: Number
    },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("paymentDetail", paymentDetailSchema);


//Status

// 9	Booking Confirmed by FF
// 10	Invoice Uploaded  by OT
// 11	Confirmed Payment by FF
// 1	Payment Confirmed by OT
