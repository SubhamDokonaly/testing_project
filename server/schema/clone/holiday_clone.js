let mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId
//portHoliday Schema
let portHolidaySchemaClone = mongoose.Schema({
    originalId: {
        type: ObjectId,
        required: true,
        ref: "portHoliday"
    },
    actionType: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    data: {
        type: Object,
        required: true,
        trim: true
    },
    status: {
        type: Number
    }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("portHolidayClone", portHolidaySchemaClone); 

