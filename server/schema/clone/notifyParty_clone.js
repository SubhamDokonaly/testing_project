let mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId
//notifyParty Clone
let notifyPartySchemaClone = mongoose.Schema({
    originalId: {
        type: ObjectId,
        required: true,
        ref: "notifyParty"
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

module.exports = mongoose.model("notifyPartyClone", notifyPartySchemaClone); 
