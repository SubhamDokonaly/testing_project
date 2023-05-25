//Schema Imports
const userClone = require('../schema/clone/user_clone')
const userDetailClone = require('../schema/clone/userDetail_clone')
const countryClone = require('../schema/clone/country_clone')
const costHeadingClone = require('../schema/clone/costHeading_clone')
const laneClone= require('../schema/clone/lane_clone')
const countryCityListClone = require('../schema/clone/countryCityList_clone')
const portHolidayClone = require('../schema/clone/holiday_clone')
const scheduleClone = require('../schema/clone/schedule_clone')
const cfsClone = require('../schema/clone/cfs_clone')
const internalClone = require('../schema/clone/internal_clone')
const rateClone = require('../schema/clone/rate_clone')
const bookingClone = require('../schema/clone/booking_clone')
const originForwarderClone = require('../schema/clone/originForwarder_clone')
const destinationForwarderClone = require('../schema/clone/destinationForwarder_clone')
const notifyPartyClone = require('../schema/clone/notifyParty_clone')
const bookingDocsClone = require('../schema/clone/bookingDocs_clone')
const checkOutDetailsClone = require('../schema/clone/checkOutDetails_clone')
const bookingSearchClone = require('../schema/clone/bookingSearch_clone')
const milestoneClone =require('../schema/clone/milestone_clone')
const paymentDetailClone =require('../schema/clone/paymentDetail_clone')

//DB Collection Schema
const db = {
  userClone,
  userDetailClone,
  countryClone,
  costHeadingClone,
  laneClone,
  countryCityListClone,
  portHolidayClone,
  scheduleClone,
  cfsClone,
  internalClone,
  rateClone,
  bookingClone,
  originForwarderClone,
  destinationForwarderClone,
  notifyPartyClone,
  bookingDocsClone,
  checkOutDetailsClone,
  bookingSearchClone,
  milestoneClone,
  paymentDetailClone
}

const insertSingleDocument = async (collection, document) => {
  try {
    let result = await db[collection].create(document)

    return result;
  } catch (error) {
    console.error("Error inserting document: ", error)

    throw error;
  }
}

module.exports = {
  insertSingleDocument
}