'use strict'
//Imports
const db = require('../../model/mongodb')
const { ObjectId } = require('bson')
const logger = require("../../model/logger")(__filename)
const { message } = require('../../model/message')
const event = require('./../../model/events')

module.exports = function () {
  let router = {}

  //Get Lane List
  router.getList = async (req, res) => {
    let data = { status: 0, response: message.inValid }, laneData

    try {
      laneData = await db.findAndSelect("lane", { status: { $in: [1, 2] } }, { systemInfo: 0, createdBy: 0, createdAt: 0, updatedAt: 0 })
      if (laneData) {

        return res.send({ status: 1, data: JSON.stringify(laneData) })
      }
    } catch (error) {
      logger.error(`Error in lane controller - getLaneList: ${error.message}`)
      data.response = error.message
      res.send(data)
    }
  }

  //Insert Lane
  router.insertLane = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let laneData = req.body, checkLane, insertLane

      if (Object.keys(laneData).length === 0 && laneData.data === undefined) {
        res.send(data)

        return
      }
      laneData = laneData.data[0]
      laneData.systemInfo = req.rawHeaders
      checkLane = await db.findOneDocumentExists("lane",
        {
          "portName": laneData.portName, 'portCode': laneData.portCode, status: { $in: [1, 2] }
        })
      if (checkLane === true) {

        return res.send({ status: 0, response: message.laneExist })
      }
      insertLane = await db.insertSingleDocument("lane", laneData)
      if (insertLane) {
        event.eventEmitterInsert.emit(
          'insert',
          'laneClone',
          {
            "originalId": insertLane._doc._id,
            "actionType": 'insert',
            "data": insertLane._doc
          }
        )

        return res.send({ status: 1, response: message.addedLaneSucess })
      }
    } catch (error) {
      logger.error(`Error in lane controller - insertLane: ${error.message}`)
      if (error.code === 11000){
        data.response = "Duplicates found"
      }
      else if (error.errors.type.kind === 'enum'){
        data.response = "Can Only Enter 1 or 2"
      }
      else{
        data.response = error.message
      }
      res.send(data)
    }
  }

  //Update Lane
  router.updateLane = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let laneData = req.body, updateLane

      if (Object.keys(laneData).length === 0 && laneData.data === undefined) {
        res.send(data)

        return
      }
      laneData = laneData.data[0]
      laneData.systemInfo = req.rawHeaders
      updateLane = await db.updateOneDocument("lane", { _id: new ObjectId(laneData.id), status: { $in: [1, 2] } }, laneData)
      if (updateLane.modifiedCount !== 0 && updateLane.matchedCount !== 0) {
        event.eventEmitterInsert.emit(
          'insert',
          'laneClone',
          {
            "originalId": laneData.id,
            "actionType": 'update',
            "data": laneData
          }
        )

        return res.send({ status: 1, response: message.updatedSucess })
      }
      else {

        return res.send({ status: 1, response: message.notFoundLane })
      }
    } catch (error) {
      logger.error(`Error in lane controller - updateLane: ${error.message}`)
      if (error.code === 11000){
        data.response = "Duplicates found"
      }
      else{
        data.response = error.message
      }
      res.send(data)
    }
  }

  return router
}
