let mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId
//portHoliday Schema
let portHolidaySchema = mongoose.Schema({
    portCode: {
        type: String,
        require: true,
        trim: true,
    },
    name: {
        type: String,
        require: true,
        trim: true,
    },
    date: {
        type: Date,
        require: true,
        trim: true,
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

module.exports = mongoose.model("portHoliday", portHolidaySchema); 

