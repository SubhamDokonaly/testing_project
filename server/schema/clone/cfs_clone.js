let mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId
//CFS Schema Clone
let cfsSchemaClone = mongoose.Schema({
    originalId: {
        type: ObjectId,
        required: true,
        ref: "cfs"
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

module.exports = mongoose.model("cfsClone", cfsSchemaClone);

