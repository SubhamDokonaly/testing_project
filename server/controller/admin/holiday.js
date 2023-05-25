'use strict'
//Imports
const db = require('../../model/mongodb')
const { ObjectId } = require('bson')
const logger = require("../../model/logger")(__filename)
const { message } = require('../../model/message')
const event = require('./../../model/events')

module.exports = function () {
  let router = {}

  //Get All Holiday
  router.getList = async (req, res) => {
    let data = { status: 0, response: message.inValid }, holidayData

    try {
      holidayData = await db.findAndSelect("portHoliday", { status: { $in: [1, 2] } }, { systemInfo: 0, createdBy: 0, createdAt: 0, updatedAt: 0 })
      if (holidayData) {

        return res.send({ status: 1, data: JSON.stringify(holidayData) })
      }
    } catch (error) {
      logger.error(`Error in holiday controller - getHolidayList: ${error.message}`)
      res.send(error.message)
    }
  }

  //Insert New Holiday
  router.insertHoliday = async (req, res) => {
    let data = { status: 0, response: message.inValid }, i = 0

    try {
      let holidayData = req.body, insertHoliday

      if (Object.keys(holidayData).length === 0 && holidayData.data === undefined) {
        res.send(data)

        return
      }
      holidayData = holidayData.data
      holidayData.systemInfo = req.rawHeaders
      insertHoliday = await db.insertManyDocuments("portHoliday", holidayData)
      if (insertHoliday) {
        for (; i < insertHoliday.length; i++) {
          event.eventEmitterInsert.emit(
            'insert',
            'portHolidayClone',
            {
              "originalId": insertHoliday[i]._doc._id,
              "actionType": 'insert',
              "data": insertHoliday[i]._doc
            }
          )
        }

        return res.send({ status: 1, response: message.addedHolidaySucess })
      }

      return res.send(data)
    } catch (error) {
      logger.error(`Error in holiday controller - insertHoliday: ${error.message}`)
      res.send(error.message)
    }
  }

  //Update Holiday
  router.updateHoliday = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let holidayData = req.body, updateHoliday

      if (Object.keys(holidayData).length === 0 && holidayData.data === undefined) {
        res.send(data)

        return
      }
      holidayData = holidayData.data[0]
      holidayData.systemInfo = req.rawHeaders
      updateHoliday = await db.updateOneDocument("portHoliday", { _id: new ObjectId(holidayData.id), status: { $in: [1, 2] } }, holidayData)
      if (updateHoliday.modifiedCount !== 0 && updateHoliday.matchedCount !== 0) {
        event.eventEmitterInsert.emit(
          'insert',
          'portHolidayClone',
          {
            "originalId": holidayData.id,
            "actionType": 'update',
            "data": holidayData
          }
        )

        return res.send({ status: 1, response: message.updatedSucess })
      }
      else {

        return res.send({ status: 1, response: message.notFoundHoliday })
      }
    } catch (error) {
      logger.error(`Error in holiday controller - updateHoliday: ${error.message}`)
      res.send(error.message)
    }
  }

  return router
}
