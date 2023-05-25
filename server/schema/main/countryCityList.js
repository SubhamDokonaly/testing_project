let mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId
//country Schema
let countryCityListSchema = mongoose.Schema({
    countryCode: {
        type: String,
        require: true,
        trim: true,
        ref: "country"
    },
    state: {
        type: String,
        require: true,
        trim: true,
    },
    city: {
        type: String,
        require: true,
        trim: true,
    },
    status: {
        type: Number,
        default: 1
    },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("countryCityList", countryCityListSchema); 
