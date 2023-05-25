let mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId
//Rate Schema
let rateSchema = mongoose.Schema({
    scheduleId: {
        type: ObjectId,
        require: true,
        unique: true,
        ref: "schedule"
    },
    originCost: {
        type: String,
        require: true,
        trim: true
    },
    originBE: {
        type: String,
        require: true,
        trim: true
    },
    scheduleInfo: {
        type: String,
        require: true,
        trim: true
    },
    originComparison: {
        type: String,
        require: true,
        trim: true
    },
    freightCost: {
        type: String,
        require: true,
        trim: true
    },
    freightBE: {
        type: String,
        require: true,
        trim: true
    },
    freightComparison: {
        type: String,
        require: true,
        trim: true
    },
    destinationCost: {
        type: String,
        require: true,
        trim: true
    },
    destinationBE: {
        type: String,
        require: true,
        trim: true
    },
    destinationComparison: {
        type: String,
        require: true,
        trim: true
    },
    otherCost: {
        type: String,
        trim: true
    },
    otherComparison: {
        type: String,
        trim: true
    },
    finalRates: {
        type: String,
        require: true,
        trim: true
    },
    savingRates: {
        type: String,
        require: true,
        trim: true
    },
    predictionRates: {
        type: String,
        require: true,
        trim: true
    },
    createdBy: {
        type: ObjectId,
        require: true
    },
    createdDate: {
        type: Date
    },
    systemInfo: {
        type: Object
    },
    status: {
        type: Number,
        require: true,
        default: 1
    },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("rate", rateSchema);

