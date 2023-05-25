'use strict'
var db = require('../../model/mongodb.js')
const mongoose = require('mongoose')
const { message } = require('../../model/message')
const CONFIGJSON = require('../../config/config.json')
const logger = require("../../model/logger")(__filename)
const common = require('../../model/common')
const path = require('path')
const { ObjectId } = require('bson')
const moment = require('moment')
const { transporter } = require('../../model/mail')
const event = require('./../../model/events')
const ejs = require('ejs')
const jwt = require("jsonwebtoken")

module.exports = function () {
  let router = {}
  let templatePath = path.resolve('./templates/freightForwarder/')

  //Mail Functions
  //Prebooking Mail
  const preBookingMail = async (mailData) => {

    ejs.renderFile(`${templatePath}/prebooking.ejs`,
      {
        email: mailData.emailTo,
        bookingData: mailData.bookingData,
        fullName: mailData.fullName,
        legalName: mailData.legalName,
        url: mailData.url
      }
      , (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let mailOptions = {
            from: 'noreply@dokonaly.com',
            to: mailData.emailTo,
            subject: `AllMasters | Pre-Booking Received - ${mailData.bookingData.bId}`,
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

  //Booking Confirmation Mail
  const bookingConfirmationMail = async (mailData) => {

    ejs.renderFile(`${templatePath}/bookingconfirmation.ejs`,
      {
        email: mailData.emailTo,
        bookingData: mailData.bookingData,
        fullName: mailData.fullName,
        legalName: mailData.legalName,
        url: mailData.url
      }
      , (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let mailOptions = {
            from: 'noreply@dokonaly.com',
            to: mailData.emailTo,
            subject: `AllMasters | Booking Confirmed - ${mailData.bookingData.bId}`,
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

  //Payment Received Mail
  const paymentReceivedMail = async (mailData) => {

    ejs.renderFile(`${templatePath}/paymentconfirmation.ejs`,
      {
        email: mailData.emailTo,
        bId: mailData.bId,
        fullName: mailData.fullName,
        url: mailData.url
      }
      , (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let mailOptions = {
            from: 'noreply@dokonaly.com',
            to: mailData.emailTo,
            subject: `AllMasters | Payment Received - ${mailData.bId}`,
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

  //File Upload Function
  const fileUpload = async (folderPath, fileFolderPath, fileName, base64String) => {
    let base64Pdf

    //Creating Directory in Node Server for Saving the Uploaded Files
    await common.createDir(folderPath)
    await common.createDir(fileFolderPath)

    //Splitting base64pdf from base64String
    base64Pdf = base64String.split(';base64,').pop()

    //Creating the File in the Node Server Directory & Uploading the File to Azure File Share
    await common.createFile(`${fileFolderPath}/${fileName}`, base64Pdf, 'base64')
    await common.uploadFileAzure(`${fileFolderPath}/${fileName}`, fileFolderPath.split("/").pop(), fileName)
  }

  //Router Functions
  //Insert Booking Collection
  router.save = async (req, res) => {
    let data = { status: 0, response: message.inValid }, bookingData, bookingDocsData, insertBooking, updateBooking, currentYear, userData

    try {
      bookingData = req.body;

      if (Object.keys(bookingData).length === 0 && bookingData.data === undefined) {
        res.send(data)

        return
      }
      bookingData = bookingData.data[0]
      bookingData.systemInfo = req.rawHeaders
      currentYear = moment().year().toString()
      if (bookingData.id === undefined) {
        if (!mongoose.isValidObjectId(bookingData.createdBy)) {

          return res.send({ status: 0, response: message.invalidUserId })
        }
        userData = await db.findSingleDocument("user", { "_id": bookingData.createdBy })
        if (userData === null) {
          return res.send({ status: 0, response: message.userNotFound })
        }
        bookingDocsData = await db.findDocuments("booking", { "bId": { $regex: currentYear } })
        bookingData.bId = CONFIGJSON.booking.bIdFormat + currentYear + String(bookingDocsData.length + 1).padStart(4, '0')
        insertBooking = await db.insertSingleDocument("booking", bookingData)
        if (Object.keys(insertBooking).length !== 0) {
          //Pre-booking Confirmation Mail
          if (bookingData.status === 2) {
            await preBookingMail({
              emailTo: userData.email,
              fullName: userData.fullName,
              legalName: insertBooking.legalName,
              bookingData: insertBooking._doc,
              url: CONFIGJSON.settings.siteUrl
            })
          }
          event.eventEmitterInsert.emit(
            'insert',
            'bookingClone',
            {
              "originalId": insertBooking._doc._id,
              "actionType": 'insert',
              "data": insertBooking._doc
            }
          )

          return res.send({ status: 1, data: JSON.stringify({ _id: insertBooking._id }), response: message.addedSucess })
        }

        return res.send(data)
      } else {
        updateBooking = await db.findByIdAndUpdate("booking", bookingData.id, bookingData)
        if (updateBooking.modifiedCount !== 0 && updateBooking.matchedCount !== 0) {
          event.eventEmitterInsert.emit(
            'insert',
            'bookingClone',
            {
              "originalId": bookingData.createdBy,
              "actionType": 'update',
              "data": bookingData
            }
          )

          return res.send({ status: 1, response: message.updatedSucess })
        }

        return res.send(data)
      }
    } catch (error) {
      logger.error(`Error in booking controller - saveBooking: ${error.message}`)
      data.response = error.message
      res.send(error.message)
    }
  }

  //Insert Origin Forwarder Collection
  router.saveOF = async (req, res) => {
    let data = { status: 0, response: message.inValid }, ofData, ofCheck, insertBookingOF, updateStatus,
      ofFolderpath, ofFileFolderpath, fileName, base64String

    try {
      ofData = req.body

      if (Object.keys(ofData).length === 0 && ofData.data === undefined) {
        res.send(data)

        return
      }
      ofData = ofData.data[0]
      ofData.systemInfo = req.rawHeaders
      ofFolderpath = path.resolve(__dirname, '../../fileuploads/origin forwarder/')
      ofFileFolderpath = `${ofFolderpath}/${ofData.legalName}`
      fileName = `${ofData.gstName}_GST.pdf`
      base64String = ofData.gstPath

      ofCheck = await db.findOneDocumentExists("originForwarder", { bookingId: new ObjectId(ofData.bookingId) })
      if (ofCheck === true) {
        if (base64String.includes('base64') === true) {
          await fileUpload(ofFolderpath, ofFileFolderpath, fileName, base64String)
          ofData.gstPath = CONFIGJSON.settings.nodeFileUploads + `origin forwarder/${ofData.legalName}/${fileName}`
        }
        await db.updateOneDocument("originForwarder", { 'bookingId': new ObjectId(ofData.bookingId) }, ofData)
        updateStatus = await db.findByIdAndUpdate("booking", ofData.bookingId, { status: ofData.status })
        event.eventEmitterInsert.emit(
          'insert',
          'originForwarderClone',
          {
            "originalId": ofData.bookingId,
            "actionType": 'update',
            "data": ofData
          }
        )

        return res.send({ status: 1, response: message.updateOF })
      }
      else {
        await fileUpload(ofFolderpath, ofFileFolderpath, fileName, base64String)
        ofData.gstPath = CONFIGJSON.settings.nodeFileUploads + `origin forwarder/${ofData.legalName}/${fileName}`
        insertBookingOF = await db.insertSingleDocument("originForwarder", ofData)
        if (Object.keys(insertBookingOF).length !== 0) {
          updateStatus = await db.findByIdAndUpdate("booking", ofData.bookingId, { status: ofData.status })
          event.eventEmitterInsert.emit(
            'insert',
            'originForwarderClone',
            {
              "originalId": insertBookingOF._doc._id,
              "actionType": 'insert',
              "data": insertBookingOF._doc
            }
          )

          return res.send({ status: 1, response: message.addedSucess })
        }
      }
    } catch (error) {
      logger.error(`Error in booking controller - saveOF: ${error.message}`)
      res.send(error.message)
    }
  }

  //Insert Destination Forwarder Collection 
  router.saveDF = async (req, res) => {
    let data = { status: 0, response: message.inValid }, dfData, dfCheck, insertBookingDF, updateStatus

    try {
      dfData = req.body;

      if (Object.keys(dfData).length === 0 && dfData.data === undefined) {
        res.send(data)

        return
      }
      dfData = dfData.data[0]
      dfData.systemInfo = req.rawHeaders
      dfCheck = await db.findOneDocumentExists("destinationForwarder", { bookingId: new ObjectId(dfData.bookingId) })
      if (dfCheck === true) {
        await db.updateOneDocument("destinationForwarder", { 'bookingId': new ObjectId(dfData.bookingId) }, dfData)
        updateStatus = await db.findByIdAndUpdate("booking", dfData.bookingId, { status: dfData.status })
        event.eventEmitterInsert.emit(
          'insert',
          'destinationForwarderClone',
          {
            "originalId": dfData.bookingId,
            "actionType": 'update',
            "data": dfData
          }
        )

        return res.send({ status: 1, response: message.updateDF })
      }
      else {
        insertBookingDF = await db.insertSingleDocument("destinationForwarder", dfData)
        if (Object.keys(insertBookingDF).length !== 0) {
          updateStatus = await db.findByIdAndUpdate("booking", dfData.bookingId, { status: dfData.status })
          event.eventEmitterInsert.emit(
            'insert',
            'destinationForwarderClone',
            {
              "originalId": insertBookingDF._doc._id,
              "actionType": 'insert',
              "data": insertBookingDF._doc
            }
          )

          return res.send({ status: 1, response: message.addedSucess })
        }
      }
    } catch (error) {
      logger.error(`Error in booking controller - saveDF: ${error.message}`)
      res.send(error.message)
    }
  }

  //Insert Notify Partner Collection
  router.saveNP = async (req, res) => {
    let data = { status: 0, response: message.inValid }, npData, npCheck, updateStatus, insertBookingNF

    try {
      npData = req.body

      if (Object.keys(npData).length === 0 && npData.data === undefined) {
        res.send(data)

        return
      }
      npData = npData.data[0]
      npData.systemInfo = req.rawHeaders
      npCheck = await db.findOneDocumentExists("notifyParty", { bookingId: new ObjectId(npData.bookingId) })
      if (npCheck === true) {
        await db.updateOneDocument("notifyParty", { 'bookingId': new ObjectId(npData.bookingId) }, npData)
        updateStatus = await db.findByIdAndUpdate("booking", npData.bookingId, { status: 5 })
        event.eventEmitterInsert.emit(
          'insert',
          'notifyPartyClone',
          {
            "originalId": npData.bookingId,
            "actionType": 'update',
            "data": npData
          }
        )

        return res.send({ status: 1, response: message.updateNP })
      }
      else {
        insertBookingNF = await db.insertSingleDocument("notifyParty", npData)
        if (Object.keys(insertBookingNF).length !== 0) {
          updateStatus = await db.findByIdAndUpdate("booking", npData.bookingId, { status: 5 })
          event.eventEmitterInsert.emit(
            'insert',
            'notifyPartyClone',
            {
              "originalId": insertBookingNF._doc._id,
              "actionType": 'insert',
              "data": insertBookingNF._doc
            }
          )

          return res.send({ status: 1, response: message.addedSucess })
        }
      }
    } catch (error) {
      logger.error(`Error in booking controller - saveDF: ${error.message}`)
      res.send(error.message)
    }
  }

  //Insert Booking Documents Collection
  router.saveDocs = async (req, res) => {
    let data = { status: 0, response: message.inValid }, docsData, docsCheck, getBid, insertBookingDocs, updateStatus,
      docsFolderpath, docsFileFolderpath, fileName, base64String, i = 0, j = 0

    try {
      docsData = req.body;

      if (Object.keys(docsData).length === 0 && docsData.data === undefined) {
        res.send(data)
        return
      }
      docsData = docsData.data[0]
      docsData.systemInfo = req.rawHeaders


      getBid = await db.findAndSelect("booking", { _id: new ObjectId(docsData.bookingId) }, { bId: 1, _id: 0 })
      if (getBid.length === 0) {

        return res.send({ status: 0, response: message.bookingNotFound })
      }
      docsFolderpath = path.resolve(__dirname, '../../fileuploads/booking/')
      docsFileFolderpath = `${docsFolderpath}/${getBid[0].bId}`

      docsCheck = await db.findOneDocumentExists("bookingDocs", { bookingId: new ObjectId(docsData.bookingId) })
      if (docsCheck === true) {
        //Shipping Bill
        if (docsData.shippingBill.length !== 0) {
          for (; i < docsData.shippingBill.length; i++) {
            if (docsData.shippingBill[i].filePath.includes('base64') === true) {
              fileName = `${docsData.shippingBill[i].fileName}_SB${i + 1}.pdf`
              base64String = docsData.shippingBill[i].filePath
              docsData.shippingBill[i].filePath = CONFIGJSON.settings.nodeFileUploads + `booking/${getBid[0].bId}/${fileName}`
              await fileUpload(docsFolderpath, docsFileFolderpath, fileName, base64String)
            }
          }
        }
        //Packing List
        if (docsData.packingList.length !== 0) {
          for (; j < docsData.packingList.length; j++) {
            if (docsData.packingList[j].filePath.includes('base64') === true) {
              fileName = `${docsData.packingList[j].fileName}_PL${j + 1}.pdf`
              base64String = docsData.packingList[j].filePath
              docsData.packingList[j].filePath = CONFIGJSON.settings.nodeFileUploads + `booking/${getBid[0].bId}/${fileName}`
              await fileUpload(docsFolderpath, docsFileFolderpath, fileName, base64String)
            }
          }
        }
        await db.updateOneDocument("bookingDocs", { 'bookingId': new ObjectId(docsData.bookingId) }, docsData)
        updateStatus = await db.findByIdAndUpdate("booking", docsData.bookingId, { status: docsData.status })
        event.eventEmitterInsert.emit(
          'insert',
          'bookingDocsClone',
          {
            "originalId": docsData.bookingId,
            "actionType": 'update',
            "data": docsData
          }
        )

        return res.send({ status: 1, response: message.updateDOCS })
      }
      else {
        //Shipping Bill
        if (docsData.shippingBill.length !== 0) {
          for (; i < docsData.shippingBill.length; i++) {
            fileName = `${docsData.shippingBill[i].fileName}_SB${i + 1}.pdf`
            base64String = docsData.shippingBill[i].filePath
            docsData.shippingBill[i].filePath = CONFIGJSON.settings.nodeFileUploads + `booking/${getBid[0].bId}/${fileName}`
            await fileUpload(docsFolderpath, docsFileFolderpath, fileName, base64String)
          }
        }
        //Packing List
        if (docsData.packingList.length !== 0) {
          for (; j < docsData.packingList.length; j++) {
            fileName = `${docsData.packingList[j].fileName}_PL${j + 1}.pdf`
            base64String = docsData.packingList[j].filePath
            docsData.packingList[j].filePath = CONFIGJSON.settings.nodeFileUploads + `booking/${getBid[0].bId}/${fileName}`
            await fileUpload(docsFolderpath, docsFileFolderpath, fileName, base64String)
          }
        }
        insertBookingDocs = await db.insertSingleDocument("bookingDocs", docsData)
        if (Object.keys(insertBookingDocs).length !== 0) {
          updateStatus = await db.findByIdAndUpdate("booking", docsData.bookingId, { status: docsData.status })
          event.eventEmitterInsert.emit(
            'insert',
            'bookingDocsClone',
            {
              "originalId": insertBookingDocs._doc._id,
              "actionType": 'insert',
              "data": insertBookingDocs._doc
            }
          )

          return res.send({ status: 1, response: message.addedSucess })
        }
      }
    } catch (error) {
      logger.error(`Error in booking controller - saveDocs: ${error.message}`)
      res.send(error.message)
    }
  }

  //Insert Checkout Details Collection
  router.saveCheckoutDetails = async (req, res) => {
    let data = { status: 0, response: message.inValid }, checkoutDetailsData, checkoutDetailsCheck, updateStatus, insertCheckoutDetails

    try {
      checkoutDetailsData = req.body;

      if (Object.keys(checkoutDetailsData).length === 0 && checkoutDetailsData.data === undefined) {
        res.send(data)
        return
      }
      checkoutDetailsData = checkoutDetailsData.data[0]
      checkoutDetailsData.systemInfo = req.rawHeaders
      checkoutDetailsCheck = await db.findOneDocumentExists("checkOutDetails", { bookingId: new ObjectId(checkoutDetailsData.bookingId) })
      if (checkoutDetailsCheck === true) {
        await db.updateOneDocument("checkOutDetails", { 'bookingId': new ObjectId(checkoutDetailsData.bookingId) }, checkoutDetailsData)
        updateStatus = await db.findByIdAndUpdate("booking", checkoutDetailsData.bookingId, { status: checkoutDetailsData.status })
        event.eventEmitterInsert.emit(
          'insert',
          'checkOutDetailsClone',
          {
            "originalId": checkoutDetailsData.bookingId,
            "actionType": 'update',
            "data": checkoutDetailsData
          }
        )

        return res.send({ status: 1, response: message.updateCheckoutDetails })
      }
      else {
        insertCheckoutDetails = await db.insertSingleDocument("checkOutDetails", checkoutDetailsData)
        if (Object.keys(insertCheckoutDetails).length !== 0) {
          updateStatus = await db.findByIdAndUpdate("booking", checkoutDetailsData.bookingId, { status: checkoutDetailsData.status })
          event.eventEmitterInsert.emit(
            'insert',
            'checkOutDetailsClone',
            {
              "originalId": insertCheckoutDetails._doc._id,
              "actionType": 'insert',
              "data": insertCheckoutDetails._doc
            }
          )

          return res.send({ status: 1, response: message.addedSucess })
        }
      }

    } catch (error) {
      logger.error(`Error in booking controller - saveCheckoutDetails: ${error.message}`)
      data.response = error.message
      res.send(data)
    }
  }

  //Get Bookings List
  router.bookingList = async (req, res) => {
    let data = { status: 0, response: message.inValid }, bookingsData

    try {
      bookingsData = await db.findAndSelect("booking", {}, { systemInfo: 0, createdBy: 0, createdAt: 0, updatedAt: 0 })
      if (bookingsData && bookingsData.length !== 0) {

        return res.send({ status: 1, data: JSON.stringify(bookingsData) })
      }

      return res.send({ status: 1, data: '[]' })
    } catch (error) {
      logger.error(`Error in booking controller - bookingList: ${error.message}`)
      data.response = error.message
      res.send(data)
    }
  }

  //Get Origin Forwarder List
  router.ofList = async (req, res) => {
    let data = { status: 0, response: message.inValid }, ofPostData, ofListData

    try {
      ofPostData = req.body
      if (Object.keys(ofPostData).length === 0 && ofPostData.data === undefined) {
        res.send(data)

        return
      }
      ofPostData = ofPostData.data[0]

      ofListData = await db.findDocuments("originForwarder", { legalName: ofPostData.legalName, saveFlag: 1 }, { createdAt: 0, updatedAt: 0, systemInfo: 0 })
      if (ofListData.length !== 0) {

        return res.send({ status: 1, data: JSON.stringify(ofListData) })
      }

      return res.send({ status: 1, data: "[]" })
    } catch (error) {
      logger.error(`Error in booking controller - ofList: ${error.message}`)
      data.response = error.message
      res.send(error.message)
    }
  }

  //Get Destination Forwarder List
  router.dfList = async (req, res) => {
    let data = { status: 0, response: message.inValid }, dfPostData, dfListData

    try {
      dfPostData = req.body;

      if (Object.keys(dfPostData).length === 0 && dfPostData.data === undefined) {
        res.send(data)

        return
      }
      dfPostData = dfPostData.data[0]

      dfListData = await db.findDocuments("destinationForwarder", { legalName: dfPostData.legalName, saveFlag: 1 }, { createdAt: 0, updatedAt: 0, systemInfo: 0 })
      if (dfListData.length !== 0) {

        return res.send({ status: 1, data: JSON.stringify(dfListData) })
      }

      return res.send({ status: 1, data: "[]" })
    } catch (error) {
      logger.error(`Error in booking controller - dfList: ${error.message}`)
      data.response = error.message
      res.send(error.message)
    }
  }

  //Get Notify Party List
  router.npList = async (req, res) => {
    let data = { status: 0, response: message.inValid }, npPostData, npListData

    try {
      npPostData = req.body;
      if (Object.keys(npPostData).length === 0 && npPostData.data === undefined) {
        res.send(data)

        return
      }
      npPostData = npPostData.data[0]
      npListData = await db.findDocuments("notifyParty", { legalName: npPostData.legalName, saveFlag: 1 }, { createdAt: 0, updatedAt: 0, systemInfo: 0 })
      if (npListData.length !== 0) {

        return res.send({ status: 1, data: JSON.stringify(npListData) })
      }

      return res.send({ status: 1, data: "[]" })
    } catch (error) {
      logger.error(`Error in booking controller - npList: ${error.message}`)
      data.response = error.message
      res.send(error.message)
    }
  }

  //Get Origin Forwarder Data by Id
  router.ofDataById = async (req, res) => {
    let data = { status: 0, response: message.inValid }, ofPostData, ofListData

    try {
      ofPostData = req.body;

      if (Object.keys(ofPostData).length === 0 && ofPostData.data === undefined) {
        res.send(data)

        return
      }
      ofPostData = ofPostData.data[0]
      if (!mongoose.isValidObjectId(ofPostData.id)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      ofListData = await db.findSingleDocument("originForwarder", { bookingId: new ObjectId(ofPostData.id) }, { createdAt: 0, updatedAt: 0, systemInfo: 0 })
      if (ofListData !== null && Object.keys(ofListData).length !== 0) {
        await common.downloadFileAzure(`${ofListData.legalName}`, `${ofListData.gstName}_GST.pdf`, 'origin forwarder')

        return res.send({ status: 1, data: JSON.stringify(ofListData) })
      }

      return res.send({ status: 1, data: "[]" })
    } catch (error) {
      logger.error(`Error in booking controller - ofDataById: ${error.message}`)
      data.response = error.message
      res.send(error.message)
    }
  }

  //Get Destination Forwarder Data by Id
  router.dfDataById = async (req, res) => {
    let data = { status: 0, response: message.inValid }, dfPostData, dfListData

    try {
      dfPostData = req.body;

      if (Object.keys(dfPostData).length === 0 && dfPostData.data === undefined) {
        res.send(data)

        return
      }
      dfPostData = dfPostData.data[0]
      if (!mongoose.isValidObjectId(dfPostData.id)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      dfListData = await db.findSingleDocument("destinationForwarder", { bookingId: new ObjectId(dfPostData.id) }, { createdAt: 0, updatedAt: 0, systemInfo: 0 })
      if (dfListData !== null && Object.keys(dfListData).length !== 0) {

        return res.send({ status: 1, data: JSON.stringify(dfListData) })
      }

      return res.send({ status: 1, data: "[]" })
    } catch (error) {
      logger.error(`Error in booking controller - dfDataById: ${error.message}`)
      data.response = error.message
      res.send(error.message)
    }
  }

  //Get Notify Partner Data by Id
  router.npDataById = async (req, res) => {
    let data = { status: 0, response: message.inValid }, npPostData, npListData

    try {
      npPostData = req.body;

      if (Object.keys(npPostData).length === 0 && npPostData.data === undefined) {
        res.send(data)

        return
      }
      npPostData = npPostData.data[0]
      if (!mongoose.isValidObjectId(npPostData.id)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      npListData = await db.findSingleDocument("notifyParty", { bookingId: new ObjectId(npPostData.id) }, { createdAt: 0, updatedAt: 0, systemInfo: 0 })
      if (npListData !== null && Object.keys(npListData).length !== 0) {

        return res.send({ status: 1, data: JSON.stringify(npListData) })
      }

      return res.send({ status: 1, data: "[]" })
    } catch (error) {
      logger.error(`Error in booking controller - npDataById: ${error.message}`)
      data.response = error.message
      res.send(error.message)
    }
  }

  //Get Booking Documents by Id
  router.docsById = async (req, res) => {
    let data = { status: 0, response: message.inValid }, docsPostData, docsListData, getBid

    try {
      docsPostData = req.body;

      if (Object.keys(docsPostData).length === 0 && docsPostData.data === undefined) {
        res.send(data)

        return
      }
      docsPostData = docsPostData.data[0]
      if (!mongoose.isValidObjectId(docsPostData.id)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      getBid = await db.findAndSelect("booking", { _id: new ObjectId(docsPostData.id) }, { bId: 1, _id: 0 })
      docsListData = await db.findSingleDocument("bookingDocs", { bookingId: new ObjectId(docsPostData.id) }, { createdAt: 0, updatedAt: 0, systemInfo: 0 })
      if (docsListData !== null && Object.keys(docsListData).length !== 0) {
        await common.downloadFileAzure(`${getBid[0].bId}`, '', 'booking')

        return res.send({ status: 1, data: JSON.stringify(docsListData) })
      }

      return res.send({ status: 1, data: "[]" })
    } catch (error) {
      logger.error(`Error in booking controller - docsById: ${error.message}`)
      data.response = error.message
      res.send(error.message)
    }
  }

  //Get Checkout Details Data by Id
  router.checkoutDetailsDataById = async (req, res) => {
    let data = { status: 0, response: message.inValid }, cdPostData, cdListData, paymentData, token, decodedToken

    try {
      cdPostData = req.body;

      if (Object.keys(cdPostData).length === 0 && cdPostData.data === undefined) {
        res.send(data)

        return
      }
      cdPostData = cdPostData.data[0]
      token = req.headers.authorization
      token = token.substring(7)

      decodedToken = jwt.decode(token)

      if (!mongoose.isValidObjectId(cdPostData.id)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      cdListData = await db.findSingleDocument("checkOutDetails", { bookingId: new ObjectId(cdPostData.id) }, { createdAt: 0, updatedAt: 0, systemInfo: 0 })
      if (cdListData !== null && Object.keys(cdListData).length !== 0) {
        if (decodedToken.type === 1) {
          if (cdListData._doc.createdBy != decodedToken.userId) {

            return res.status(401).send("Unauthorized Access")
          }
        }
        paymentData = await db.findSingleDocument("paymentDetail", { bookingId: new ObjectId(cdPostData.id) }, { createdAt: 0, updatedAt: 0, systemInfo: 0 })
        cdListData._doc.paymentData = paymentData

        return res.send({ status: 1, data: JSON.stringify(cdListData) })
      }

      return res.send({ status: 1, data: "[]" })
    } catch (error) {
      logger.error(`Error in booking controller - checkoutDetailsDataById: ${error.message}`)
      data.response = error.message
      res.send(error.message)
    }
  }

  //Get Checkout Details Data by Id For Cfs
  router.checkoutDetailsCfsData = async (req, res) => {
    let data = { status: 0, response: message.inValid }, cdPostData, cdListData, paymentData, scheduleData, token, decodedToken

    try {
      cdPostData = req.body;

      if (Object.keys(cdPostData).length === 0 && cdPostData.data === undefined) {
        res.send(data)

        return
      }
      cdPostData = cdPostData.data[0]
      token = req.headers.authorization
      token = token.substring(7)
      decodedToken = jwt.decode(token)

      if (!mongoose.isValidObjectId(cdPostData.id)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      scheduleData = await db.findSingleDocument("schedule", { _id: new ObjectId(cdPostData.scheduleId) }, { destinationCfsName: 1, originCfsName: 1, _id: 0 })
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
      cdListData = await db.findSingleDocument("checkOutDetails", { bookingId: new ObjectId(cdPostData.id) }, { createdAt: 0, updatedAt: 0, systemInfo: 0 })
      if (cdListData !== null && Object.keys(cdListData).length !== 0) {

        paymentData = await db.findSingleDocument("paymentDetail", { bookingId: new ObjectId(cdPostData.id) }, { createdAt: 0, updatedAt: 0, systemInfo: 0 })
        cdListData._doc.paymentData = paymentData

        return res.send({ status: 1, data: JSON.stringify(cdListData) })
      }

      return res.send({ status: 1, data: "[]" })
    } catch (error) {
      logger.error(`Error in booking controller - checkoutDetailsDataById: ${error.message}`)
      data.response = error.message
      res.send(error.message)
    }
  }

  //Get Booking Data by Id
  router.getBookingById = async (req, res) => {
    let data = { status: 0, response: message.inValid }, bookingData, bookingListData

    try {
      bookingData = req.body;

      if (Object.keys(bookingData).length === 0 && bookingData.data === undefined) {
        res.send(data)

        return
      }
      bookingData = bookingData.data[0]
      if (!mongoose.isValidObjectId(bookingData.id)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      bookingListData = await db.findSingleDocument("booking", { _id: new ObjectId(bookingData.id) }, { createdAt: 0, updatedAt: 0, systemInfo: 0 })
      if (bookingListData !== null && Object.keys(bookingListData).length !== 0) {

        return res.send({ status: 1, data: JSON.stringify(bookingListData) })
      }

      return res.send({ status: 1, data: "[]" })
    } catch (error) {
      logger.error(`Error in booking controller - getBookingById: ${error.message}`)
      data.response = error.message
      res.send(error.message)
    }
  }

  //Get Bookings by Legal Name
  router.getBookingsByLegalName = async (req, res) => {
    let data = { status: 0, response: message.inValid }, legalNameData, legalNameListData

    try {
      legalNameData = req.body;

      if (Object.keys(legalNameData).length === 0 && legalNameData.data === undefined) {
        res.send(data)

        return
      }
      legalNameData = legalNameData.data[0]
      legalNameListData = await db.findDocuments("booking", { legalName: legalNameData.legalName, status: { $in: [1, 2] } }, { createdAt: 0, updatedAt: 0, systemInfo: 0 })
      if (legalNameListData.length !== 0) {

        return res.send({ status: 1, data: JSON.stringify(legalNameListData) })
      }

      return res.send({ status: 1, data: "[]" })
    } catch (error) {
      logger.error(`Error in booking controller - getBookingsByLegalName: ${error.message}`)
      data.response = error.message
      res.send(error.message)
    }
  }

  //Get Bookings Details by Legal Name
  router.getBookingsDetailsByLegalName = async (req, res) => {
    let data = { status: 0, response: message.inValid }, legalNameData, bookingData, aggregationQuery = [], i = 0, newBookingData = [{}]

    try {
      legalNameData = req.body
      legalNameData = legalNameData.data[0]

      aggregationQuery = [
        {
          $lookup: {
            from: 'rates',
            localField: 'scheduleId',
            foreignField: 'scheduleId',
            as: 'rateData',
          },
        },
        {
          $lookup: {
            from: 'schedules',
            localField: 'scheduleId',
            foreignField: '_id',
            as: 'sData',
          },
        },
        {
          $lookup: {
            from: 'paymentdetails',
            localField: '_id',
            foreignField: 'bookingId',
            as: 'pData',
          },
        },
        {
          $match: {
            $expr: {
              $and: [
                { $ne: ["$rateData", []] },
                { $eq: [{ $arrayElemAt: ["$rateData.status", 0] }, 1] }
              ]
            },
            "legalName": legalNameData.legalName
          }
        },
        {
          '$project': {
            'scheduleData': {
              '_id': { '$arrayElemAt': ['$sData._id', 0] },
              'scheduleId': { '$arrayElemAt': ['$sData.scheduleId', 0] },
              'pol': { '$arrayElemAt': ['$sData.pol', 0] },
              'pod': { '$arrayElemAt': ['$sData.pod', 0] },
              'container': { '$arrayElemAt': ['$sData.container', 0] },
              'volume': { '$arrayElemAt': ['$sData.volume', 0] },
              'weight': { '$arrayElemAt': ['$sData.weight', 0] },
              'vessel': { '$arrayElemAt': ['$sData.vessel', 0] },
              'voyage': { '$arrayElemAt': ['$sData.voyage', 0] },
              'etd': { '$arrayElemAt': ['$sData.etd', 0] },
              'eta': { '$arrayElemAt': ['$sData.eta', 0] },
              'bookingCutOff': { '$arrayElemAt': ['$sData.bookingCutOff', 0] },
              'originCfsCutOff': { '$arrayElemAt': ['$sData.originCfsCutOff', 0] },
              'destinationCfsCutOff': { '$arrayElemAt': ['$sData.destinationCfsCutOff', 0] },
              'originCfsName': { '$arrayElemAt': ['$sData.originCfsName', 0] },
              'originCfsBranch': { '$arrayElemAt': ['$sData.originCfsBranch', 0] },
              'destinationCfsName': { '$arrayElemAt': ['$sData.destinationCfsName', 0] },
              'destinationCfsBranch': { '$arrayElemAt': ['$sData.destinationCfsBranch', 0] },
              'originCfsClosingtime': { '$arrayElemAt': ['$sData.originCfsClosingtime', 0] },
              'destinationCfsClosingtime': { '$arrayElemAt': ['$sData.destinationCfsClosingtime', 0] },
              'status': { '$arrayElemAt': ['$sData.status', 0] },
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
            'bookingData': {
              "_id": "$_id",
              "bId": "$bId",
              "scheduleId": "$scheduleId",
              "cargoType": "$cargoType",
              "cargoDetails": "$cargoDetails",
              "totalCbm": "$totalCbm",
              "totalWt": "$totalWt",
              "legalName": "$legalName",
              "companyName": "$companyName",
              "bookedPrice": "$bookedPrice",
              "totalPrice": "$totalPrice",
              "status": "$status",
              "updatedAt": "$updatedAt"
            },
            'paymentData': {
              "_id": { '$arrayElemAt': ['$pData._id', 0] },
              "invoiceName": { '$arrayElemAt': ['$pData.invoiceName', 0] },
              "invoicePath": { '$arrayElemAt': ['$pData.invoicePath', 0] },
              "status": { '$arrayElemAt': ['$pData.status', 0] },
            }
          },
        },
      ]
      bookingData = await db.getAggregation('booking', aggregationQuery)
      if (bookingData.length === 0) {

        res.send({ status: 1, data: "[]" })
      } else {
        for (; i < bookingData.length; i++) {
          newBookingData[i] = { ...bookingData[i] }

          newBookingData[i].scheduleData.originCost = common.decryptDB(bookingData[i].scheduleData.originCost)
          newBookingData[i].scheduleData.originBE = common.decryptDB(bookingData[i].scheduleData.originBE)
          newBookingData[i].scheduleData.originComparison = common.decryptDB(bookingData[i].scheduleData.originComparison)
          newBookingData[i].scheduleData.freightCost = common.decryptDB(bookingData[i].scheduleData.freightCost)
          newBookingData[i].scheduleData.freightBE = common.decryptDB(bookingData[i].scheduleData.freightBE)
          newBookingData[i].scheduleData.freightComparison = common.decryptDB(bookingData[i].scheduleData.freightComparison)
          newBookingData[i].scheduleData.destinationCost = common.decryptDB(bookingData[i].scheduleData.destinationCost)
          newBookingData[i].scheduleData.destinationBE = common.decryptDB(bookingData[i].scheduleData.destinationBE)
          newBookingData[i].scheduleData.destinationComparison = common.decryptDB(bookingData[i].scheduleData.destinationComparison)
          newBookingData[i].scheduleData.otherCost = common.decryptDB(bookingData[i].scheduleData.otherCost)
          newBookingData[i].scheduleData.otherComparison = common.decryptDB(bookingData[i].scheduleData.otherComparison)
          newBookingData[i].scheduleData.finalRates = common.decryptDB(bookingData[i].scheduleData.finalRates)
          newBookingData[i].scheduleData.savingRates = common.decryptDB(bookingData[i].scheduleData.savingRates)
          newBookingData[i].scheduleData.predictionRates = common.decryptDB(bookingData[i].scheduleData.predictionRates)
        }
        res.send({ status: 1, data: JSON.stringify(newBookingData) });
      }
    } catch (error) {
      logger.error(`Error in booking controller - getBookingsByLegalName: ${error.message}`)
      data.response = error.message
      res.send(error.message)
    }
  }

  //Update Status in Booking Collection
  router.updateStatus = async (req, res) => {
    let data = { status: 0, response: message.inValid }, updateData, bookingData, userData, insertPayment,
      paymentDetails, milestoneData = {}, insertMilestone, bookingObj, scheduleData, bookingCbm, totalCbm = 0, searchBookingDoc

    try {
      updateData = req.body;

      if (Object.keys(updateData).length === 0 && updateData.data === undefined) {
        res.send(data)
        return
      }
      updateData = updateData.data[0]
      updateData.systemInfo = req.rawHeaders
      bookingData = await db.findSingleDocument("booking", { _id: new ObjectId(updateData.bookingId) })
      if (bookingData !== null && Object.keys(bookingData).length !== 0) {
        userData = await db.findSingleDocument("user", { _id: new ObjectId(bookingData.createdBy) })
        if (userData === null) {

          return res.send({ status: 0, response: message.userNotFound })
        }
        if (updateData.status === 1) {

          bookingObj = await db.findSingleDocument("booking", { _id: new ObjectId(updateData.bookingId) }, { scheduleId: 1, _id: 0, totalCbm: 1 })
          if (bookingObj !== null && Object.keys(bookingObj).length !== 0) {
            scheduleData = await db.findSingleDocument("schedule", { _id: new ObjectId(bookingObj.scheduleId) }, { volume: 1 })
            if (scheduleData !== null && Object.keys(scheduleData).length !== 0) {
              bookingCbm = await db.findAndSelect("booking", { scheduleId: new ObjectId(scheduleData._id), status: 1 }, { totalCbm: 1, _id: 0 })
              if (bookingCbm && bookingCbm.length !== 0) {
                totalCbm = bookingCbm.reduce((sum, num) => sum + parseInt(num.totalCbm), 0)
                if (totalCbm + parseInt(bookingObj.totalCbm) > scheduleData.volume) {

                  return res.send({ status: 0, response: message.containerFilled })
                }
              }
            }
          }
          await bookingConfirmationMail({
            emailTo: userData.email,
            fullName: userData.fullName,
            legalName: bookingData.legalName,
            bookingData: bookingData._doc,
            url: CONFIGJSON.settings.siteUrl
          })

          paymentDetails = {
            bookingId: updateData.bookingId,
            bId: bookingData.bId,
            createdBy: bookingData.createdBy,
            systemInfo: updateData.systemInfo,
            status: 9
          }
          insertPayment = await db.insertSingleDocument("paymentDetail", paymentDetails)
          if (Object.keys(insertPayment).length !== 0) {
            event.eventEmitterInsert.emit(
              'insert',
              'paymentDetailClone',
              {
                "originalId": updateData.bookingId,
                "actionType": 'insert',
                "data": paymentDetails
              }
            )
          }
          milestoneData.bId = bookingData.bId
          milestoneData.bookingId = updateData.bookingId
          milestoneData.systemInfo = req.rawHeaders
          milestoneData.createdBy = bookingData.createdBy

          // Shipping Bill with Array
          searchBookingDoc = await db.findSingleDocument("bookingDocs", { bookingId: new ObjectId(updateData.bookingId) })
          if (searchBookingDoc._doc.shippingBill.length !== 0) {

            milestoneData.msams09File = searchBookingDoc.shippingBill
          }

          insertMilestone = await db.insertSingleDocument("milestone", milestoneData)
          if (Object.keys(insertMilestone).length !== 0) {
            event.eventEmitterInsert.emit(
              'insert',
              'milestoneClone',
              {
                "originalId": insertMilestone._doc._id,
                "actionType": 'insert',
                "data": insertMilestone._doc
              }
            )
          }
        }

        await db.findByIdAndUpdate("booking", updateData.bookingId,
          updateData.bookedPrice !== undefined ?
            { status: updateData.status, bookedPrice: updateData.bookedPrice } :
            { status: updateData.status }
        )

        event.eventEmitterInsert.emit(
          'insert',
          'bookingClone',
          {
            "originalId": updateData.bookingId,
            "actionType": 'update',
            "data": updateData
          }
        )

        return res.send({ status: 1, response: message.updateBooking })
      }

      return res.send(data)
    } catch (error) {
      logger.error(`Error in booking controller - updateStatus: ${error.message}`)
      data.response = error.message
      res.send(error.message)
    }
  }

  //Insert Booking Search
  router.insertBookingSearch = async (req, res) => {
    let data = { status: 0, response: message.inValid }, bookingSearchData, insertBookingSearch

    try {
      bookingSearchData = req.body

      if (Object.keys(bookingSearchData).length === 0 && bookingSearchData.data === undefined) {
        res.send(data)

        return
      }
      bookingSearchData = bookingSearchData.data[0]
      bookingSearchData.systemInfo = req.rawHeaders

      insertBookingSearch = await db.insertSingleDocument("bookingSearch", bookingSearchData)
      if (insertBookingSearch !== null && Object.keys(insertBookingSearch).length !== 0) {

        return res.send({ status: 1, response: message.addedSucessBS })
      }

      return res.send(data)
    } catch (error) {
      logger.error(`Error in booking controller - insertBookingSearch: ${error.message}`)
      res.send(error.message)
    }
  }

  //Get Origin Forwarder File by Id
  router.ofFileById = async (req, res) => {
    let data = { status: 0, response: message.inValid }, ofFileData, ofListData

    try {
      ofFileData = req.body;

      if (Object.keys(ofFileData).length === 0 && ofFileData.data === undefined) {
        res.send(data)

        return
      }
      ofFileData = ofFileData.data[0]
      if (!mongoose.isValidObjectId(ofFileData.id)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      ofListData = await db.findSingleDocument("originForwarder", { _id: new ObjectId(ofFileData.id) }, { createdAt: 0, updatedAt: 0, systemInfo: 0 })
      if (ofListData !== null && Object.keys(ofListData).length !== 0) {
        await common.downloadFileAzure(`${ofListData.legalName}`, `${ofListData.gstName}_GST.pdf`, 'origin forwarder')

        return res.send({ status: 1, response: message.fileDownloaded })
      }

      return res.send(data)
    } catch (error) {
      logger.error(`Error in booking controller - ofFileById: ${error.message}`)
      data.response = error.message
      res.send(error.message)
    }
  }

  //Update Invoice Payment Status in Payment Collection
  router.updateInvoicePayment = async (req, res) => {
    let data = { status: 0, response: message.inValid }, updateData, paymentData, userData,
      invoiceFolderpath, invoiceFileFolderpath, fileName, base64String

    try {
      updateData = req.body;

      if (Object.keys(updateData).length === 0 && updateData.data === undefined) {
        res.send(data)
        return
      }
      updateData = updateData.data[0]
      updateData.systemInfo = req.rawHeaders
      paymentData = await db.findSingleDocument("paymentDetail", { bookingId: new ObjectId(updateData.bookingId) })
      if (paymentData !== null && Object.keys(paymentData).length !== 0) {
        userData = await db.findSingleDocument("user", { _id: new ObjectId(paymentData.createdBy) })
        if (userData === null) {

          return res.send({ status: 0, response: message.userNotFound })
        }
        if (updateData.status === 10) {
          invoiceFolderpath = path.resolve(__dirname, '../../fileuploads/booking/')
          invoiceFileFolderpath = `${invoiceFolderpath}/${paymentData.bId}`
          fileName = `${updateData.invoiceName}_Invoice.pdf`
          base64String = updateData.invoicePath

          if (base64String.includes('base64') === true) {
            await fileUpload(invoiceFolderpath, invoiceFileFolderpath, fileName, base64String)
            updateData.invoicePath = CONFIGJSON.settings.nodeFileUploads + `booking/${paymentData.bId}/${fileName}`
          }
        }
        else if (updateData.status === 11) {
          updateData.utrDate = moment(updateData.utrDate, 'DD-MM-YYYY').toDate()
        }
        else if (updateData.status === 1) {
          await paymentReceivedMail({
            emailTo: userData.email,
            fullName: userData.fullName,
            bId: paymentData.bId,
            url: CONFIGJSON.settings.siteUrl
          })
        }
        await db.findByIdAndUpdate("paymentDetail", paymentData._id, updateData)

        event.eventEmitterInsert.emit(
          'insert',
          'paymentDetailClone',
          {
            "originalId": updateData.bookingId,
            "actionType": 'update',
            "data": updateData
          }
        )

        return res.send({ status: 1, response: message.updatedPayment })
      }

      return res.send(data)
    } catch (error) {
      logger.error(`Error in booking controller - updateInvoicePayment: ${error.message}`)
      data.response = error.message
      res.send(error.message)
    }
  }

  //Get Invoice Payment File
  router.getInvoicePaymentFile = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let idData = req.body, paymentData
      if (Object.keys(idData).length === 0 && idData.data === undefined) {
        res.send(data)

        return
      }
      idData = idData.data[0]
      if (!mongoose.isValidObjectId(idData.id)) {

        return res.send({ status: 0, response: message.invalidId })
      }
      paymentData = await db.findSingleDocument("paymentDetail", { _id: new ObjectId(idData.id) })
      if (paymentData !== null && Object.keys(paymentData).length !== 0) {

        await common.downloadFileAzure(`${paymentData.bId}`, `${paymentData.invoiceName}_Invoice.pdf`, 'booking')

        return res.send({ status: 1, response: message.fileDownloaded })
      }

      return res.send(data)
    } catch (error) {
      logger.error(`Error in booking controller - getInvoicePaymentFile: ${error.message}`);
      data.response = `${error.message}`;
      res.send(data);
    }
  }

  return router
}
