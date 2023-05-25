let mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId
//booking
let bookingSchema = mongoose.Schema({
    bId: {
        type: String,
        require: true,
        unique:true
    },
    scheduleId: {
        type: ObjectId,
        require: true,
        ref: "schedule"
    },
    cargoType:{
        type:String,
        require:true
    },
    cargoDetails: {
        type: Array,
        require: true
    },
    totalCbm: {
        type: String,
        require: true,
    },
    totalWt: {
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
    bookedPrice: {
        type: Object
    },
    totalPrice: {
        type: String,
        require: true,
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

module.exports = mongoose.model("booking", bookingSchema);


//Status

// 1	Booking Confirmed
// 2	Pre-booking
// 3	Origin Forwarder
// 4	Destination Forwarder
// 5	Notify Party
// 6	Booking Documents
// 7	Checkout
// 8	Cargo Details
// 9    Completed
