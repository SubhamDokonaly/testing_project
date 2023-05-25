"use strict";
const { ensureAuthorized } = require('../model/auth')
const logger = require("../model/logger")(__filename)

module.exports = (app) => {
    try {

        //Validation files
        const bookingValidation = require("../validation/freightForwarder/bookingValidation")()

        //Controller files
        const booking = require('../controller/freightForwarder/booking.js')()

        //Booking Portal APIs
        app.post('/booking/insert', ensureAuthorized, bookingValidation.save, booking.save)
        app.post('/booking/ofInsert', ensureAuthorized, bookingValidation.saveOF, booking.saveOF)
        app.post('/booking/dfInsert', ensureAuthorized, bookingValidation.saveDF, booking.saveDF)
        app.post('/booking/npInsert', ensureAuthorized, bookingValidation.saveNP, booking.saveNP)
        app.post('/booking/docsInsert', ensureAuthorized, bookingValidation.saveDocs, booking.saveDocs)
        app.post('/booking/checkoutDetailsInsert', ensureAuthorized, bookingValidation.saveCheckoutDetails, booking.saveCheckoutDetails)
        app.post('/of/list', ensureAuthorized, bookingValidation.checkLegalName, booking.ofList)
        app.post('/df/list', ensureAuthorized, bookingValidation.checkLegalName, booking.dfList)
        app.post('/np/list', ensureAuthorized, bookingValidation.checkLegalName, booking.npList)
        app.post('/booking/getOfDataById', ensureAuthorized, bookingValidation.checkId, booking.ofDataById)
        app.post('/booking/getDfDataById', ensureAuthorized, bookingValidation.checkId, booking.dfDataById)
        app.post('/booking/getNpDataById', ensureAuthorized, bookingValidation.checkId, booking.npDataById)
        app.post('/booking/getDocsById', ensureAuthorized, bookingValidation.checkId, booking.docsById)
        app.post('/booking/checkoutDetailsDataById', ensureAuthorized, bookingValidation.checkId, booking.checkoutDetailsDataById)
        app.post('/booking/checkoutDetailsCfsData',ensureAuthorized, bookingValidation.checkDataId, booking.checkoutDetailsCfsData)
        app.post('/booking/getBookingById', ensureAuthorized, bookingValidation.checkId, booking.getBookingById)
        app.post('/booking/getBookingsByLegalName', ensureAuthorized, bookingValidation.checkLegalName, booking.getBookingsByLegalName)
        app.post('/booking/getBookingsDetailsByLegalName', ensureAuthorized, bookingValidation.checkLegalName, booking.getBookingsDetailsByLegalName)
        app.post('/booking/updateStatus', ensureAuthorized, bookingValidation.checkUpdate, booking.updateStatus)
        app.get('/booking/getBookingsList', ensureAuthorized, booking.bookingList)
        app.post('/booking/getOfFileById', ensureAuthorized, bookingValidation.checkId, booking.ofFileById)

        //Booking Search APIs
        app.post('/booking/searchBooking', ensureAuthorized, bookingValidation.searchBooking, booking.insertBookingSearch)

        //Payment Invoice API
        app.post('/booking/updateInvoicePayment', ensureAuthorized, bookingValidation.checkUpdate, booking.updateInvoicePayment)
        app.post('/booking/getInvoicePaymentFile', ensureAuthorized, bookingValidation.checkId, booking.getInvoicePaymentFile)

    } catch (e) {
        logger.error(`Error in freightForwarder route: ${e.message}`)
    }
};