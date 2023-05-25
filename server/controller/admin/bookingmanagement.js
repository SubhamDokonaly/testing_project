'use strict'
//Imports
const db = require('../../model/mongodb')
const { ObjectId } = require('bson')
const logger = require("../../model/logger")(__filename)
const { message } = require('../../model/message')
const moment = require('moment');
const common = require('../../model/common')
const { default: mongoose } = require('mongoose')
const cron = require('cron').CronJob
const jwt = require("jsonwebtoken")

module.exports = function () {
    let router = {}

    //Schedule Job to Disable
    let scheduleJob = new cron(
        '00 00 00 * * *',
        async () => {
            let data = { status: 0, response: message.inValid }, scheduleCondition, scheduleData, updateScheduleStatus
            scheduleCondition = {
                $and: [
                    { 'status': 1 },
                    {
                        'bookingCutOff': { $lte: moment().utcOffset("+05:30").toISOString() },
                    },
                ],
            }

            try {
                scheduleData = await db.findAndSelect("schedule", scheduleCondition, { systemInfo: 0, createdBy: 0, createdAt: 0, updatedAt: 0 })
                if (scheduleData && scheduleData.length !== 0) {
                    scheduleData = scheduleData.map(e => e._id)
                    updateScheduleStatus = await db.updateManyDocuments("schedule", { "_id": { $in: scheduleData } }, { status: 2 })
                }

            }
            catch (error) {
                logger.error(`Error in bokingmanagement controller - scheduleJob: ${error.message}`)
            }
        },
        null,
        true,
        'Asia/Kolkata'
    )

    // Get Bookings by Schedule Id
    router.getBookingsbyScheduleId = async (req, res) => {
        let data = { status: 0, response: message.inValid }, idData, bookingData

        try {
            idData = req.body

            if (Object.keys(idData).length === 0 && idData.data === undefined) {
                res.send(data)

                return
            }
            idData = idData.data[0]
            if (!mongoose.isValidObjectId(idData.id)) {

                return res.send({ status: 0, response: message.invalidScheduleId })
            }

            bookingData = await db.findDocuments('booking', { scheduleId: new ObjectId(idData.id) })

            if (bookingData.length !== 0) {

                return res.send({ status: 1, data: JSON.stringify(bookingData) })
            }

            return res.send({ status: 1, data: "[]" })
        } catch (error) {
            logger.error(`Error in bokingmanagement controller - getBookingsbyScheduleId: ${error.message}`)
            res.send(error.message)
        }
    }

    // Get Bookings by Schedule Id For cfs
    router.getBookingsbyScheduleIdCfs = async (req, res) => {
        let data = { status: 0, response: message.inValid }, idData, bookingData, scheduleData, token, decodedToken

        try {
            idData = req.body

            if (Object.keys(idData).length === 0 && idData.data === undefined) {
                res.send(data)

                return
            }
            idData = idData.data[0]
            token = req.headers.authorization
            token = token.substring(7)
            decodedToken = jwt.decode(token)
            if (!mongoose.isValidObjectId(idData.id)) {

                return res.send({ status: 0, response: message.invalidScheduleId })
            }
            scheduleData = await db.findSingleDocument("schedule", { _id: new ObjectId(idData.id) }, { destinationCfsName: 1, originCfsName: 1, _id: 0 })
            if (scheduleData !== null && Object.keys(scheduleData).length !== 0) {

                if (decodedToken.role === 6) {
                    if (scheduleData.originCfsName != decodedToken.userId) {
                        return res.status(401).send("Unauthorized Access")
                    }
                } else if (decodedToken.role === 7) {
                    if (scheduleData.destinationCfsName != decodedToken.userId) {
                        return res.status(401).send("Unauthorized Access")
                    }
                }
            }

            bookingData = await db.findDocuments('booking', { scheduleId: new ObjectId(idData.id) })

            if (bookingData.length !== 0) {

                return res.send({ status: 1, data: JSON.stringify(bookingData) })
            }

            return res.send({ status: 1, data: "[]" })
        } catch (error) {
            logger.error(`Error in bokingmanagement controller - getBookingsbyScheduleId: ${error.message}`)
            res.send(error.message)
        }
    }

    //Get Schedule & Booking by Active Rate
    router.getSchedulesRatesBookings = async (req, res) => {
        let rateData, aggregationQuery = [], i = 0, newRateData = [{}]

        try {
            aggregationQuery = [
                {
                    $lookup: {
                        from: 'rates',
                        localField: '_id',
                        foreignField: 'scheduleId',
                        as: 'rateData',
                    },
                },
                {
                    $lookup: {
                        from: 'bookings',
                        localField: '_id',
                        foreignField: 'scheduleId',
                        as: 'bookData',
                    },
                },
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $ne: ["$rateData", []] },
                                { $eq: [{ $arrayElemAt: ["$rateData.status", 0] }, 1] }
                            ]
                        }
                    }
                },
                {
                    '$project': {
                        'scheduleData': {
                            '_id': '$_id',
                            'scheduleId': "$scheduleId",
                            'pol': '$pol',
                            'pod': '$pod',
                            'container': '$container',
                            'volume': '$volume',
                            'weight': '$weight',
                            'vessel': '$vessel',
                            'voyage': '$voyage',
                            'etd': '$etd',
                            'eta': '$eta',
                            'bookingCutOff': '$bookingCutOff',
                            'originCfsCutOff': '$originCfsCutOff',
                            'destinationCfsCutOff': '$destinationCfsCutOff',
                            'originCfsName': '$originCfsName',
                            'originCfsBranch': '$originCfsBranch',
                            'destinationCfsName': '$destinationCfsName',
                            'destinationCfsBranch': '$destinationCfsBranch',
                            'originCfsClosingtime': '$originCfsClosingtime',
                            'destinationCfsClosingtime': '$destinationCfsClosingtime',
                            'status': '$status',
                            'originCost': { '$arrayElemAt': ['$rateData.originCost', 0] },
                            'originBE': { '$arrayElemAt': ['$rateData.originBE', 0] },
                            'originComparison': { '$arrayElemAt': ['$rateData.originComparison', 0] },
                            'freightCost': { '$arrayElemAt': ['$rateData.freightCost', 0] },
                            'freightBE': { '$arrayElemAt': ['$rateData.freightBE', 0] },
                            'freightComparison': { '$arrayElemAt': ['$rateData.freightComparison', 0] },
                            'destinationCost': { '$arrayElemAt': ['$rateData.destinationCost', 0] },
                            'destinationBE': { '$arrayElemAt': ['$rateData.destinationBE', 0] },
                            'destinationComparison': { '$arrayElemAt': ['$rateData.destinationComparison', 0] },
                            'otherCost': { '$arrayElemAt': ['$rateData.otherCost', 0] },
                            'otherComparison': { '$arrayElemAt': ['$rateData.otherComparison', 0] },
                            'finalRates': { '$arrayElemAt': ['$rateData.finalRates', 0] },
                            'savingRates': { '$arrayElemAt': ['$rateData.savingRates', 0] },
                            'predictionRates': { '$arrayElemAt': ['$rateData.predictionRates', 0] },
                        },
                        'bookingData': '$bookData'
                    },
                },
            ]
            rateData = await db.getAggregation('schedule', aggregationQuery)
            if (rateData.length === 0) {

                res.send({ status: 1, data: "[]" })
            } else {
                for (; i < rateData.length; i++) {
                    newRateData[i] = { ...rateData[i] }

                    newRateData[i].scheduleData.originCost = common.decryptDB(rateData[i].scheduleData.originCost)
                    newRateData[i].scheduleData.originBE = common.decryptDB(rateData[i].scheduleData.originBE)
                    newRateData[i].scheduleData.originComparison = common.decryptDB(rateData[i].scheduleData.originComparison)
                    newRateData[i].scheduleData.freightCost = common.decryptDB(rateData[i].scheduleData.freightCost)
                    newRateData[i].scheduleData.freightBE = common.decryptDB(rateData[i].scheduleData.freightBE)
                    newRateData[i].scheduleData.freightComparison = common.decryptDB(rateData[i].scheduleData.freightComparison)
                    newRateData[i].scheduleData.destinationCost = common.decryptDB(rateData[i].scheduleData.destinationCost)
                    newRateData[i].scheduleData.destinationBE = common.decryptDB(rateData[i].scheduleData.destinationBE)
                    newRateData[i].scheduleData.destinationComparison = common.decryptDB(rateData[i].scheduleData.destinationComparison)
                    newRateData[i].scheduleData.otherCost = common.decryptDB(rateData[i].scheduleData.otherCost)
                    newRateData[i].scheduleData.otherComparison = common.decryptDB(rateData[i].scheduleData.otherComparison)
                    newRateData[i].scheduleData.finalRates = common.decryptDB(rateData[i].scheduleData.finalRates)
                    newRateData[i].scheduleData.savingRates = common.decryptDB(rateData[i].scheduleData.savingRates)
                    newRateData[i].scheduleData.predictionRates = common.decryptDB(rateData[i].scheduleData.predictionRates)
                }
                res.send({ status: 1, data: JSON.stringify(newRateData) });
            }
        } catch (error) {
            logger.error(`Error in schedule controller - getSchedulesRatesBookings: ${error.message}`)
            res.send(error.message)
        }
    }

    return router
}
