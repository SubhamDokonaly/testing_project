'use strict'
//Imports
const db = require('../../model/mongodb')
const { ObjectId } = require('bson')
const logger = require("../../model/logger")(__filename)
const { message } = require('../../model/message')
const bcrypt = require('bcrypt')
const { default: mongoose } = require('mongoose')
const { transporter } = require('../../model/mail')
const common = require('../../model/common')
const CONFIGJSON = require('../../config/config.json')
const path = require('path')
const event = require('./../../model/events')
const ejs = require('ejs')

module.exports = function () {
  let router = {}
  let templatePath = path.resolve('./templates/admin/')

  //Mail Functions
  //Create Password Mail
  const createPasswordMail = async (mailData) => {

    ejs.renderFile(`${templatePath}/vendorCreatePassword.ejs`,
      {
        fullName: mailData.fullName,
        cfsName: mailData.cfsName,
        email: mailData.emailTo,
        url: mailData.url
      }
      , (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let mailOptions = {
            from: 'noreply@dokonaly.com',
            to: mailData.emailTo,
            subject: 'AllMasters | Create Vendor Password',
            html: data
          }

          //Send Mail
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              logger.error(`Mail Not Sent - ${error}`)
              return console.log(error)
            }
            logger.info(`Mail sent:  - ${info.messageId}`)
          })
        }
      })
  }

  //Get CFS List
  router.getList = async (req, res) => {
    let data = { status: 0, response: message.inValid }, cfsData

    try {
      cfsData = await db.findAndSelect("cfs", { status: { $in: [1, 2, 3] } }, { systemInfo: 0, createdBy: 0, createdAt: 0, updatedAt: 0 })
      if (cfsData) {

        return res.send({ status: 1, data: JSON.stringify(cfsData) })
      }
    } catch (error) {
      logger.error(`Error in cfs controller - getCfsList: ${error.message}`)
      data.response = error.message
      res.send(data)
    }
  }

  //Insert Cfs
  router.insertCfs = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let cfsData = req.body, i = 0, checkCfs, insertCfs,
        cfsCertificatesFolderPath, cfsCertificatesFileFolderPath, fileName, base64String, base64Pdf

      if (Object.keys(cfsData).length === 0 && cfsData.data === undefined) {
        res.send(data)

        return
      }
      cfsData = cfsData.data[0]
      cfsData.systemInfo = req.rawHeaders
      checkCfs = await db.findOneDocumentExists("cfs",
        {
          "cfsName": cfsData.cfsName,
          "cfsBranch": cfsData.cfsBranch,
          status: { $in: [1, 2, 3] },
        })
      if (checkCfs === true) {

        return res.send({ status: 0, response: message.cfsExist })
      }
      //CFS Certificates Azure File Upload

      if (cfsData.cfsCertificate !== undefined && Object.keys(cfsData.cfsCertificate).length !== 0) {
        cfsCertificatesFolderPath = path.resolve(__dirname, '../../fileuploads/cfs certificates/')
        cfsCertificatesFileFolderPath = `${cfsCertificatesFolderPath}/${cfsData.cfsName} (${cfsData.cfsBranch})`
        await common.createDir(cfsCertificatesFolderPath)
        await common.createDir(cfsCertificatesFileFolderPath)

        for (; i < cfsData.cfsCertificate.length; i++) {
          fileName = cfsData.cfsCertificate[i].fileName
          base64String = cfsData.cfsCertificate[i].fileData
          cfsData.cfsCertificate[i].fileData = CONFIGJSON.settings.nodeFileUploads + `cfs certificates/${cfsData.cfsName} (${cfsData.cfsBranch})/${fileName}`

          base64Pdf = base64String.split(';base64,').pop();
          await common.createFile(`${cfsCertificatesFileFolderPath}/${fileName}`, base64Pdf, 'base64')
          await common.uploadFileAzure(`${cfsCertificatesFileFolderPath}/${fileName}`, `${cfsData.cfsName} (${cfsData.cfsBranch})`, fileName)
        }
      }
      if (cfsData.type === 1) {
        cfsData.role = 6
      }
      else {
        cfsData.role = 7
      }
      insertCfs = await db.insertSingleDocument("cfs", cfsData)
      if (insertCfs !== null && Object.keys(insertCfs).length !== 0) {

        await createPasswordMail({
          emailTo: cfsData.email,
          fullName: cfsData.fullName,
          cfsName: cfsData.cfsName,
          url: CONFIGJSON.settings.cfsPasswordUrl + insertCfs._id
        })
        event.eventEmitterInsert.emit(
          'insert',
          'cfsClone',
          {
            "originalId": insertCfs._doc._id,
            "actionType": 'insert',
            "data": insertCfs._doc
          }
        )

        return res.send({ status: 1, response: message.addedCfsSucess })
      }
    } catch (error) {
      logger.error(`Error in Cfs controller - insertCfs: ${error.message}`)
      if (error.code === 11000) {
        data.response = "Duplicates found"
      }
      else {
        data.response = error.message
      }
      res.send(data)
    }
  }

  //Update Cfs
  router.updateCfs = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let cfsData = req.body, updateCfs

      if (Object.keys(cfsData).length === 0 && cfsData.data === undefined) {
        res.send(data)

        return
      }
      cfsData = cfsData.data[0]
      cfsData.systemInfo = req.rawHeaders
      updateCfs = await db.updateOneDocument("cfs", { _id: new ObjectId(cfsData.id), status: { $in: [1, 2] } }, cfsData)
      if (updateCfs.modifiedCount !== 0 && updateCfs.matchedCount !== 0) {
        event.eventEmitterInsert.emit(
          'insert',
          'cfsClone',
          {
            "originalId": cfsData.id,
            "actionType": 'update',
            "data": cfsData
          }
        )

        return res.send({ status: 1, response: message.updatedSucess })
      }
      else {

        return res.send({ status: 0, response: message.notFoundCfs })
      }
    } catch (error) {
      logger.error(`Error in Cfs controller - updateCfs: ${error.message}`)
      if (error.code === 11000) {
        data.response = "Duplicates found"
      }
      else {
        data.response = error.message
      }
      res.send(data)
    }
  }

  //Create Password Cfs
  router.updatePassword = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let passwordData = req.body, checkCfs, updatePassword

      if (Object.keys(passwordData).length === 0 && passwordData.data === undefined) {
        res.send(data)

        return
      }
      passwordData = passwordData.data[0]
      passwordData.password = bcrypt.hashSync(passwordData.password, 10)
      if (!mongoose.isValidObjectId(passwordData.id)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      checkCfs = await db.findOneDocumentExists("cfs", { _id: new ObjectId(passwordData.id), status: { $in: [1, 2, 3] } })
      if (checkCfs === true) {
        updatePassword = await db.findByIdAndUpdate("cfs", passwordData.id, { password: passwordData.password, status: 1 })
        if (updatePassword.modifiedCount !== 0 && updatePassword.matchedCount !== 0) {
          event.eventEmitterInsert.emit(
            'insert',
            'cfsClone',
            {
              "originalId": passwordData.id,
              "actionType": 'update',
              "data": passwordData
            }
          )

          return res.send({ status: 1, response: message.updatedSucess })
        }

      }

      return res.send({ status: 0, response: message.notFoundCfs })
    } catch (error) {
      logger.error(`Error in Cfs controller - updatePassword: ${error.message}`)
      if (error.code === 11000) {
        data.response = "Duplicates found"
      }
      else {
        data.response = error.message
      }
      res.send(data)
    }
  }

  //Get CFS Info
  router.getCfsInfo = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let cfsId = req.body, cfsData
      if (Object.keys(cfsId).length === 0 && cfsId.data === undefined) {
        res.send(data)

        return
      }
      cfsId = cfsId.data[0]
      if (!mongoose.isValidObjectId(cfsId.id)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      cfsData = await db.findSingleDocument("cfs", { _id: new ObjectId(cfsId.id), status: { $in: [1, 2, 3] } })
      if (cfsData !== null && Object.keys(cfsData).length !== 0) {

        return res.send({
          status: 1,
          data: JSON.stringify({
            email: cfsData.email,
            fullName: cfsData.fullName,
            cfsName: cfsData.cfsName,
            status: cfsData.status
          })
        })
      }

      return res.send(data)
    } catch (error) {
      logger.error(`Error in Cfs Controller - getCfsInfo: ${error.message}`);
      data.response = `${error.message}`;
      res.send(data);
    }
  }

  //Get CFS Details
  router.getCfsDetails = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let cfsId = req.body, cfsData
      if (Object.keys(cfsId).length === 0 && cfsId.data === undefined) {
        res.send(data)

        return
      }
      cfsId = cfsId.data[0]
      if (!mongoose.isValidObjectId(cfsId.id)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      cfsData = await db.findSingleDocument("cfs", { _id: new ObjectId(cfsId.id), status: { $in: [1, 2] } })
      if (cfsData !== null && Object.keys(cfsData).length !== 0) {

        await common.downloadFileAzure(`${cfsData.cfsName} (${cfsData.cfsBranch})`, '', 'cfs certificates')

        return res.send({ status: 1, data: JSON.stringify(cfsData) })
      }

      return res.send(data)
    } catch (error) {
      logger.error(`Error in Cfs Controller - getCfsDetails: ${error.message}`);
      data.response = `${error.message}`;
      res.send(data);
    }
  }

  //Get Bookings by CFS Id & Type
  router.getBookingsCfs = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let cfsId = req.body, cfsData, scheduleData, aggregationQuery = [], condition = {}, bookingData
      if (Object.keys(cfsId).length === 0 && cfsId.data === undefined) {
        res.send(data)

        return
      }
      cfsId = cfsId.data[0]
      if (!mongoose.isValidObjectId(cfsId.id)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      cfsData = await db.findSingleDocument("cfs", { _id: new ObjectId(cfsId.id), status: 1 })

      if (cfsData !== null && Object.keys(cfsData).length !== 0) {

        cfsData.type === 1 ?
          condition = {
            pol: new ObjectId(cfsData.gateway),
            originCfsName: cfsData._id,
            originCfsBranch: cfsData._id,
          } :
          condition = {
            pod: new ObjectId(cfsData.destination),
            destinationCfsName: cfsData._id,
            destinationCfsBranch: cfsData._id,
          }

        aggregationQuery = [
          {
            $lookup: {
              from: 'bookings',
              localField: '_id',
              foreignField: 'scheduleId',
              as: 'bookData',
            },
          },
          {
            $match: condition
          },
          {
            '$project': {
              'scheduleData': {
                '_id': '$_id',
                'scheduleId': '$scheduleId',
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
                'status': '$status'
              },
              'bookingData': {
                '$filter': {
                  'input': '$bookData',
                  'cond': {
                    $in: ['$$this.status', [1, 9]]
                  }
                }
              }
            },
          },
        ]
        bookingData = await db.getAggregation('schedule', aggregationQuery)

        return res.send({ status: 1, data: JSON.stringify(bookingData) })
      }

      return res.send({ status: 1, response: "[]" })
    } catch (error) {
      logger.error(`Error in Cfs Controller - getBookingsCfs: ${error.message}`);
      data.response = `${error.message}`;
      res.send(data);
    }
  }

  return router
}
