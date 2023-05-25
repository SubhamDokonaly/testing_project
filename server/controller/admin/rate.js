'use strict'
//Imports
const db = require('../../model/mongodb')
const { ObjectId } = require('bson')
const logger = require("../../model/logger")(__filename)
const { message } = require('../../model/message')
const common = require('../../model/common')
const { default: mongoose } = require('mongoose')
const event = require('./../../model/events')

module.exports = function () {
    let router = {}

    //Get All Rate
    router.getList = async (req, res) => {
        let data = { status: 0, response: message.inValid }, rateData, i = 0, newRateData = [{}]

        try {
            rateData = await db.findAndSelect("rate", { status: { $in: [1, 2] } }, { systemInfo: 0, createdBy: 0, createdAt: 0, updatedAt: 0 })

            if (rateData.length === 0) {
                return res.send({ status: 1, data: common.encryptAPI([]) })
            }
            for (; i < rateData.length; i++) {
                newRateData[i] = { ...rateData[i].toObject() }

                newRateData[i].originCost = common.decryptDB(rateData[i].originCost)
                newRateData[i].scheduleInfo = common.decryptDB(rateData[i].scheduleInfo)
                newRateData[i].originBE = common.decryptDB(rateData[i].originBE)
                newRateData[i].originComparison = common.decryptDB(rateData[i].originComparison)
                newRateData[i].freightCost = common.decryptDB(rateData[i].freightCost)
                newRateData[i].freightBE = common.decryptDB(rateData[i].freightBE)
                newRateData[i].freightComparison = common.decryptDB(rateData[i].freightComparison)
                newRateData[i].destinationCost = common.decryptDB(rateData[i].destinationCost)
                newRateData[i].destinationBE = common.decryptDB(rateData[i].destinationBE)
                newRateData[i].destinationComparison = common.decryptDB(rateData[i].destinationComparison)
                newRateData[i].otherCost = common.decryptDB(rateData[i].otherCost)
                newRateData[i].otherComparison = common.decryptDB(rateData[i].otherComparison)
                newRateData[i].finalRates = common.decryptDB(rateData[i].finalRates)
                newRateData[i].savingRates = common.decryptDB(rateData[i].savingRates)
                newRateData[i].predictionRates = common.decryptDB(rateData[i].predictionRates)
            }
            newRateData = newRateData

            return res.send({ status: 1, data: common.encryptAPI(newRateData) })
        } catch (error) {
            logger.error(`Error in Rate controller - rate/getList: ${error.message}`)
            res.send(error.message)
        }
    }

    //get Rate By ID
    router.getRateById = async (req, res) => {
        let data = { status: 0, response: message.inValid }, rateBody, rateData, i = 0, newRateData = [{}]

        try {
            rateBody = req.body
            if (Object.keys(rateBody).length === 0 && rateBody.data === undefined) {
                res.send(data)

                return
            }
            rateBody = rateBody.data[0]
            if (!mongoose.isValidObjectId(rateBody.id)) {

                return res.send({ status: 0, response: message.invalidUserId })
            }
            rateData = await db.findSingleDocument("rate", { _id: new ObjectId(rateBody.id) }, { systemInfo: 0, createdBy: 0, createdAt: 0, updatedAt: 0 })
            if (Object.keys(rateData).length === 0) {
                return res.send({ status: 1, data: common.encryptAPI([]) })
            }
            newRateData = { ...rateData.toObject() }

            newRateData.originCost = common.decryptDB(rateData.originCost)
            newRateData.originBE = common.decryptDB(rateData.originBE)
            newRateData.scheduleInfo = common.decryptDB(rateData.scheduleInfo)
            newRateData.originComparison = common.decryptDB(rateData.originComparison)
            newRateData.freightCost = common.decryptDB(rateData.freightCost)
            newRateData.freightBE = common.decryptDB(rateData.freightBE)
            newRateData.freightComparison = common.decryptDB(rateData.freightComparison)
            newRateData.destinationCost = common.decryptDB(rateData.destinationCost)
            newRateData.destinationBE = common.decryptDB(rateData.destinationBE)
            newRateData.destinationComparison = common.decryptDB(rateData.destinationComparison)
            newRateData.otherCost = common.decryptDB(rateData.otherCost)
            newRateData.otherComparison = common.decryptDB(rateData.otherComparison)
            newRateData.finalRates = common.decryptDB(rateData.finalRates)
            newRateData.savingRates = common.decryptDB(rateData.savingRates)
            newRateData.predictionRates = common.decryptDB(rateData.predictionRates)

            return res.send({ status: 1, data: common.encryptAPI(newRateData) })
        } catch (error) {
            logger.error(`Error in Rate controller - rate/getRateById: ${error.message}`)
            res.send(error.message)
        }
    }

    //Insert Rate
    router.insertRate = async (req, res) => {
        let data = { status: 0, response: message.inValid }

        try {
            let rateData = req.body, checkScheduleId, insertRate
            if (Object.keys(rateData).length === 0 && rateData.data === undefined) {
                res.send(data)

                return
            }
            rateData = rateData.data[0]
            checkScheduleId = await db.findOneDocumentExists("rate", { scheduleId: new ObjectId(rateData.scheduleId), status: { $in: [1, 2] } })
            if (checkScheduleId === true) {

                return res.send({ status: 0, response: message.scheduleIdExist })
            }
            rateData.originCost = common.encryptDB(rateData.originCost)
            rateData.originBE = common.encryptDB(rateData.originBE)
            rateData.scheduleInfo = common.encryptDB(rateData.scheduleInfo)
            rateData.originComparison = common.encryptDB(rateData.originComparison)
            rateData.freightCost = common.encryptDB(rateData.freightCost)
            rateData.freightBE = common.encryptDB(rateData.freightBE)
            rateData.freightComparison = common.encryptDB(rateData.freightComparison)
            rateData.destinationCost = common.encryptDB(rateData.destinationCost)
            rateData.destinationBE = common.encryptDB(rateData.destinationBE)
            rateData.destinationComparison = common.encryptDB(rateData.destinationComparison)
            rateData.otherCost = common.encryptDB(rateData.otherCost)
            rateData.otherComparison = common.encryptDB(rateData.otherComparison)
            rateData.finalRates = common.encryptDB(rateData.finalRates)
            rateData.savingRates = common.encryptDB(rateData.savingRates)
            rateData.predictionRates = common.encryptDB(rateData.predictionRates)
            rateData.systemInfo = req.rawHeaders

            insertRate = await db.insertSingleDocument("rate", rateData)
            if (insertRate) {
                event.eventEmitterInsert.emit(
                    'insert',
                    'rateClone',
                    {
                        "originalId": insertRate._doc._id,
                        "actionType": 'insert',
                        "data": insertRate._doc
                    }
                )

                return res.send({ status: 1, response: message.addedRateSucess })
            }

            return res.send(data)
        } catch (error) {
            logger.error(`Error in rate controller - insertRate: ${error.message}`)
            res.send(error.message)
        }
    }

    //update Rate Status
    router.updateStatusById = async (req, res) => {
        let data = { status: 0, response: message.inValid }

        try {
            let statusData = req.body, updateStatus

            if (Object.keys(statusData).length === 0 && statusData.data === undefined) {
                res.send(data)

                return
            }
            statusData = statusData.data[0]
            if (!mongoose.isValidObjectId(statusData.id)) {

                return res.send({ status: 0, response: message.invalidUserId })
            }
            updateStatus = await db.findByIdAndUpdate("rate", statusData.id, { status: statusData.status })
            if (updateStatus.modifiedCount !== 0 && updateStatus.matchedCount !== 0) {
                event.eventEmitterInsert.emit(
                    'insert',
                    'rateClone',
                    {
                        "originalId": statusData.id,
                        "actionType": 'update',
                        "data": statusData
                    }
                )

                return res.send({ status: 1, response: message.updatedSucess })
            }
            else {

                return res.send({ status: 1, response: message.notFoundRate })
            }
        } catch (error) {
            logger.error(`Error in rate controller - updateStatusById: ${error.message}`)
            res.send(error.message)
        }
    }
    return router
}
