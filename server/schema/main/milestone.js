let mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId
//Milestone Schema
let milestoneSchema = mongoose.Schema({
    bookingId: {
        type: ObjectId,
        require: true,
        ref: "booking"
    },
    bId: {
        type: String,
        require: true
    },
    msams01: {
        type: Number,
        default: 1
    },
    msams02: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    msams03: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    msams04: {
        type: Number,
        enum: [0, 1, 2],
        default: 0
    },
    msams05: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    msams06: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    msams07: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    msams08: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    msams09: {
        type: Number,
        default: 0
    },
    msams10: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    msams11: {
        type: Number,
        default: 0
    },
    msams12: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    msams13: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    msams14: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    msams15: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    msams16: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    msams17: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    msams18: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    msams19: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    msams20: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    msams21: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    msams02File: {
        type: Object
    },
    msams04File: {
        type: Object
    },
    msams05File: {
        type: Object
    },
    msams07File: {
        type: Object
    },
    msams08File: {
        type: Object
    },
    msams09File: {
        type: Array
    },
    msams10File: {
        type: Object
    },
    msams11File: {
        type: Object
    },
    msams12File: {
        type: Object
    },
    msams14File: {
        type: Object
    },
    msams18File: {
        type: Object
    },
    msams20File: {
        type: Object
    },
    msams01Mail: {
        type: Number,
        enum: [0, 1],
        default: 1
    },
    msams02Mail: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    msams13Mail: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    msams15Mail: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    msams20Mail: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    msams09Data: {
        type: Object
    },
    msams19Data: {
        type: Object
    },
    msams21Data: {
        type: Object
    },
    systemInfo: {
        type: Object
    },
    status: {
        type: Number,
        default: 1
    },
    createdBy: {
        type: ObjectId,
        require: true,
        ref: "user"
    }
}, { timestamps: true, versionKey: false })

module.exports = mongoose.model("milestone", milestoneSchema)