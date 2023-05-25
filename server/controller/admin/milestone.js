'use strict'
//Imports
const db = require('../../model/mongodb')
const logger = require("../../model/logger")(__filename)
const CONFIGJSON = require('../../config/config.json')
const { message } = require('../../model/message')
const common = require('../../model/common')
const { ObjectId } = require('bson')
const moment = require('moment');
const path = require('path')
const mongoose = require('mongoose')
const ejs = require('ejs')
const event = require('./../../model/events')
const { transporter } = require('../../model/mail')
const jwt = require("jsonwebtoken")

module.exports = function () {
    let router = {}
    let templatePath = path.resolve('./templates/milestone')

    //Mail Functions
    //SO Released Mail
    const soReleaseMail = async (mailData) => {

        ejs.renderFile(`${templatePath}/soRelease.ejs`,
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
                        subject: `AllMasters | SO Released  - ${mailData.bookingData.bId}`,
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

    //Onboarding Confirmed Mail
    const onboardingConfirmationMail = async (mailData) => {

        ejs.renderFile(`${templatePath}/onboardingConfirmation.ejs`,
            {
                email: mailData.emailTo,
                bookingData: mailData.bookingData,
                fullName: mailData.fullName,
                legalName: mailData.legalName,
                aetd: mailData.aetd,
                url: mailData.url
            }
            , async (err, data) => {
                if (err) {
                    console.log(err)
                } else {
                    let mailOptions = {
                        from: 'noreply@dokonaly.com',
                        to: mailData.emailTo,
                        subject: `AllMasters | Onboarding Confirmed - ${mailData.bookingData.bId}`,
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

    //Vessel Arrived Mail
    const vesselArrivedMail = async (mailData) => {

        ejs.renderFile(`${templatePath}/vesselArrived.ejs`,
            {
                email: mailData.emailTo,
                bookingData: mailData.bookingData,
                fullName: mailData.fullName,
                legalName: mailData.legalName,
                aeta: mailData.aeta,
                url: mailData.url
            }
            , (err, data) => {
                if (err) {
                    console.log(err)
                } else {
                    let mailOptions = {
                        from: 'noreply@dokonaly.com',
                        to: mailData.emailTo,
                        subject: `AllMasters | Vessel Arrived - ${mailData.bookingData.bId}`,
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

    //DO Released Mail
    const doReleaseMail = async (mailData) => {

        ejs.renderFile(`${templatePath}/doRelease.ejs`,
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
                        subject: `AllMasters | DO Released  - ${mailData.bookingData.bId}`,
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
    //Update Milestone
    router.updateMilestone = async (req, res) => {
        let data = { status: 0, response: message.inValid }, updateData, updateStatus, userData, bookingData, bookingCountData,
            folderpath, fileFolderpath, fileName, base64String, allBooking, updateMilestone, milestoneUpdateData = {}, updateBooking, i = 0

        try {
            updateData = req.body;

            if (Object.keys(updateData).length === 0 && updateData.data === undefined) {
                res.send(data)
                return
            }
            updateData = updateData.data[0]
            if (!mongoose.isValidObjectId(updateData.bookingId)) {

                return res.send({ status: 0, response: message.invalidBookingId })
            }
            bookingData = await db.findSingleDocument("booking", { _id: new ObjectId(updateData.bookingId) })
            if (bookingData !== null && Object.keys(bookingData).length !== 0) {
                userData = await db.findSingleDocument("user", { _id: new ObjectId(bookingData.createdBy) })
                if (userData === null) {

                    return res.send({ status: 0, response: message.userNotFound })
                }
                if (updateData.msams02 === 1) {
                    await soReleaseMail({
                        emailTo: userData.email,
                        fullName: userData.fullName,
                        legalName: bookingData.legalName,
                        bookingData: bookingData._doc,
                        url: `${CONFIGJSON.settings.milestoneUrl}${bookingData.scheduleId}/${bookingData._id}`
                    })
                    updateData.msams02Mail = 1
                    folderpath = path.resolve(__dirname, '../../fileuploads/booking/')
                    fileFolderpath = `${folderpath}/${bookingData.bId}`
                    fileName = `${updateData.msams02File.fileName}_SO.pdf`
                    base64String = updateData.msams02File.filePath

                    if (base64String.includes('base64') === true) {
                        await fileUpload(folderpath, fileFolderpath, fileName, base64String)
                        updateData.msams02File.filePath = CONFIGJSON.settings.nodeFileUploads + `booking/${bookingData.bId}/${fileName}`
                    }
                }
                else if (updateData.msams04 === 1 && updateData.msams04File !== undefined) {
                    folderpath = path.resolve(__dirname, '../../fileuploads/booking/')
                    fileFolderpath = `${folderpath}/${bookingData.bId}`
                    fileName = `${updateData.msams04File.fileName}_PaymentAdvice.pdf`
                    base64String = updateData.msams04File.filePath

                    if (base64String.includes('base64') === true) {
                        await fileUpload(folderpath, fileFolderpath, fileName, base64String)
                        updateData.msams04File.filePath = CONFIGJSON.settings.nodeFileUploads + `booking/${bookingData.bId}/${fileName}`
                    }
                }
                else if (updateData.msams05 === 1) {
                    folderpath = path.resolve(__dirname, '../../fileuploads/booking/')
                    fileFolderpath = `${folderpath}/${bookingData.bId}`
                    fileName = `${updateData.msams05File.fileName}_SurveyReport.pdf`
                    base64String = updateData.msams05File.filePath

                    if (base64String.includes('base64') === true) {
                        await fileUpload(folderpath, fileFolderpath, fileName, base64String)
                        updateData.msams05File.filePath = CONFIGJSON.settings.nodeFileUploads + `booking/${bookingData.bId}/${fileName}`
                    }
                }
                else if (updateData.msams07 === 1) {
                    folderpath = path.resolve(__dirname, '../../fileuploads/booking/')
                    fileFolderpath = `${folderpath}/${bookingData.bId}`
                    fileName = `${updateData.msams07File.fileName}_StuffingReport.pdf`
                    base64String = updateData.msams07File.filePath

                    if (base64String.includes('base64') === true) {
                        await fileUpload(folderpath, fileFolderpath, fileName, base64String)
                        updateData.msams07File.filePath = CONFIGJSON.settings.nodeFileUploads + `booking/${bookingData.bId}/${fileName}`
                    }
                }
                else if (updateData.msams08 === 1) {
                    folderpath = path.resolve(__dirname, '../../fileuploads/booking/')
                    fileFolderpath = `${folderpath}/${bookingData.bId}`
                    fileName = `${updateData.msams08File.fileName}_ShippingInstruction.pdf`
                    base64String = updateData.msams08File.filePath

                    if (base64String.includes('base64') === true) {
                        await fileUpload(folderpath, fileFolderpath, fileName, base64String)
                        updateData.msams08File.filePath = CONFIGJSON.settings.nodeFileUploads + `booking/${bookingData.bId}/${fileName}`
                    }
                }
                else if (updateData.msams09 === 1) {
                    folderpath = path.resolve(__dirname, '../../fileuploads/booking/')
                    fileFolderpath = `${folderpath}/${bookingData.bId}`

                    //Shipping Bill
                    if (updateData.msams09File.length !== 0) {
                        for (; i < updateData.msams09File.length; i++) {
                            if (updateData.msams09File[i].filePath.includes('base64') === true) {
                                fileName = `${updateData.msams09File[i].fileName}_SB${i + 1}.pdf`
                                base64String = updateData.msams09File[i].filePath
                                updateData.msams09File[i].filePath = CONFIGJSON.settings.nodeFileUploads + `booking/${bookingData.bId}/${fileName}`
                                await fileUpload(folderpath, fileFolderpath, fileName, base64String)
                            }
                        }
                    }
                }
                else if (updateData.msams10 === 1) {
                    folderpath = path.resolve(__dirname, '../../fileuploads/booking/')
                    fileFolderpath = `${folderpath}/${bookingData.bId}`
                    fileName = `${updateData.msams10File.fileName}_FCRDraft.pdf`
                    base64String = updateData.msams10File.filePath

                    if (base64String.includes('base64') === true) {
                        await fileUpload(folderpath, fileFolderpath, fileName, base64String)
                        updateData.msams10File.filePath = CONFIGJSON.settings.nodeFileUploads + `booking/${bookingData.bId}/${fileName}`
                    }
                }
                else if (updateData.msams11 === 1) {
                    folderpath = path.resolve(__dirname, '../../fileuploads/booking/')
                    fileFolderpath = `${folderpath}/${bookingData.bId}`
                    fileName = `${updateData.msams11File.fileName}_ForwarderHBL.pdf`
                    base64String = updateData.msams11File.filePath

                    if (base64String.includes('base64') === true) {
                        await fileUpload(folderpath, fileFolderpath, fileName, base64String)
                        updateData.msams11File.filePath = CONFIGJSON.settings.nodeFileUploads + `booking/${bookingData.bId}/${fileName}`
                    }
                }
                else if (updateData.msams12 === 1 && updateData.msams12File !== undefined) {
                    folderpath = path.resolve(__dirname, '../../fileuploads/booking/')
                    fileFolderpath = `${folderpath}/${bookingData.bId}`
                    if (updateData.msams12File.fileName != null) {
                        fileName = `${updateData.msams12File.fileName}_FCRVerifiedDraft.pdf`
                        base64String = updateData.msams12File.filePath
                        await fileUpload(folderpath, fileFolderpath, fileName, base64String)
                        updateData.msams12File.filePath = CONFIGJSON.settings.nodeFileUploads + `booking/${bookingData.bId}/${fileName}`
                    }
                }
                else if (updateData.msams14 === 1) {
                    folderpath = path.resolve(__dirname, '../../fileuploads/booking/')
                    fileFolderpath = `${folderpath}/${bookingData.bId}`
                    fileName = `${updateData.msams14File.fileName}_FCRFinalCopy.pdf`
                    base64String = updateData.msams14File.filePath

                    if (base64String.includes('base64') === true) {
                        await fileUpload(folderpath, fileFolderpath, fileName, base64String)
                        updateData.msams14File.filePath = CONFIGJSON.settings.nodeFileUploads + `booking/${bookingData.bId}/${fileName}`
                    }
                }
                else if (updateData.msams16 === 1) {
                    bookingData = await db.findSingleDocument("booking", { _id: new ObjectId(updateData.bookingId) }, { _id: 0, scheduleId: 1 })
                    if (bookingData !== null & Object.keys(bookingData).length !== 0) {
                        allBooking = await db.findAndSelect("booking", { scheduleId: new ObjectId(bookingData.scheduleId) }, { _id: 1 })
                        if (allBooking.length !== 0) {
                            updateMilestone = await db.updateManyDocuments("milestone", { bookingId: { $in: allBooking } }, { msams16: 1 })
                            if (updateMilestone.modifiedCount !== 0 && updateMilestone.matchedCount !== 0) {

                                return res.send({ status: 1, response: message.updatedSucess })
                            }
                        }
                    }

                }
                else if (updateData.msams17 === 1) {
                    bookingData = await db.findSingleDocument("booking", { _id: new ObjectId(updateData.bookingId) }, { _id: 0, scheduleId: 1 })
                    if (bookingData !== null & Object.keys(bookingData).length !== 0) {
                        allBooking = await db.findAndSelect("booking", { scheduleId: new ObjectId(bookingData.scheduleId) }, { _id: 1 })
                        if (allBooking.length !== 0) {
                            updateMilestone = await db.updateManyDocuments("milestone", { bookingId: { $in: allBooking } }, { msams17: 1 })
                            if (updateMilestone.modifiedCount !== 0 && updateMilestone.matchedCount !== 0) {

                                return res.send({ status: 1, response: message.updatedSucess })
                            }
                        }
                    }
                }
                else if (updateData.msams18 === 1) {
                    folderpath = path.resolve(__dirname, '../../fileuploads/booking/')
                    fileFolderpath = `${folderpath}/${bookingData.bId}`
                    fileName = `${updateData.msams18File.fileName}_CargoPhotos.pdf`
                    base64String = updateData.msams18File.filePath

                    if (base64String.includes('base64') === true) {
                        await fileUpload(folderpath, fileFolderpath, fileName, base64String)
                        updateData.msams18File.filePath = CONFIGJSON.settings.nodeFileUploads + `booking/${bookingData.bId}/${fileName}`
                    }
                }
                else if (updateData.msams19 === 1) {
                    bookingData = await db.findSingleDocument("booking", { _id: new ObjectId(updateData.bookingId) }, { _id: 0, scheduleId: 1 })
                    if (bookingData !== null & Object.keys(bookingData).length !== 0) {
                        allBooking = await db.findAndSelect("booking", { scheduleId: new ObjectId(bookingData.scheduleId) }, { _id: 1 })
                        if (allBooking.length !== 0) {
                            updateData.msams19Data.cargoDeliveryDate = moment(updateData.msams19Data.cargoDeliveryDate, 'DD-MM-YYYY').toDate()
                            updateMilestone = await db.updateManyDocuments("milestone", { bookingId: { $in: allBooking } }, { msams19: updateData.msams19, msams19Data: updateData.msams19Data })
                            if (updateMilestone.modifiedCount !== 0 && updateMilestone.matchedCount !== 0) {

                                return res.send({ status: 1, response: message.updatedSucess })
                            }
                        }
                    }
                }
                else if (updateData.msams20 === 1) {
                    folderpath = path.resolve(__dirname, '../../fileuploads/booking/')
                    fileFolderpath = `${folderpath}/${bookingData.bId}`
                    fileName = `${updateData.msams20File.fileName}_DO.pdf`
                    base64String = updateData.msams20File.filePath

                    if (base64String.includes('base64') === true) {
                        await fileUpload(folderpath, fileFolderpath, fileName, base64String)
                        updateData.msams20File.filePath = CONFIGJSON.settings.nodeFileUploads + `booking/${bookingData.bId}/${fileName}`
                    }
                    await doReleaseMail({
                        emailTo: userData.email,
                        fullName: userData.fullName,
                        legalName: bookingData.legalName,
                        bookingData: bookingData._doc,
                        url: `${CONFIGJSON.settings.milestoneUrl}${bookingData.scheduleId}/${bookingData._id}`
                    })
                    updateData.msams18Mail = 1
                }
                else if (updateData.msams21 === 1) {
                    updateBooking = await db.findByIdAndUpdate("booking", updateData.bookingId, { status: 9 })
                }
                updateStatus = await db.updateOneDocument("milestone", { bookingId: updateData.bookingId }, updateData)
                if (updateStatus.modifiedCount !== 0 && updateStatus.matchedCount !== 0) {

                    return res.send({ status: 1, response: message.updatedSucess })
                }
            }

            return res.send(data)
        } catch (error) {
            logger.error(`Error in milestone controller - updateMilestone: ${error.message}`)
            if (error.errors.type.kind === 'enum') {
                data.response = "Status Invalid"
            }
            else {
                data.response = error.message
            }
            res.send(error.message)
        }
    }

    //Update Container
    router.updateContainer = async (req, res) => {
        let data = { status: 0, response: message.inValid }, updateData, bookingData, bookingIdData, scheduleData, milestoneData,
            userData, updateSchedule, updateMilestone, milestoneUpdateData = { msams06: 1 }, i = 0, j = 0

        try {
            updateData = req.body;

            if (Object.keys(updateData).length === 0 && updateData.data === undefined) {
                res.send(data)
                return
            }
            updateData = updateData.data[0]
            if (!mongoose.isValidObjectId(updateData.id)) {

                return res.send({ status: 0, response: message.invalidScheduleId })
            }

            scheduleData = await db.findSingleDocument("schedule", { _id: new ObjectId(updateData.id) })
            if (scheduleData !== null && Object.keys(scheduleData).length !== 0) {
                //Onboarding Confirmed - ATD
                if (updateData.aetd !== undefined && updateData.aetd !== '') {
                    updateData.aetd = moment(updateData.aetd, 'DD-MM-YYYY').toDate()
                    milestoneUpdateData.msams13 = 1
                    milestoneUpdateData.msams13Mail = 1
                }
                else {
                    delete updateData.aetd
                }
                //Vessel Arrived - ATA
                if (updateData.aeta !== undefined && updateData.aeta !== '') {
                    updateData.aeta = moment(updateData.aeta, 'DD-MM-YYYY').toDate()
                    milestoneUpdateData.msams15 = 1
                    milestoneUpdateData.msams15Mail = 1
                }
                else {
                    delete updateData.aeta
                }
                //ETA Change
                if (updateData.eta !== undefined && updateData.eta !== '') {
                    updateData.eta = moment(updateData.eta, 'DD-MM-YYYY').toDate()
                }
                else {
                    delete updateData.eta
                }
                //MBL Date Conversion
                if (updateData.mblDate !== undefined && updateData.mblDate !== '') {
                    updateData.mblDate = moment(updateData.mblDate, 'DD-MM-YYYY').toDate()
                }
                else {
                    delete updateData.mblDate
                }

                updateSchedule = await db.updateOneDocument("schedule", { _id: new ObjectId(updateData.id) }, updateData)
                if (updateSchedule.modifiedCount !== 0 && updateSchedule.matchedCount !== 0) {
                    bookingData = await db.findDocuments("booking", { scheduleId: new ObjectId(updateData.id), status: 1 })
                    if (bookingData !== null && bookingData.length !== 0) {
                        bookingIdData = bookingData.map(e => e._id)
                        milestoneData = await db.findSingleDocument("milestone", { bookingId: bookingIdData[0] })
                        if (milestoneData !== null && Object.keys(milestoneData).length !== 0) {
                            if (milestoneData.msams06 !== 1 || milestoneData.msams13 !== 1 || milestoneData.msams15 !== 1) {
                                updateMilestone = await db.updateManyDocuments("milestone",
                                    { "bookingId": { $in: bookingIdData } },
                                    milestoneUpdateData)

                                if (updateMilestone.modifiedCount !== 0 && updateMilestone.matchedCount !== 0) {
                                    if (milestoneUpdateData.msams13 === 1 && milestoneData.msams13Mail !== 1) {
                                        for (; i < bookingData.length; i++) {
                                            userData = await db.findSingleDocument("user", { _id: new ObjectId(bookingData[i].createdBy) })
                                            if (userData === null) {

                                                return res.send({ status: 0, response: message.userNotFound })
                                            }

                                            await onboardingConfirmationMail({
                                                emailTo: userData.email,
                                                fullName: userData.fullName,
                                                legalName: bookingData[i].legalName,
                                                bookingData: bookingData[i]._doc,
                                                aetd: moment(updateData.aetd).format("DD/MM/YYYY"),
                                                url: `${CONFIGJSON.settings.milestoneUrl}${bookingData[i].scheduleId}/${bookingData[i]._id}`
                                            })
                                        }
                                    }
                                    if (milestoneUpdateData.msams15 === 1 && milestoneData.msams15Mail !== 1) {
                                        for (; j < bookingData.length; j++) {
                                            userData = await db.findSingleDocument("user", { _id: new ObjectId(bookingData[j].createdBy) })
                                            if (userData === null) {

                                                return res.send({ status: 0, response: message.userNotFound })
                                            }

                                            await vesselArrivedMail({
                                                emailTo: userData.email,
                                                fullName: userData.fullName,
                                                legalName: bookingData[j].legalName,
                                                bookingData: bookingData[j]._doc,
                                                aeta: moment(updateData.aeta).format("DD/MM/YYYY"),
                                                url: `${CONFIGJSON.settings.milestoneUrl}${bookingData[j].scheduleId}/${bookingData[j]._id}`
                                            })
                                        }
                                    }

                                    return res.send({ status: 1, response: message.updatedSucess })
                                }
                            }

                            return res.send({ status: 1, response: message.updatedSucess })
                        }
                    }
                }
            }

            return res.send(data)
        } catch (error) {
            logger.error(`Error in milestone controller - updateContainer: ${error.message}`)
            data.response = error.message
            res.send(error.message)
        }
    }

    //Get Milestones by Booking Id
    router.getMilestoneByBookingId = async (req, res) => {
        let data = { status: 0, response: message.inValid }, idData, milestoneData, token, decodedToken

        try {
            idData = req.body;

            if (Object.keys(idData).length === 0 && idData.data === undefined) {
                res.send(data)
                return
            }
            idData = idData.data[0]
            token = req.headers.authorization
            token = token.substring(7)

            decodedToken = jwt.decode(token)
            if (!mongoose.isValidObjectId(idData.bookingId)) {

                return res.send({ status: 0, response: message.bookingId })
            }
            milestoneData = await db.findSingleDocument("milestone", { bookingId: new ObjectId(idData.bookingId) }, { createdAt: 0, updatedAt: 0 })
            if (milestoneData !== null && Object.keys(milestoneData).length !== 0) {
                if(decodedToken.type ===1){
                    if (milestoneData._doc.createdBy != decodedToken.userId) {

                        return res.status(401).send("Unauthorized Access")
                    }
                }

                return res.send({ status: 1, data: JSON.stringify(milestoneData) })
            }

            return res.send({ status: 1, data: "[]" })
        } catch (error) {
            logger.error(`Error in milestone controller - getMilestone: ${error.message}`)
            data.response = error.message
            res.send(error.message)
        }
    }

    //Get Milestone File
    router.getMilestoneFile = async (req, res) => {
        let data = { status: 0, response: message.inValid }, downloadFile

        try {
            let fileData = req.body, milestoneData
            if (Object.keys(fileData).length === 0 && fileData.data === undefined) {
                res.send(data)

                return
            }
            fileData = fileData.data[0]
            if (!mongoose.isValidObjectId(fileData.bookingId)) {

                return res.send({ status: 0, response: message.invalidBookingId })
            }

            downloadFile = Object.values(fileData)[1].filePath
            downloadFile = downloadFile.substring(downloadFile.lastIndexOf('/') + 1)
            milestoneData = await db.findSingleDocument("milestone", { bookingId: new ObjectId(fileData.bookingId) })
            if (milestoneData !== null && Object.keys(milestoneData).length !== 0) {
                await common.downloadFileAzure(`${milestoneData.bId}`, `${downloadFile}`, 'booking')

                return res.send({ status: 1, response: message.fileDownloaded })
            }

            return res.send(data)
        } catch (error) {
            logger.error(`Error in milestone controller - getMilestoneFile: ${error.message}`);
            data.response = `${error.message}`;
            res.send(data);
        }
    }

    return router
}