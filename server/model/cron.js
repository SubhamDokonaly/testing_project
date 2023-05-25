'use strict'
//Imports
const db = require('./mongodb')
const { ObjectId } = require('bson')
const logger = require("./logger")(__filename)
const { message } = require('./message')
const moment = require('moment');
const { default: mongoose } = require('mongoose')
const cron = require('cron').CronJob

const scheduleJob = async () => {

    //laneData = await db.findDocuments("lane", { status: 1 } )

    console.log(laneData)

    //Schedule Job to Disable
    new cron(
        '00 47 07 * * *',       //Schedule Time
        async () => {           //onTick
            console.log('USNYC')
            let data = { status: 0, response: message.inValid }, scheduleCondition, scheduleData, updateScheduleStatus
            scheduleCondition = {
                $and: [
                    { 'status': 1 },
                    {
                        'bookingCutOff': { $lte: moment().utcOffset("+05:30").toISOString() },
                    },
                ],
            }

            try {
                scheduleData = await db.findAndSelect("schedule", scheduleCondition, { systemInfo: 0, createdBy: 0, createdAt: 0, updatedAt: 0 })
                if (scheduleData && scheduleData.length !== 0) {
                    scheduleData = scheduleData.map(e => e._id)
                    updateScheduleStatus = await db.updateManyDocuments("schedule", { "_id": { $in: scheduleData } }, { status: 2 })
                }

            }
            catch (error) {
                logger.error(`Error in Schedule controller - scheduleJob: ${error.message}`)
            }
        },
        null,           //onComplete
        true,           //start
        null,           //timeZone
        null,           //context
        null,           //runOnInit
        "-240"          //utcOffset
    )

    new cron(
        '00 16 17 * * *',
        async () => {
            console.log('IN')
            let data = { status: 0, response: message.inValid }, scheduleCondition, scheduleData, updateScheduleStatus
            scheduleCondition = {
                $and: [
                    { 'status': 1 },
                    {
                        'bookingCutOff': { $lte: moment().utcOffset("+05:30").toISOString() },
                    },
                ],
            }

            try {
                scheduleData = await db.findAndSelect("schedule", scheduleCondition, { systemInfo: 0, createdBy: 0, createdAt: 0, updatedAt: 0 })
                if (scheduleData && scheduleData.length !== 0) {
                    scheduleData = scheduleData.map(e => e._id)
                    updateScheduleStatus = await db.updateManyDocuments("schedule", { "_id": { $in: scheduleData } }, { status: 2 })
                }

            }
            catch (error) {
                logger.error(`Error in Schedule controller - scheduleJob: ${error.message}`)
            }
        },
        null,
        true,
        'Asia/Kolkata'
    )
}

module.exports = {
    scheduleJob
}
