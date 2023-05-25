'use strict'
//Imports
const db = require('../../model/mongodb')
const common = require('../../model/common')
const CONFIG = require('../../config/config.js')
const CONFIGJSON = require('../../config/config.json')
const { message } = require('../../model/message')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { default: mongoose } = require('mongoose')
const logger = require('../../model/logger')(__filename)
const { transporter } = require('../../model/mail')
const path = require('path')
const { ObjectId } = require('bson')
const event = require('./../../model/events')

module.exports = function () {
  let router = {}
  let templatePath = path.resolve('./templates/admin/')

  //Mail Functions
  //Registration Successful Mail
  const registrationSuccessfulMail = async (mailData) => {

    let mailOptions = {
      from: 'noreply@dokonaly.com',
      to: mailData.emailTo,
      subject: 'AllMasters | Registration Request Received',
      template: 'registrationSuccessful',
      context: {
        fullName: mailData.fullName,
        email: mailData.emailTo,
        otp: mailData.otp,
        url: mailData.url
      },
    }
    //Send Mail
    return await transporter.transporter(mailOptions)
  }

  //Forgot Password Mail
  const forgotPasswordMail = async (mailData) => {

    let mailOptions = {
      from: 'noreply@dokonaly.com',
      to: mailData.emailTo,
      subject: 'AllMasters | Reset Password Request',
      template: 'forgotPassword',
      context: {
        fullName: mailData.fullName,
        email: mailData.emailTo,
        url: mailData.url
      },
    }
    //Send Mail
    return await transporter.sendMail(mailOptions)
  }

  //Router Functions
  //Register
  router.register = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let userData = req.body, check_Email, insertUser

      if (Object.keys(userData).length === 0 && userData.data === undefined) {
        res.send(data)

        return
      }
      userData = userData.data[0]
      userData.password = bcrypt.hashSync(userData.password, 10);    //password,salt
      userData.systemInfo = req.rawHeaders
      userData.otp = common.otpGenerate()

      check_Email = await db.findOneDocumentExists("internal", { "email": userData.email, status: { $nin: [ 1, 2 ] } })
      if (check_Email === true) {

        return res.send({ status: 0, response: message.emailExist })
      }
      insertUser = await db.insertSingleDocument("internal", userData)
      if (Object.keys(insertUser).length !== 0) {
        event.eventEmitterInsert.emit(
          'insert',
          'internalClone',
          {
            "originalId": insertUser._doc._id,
            "actionType": 'insert',
            "data": insertUser._doc
          }
        )

        return res.send({ status: 1, data: insertUser._id, response: message.registerSuccess })
      }
    } catch (error) {
      logger.error(`Error in internal controller - register: ${error.message}`)
      res.send(error.message)
    }
  }

  return router
}
