let mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId
//countryCity Schema Clone
let countryCityListSchemaClone = mongoose.Schema({
    originalId: {
        type: ObjectId,
        required: true,
        ref: "countryCityList"
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

module.exports = mongoose.model("countryCityListClone", countryCityListSchemaClone); 
