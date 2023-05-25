'use strict'
//Imports
const db = require('../../model/mongodb')
const common = require('../../model/common')
const CONFIG = require('../../config/config.js')
const CONFIGJSON = require('../../config/config.json')
const { message } = require('../../model/message')
const bcrypt = require('bcrypt')
const { default: mongoose } = require('mongoose')
const logger = require('../../model/logger')(__filename)
const { transporter } = require('../../model/mail')
const path = require('path')
const { ObjectId } = require('bson')
const event = require('./../../model/events')
const ejs = require('ejs')

module.exports = function () {
  let router = {}
  let templatePathUser = path.resolve('./templates/user/')
  let templatePathAdmin = path.resolve('./templates/admin/')

  //Mail Functions
  //Registration Successful Mail
  const registrationSuccessfulMail = async (mailData) => {

    ejs.renderFile(`${templatePathUser}/registrationSuccessful.ejs`,
      {
        fullName: mailData.fullName,
        email: mailData.emailTo,
        otp: mailData.otp,
        url: mailData.url
      }
      , (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let mailOptions = {
            from: 'noreply@dokonaly.com',
            to: mailData.emailTo,
            subject: `AllMasters | Registration Request Received`,
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

  //Sub User Added Mail
  const subUserAddedMail = async (mailData) => {

    ejs.renderFile(`${templatePathUser}/subUserAdded.ejs`,
      {
        fullName: mailData.fullName,
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
            subject: `AllMasters | Create Sub-User Password`,
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

  //Approved Mail
  const approvedMail = async (mailData) => {

    ejs.renderFile(`${templatePathAdmin}/approvedUser.ejs`,
      {
        fullName: mailData.fullName,
        email: mailData.emailTo,
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
            subject: `AllMasters | Welcome to AllMasters`,
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

  //Revalidation Mail
  const revalidationMail = async (mailData) => {

    ejs.renderFile(`${templatePathAdmin}/revalidatedUser.ejs`,
      {
        fullName: mailData.fullName,
        email: mailData.emailTo,
        reason: mailData.reason,
        url: mailData.url
      }
      , (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let mailOptions = {
            from: 'noreply@dokonaly.com',
            to: mailData.emailTo,
            subject: `AllMasters | Registration Verification Failed`,
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
  //Rejection Mail
  const rejectedMail = async (mailData) => {

    ejs.renderFile(`${templatePathAdmin}/rejectedUser.ejs`,
      {
        fullName: mailData.fullName,
        email: mailData.emailTo,
        reason: mailData.reason,
        url: mailData.url
      }
      , (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let mailOptions = {
            from: 'noreply@dokonaly.com',
            to: mailData.emailTo,
            subject: `AllMasters | Registration Request Rejected`,
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
  //Resend OTP Mail
  const resendOtpMail = async (mailData) => {

    ejs.renderFile(`${templatePathUser}/resendOtp.ejs`,
      {
        fullName: mailData.fullName,
        email: mailData.emailTo,
        otp: mailData.otp,
        url: mailData.url
      }
      , (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let mailOptions = {
            from: 'noreply@dokonaly.com',
            to: mailData.emailTo,
            subject: `AllMasters | New OTP Request`,
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

  //Forgot Password Mail
  const forgotPasswordMail = async (mailData) => {

    ejs.renderFile(`${templatePathUser}/forgotPassword.ejs`,
      {
        fullName: mailData.fullName,
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
            subject: `AllMasters | Reset Password Request`,
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

  //Router Functions
  //Register
  router.register = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let userData = req.body, checkEmail, insertUser

      if (Object.keys(userData).length === 0 && userData.data === undefined) {
        res.send(data)

        return
      }
      userData = userData.data[0]
      userData.password = bcrypt.hashSync(userData.password, 10)     //password,salt
      userData.systemInfo = req.rawHeaders
      userData.otp = common.otpGenerate()

      checkEmail = await db.findOneDocumentExists("user", { "email": userData.email, status: { $nin: [8] } })
      if (checkEmail === true) {

        return res.send({ status: 0, response: message.emailExist })
      }
      insertUser = await db.insertSingleDocument("user", userData)
      if (Object.keys(insertUser).length !== 0) {

        await registrationSuccessfulMail({
          emailTo: userData.email,
          fullName: userData.fullName,
          otp: userData.otp,
          url: CONFIGJSON.settings.otpUrl + insertUser._id
        })

        event.eventEmitterInsert.emit(
          'insert',
          'userClone',
          {
            "originalId": insertUser._doc._id,
            "actionType": 'insert',
            "data": insertUser._doc
          }
        )

        return res.send({ status: 1, data: insertUser._id, response: message.registerSuccess })
      }
    } catch (error) {
      logger.error(`Error in user controller - register: ${error.message}`)
      res.send(error.message)
    }
  }

  router.addSubUser = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let userData = req.body, checkEmail, insertUser, checkCountUsers

      if (Object.keys(userData).length === 0 && userData.data === undefined) {
        res.send(data)

        return
      }
      userData = userData.data[0]
      userData.systemInfo = req.rawHeaders
      userData.otp = 'n/a'
      userData.designation = 'n/a'
      userData.password = 'n/a'
      userData.role = 1
      userData.status = 9

      if (!mongoose.isValidObjectId(userData.userId)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      checkCountUsers = await db.findDocuments("user", { userId: new ObjectId(userData.userId), status: { $in: [1, 9] } })
      if (checkCountUsers.length >= 4) {

        return res.send({ status: 0, response: message.maxUsers })
      }
      checkEmail = await db.findOneDocumentExists("user", { "email": userData.email, status: { $nin: [8] } })
      if (checkEmail === true) {

        return res.send({ status: 0, response: message.emailExist })
      }
      insertUser = await db.insertSingleDocument("user", userData)
      if (Object.keys(insertUser).length !== 0) {

        await subUserAddedMail({
          emailTo: userData.email,
          fullName: userData.fullName,
          url: CONFIGJSON.settings.createPasswordUrl + insertUser._id
        })

        event.eventEmitterInsert.emit(
          'insert',
          'userClone',
          {
            "originalId": insertUser._doc._id,
            "actionType": 'insert',
            "data": insertUser._doc
          }
        )

        return res.send({ status: 1, response: message.subUserAdded })
      }
    } catch (error) {
      logger.error(`Error in user controller - addUser: ${error.message}`)
      res.send(error.message)
    }
  }

  //Login
  router.login = async (req, res) => {
    let data = { status: 0, response: "Invalid Request" }

    try {
      let loginData = req.body, user, passwordMatch, generatedToken, loginTime, updateLogIn

      if (Object.keys(loginData).length === 0 && loginData.data === undefined) {
        res.send(data)

        return
      }
      loginData = loginData.data[0]

      if (loginData.type === 1) {                            //Type 1 - User Schema 
        common.loginParameter('user', loginData, res)
      }
      else if (loginData.type === 2) {                      //Type 2 - Partner Schema 
        common.loginParameter('cfs', loginData, res)
      }
      else if (loginData.type === 3) {                      //Type 3 - Internal Schema 
        common.loginParameter('internal', loginData, res)
      }
      else {

        return res.send(data)
      }
    } catch (error) {
      logger.error(`Error in user controller - login: ${error.message}`)
      res.send(error.message)
    }
  }

  //Logout
  router.logout = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let logoutData = req.body

      if (Object.keys(logoutData).length === 0 && logoutData.data === undefined) {
        res.send(data)

        return
      }
      logoutData = logoutData.data[0]

      if (!mongoose.isValidObjectId(logoutData.id)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }

      if (logoutData.type === 1) {                            //Type 1 - User Schema 
        common.logoutParameter('user', logoutData, res)
      }
      else if (logoutData.type === 2) {                      //Type 2 - Partner Schema 
        common.logoutParameter('cfs', logoutData, res)
      }
      else if (logoutData.type === 3) {                      //Type 3 - Internal Schema 
        common.logoutParameter('internal', logoutData, res)
      }
      else {

        return res.send(data)
      }
    } catch (error) {
      logger.error(`Error in user controller - logout: ${error.message}`)
      res.send(error.message)
    }
  }

  //Get User Email by ID
  router.getUserEmailbyId = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let userId = req.body, findEmail
      if (Object.keys(userId).length === 0 && userId.data === undefined) {
        res.send(data)

        return
      }
      userId = userId.data[0]
      if (!mongoose.isValidObjectId(userId.id)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      findEmail = await db.findSingleDocument("user", { _id: new ObjectId(userId.id), status: { $in: [0, 9] } })
      if (findEmail !== null && Object.keys(findEmail).length !== 0) {

        return res.send({ status: 1, data: findEmail.email })
      }

      return res.send(data)
    } catch (error) {
      logger.error(`Error in user controller - getUserEmailbyId: ${error.message}`)
      res.send(error.message)
    }
  }

  //Check PAN Exist - Register
  router.checkPanExist = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let panData = req.body, checkPanExist, condition, aggregationQuery

      if (Object.keys(panData).length === 0 && panData.data === undefined) {
        res.send(data)

        return
      }
      panData = panData.data[0]
      condition = { pan: panData.pan }
      aggregationQuery = [
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userData',
          },
        },
        { '$match': condition },
        {
          '$project': {
            'status': { $cond: { if: { $eq: [{ '$arrayElemAt': ['$userData.status', 0] }, 1] }, then: true, else: false } }
          },
        },
      ]

      checkPanExist = await db.getAggregation('userDetail', aggregationQuery)
      if (checkPanExist.length !== 0 && checkPanExist[0].status === true) {

        return res.send({ status: 0, response: message.panExist })
      }

      return res.send({ status: 1, response: message.userNotFound })
    } catch (error) {
      logger.error(`Error in user controller - checkPanExist: ${error.message}`)
      res.send(error.message)
    }
  }

  //Check GST Exist - Register
  router.checkGstExist = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let gstData = req.body, checkGstExist, condition, aggregationQuery

      if (Object.keys(gstData).length === 0 && gstData.data === undefined) {
        res.send(data)

        return
      }
      gstData = gstData.data[0]
      condition = { gstNumber: gstData.gstNumber }
      aggregationQuery = [
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userData',
          },
        },
        { '$match': condition },
        {
          '$project': {
            'status': { $cond: { if: { $eq: [{ '$arrayElemAt': ['$userData.status', 0] }, 1] }, then: true, else: false } }
          },
        },
      ]

      checkGstExist = await db.getAggregation('userDetail', aggregationQuery)
      if (checkGstExist.length !== 0 && checkGstExist[0].status === true) {

        return res.send({ status: 0, response: message.gstExist })
      }

      return res.send({ status: 1, response: message.userNotFound })
    } catch (error) {
      logger.error(`Error in user controller - checkGstExist: ${error.message}`)
      res.send(error.message)
    }
  }

  //Check MTO Exist - Register
  router.checkMtoExist = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let mtoData = req.body, checkMtoExist, condition, aggregationQuery

      if (Object.keys(mtoData).length === 0 && mtoData.data === undefined) {
        res.send(data)

        return
      }
      mtoData = mtoData.data[0]
      condition = { mto: mtoData.mto }
      aggregationQuery = [
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userData',
          },
        },
        { '$match': condition },
        {
          '$project': {
            'status': { $cond: { if: { $eq: [{ '$arrayElemAt': ['$userData.status', 0] }, 1] }, then: true, else: false } }
          },
        },
      ]

      checkMtoExist = await db.getAggregation('userDetail', aggregationQuery)
      if (checkMtoExist.length !== 0 && checkMtoExist[0].status === true) {

        return res.send({ status: 0, response: message.mtoExist })
      }

      return res.send({ status: 1, response: message.userNotFound })
    } catch (error) {
      logger.error(`Error in user controller - checkMtoExist: ${error.message}`)
      res.send(error.message)
    }
  }

  //Check Email Exist - Register
  router.checkEmailExist = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let emailData = req.body, emailExistUser, emailExistCfs, emailExistInternal

      if (Object.keys(emailData).length === 0 && emailData.data === undefined) {
        res.send(data)

        return
      }
      emailData = emailData.data[0]
      emailExistUser = await db.findOneDocumentExists("user", { "email": emailData.email, status: { $nin: [8] } })
      if (emailExistUser === true) {

        return res.send({ status: 0, response: message.emailExist })
      }
      else {
        emailExistCfs = await db.findOneDocumentExists("cfs", { "email": emailData.email, status: { $in: [1, 2, 3] } })
        if (emailExistCfs === true) {

          return res.send({ status: 0, response: message.emailExist })
        }
        else {
          emailExistInternal = await db.findOneDocumentExists("internal", { "email": emailData.email, status: { $in: [1, 2] } })
          if (emailExistInternal === true) {

            return res.send({ status: 0, response: message.emailExist })
          }
        }
      }

      return res.send({ status: 1, response: message.userNotFound })
    } catch (error) {
      logger.error(`Error in user controller - checkEmailExist: ${error.message}`)
      res.send(error.message)
    }
  }

  //Check Email Exist - Forgot Password
  router.checkEmailForgotPwd = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let emailData = req.body, checkEmailExist

      if (Object.keys(emailData).length === 0 && emailData.data === undefined) {
        res.send(data)

        return
      }
      emailData = emailData.data[0]

      checkEmailExist = await db.findOneDocumentExists("user", { "email": emailData.email, status: { $nin: [0, 7, 8] } })
      if (checkEmailExist === true) {

        return res.send({ status: 1, response: message.verifiedEmail })
      } else if (checkEmailExist === false) {
        checkEmailExist = await db.findOneDocumentExists("cfs", { "email": emailData.email, status: 1 })
        if (checkEmailExist === true) {

          return res.send({ status: 1, response: message.verifiedEmail })
        }

        return res.send({ status: 0, response: message.userNotFound })
      }

      return res.send({ status: 0, response: message.userNotFound })

    } catch (error) {
      logger.error(`Error in user controller - checkForgotPassword: ${error.message}`)
      res.send(error.message)
    }
  }

  //Get All Users by Status - For OBT & Admin
  router.getAllUsers = async (req, res) => {
    let data = { status: 0, response: message.inValid }, aggregationQuery = [], condition, usersData

    try {
      let statusData = req.body

      if (Object.keys(statusData).length === 0 && statusData.data === undefined) {
        res.send(data)

        return
      }
      statusData = statusData.data[0]
      condition = { status: { $in: statusData.status } }

      aggregationQuery = [
        {
          $lookup: {
            from: 'userdetails',
            localField: '_id',
            foreignField: 'userId',
            as: 'userData',
          },
        },
        { '$match': condition },
        {
          '$project': {
            'fullName': 1,
            'mobileNumber': 1,
            'email': 1,
            'status': 1,
            'userId': 1,
            'legalName': { '$arrayElemAt': ['$userData.legalName', 0] },
            'country': { '$arrayElemAt': ['$userData.country', 0] },
            'mto': { '$arrayElemAt': ['$userData.mto', 0] },
            'approvedBy': { '$arrayElemAt': ['$userData.updatedBy', 0] },
            'approvedOn': { '$arrayElemAt': ['$userData.updatedAt', 0] },
          },
        },
      ]

      usersData = await db.getAggregation('user', aggregationQuery)
      if (usersData.length === 0) {

        res.send({ status: 1, data: "[]" })
      } else {

        res.send({ status: 1, data: JSON.stringify(usersData) });
      }
    } catch (error) {
      logger.error(`Error in user controller - getAllUsers: ${error.message}`);
      data.response = `${error.message}`;
      res.send(data);
    }
  }

  //Get Internal Users
  router.getInternalUsers = async (req, res) => {
    let data = { status: 0, response: message.inValid }, usersData

    try {
      usersData = await db.findAndSelect("internal",
        { status: { $in: [1, 2] } },
        {
          role: 1,
          fullName: 1,
          email: 1,
        }
      )
      if (usersData) {

        return res.send({ status: 1, data: JSON.stringify(usersData) })
      }
    } catch (error) {
      logger.error(`Error in user controller - getInternalUsers: ${error.message}`);
      data.response = `${error.message}`;
      res.send(data);
    }
  }

  //Get Team Details
  router.getTeamDetails = async (req, res) => {
    let data = { status: 0, response: message.inValid }, aggregationQuery = [], condition, usersData

    try {
      let idData = req.body

      if (Object.keys(idData).length === 0 && idData.data === undefined) {
        res.send(data)

        return
      }
      idData = idData.data[0]
      condition = { _id: new ObjectId(idData.id) }

      aggregationQuery = [
        {
          $lookup: {
            from: 'userdetails',
            localField: '_id',
            foreignField: 'userId',
            as: 'userData',
          },
        },
        {
          $lookup: {
            from: 'userdetails',
            localField: 'userId',
            foreignField: 'userId',
            as: 'uData',
          },
        },
        { '$match': condition },
        {
          '$project': {
            'fullName': 1,
            'mobileNumber': 1,
            'email': 1,
            'status': 1,
            'userId': 1,
            'preferredGateway': { $cond: { if: { $eq: [{ $size: '$userData.preferredGateway' }, 0] }, then: { '$arrayElemAt': ['$uData.preferredGateway', 0] }, else: { '$arrayElemAt': ['$userData.preferredGateway', 0] } } },
            'legalName': { $cond: { if: { $eq: [{ $size: '$userData.legalName' }, 0] }, then: '$legalName', else: { '$arrayElemAt': ['$userData.legalName', 0] } } },
            'groupName': { '$arrayElemAt': ['$userData.groupName', 0] },
            'country': { '$arrayElemAt': ['$userData.country', 0] },
            'state': { '$arrayElemAt': ['$userData.state', 0] },
            'mto': { '$arrayElemAt': ['$userData.mto', 0] },
            'city': { '$arrayElemAt': ['$userData.city', 0] },
            'gstNumber': { '$arrayElemAt': ['$userData.gstNumber', 0] },
            'pan': { '$arrayElemAt': ['$userData.pan', 0] },
            'gstFilePath': { '$arrayElemAt': ['$userData.gstFilePath', 0] },
            'gstFileName': { '$arrayElemAt': ['$userData.gstFileName', 0] },
            'blCopyPath': { '$arrayElemAt': ['$userData.blCopyPath', 0] },
            'blCopyName': { '$arrayElemAt': ['$userData.blCopyName', 0] },
            'reason': { '$arrayElemAt': ['$userData.reason', 0] },
            'approvedBy': { '$arrayElemAt': ['$userData.updatedBy', 0] },
            'approvedOn': { '$arrayElemAt': ['$userData.updatedAt', 0] },
          },
        },
      ]
      usersData = await db.getAggregation('user', aggregationQuery)
      if (usersData.length === 0) {

        res.send({ status: 1, data: "[]" })
      } else {
        await common.downloadFileAzure(usersData[0].gstNumber, '', 'registration')

        res.send({ status: 1, data: JSON.stringify(usersData) });
      }
    } catch (error) {
      logger.error(`Error in user controller - getTeamDetails: ${error.message}`);
      data.response = `${error.message}`;
      res.send(data);
    }
  }

  //Verify OTP
  router.verifyOtp = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let otpData = req.body, otpCheck

      if (Object.keys(otpData).length === 0 && otpData.data === undefined) {
        res.send(data)

        return
      }
      otpData = otpData.data[0]
      if (!mongoose.isValidObjectId(otpData.id)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      otpCheck = await db.findOneDocumentExists("user", { _id: new ObjectId(otpData.id), otp: otpData.otp, status: 0 })
      if (otpCheck === true) {
        await db.findByIdAndUpdate("user", otpData.id, { status: 2 })

        return res.send({ status: 1, response: message.otpVerified })

      }

      return res.send(data)
    } catch (error) {
      logger.error(`Error in user controller - verifyOtp: ${error.message}`)
      res.send(error.message)
    }
  }

  //Resend OTP
  router.resendOtp = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let resendOtpData = req.body, otp, updateOtp, userData

      if (Object.keys(resendOtpData).length === 0 && resendOtpData.data === undefined) {
        res.send(data)

        return
      }
      resendOtpData = resendOtpData.data[0]
      if (!mongoose.isValidObjectId(resendOtpData.id)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      otp = common.otpGenerate()
      updateOtp = await db.findByIdAndUpdate("user", resendOtpData.id, { otp })
      userData = await db.findSingleDocument("user", { _id: new ObjectId(resendOtpData.id), status: 0 })
      if (updateOtp.modifiedCount !== 0 && updateOtp.matchedCount !== 0 && userData !== null) {

        await resendOtpMail({
          emailTo: userData.email,
          fullName: userData.fullName,
          otp: userData.otp,
          url: CONFIGJSON.settings.otpUrl + userData._id
        })

        return res.send({ status: 1, response: message.otpResend })
      }

      return res.send(data)
    } catch (error) {
      logger.error(`Error in user controller - resendOtp: ${error.message}`)
      res.send(error.message)
    }
  }

  //Forgot Password
  router.forgotPassword = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let forgotPasswordData = req.body, userData

      if (Object.keys(forgotPasswordData).length === 0 && forgotPasswordData.data === undefined) {
        res.send(data)

        return
      }
      forgotPasswordData = forgotPasswordData.data[0]
      if (forgotPasswordData.type && forgotPasswordData.type === 1) {
        userData = await db.findSingleDocument("user", { email: forgotPasswordData.email, status: { $nin: [0, 7, 8] } })
        if (userData !== null && Object.keys(userData) !== 0) {

          await forgotPasswordMail({
            emailTo: userData.email,
            fullName: userData.fullName,
            url: CONFIGJSON.settings.changePasswordUrl + userData._id + "/1"
          })

          return res.send({ status: 1, response: message.sendMail })
        }
        else {

          return res.send({ status: 0, response: message.userNotFound })
        }
      } else if (forgotPasswordData.type && forgotPasswordData.type === 2) {
        userData = await db.findSingleDocument("cfs", { email: forgotPasswordData.email, status: 1 })
        if (userData !== null && Object.keys(userData) !== 0) {

          await forgotPasswordMail({
            emailTo: userData.email,
            fullName: userData.fullName,
            url: CONFIGJSON.settings.changePasswordUrl + userData._id + "/2"
          })

          return res.send({ status: 1, response: message.sendMail })
        }
        else {

          return res.send({ status: 0, response: message.userNotFound })
        }
      }
      return res.send(data)
    } catch (error) {
      logger.error(`Error in user controller - forgotPassword: ${error.message}`)
      res.send(error.message)
    }
  }

  //Change Forgot Password
  router.changeForgotPassword = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let passwordData = req.body, updatePassword

      if (Object.keys(passwordData).length === 0 && passwordData.data === undefined) {
        res.send(data)

        return
      }
      passwordData = passwordData.data[0]
      if (!mongoose.isValidObjectId(passwordData.id)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      passwordData.password = bcrypt.hashSync(passwordData.password, 10);    //password,salt

      if (passwordData.type && passwordData.type === 1) {
        updatePassword = await db.findByIdAndUpdate("user", passwordData.id, { password: passwordData.password })
        if (updatePassword.modifiedCount !== 0 && updatePassword.matchedCount !== 0) {
          event.eventEmitterInsert.emit(
            'insert',
            'userClone',
            {
              "originalId": passwordData.id,
              "actionType": 'update',
              "data": passwordData
            }
          )

          return res.send({ status: 1, response: message.updatedSucess })
        }

        return res.send(data)
      } else if (passwordData.type && passwordData.type === 2) {
        updatePassword = await db.findByIdAndUpdate("cfs", passwordData.id, { password: passwordData.password })
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

        return res.send(data)
      }

      return res.send(data)
    } catch (error) {
      logger.error(`Error in user controller - changeForgotPassword: ${error.message}`)
      res.send(error.message)
    }
  }

  //Create Sub User Password
  router.createSubUserPassword = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let passwordData = req.body, updatePassword, userData, checkCountUsers

      if (Object.keys(passwordData).length === 0 && passwordData.data === undefined) {
        res.send(data)

        return
      }
      passwordData = passwordData.data[0]
      if (!mongoose.isValidObjectId(passwordData.id)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      userData = await db.findSingleDocument("user", { _id: passwordData.id, status: 9 })
      if (userData !== null && Object.keys(userData) !== 0) {
        checkCountUsers = await db.findDocuments("user", { userId: userData.userId, status: { $in: [1, 9] } })
        if (checkCountUsers.length >= 4) {

          return res.send({ status: 0, response: message.maxUsers })
        }
      }
      passwordData.password = bcrypt.hashSync(passwordData.password, 10);    //password,salt
      updatePassword = await db.findByIdAndUpdate("user", passwordData.id, { password: passwordData.password, status: 1 })
      if (updatePassword.modifiedCount !== 0 && updatePassword.matchedCount !== 0) {
        event.eventEmitterInsert.emit(
          'insert',
          'userClone',
          {
            "originalId": passwordData.id,
            "actionType": 'update',
            "data": passwordData
          }
        )
        return res.send({ status: 1, response: message.passwordCreated })
      }

      return res.send(data)
    } catch (error) {
      logger.error(`Error in user controller - changeForgotPassword: ${error.message}`)
      res.send(error.message)
    }
  }

  //Add User Details from KYC
  router.addUserDetails = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let userDetails = req.body, insertUserDetails, statusCheck,
        registrationFolderpath, registrationFileFolderpath, fileName, base64String, base64Pdf

      if (Object.keys(userDetails).length === 0 && userDetails.data === undefined) {
        res.send(data)

        return
      }
      userDetails = userDetails.data[0]
      userDetails.systemInfo = req.rawHeaders

      statusCheck = await db.findOneDocumentExists("user",
        { _id: new mongoose.Types.ObjectId(userDetails.userId), status: { $in: [2] } })
      if (statusCheck === true) {

        registrationFolderpath = path.resolve(__dirname, '../../fileuploads/registration/')
        registrationFileFolderpath = `${registrationFolderpath}/${userDetails.gstNumber}`
        await common.createDir(registrationFolderpath)
        await common.createDir(registrationFileFolderpath)

        for (const i in { gstFilePath: 1, blCopyPath: 1 }) {
          if (userDetails.hasOwnProperty(i) || userDetails.hasOwnProperty(i)) {
            fileName = null
            base64String = null
            if (i === 'gstFilePath') {
              fileName = `${userDetails.gstNumber}_GST.pdf`
              base64String = userDetails.gstFilePath
              userDetails.gstFilePath = CONFIGJSON.settings.nodeFileUploads + `registration/${userDetails.gstNumber}/${fileName}`
            }
            else if (i === 'blCopyPath') {
              fileName = `${userDetails.gstNumber}_BL.pdf`
              base64String = userDetails.blCopyPath
              userDetails.blCopyPath = CONFIGJSON.settings.nodeFileUploads + `registration/${userDetails.gstNumber}/${fileName}`
            }
            if (fileName !== null && base64String !== null) {
              base64Pdf = base64String.split(';base64,').pop()
              await common.createFile(`${registrationFileFolderpath}/${fileName}`, base64Pdf, 'base64')
              await common.uploadFileAzure(`${registrationFileFolderpath}/${fileName}`, userDetails.gstNumber, fileName)
            }
          }
        }

        insertUserDetails = await db.insertSingleDocument("userDetail", userDetails)
        if (insertUserDetails !== null && Object.keys(insertUserDetails).length !== 0) {
          await db.findByIdAndUpdate("user", userDetails.userId, { status: 3 })
          event.eventEmitterInsert.emit(
            'insert',
            'userDetailClone',
            {
              "originalId": insertUserDetails._doc._id,
              "actionType": 'insert',
              "data": insertUserDetails._doc
            }
          )

          return res.send({ status: 1, response: message.addedUserDetailsSucess })
        }
        res.send(data)
      }

      return res.send({ status: 0, response: message.userDetailsUnsucess })
    } catch (error) {
      logger.error(`Error in user controller - addUserDetails: ${error.message}`)
      res.send(error.message)
    }
  }

  //Update User Status by Id - For OBT & Admin Update
  router.updateUserStatusById = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let statusData = req.body, updateStatus, updateReason, userData, aggregationQuery

      if (Object.keys(statusData).length === 0 && statusData.data === undefined) {
        res.send(data)

        return
      }
      statusData = statusData.data[0]
      if (!mongoose.isValidObjectId(statusData.id)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      updateStatus = await db.findByIdAndUpdate("user", statusData.id, { status: statusData.status })
      aggregationQuery = [
        {
          $lookup: {
            from: 'userdetails',
            localField: '_id',
            foreignField: 'userId',
            as: 'userData',
          },
        },
        { '$match': { _id: new ObjectId(statusData.id), status: statusData.status } },
        {
          '$project': {
            'fullName': 1,
            'email': 1,
            'status': 1,
            'legalName': { '$arrayElemAt': ['$userData.legalName', 0] },
            'reason': { '$arrayElemAt': ['$userData.reason', 0] },
          },
        },
      ]
      userData = await db.getAggregation('user', aggregationQuery)
      if (userData.length === 0) {

        return res.send({ status: 0, data: "[]" })
      }
      userData = userData[0]
      if (updateStatus.modifiedCount !== 0 && updateStatus.matchedCount !== 0) {
        updateReason = await db.updateOneDocument("userDetail", { userId: new ObjectId(statusData.id) }, { $push: { reason: statusData.reason } })
        if (updateReason.modifiedCount !== 0 && updateReason.matchedCount !== 0) {
          if (statusData.status === 1) {
            await approvedMail({
              emailTo: userData.email,
              fullName: userData.fullName,
              legalName: userData.legalName,
              url: CONFIGJSON.settings.siteUrl
            })
          }
          else if (statusData.status === 5) {
            await revalidationMail({
              emailTo: userData.email,
              fullName: userData.fullName,
              reason: statusData.reason.message,
              url: CONFIGJSON.settings.siteUrl
            })
          }
          else if (statusData.status === 7) {
            await rejectedMail({
              emailTo: userData.email,
              fullName: userData.fullName,
              reason: userData.reason[userData.reason.length - 1].message,
              url: CONFIGJSON.settings.siteUrl
            })
          }

          return res.send({ status: 1, response: message.statusUpdatedSucess })
        }
      }

      return res.send(data)
    } catch (error) {
      logger.error(`Error in user controller - updateuserstatusById: ${error.message}`)
      res.send(error.message)
    }
  }

  //Get User Data by Id - When Change Email Functionality
  router.getUserDataById = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let idData = req.body, userData

      if (Object.keys(idData).length === 0 && idData.data === undefined) {
        res.send(data)

        return
      }
      idData = idData.data[0]
      if (!mongoose.isValidObjectId(idData.id)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      userData = await db.findSingleDocument("user",
        { _id: new mongoose.Types.ObjectId(idData.id), status: 0 },
        { fullName: 1, designation: 1, mobileNumber: 1, mobileCode: 1, email: 1, _id: 0 })
      if (userData !== null && Object.keys(userData).length !== 0) {

        return res.send({ status: 1, response: message.dataFoundSucess, data: JSON.stringify(userData) })
      }

      return res.send(data)
    } catch (error) {
      logger.error(`Error in user controller - getUserDataById: ${error.message}`)
      res.send(error.message)
    }
  }

  //Edit User by Id - After Change Email Functionality
  router.editUserById = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let editUserData = req.body, updateUser

      if (Object.keys(editUserData).length === 0 && editUserData.data === undefined) {
        res.send(data)

        return
      }
      editUserData = editUserData.data[0]
      if (!mongoose.isValidObjectId(editUserData.id)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      editUserData.password = bcrypt.hashSync(editUserData.password, 10);    //password,salt
      editUserData.systemInfo = req.rawHeaders
      editUserData.otp = common.otpGenerate()
      updateUser = await db.updateOneDocument("user", { _id: new ObjectId(editUserData.id), status: 0 }, editUserData)
      if (updateUser.modifiedCount !== 0 && updateUser.matchedCount !== 0) {
        await registrationSuccessfulMail({
          emailTo: editUserData.email,
          fullName: editUserData.fullName,
          otp: editUserData.otp,
          url: CONFIGJSON.settings.otpUrl + editUserData.id
        })
        event.eventEmitterInsert.emit(
          'insert',
          'userClone',
          {
            "originalId": editUserData.id,
            "actionType": 'update',
            "data": editUserData
          }
        )

        return res.send({ status: 1, response: message.updatedSucess })
      }

      return res.send(data)
    } catch (error) {
      logger.error(`Error in user controller - editUserById: ${error.message}`)
      res.send(error.message)
    }
  }

  //Edit User Details - KYC Details Edit
  router.editUserDetail = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let editUserData = req.body, updateUserDetails,
        registrationFolderpath, registrationFileFolderpath, fileName, base64String, base64Pdf

      if (Object.keys(editUserData).length === 0 && editUserData.data === undefined) {
        res.send(data)

        return
      }
      editUserData = editUserData.data[0]
      if (!mongoose.isValidObjectId(editUserData.userId)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }

      if (editUserData.gstFilePath.includes('base64') === true || editUserData.blCopyPath.includes('base64') === true) {

        registrationFolderpath = path.resolve(__dirname, '../../fileuploads/registration/')
        registrationFileFolderpath = `${registrationFolderpath}/${editUserData.gstNumber}`
        await common.createDir(registrationFolderpath)
        await common.createDir(registrationFileFolderpath)

        for (const i in { gstFilePath: 1, blCopyPath: 1 }) {
          if (editUserData.hasOwnProperty(i) || editUserData.hasOwnProperty(i)) {
            fileName = null
            base64String = null
            if (i === 'gstFilePath' && editUserData.gstFilePath.includes('base64') === true) {
              fileName = `${editUserData.gstNumber}_GST.pdf`
              base64String = editUserData.gstFilePath
              editUserData.gstFilePath = CONFIGJSON.settings.nodeFileUploads + `registration/${editUserData.gstNumber}/${fileName}`
            }
            else if (i === 'blCopyPath' && editUserData.blCopyPath.includes('base64') === true) {
              fileName = `${editUserData.gstNumber}_BL.pdf`
              base64String = editUserData.blCopyPath
              editUserData.blCopyPath = CONFIGJSON.settings.nodeFileUploads + `registration/${editUserData.gstNumber}/${fileName}`
            }
            if (fileName !== null && base64String !== null) {
              base64Pdf = base64String.split(';base64,').pop();
              await common.createFile(`${registrationFileFolderpath}/${fileName}`, base64Pdf, 'base64')
              await common.uploadFileAzure(`${registrationFileFolderpath}/${fileName}`, editUserData.gstNumber, fileName)
            }
          }
        }

      }

      updateUserDetails = await db.updateOneDocument("userDetail", { userId: new ObjectId(editUserData.userId) }, editUserData)
      if (updateUserDetails.modifiedCount !== 0 && updateUserDetails.matchedCount !== 0) {
        await db.findByIdAndUpdate("user", editUserData.userId, { status: 3 })
        event.eventEmitterInsert.emit(
          'insert',
          'userDetailClone',
          {
            "originalId": editUserData.id,
            "actionType": 'update',
            "data": editUserData
          }
        )

        return res.send({ status: 1, response: message.updatedSucess })
      }

      return res.send(data)
    } catch (error) {
      logger.error(`Error in user controller - editUserDetail: ${error.message}`)
      res.send(error.message)
    }
  }

  //Change Password
  router.changePassword = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let passwordData = req.body, userData, updatePassword, password

      if (Object.keys(passwordData).length === 0 && passwordData.data === undefined) {
        res.send(data)

        return
      }
      passwordData = passwordData.data[0]
      if (!mongoose.isValidObjectId(passwordData.id)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      userData = await db.findSingleDocument("user", { _id: new Object(passwordData.id) })
      if (userData !== null && Object.keys(userData).length !== 0) {
        bcrypt.compare(passwordData.currentPassword, userData.password, async function (err, result) {
          if (err) {
            logger.error(`Error in user controller - changePassword brcypt.compare: ${err.message}`)
          } else if (result === false) {

            return res.send({ status: 0, message: message.wrongCurrentPassword })
          } else {
            password = bcrypt.hashSync(passwordData.password, 10)
            updatePassword = await db.findByIdAndUpdate("user", passwordData.id, { password: password })
            if (updatePassword.modifiedCount !== 0 && updatePassword.matchedCount !== 0) {
              event.eventEmitterInsert.emit(
                'insert',
                'userClone',
                {
                  "originalId": passwordData.id,
                  "actionType": 'update',
                  "data": passwordData
                }
              )

              return res.send({ status: 1, response: message.updatedSucess })
            }
          }
        })
      }
      else {
        return res.send(data)
      }
    } catch (error) {
      logger.error(`Error in user controller - changePassword: ${error.message}`)
      res.send(error.message)
    }
  }

  //Edit User Field - My Profile
  router.editUserField = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let editUserData = req.body, updateUser

      if (Object.keys(editUserData).length === 0 && editUserData.data === undefined) {
        res.send(data)

        return
      }
      editUserData = editUserData.data[0]
      if (!mongoose.isValidObjectId(editUserData.id)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      editUserData.systemInfo = req.rawHeaders

      updateUser = await db.updateOneDocument("user", { _id: new ObjectId(editUserData.id) }, editUserData)
      if (updateUser.modifiedCount !== 0 && updateUser.matchedCount !== 0) {
        event.eventEmitterInsert.emit(
          'insert',
          'userClone',
          {
            "originalId": editUserData.id,
            "actionType": 'update',
            "data": editUserData
          }
        )

        return res.send({ status: 1, response: message.updatedSucess })
      }

      return res.send(data)
    } catch (error) {
      logger.error(`Error in user controller - editUserField: ${error.message}`)
      res.send(error.message)
    }
  }

  //User Preferred Gateway - My Profile
  router.userPreferredGateway = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let gatewayData = req.body, updateUser

      if (Object.keys(gatewayData).length === 0 && gatewayData.data === undefined) {
        res.send(data)

        return
      }
      gatewayData = gatewayData.data[0]
      if (!mongoose.isValidObjectId(gatewayData.userId)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      gatewayData.systemInfo = req.rawHeaders

      updateUser = await db.updateOneDocument("userDetail", { userId: new ObjectId(gatewayData.userId) }, { preferredGateway: gatewayData.preferredGateway })
      if (updateUser.modifiedCount !== 0 && updateUser.matchedCount !== 0) {
        event.eventEmitterInsert.emit(
          'insert',
          'userClone',
          {
            "originalId": gatewayData.userId,
            "actionType": 'update',
            "data": gatewayData
          }
        )

        return res.send({ status: 1, response: message.updatedSucess })
      }

      return res.send(data)
    } catch (error) {
      logger.error(`Error in user controller - userPreferredGateway: ${error.message}`)
      res.send(error.message)
    }
  }

  //Get Country City List
  router.getCountryCityList = async (req, res) => {
    let data = { status: 0, response: message.inValid }

    try {
      let countryCityData = req.body, stateData, cityData

      countryCityData = countryCityData.data[0]
      if (Object.keys(countryCityData).length === 0 && countryCityData.data === undefined) {
        res.send(data)

        return
      }
      if (countryCityData.hasOwnProperty("countryCode") === true && countryCityData.hasOwnProperty("state") === false) {
        stateData = await db.getDistinctValues("countryCityList", "state", { countryCode: countryCityData.countryCode }, { status: 1 })
        if (stateData.length !== 0) {

          return res.send({ status: 1, data: JSON.stringify(stateData) })
        }

        return res.send({ status: 0, response: message.dataNotFound })
      }
      else {
        cityData = await db.getDistinctValues("countryCityList", "city", { state: countryCityData.state }, { city: 1, _id: 0 })

        return res.send({ status: 1, data: JSON.stringify(cityData) })
      }
    } catch (error) {
      logger.error(`Error in user controller - getCountryList: ${error.message}`)
      res.send(error.message)
    }
  }

  //Get Sub Users Api
  router.getSubUsers = async (req, res) => {
    let data = { status: 0, response: message.inValid }, idData, getUserData

    try {
      idData = req.body;

      if (Object.keys(idData).length === 0 && idData.data === undefined) {
        res.send(data)
        return
      }
      idData = idData.data[0]
      if (!mongoose.isValidObjectId(idData.userId)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      getUserData = await db.findDocuments("user", { userId: new ObjectId(idData.userId), status: { $in: [1, 9] } }, { createdAt: 0, updatedAt: 0, systemInfo: 0 })
      if (getUserData.length !== 0) {

        return res.send({ status: 1, data: JSON.stringify(getUserData) })
      }

      return res.send({ status: 1, data: "[]" })
    } catch (error) {
      logger.error(`Error in user controller - getAdduser: ${error.message}`)
      data.response = error.message
      res.send(error.message)
    }
  }

  router.deleteUser = async (req, res) => {
    let data = { status: 0, response: message.inValid }, idData, updateStatus

    try {
      idData = req.body;

      if (Object.keys(idData).length === 0 && idData.data === undefined) {
        res.send(data)
        return
      }
      idData = idData.data[0]
      if (!mongoose.isValidObjectId(idData.id)) {

        return res.send({ status: 0, response: message.invalidUserId })
      }
      updateStatus = await db.findByIdAndUpdate("user", idData.id, { status: 8 })
      if (updateStatus.modifiedCount !== 0 && updateStatus.matchedCount !== 0) {

        return res.send({ status: 1, response: message.deletedSucess })
      }

      return res.send(data)
    } catch (error) {
      logger.error(`Error in user controller - deleteuser: ${error.message}`)
      data.response = error.message
      res.send(error.message)
    }
  }

  return router
}
