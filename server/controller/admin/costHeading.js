'use strict'
//Imports
const db = require('../../model/mongodb')
const { ObjectId } = require('bson')
const logger = require("../../model/logger")(__filename)
const { message } = require('../../model/message')
const { default: mongoose } = require('mongoose')
const event = require('./../../model/events')

module.exports = function () {
  let router = {}

  //Get Cost Heading List
  router.getList = async (req, res) => {
    let data = { status: 0, response: message.inValid }, costHeadingData

    try {
      costHeadingData = await db.findAndSelect("costHeading", { status: { $in: [1, 2] } }, { systemInfo: 0, createdBy: 0, createdAt: 0, updatedAt: 0 })
      if (costHeadingData) {

        return res.send({ status: 1, data: JSON.stringify(costHeadingData) })
      }
    } catch (error) {
      logger.error(`Error in costHeading controller - getCostHeadingList: ${error.message}`)
      data.response = error.message
      res.send(data)
    }
  }

  //Insert Cost Heading
  router.insertCostHeading = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let costHeadingData = req.body, checkCostHeading, insertCostHeading, i = 0, j = 0, countriesList, newCostHeadingData = []

      if (Object.keys(costHeadingData).length === 0 && costHeadingData.data === undefined) {
        res.send(data)

        return
      }
      costHeadingData = costHeadingData.data[0]
      countriesList = costHeadingData.country
      costHeadingData.systemInfo = req.rawHeaders

      for (; i < countriesList.length; i++) {
        if (!mongoose.isValidObjectId(countriesList[i])) {

          return res.send({ status: 0, response: message.invalidUserId })
        }
        checkCostHeading = await db.findOneDocumentExists("costHeading",
          {
            "country": new ObjectId(countriesList[i]),
            status: { $in: [1, 2] }
          })
        if (checkCostHeading === true) {

          return res.send({ status: 0, response: message.costheadingExist })
        }
        newCostHeadingData[i] = { ...costHeadingData, country: new ObjectId(countriesList[i]) }
      }
      insertCostHeading = await db.insertManyDocuments("costHeading", newCostHeadingData)
      if (insertCostHeading.length !== 0) {
        for (; j < insertCostHeading.length; j++) {
          event.eventEmitterInsert.emit(
            'insert',
            'costHeadingClone',
            {
              "originalId": insertCostHeading[j]._doc._id,
              "actionType": 'insert',
              "data": insertCostHeading[j]._doc
            }
          )
        }

        return res.send({ status: 1, response: message.costheadingAddedSucess })
      }
    } catch (error) {
      logger.error(`Error in costHeading controller - insertCostHeading: ${error.message}`)
      data.response = error.message
      res.send(data)
    }
  }

  //Update Cost Heading
  router.updateCostHeading = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let costHeadingData = req.body, updateCostHeading

      if (Object.keys(costHeadingData).length === 0 && costHeadingData.data === undefined) {
        res.send(data)

        return
      }
      costHeadingData = costHeadingData.data[0]
      costHeadingData.systemInfo = req.rawHeaders
      updateCostHeading = await db.updateOneDocument("costHeading",
        {
          "_id": new ObjectId(costHeadingData.id),
          "country": costHeadingData.country
        }, costHeadingData)

      if (updateCostHeading.modifiedCount !== 0 && updateCostHeading.matchedCount !== 0) {
        event.eventEmitterInsert.emit(
          'insert',
          'costHeadingClone',
          {
            "originalId": costHeadingData.id,
            "actionType": 'update',
            "data": costHeadingData
          }
        )

        return res.send({ status: 1, response: message.updatedSucess })
      }
      else {

        return res.send({ status: 0, response: message.notFoundCostHeading })
      }
    } catch (error) {
      logger.error(`Error in costHeading controller - updateCostHeading: ${error.message}`)
      data.response = error.message
      res.send(data)
    }
  }

  return router
}
