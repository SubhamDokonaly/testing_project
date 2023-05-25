"use strict";
const common = require('../model/common')
const { message } = require('../model/message')
const { ensureAuthorized } = require('../model/auth')
const logger = require("../model/logger")(__filename)

//Decrypt the Data
let decryptData = (req, res, next) => {
    let data = { status: 0, response: message.inValid }, reqData

    try {
        reqData = req.body

        if (Object.keys(reqData).length === 0 || reqData.data.length === 0) {
            res.send(data)

            return
        }
        reqData = common.decryptAPI(reqData.data[0])
        req.body = reqData

        next()
    } catch (error) {
        logger.error(`Error in admin route -decryptData : ${error.message}`)
        res.send(error.message)
    }
}

module.exports = (app) => {
    try {

        //Validation files
        const countryValidation = require("../validation/admin/countryValidation")()
        const costHeadingValidation = require("../validation/admin/costHeadingValidation")()
        const laneValidation = require("../validation/admin/laneValidation")()
        const holidayValidation = require("../validation/admin/holidayValidation")()
        const scheduleValidation = require("../validation/admin/scheduleValidation")()
        const cfsValidation = require("../validation/admin/cfsValidation")()
        const internalValidation = require("../validation/admin/internalValidation")()
        const rateValidation = require("../validation/admin/rateValidation")()
        const bookingManagementValidation = require("../validation/admin/bookingManagementValidation")()
        const milestoneValidation = require("../validation/admin/milestoneValidation")()

        //Controller files
        const country = require('../controller/admin/country')()
        const costHeading = require('../controller/admin/costHeading')()
        const lane = require('../controller/admin/lane')()
        const holiday = require('../controller/admin/holiday')()
        const schedule = require('../controller/admin/schedule')()
        const cfs = require('../controller/admin/cfs')()
        const internal = require('../controller/admin/internal')()
        const rate = require('../controller/admin/rate')()
        const bookingManagement = require('../controller/admin/bookingmanagement')()
        const milestone = require('../controller/admin/milestone')()

        //Internal APIs
        app.post('/internal/register', internalValidation.registerUser, internal.register)

        //Country APIs
        app.get('/country/getList', ensureAuthorized, country.getList)
        app.post('/country/insertCountry', ensureAuthorized, countryValidation.insertCountry, country.insertCountry)
        app.post('/country/updateCountry', ensureAuthorized, countryValidation.updateCountry, country.updateCountry)

        //Country City List APIs
        app.post('/countryCityList/insert', ensureAuthorized, country.addCountryCityList)

        //Cost Heading APIs
        app.get('/costHeading/getList', ensureAuthorized, costHeading.getList)
        app.post('/costHeading/insertCostHeading', ensureAuthorized, costHeadingValidation.insertCostHeading, costHeading.insertCostHeading)
        app.post('/costHeading/updateCostHeading', ensureAuthorized, costHeadingValidation.updateCostHeading, costHeading.updateCostHeading)

        //Lane APIs
        app.get('/lane/getList', ensureAuthorized, lane.getList)
        app.post('/lane/insertLane', ensureAuthorized, laneValidation.insertLane, lane.insertLane)
        app.post('/lane/updateLane', ensureAuthorized, laneValidation.updateLane, lane.updateLane)

        //Holiday APIs
        app.get('/holiday/getList', ensureAuthorized, holiday.getList)
        app.post('/holiday/insertHoliday', ensureAuthorized, holidayValidation.insertHoliday, holiday.insertHoliday)
        app.post('/holiday/updateHoliday', ensureAuthorized, holidayValidation.updateHoliday, holiday.updateHoliday)

        //Schedule APIs
        app.get('/schedule/getList', ensureAuthorized, schedule.getList)
        app.post('/schedule/insertSchedule', ensureAuthorized, decryptData, scheduleValidation.insertSchedule, schedule.insertSchedule)
        app.post('/schedule/updateSchedule', ensureAuthorized, decryptData, scheduleValidation.updateSchedule, schedule.updateSchedule)
        app.get('/schedule/getSchedulesBasedRates', ensureAuthorized, schedule.getSchedulesBasedRates)
        app.post('/schedule/getSchedulesBasedRatesId', ensureAuthorized, schedule.getSchedulesBasedRatesById)

        //Rate APIs
        app.get('/rate/getList', ensureAuthorized, rate.getList)
        app.post('/rate/getRateById', ensureAuthorized, decryptData, rateValidation.checkId, rate.getRateById)
        app.post('/rate/insertRate', ensureAuthorized, decryptData, rateValidation.insertRate, rate.insertRate)
        app.post('/rate/updateStatus', ensureAuthorized, decryptData, rateValidation.updateStatus, rate.updateStatusById)

        //CFS APIs
        app.get('/cfs/getList', ensureAuthorized, cfs.getList)
        app.post('/cfs/insertCfs', ensureAuthorized, cfsValidation.insertCfs, cfs.insertCfs)
        app.post('/cfs/updateCfs', ensureAuthorized, cfsValidation.updateCfs, cfs.updateCfs)
        app.post('/cfs/updatePassword', cfsValidation.updatePassword, cfs.updatePassword)
        app.post('/cfs/getCfsInfo', cfsValidation.checkId, cfs.getCfsInfo)
        app.post('/cfs/getCfsDetails', ensureAuthorized, cfsValidation.checkId, cfs.getCfsDetails)
        app.post('/cfs/getBookingsCfs', ensureAuthorized, cfsValidation.checkId, cfs.getBookingsCfs)

        //Booking Management APIs
        app.post('/booking/management/getBookingsbyScheduleId', ensureAuthorized, bookingManagementValidation.checkId, bookingManagement.getBookingsbyScheduleId)
        app.post('/booking/management/cfs/getBookingsbyScheduleId',ensureAuthorized, bookingManagementValidation.checkId, bookingManagement.getBookingsbyScheduleIdCfs)
        app.get('/booking/management/getSchedulesRatesBookings', ensureAuthorized, bookingManagement.getSchedulesRatesBookings)
        
        //Milestone APIs
        app.post('/milestone/updateMilestone', ensureAuthorized, milestoneValidation.updateMilestone, milestone.updateMilestone)
        app.post('/milestone/updateContainer', ensureAuthorized, milestoneValidation.checkId, milestone.updateContainer)
        app.post('/milestone/getMilestoneById', ensureAuthorized, milestoneValidation.checkGetBookingId, milestone.getMilestoneByBookingId)
        app.post('/milestone/getMilestoneFile', ensureAuthorized, milestoneValidation.checkBookingId, milestone.getMilestoneFile)

    } catch (e) {
        logger.error(`Error in admin route: ${e.message}`)
    }
};