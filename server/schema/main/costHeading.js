let mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId
//costHeading
let costHeadingSchema = mongoose.Schema({
    sacCode: {
        type: String,
        require: true,
        trim: true,
    },
    costHeading: {
        type: String,
        require: true,
        trim: true,
    },
    country: {
        type: ObjectId,
        require: true,
        ref: "country"
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

module.exports = mongoose.model("costHeading", costHeadingSchema); 
