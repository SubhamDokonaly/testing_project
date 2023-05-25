let mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId
//Booking Search Schema
let bookingSearchSchema = mongoose.Schema({
    pol: {
        type: ObjectId,
        require: true,
        trim: true,
        ref: "lane"
    },
    pod: {
        type: ObjectId,
        require: true,
        trim: true,
        ref: "lane"
    },
    scheduleId: {
        type: ObjectId,
        trim:true,
        ref: "schedule"
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
    },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("bookingSearch", bookingSearchSchema) 

