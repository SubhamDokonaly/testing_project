'use strict'
//Imports
const db = require('../../model/mongodb')
const { ObjectId } = require('bson')
const logger = require("../../model/logger")(__filename)
const { message } = require('../../model/message')
const event = require('./../../model/events')
const mongoose = require('mongoose')

module.exports = function () {
  let router = {}

  //Add Country City
  router.addCountryCityList = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let countryCityData = req.body, insertCountryCity

      if (Object.keys(countryCityData).length === 0 && countryCityData.data === undefined) {
        res.send(data)

        return
      }
      countryCityData = countryCityData.data
      insertCountryCity = await db.insertManyDocuments("countryCityList", countryCityData)
      if (insertCountryCity !== null) {
        event.eventEmitterInsert.emit(
          'insert',
          'countryCityListClone',
          {
            "originalId": insertCountryCity._doc._id,
            "actionType": 'insert',
            "data": insertCountryCity._doc
          }
        )

        return res.send({ status: 1, response: message.addedCountryCitySucess })
      }
    } catch (error) {
      logger.error(`Error in admin controller - addCountryCityList: ${error.message}`)
      res.send(error.message)
    }
  }

  //Get All Countries
  router.getList = async (req, res) => {
    let data = { status: 0, response: message.inValid }, countryData

    try {
      countryData = await db.findAndSelect("country", { status: { $in: [1, 2] } }, { systemInfo: 0, createdBy: 0, createdAt: 0, updatedAt: 0 })
      if (countryData) {

        return res.send({ status: 1, data: JSON.stringify(countryData) })
      }
    } catch (error) {
      logger.error(`Error in country controller - getCountryList: ${error.message}`)
      data.response = error.message
      res.send(data)
    }
  }

  //Insert New Country
  router.insertCountry = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let countryData = req.body, checkCountry, insertCountry

      if (Object.keys(countryData).length === 0 && countryData.data === undefined) {
        res.send(data)

        return
      }
      countryData = countryData.data[0]
      if (!mongoose.isValidObjectId(countryData.createdBy)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      countryData.systemInfo = req.rawHeaders
      checkCountry = await db.findOneDocumentExists("country",
        {
          "countryName": countryData.countryName, 'countryCode': countryData.countryCode, status: { $in: [1, 2] }
        })
      if (checkCountry === true) {

        return res.send({ status: 0, response: message.countryExist })
      }
      insertCountry = await db.insertSingleDocument("country", countryData)
      if (insertCountry) {
        event.eventEmitterInsert.emit(
          'insert',
          'countryClone',
          {
            "originalId": insertCountry._doc._id,
            "actionType": 'insert',
            "data": insertCountry._doc
          }
        )

        return res.send({ status: 1, response: message.addedCountrySucess })
      }
    } catch (error) {
      logger.error(`Error in country controller - insertCountry: ${error.message}`)
      if (error.code === 11000) {
        data.response = "Duplicates found"
      }
      else {
        data.response = error.message
      }
      res.send(data)
    }
  }

  //Update Country
  router.updateCountry = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let countryData = req.body, updateCountry

      if (Object.keys(countryData).length === 0 && countryData.data === undefined) {
        res.send(data)

        return
      }
      countryData = countryData.data[0]
      if (!mongoose.isValidObjectId(countryData.id)) {

        return res.send({ status: 0, response: message.invalidId })
      }
      countryData.systemInfo = req.rawHeaders
      updateCountry = await db.updateOneDocument("country", { _id: new ObjectId(countryData.id), status: { $in: [1, 2] } }, countryData)
      if (updateCountry.modifiedCount !== 0 && updateCountry.matchedCount !== 0) {
        event.eventEmitterInsert.emit(
          'insert',
          'countryClone',
          {
            "originalId": countryData.id,
            "actionType": 'update',
            "data": countryData
          }
        )

        return res.send({ status: 1, response: message.updatedSucess })
      }
      else {

        return res.send({ status: 1, response: message.notFoundCountry })
      }
    } catch (error) {
      logger.error(`Error in country controller - updateCountry: ${error.message}`)
      if (error.code === 11000) {
        data.response = "Duplicates found"
      }
      else {
        data.response = error.message
      }
      res.send(data)
    }
  }

  return router
}
