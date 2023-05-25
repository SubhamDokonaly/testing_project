'use strict'
//Imports
const db = require('../../model/mongodb')
const { ObjectId } = require('bson')
const logger = require("../../model/logger")(__filename)
const { message } = require('../../model/message')
const moment = require('moment');
const common = require('../../model/common')
const { default: mongoose } = require('mongoose')
const event = require('./../../model/events')
const { scheduleJob } = require('../../model/cron')

module.exports = function () {
  let router = {}

  //Schedules Scheduler Start
  //scheduleJob()

  //Get Schedule List
  router.getList = async (req, res) => {
    let data = { status: 0, response: message.inValid }, scheduleData

    try {
      scheduleData = await db.findAndSelect("schedule", { status: { $in: [1, 2] } }, { systemInfo: 0, createdBy: 0, createdAt: 0, updatedAt: 0 })
      if (scheduleData && scheduleData.length !== 0) {
        scheduleData = scheduleData

        return res.send({ status: 1, data: common.encryptAPI(scheduleData) })
      }

      return res.send({ status: 1, data: common.encryptAPI([]) })
    } catch (error) {
      logger.error(`Error in Schedule controller - getScheduleList: ${error.message}`)
      res.send(error.message)
    }
  }

  //Insert Schedule
  router.insertSchedule = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let scheduleData = req.body, insertSchedule, scheduleDocsData

      if (Object.keys(scheduleData).length === 0 && scheduleData.data === undefined) {
        res.send(data)

        return
      }
      scheduleData = scheduleData.data[0]

      scheduleData.systemInfo = req.rawHeaders
      scheduleData.eta = moment(scheduleData.eta, 'DD-MM-YYYY').toDate()
      scheduleData.etd = moment(scheduleData.etd, 'DD-MM-YYYY').toDate()
      scheduleData.bookingCutOff = moment(scheduleData.bookingCutOff, 'DD-MM-YYYY').utcOffset("+05:30").toDate()
      scheduleData.originCfsCutOff = moment(scheduleData.originCfsCutOff, 'DD-MM-YYYY').utcOffset("+05:30").toDate()
      scheduleData.destinationCfsCutOff = moment(scheduleData.destinationCfsCutOff, 'DD-MM-YYYY').toDate()
      scheduleDocsData = await db.findDocuments("schedule", {})
      scheduleData.scheduleId = scheduleDocsData.length + 1;
      insertSchedule = await db.insertSingleDocument("schedule", scheduleData)
      if (insertSchedule) {
        event.eventEmitterInsert.emit(
          'insert',
          'scheduleClone',
          {
            "originalId": insertSchedule._doc._id,
            "actionType": 'insert',
            "data": insertSchedule._doc
          }
        )

        return res.send({ status: 1, response: message.addedScheduleSucess })
      }
    } catch (error) {
      logger.error(`Error in Schedule controller - insertSchedule: ${error.message}`)
      if (error.code === 11000) {
        data.response = "Duplicates found"
      }
      else {
        data.response = error.message
      }
      res.send(data)
    }
  }

  //Update Schedule
  router.updateSchedule = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let scheduleData = req.body, updateSchedule

      if (Object.keys(scheduleData).length === 0 && scheduleData.data === undefined) {
        res.send(data)

        return
      }
      scheduleData = scheduleData.data[0]

      scheduleData.systemInfo = req.rawHeaders
      scheduleData.eta = moment(scheduleData.eta, 'DD-MM-YYYY').toDate()
      scheduleData.etd = moment(scheduleData.etd, 'DD-MM-YYYY').toDate()
      scheduleData.bookingCutOff = moment(scheduleData.bookingCutOff, 'DD-MM-YYYY').utcOffset("+05:30").toDate()
      scheduleData.originCfsCutOff = moment(scheduleData.originCfsCutOff, 'DD-MM-YYYY').utcOffset("+05:30").toDate()
      scheduleData.destinationCfsCutOff = moment(scheduleData.destinationCfsCutOff, 'DD-MM-YYYY').toDate()
      updateSchedule = await db.updateOneDocument("schedule", { _id: new ObjectId(scheduleData.id), scheduleId: scheduleData.scheduleId, status: { $in: [1, 2] } }, scheduleData)
      if (updateSchedule.modifiedCount !== 0 && updateSchedule.matchedCount !== 0) {
        event.eventEmitterInsert.emit(
          'insert',
          'scheduleClone',
          {
            "originalId": scheduleData.id,
            "actionType": 'update',
            "data": scheduleData
          }
        )

        return res.send({ status: 1, response: message.updatedSucess })
      }
      else {

        return res.send({ status: 1, response: message.notFoundSchedule })
      }
    } catch (error) {
      logger.error(`Error in Schedule controller - updateSchedule: ${error.message}`)
      if (error.code === 11000) {
        data.response = "Duplicates found"
      }
      else {
        data.response = error.message
      }
      res.send(data)
    }
  }

  // Get schedule and Rate only status 1
  router.getSchedulesBasedRates = async (req, res) => {
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
          $match: {
            $expr: {
              $and: [
                { $ne: ["$rateData", []] },
                { $eq: ["$status", 1] },
                { $eq: [{ $arrayElemAt: ["$rateData.status", 0] }, 1] }
              ]
            }
          }
        },
        {
          '$project': {
            'scheduleId': 1,
            'pol': 1,
            'pod': 1,
            'container': 1,
            'volume': 1,
            'weight': 1,
            'vessel': 1,
            'voyage': 1,
            'etd': 1,
            'eta': 1,
            'bookingCutOff': 1,
            'originCfsCutOff': 1,
            'destinationCfsCutOff': 1,
            'originCfsName': 1,
            'originCfsBranch': 1,
            'destinationCfsName': 1,
            'bookingCutOff': 1,
            'originCfsCutOff': 1,
            'destinationCfsBranch': 1,
            'originCfsClosingtime': 1,
            'destinationCfsClosingtime': 1,
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
        },
      ]
      rateData = await db.getAggregation('schedule', aggregationQuery)
      if (rateData.length === 0) {

        res.send({ status: 1, data: "[]" })
      } else {
        for (; i < rateData.length; i++) {
          newRateData[i] = { ...rateData[i] }

          newRateData[i].originCost = common.decryptDB(rateData[i].originCost)
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
        res.send({ status: 1, data: JSON.stringify(newRateData) });
      }
    } catch (error) {
      logger.error(`Error in schedule controller - getSchedulesBasedRates: ${error.message}`)
      res.send(error.message)
    }
  }

  // Get schedule and Rate By Id only status 1
  router.getSchedulesBasedRatesById = async (req, res) => {
    let data = { status: 0, response: message.inValid }, idData, rateData, aggregationQuery = [], i = 0, newRateData = [{}]

    try {
      idData = req.body

      if (Object.keys(idData).length === 0 && idData.data === undefined) {
        res.send(data)

        return
      }
      idData = idData.data[0]

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
          $match: {
            _id: new ObjectId(idData.id),
            $expr: {
              $and: [
                { $ne: ["$rateData", []] },
                // { $eq: ["$status", 1] },
                // { $eq: [{ $arrayElemAt: ["$rateData.status", 0] }, 1] }
              ]
            }
          }
        },
        {
          '$project': {
            'scheduleId': 1,
            'pol': 1,
            'pod': 1,
            'container': 1,
            'volume': 1,
            'weight': 1,
            'vessel': 1,
            'voyage': 1,
            'etd': 1,
            'eta': 1,
            'bookingCutOff': 1,
            'originCfsCutOff': 1,
            'destinationCfsCutOff': 1,
            'originCfsName': 1,
            'originCfsBranch': 1,
            'destinationCfsName': 1,
            'destinationCfsBranch': 1,
            'originCfsClosingtime': 1,
            'destinationCfsClosingtime': 1,
            'containerNo':1,
            'mblNo':1,
            'sealNo':1,
            'aeta':1,
            'aetd':1,
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
        },
      ]
      rateData = await db.getAggregation('schedule', aggregationQuery)
      if (rateData.length === 0) {

        res.send({ status: 1, data: "[]" })
      } else {
        for (; i < rateData.length; i++) {
          newRateData[i] = { ...rateData[i] }

          newRateData[i].originCost = common.decryptDB(rateData[i].originCost)
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
        res.send({ status: 1, data: JSON.stringify(newRateData) });
      }
    } catch (error) {
      logger.error(`Error in schedule controller - getSchedulesBasedRatesById: ${error.message}`)
      res.send(error.message)
    }
  }

  return router
}
