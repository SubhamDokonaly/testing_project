//Imports
const db = require('../model/mongodb')
const bcrypt = require('bcrypt')
const { ShareServiceClient } = require("@azure/storage-file-share")
const fs = require('fs').promises
const logger = require('../model/logger')(__filename)
const CONFIG = require('../config/config')
var CONFIGJSON = require('../config/config.json')
const jwt = require('jsonwebtoken')
const path = require('path')
const CryptoJS = require("crypto-js")
const { message } = require('./message')
const { ObjectId } = require('bson')

//Azure File Share Upload - uploadFileAzure(filePath, lclbookingId, fileNamePath)
const uploadFileAzure = async (filePath, folderName, fileNamePath) => {
  let serviceClient, shareName, shareClient, shareExists,
    fileHierarchyPath, fileHierarchy, directoryName, directoryClient, directoryExists,
    fileName, fileClient

  const azureConnectionString = CONFIG.AZURECONNECTIONSTRING
  if (!azureConnectionString) throw Error('Azure Storage ConnectionString not found');

  try {
    serviceClient = ShareServiceClient.fromConnectionString(azureConnectionString)

    //Azure File Share
    shareName = CONFIGJSON.azureFilePath.shareName
    shareClient = serviceClient.getShareClient(shareName);
    shareExists = await shareClient.exists()
    // await shareClient.create();           -    To Create Azure Share Client if not exists. Legacy Now as Azure Share Client Already Exists

    if (shareExists) {
      //Finding the File Hierarchy to determine the Directory Name to Upload the File in Azure File Share
      if (filePath.includes('app') === true) {                        //For Dev, Qa, Uat Environments
        fileHierarchyPath = filePath.split("/fileuploads/").pop()
      }
      else {                                                          //Only for Local API Work
        fileHierarchyPath = filePath.split("\\fileuploads\\").pop()
      }
      fileHierarchy = fileHierarchyPath.substring(0, fileHierarchyPath.indexOf("/"))

      //Azure File Share Directory
      if (fileHierarchy === 'registration') {
        directoryName = CONFIGJSON.azureFilePath.directory + `/Registration/${folderName}`
      }
      else if (fileHierarchy === 'cfs certificates') {
        directoryName = CONFIGJSON.azureFilePath.directory + `/CFS Certificates/${folderName}`
      }
      else if (fileHierarchy === 'origin forwarder') {
        directoryName = CONFIGJSON.azureFilePath.directory + `/Origin Forwarder/${folderName}`
      }
      else if (fileHierarchy === 'booking') {
        directoryName = CONFIGJSON.azureFilePath.directory + `/Booking/${folderName}`
      }

      directoryClient = shareClient.getDirectoryClient(directoryName)
      directoryExists = await directoryClient.exists()

      if (!directoryExists) { await directoryClient.create() }

      //Azure File Share File
      fileName = fileNamePath
      fileClient = directoryClient.getFileClient(fileName)
      await fileClient.uploadFile(filePath)
    }
  }
  catch (error) {
    logger.error('Error in Azure File Share Connection: ' + error.message + '')
  }
}

//Azure File Share Download - downloadFileAzure(lclbookingId)
const downloadFileAzure = async (folderName, fileToDownload, type) => {
  let serviceClient, shareName, shareClient, shareExists,
    directoryName, directoryClient, directoryExists,
    fileName, fileClient, fileUploadsPath, filePath,
    fileDownloadBuffer

  fileUploadsPath = path.resolve(__dirname, '../fileuploads')
  filePath = `${fileUploadsPath}/${type}/${folderName}/`
  await fs.mkdir(filePath, { recursive: true }, (err) => {
    if (err) throw err;
  })

  const azureConnectionString = CONFIG.AZURECONNECTIONSTRING
  if (!azureConnectionString) throw Error('Azure Storage ConnectionString not found');

  try {
    serviceClient = ShareServiceClient.fromConnectionString(azureConnectionString)

    //Azure File Share
    shareName = CONFIGJSON.azureFilePath.shareName
    shareClient = serviceClient.getShareClient(shareName);
    shareExists = await shareClient.exists()
    // await shareClient.create();

    //Azure File Share Directory
    if (shareExists) {
      directoryName = CONFIGJSON.azureFilePath.directory + `/${type}/${folderName}`
      directoryClient = shareClient.getDirectoryClient(directoryName)
      directoryExists = await directoryClient.exists()

      if (directoryExists) {
        const dirIter = directoryClient.listFilesAndDirectories()
        let i = 1;
        for await (const item of dirIter) {
          if (item.kind === "directory") {
            console.log(`${i} - directory\t: ${item.name}`);
          } else {
            //Azure File Share File Download to Server
            // console.log(`${i} - file\t: ${item.name}`);
            if (fileToDownload !== "") {
              if (fileToDownload === item.name) {
                fileName = item.name
                fileClient = directoryClient.getFileClient(fileName)
                fileDownloadBuffer = await fileClient.downloadToBuffer()
                await fs.writeFile(`${filePath}/${fileName}`, fileDownloadBuffer)
                return
              }
            }
            else {
              fileName = item.name
              fileClient = directoryClient.getFileClient(fileName)
              fileDownloadBuffer = await fileClient.downloadToBuffer()
              await fs.writeFile(`${filePath}/${fileName}`, fileDownloadBuffer)
            }
          }
          i++;
        }
      }
    }
  }
  catch (error) {
    logger.error('Error in Azure File Share Connection: ' + error.message + '');
    data.response = error.message;
    res.send(data);
  }
}

//Create Milestone Directory - createDir(fileuploadpath)
const createDir = async (path) => {
  await fs.mkdir(path, { recursive: true }, (err) => {
    if (err) throw err;
  });
}

//Create Milestone File - createMilestoneFile(`${filePath}/${lclbookingId}/${fileName}`, base64Pdf, 'base64')
const createFile = async (filePath, fileData, fileEncoding) => {
  await fs.writeFile(filePath, fileData, { encoding: fileEncoding })
}

const hasDuplicates = (array) => {
  var valuesSoFar = [];
  for (var i = 0; i < array.length; ++i) {
    var value = array[i];
    if (valuesSoFar.indexOf(value) !== -1) {
      return true
    }
    valuesSoFar.push(value);
  }
  return false;
}

const duplicate = (arr, keys) => {
  let store = []
  let duplicate
  arr.map((el) => {
    let str = ""
    keys.forEach((e) => {
      str += el[e]
    })
    if (!store.includes(str)) {
      store.push(str)
    } else {
      duplicate = true
    }
  })
  if (duplicate) {
    return true
  }
}

const otpGenerate = () => {
  let otp = Math.random().toString().substring(2, 8)
  if (otp.length !== 6) {
    otpGenerate()
  } else {
    return otp
  }
}

const encryptDB = (data) => {
  var ciphertext = CryptoJS.AES.encrypt(`${JSON.stringify(data)}`, CONFIG.DB_KEY).toString();
  if (ciphertext) {
    return ciphertext
  }
}

const decryptDB = (data) => {
  bytes = CryptoJS.AES.decrypt(data, CONFIG.DB_KEY);
  data = bytes.toString(CryptoJS.enc.Utf8);
  data = JSON.parse(data)
  return data
}

const encryptAPI = (data) => {
  var ciphertext = CryptoJS.AES.encrypt(`${JSON.stringify(data)}`, CONFIG.API_KEY).toString();
  if (ciphertext) {
    return ciphertext
  }
}

const decryptAPI = (data) => {
  bytes = CryptoJS.AES.decrypt(data, CONFIG.API_KEY);
  data = bytes.toString(CryptoJS.enc.Utf8);
  data = JSON.parse(data)
  return data
}

let triesLeft = 3
const loginParameter = async (model, loginData, res) => {
  let user, passwordMatch, generatedToken, loginTime, updateLogIn

  user = await db.findSingleDocument(model, { "email": loginData.email, status: loginData.type === 1 ? { $nin: [0, 7, 8] } : { $in: 1 } })
  if (user !== null && Object.keys(user).length !== 0) {
    if (user.password !== undefined) {                        // && (user.logoutTime === undefined || user.logoutTime !== null)
      passwordMatch = bcrypt.compareSync(loginData.password, user.password);
      if (passwordMatch === true) {
        generatedToken = jwt.sign({
          userId: user._id,
          role: user.role,
          status: user.status,
          type: loginData.type,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
        }, CONFIG.SECRET_KEY)
        res.setHeader('Authorization', 'Bearer ' + generatedToken)

        loginTime = Date.now()
        updateLogIn = await db.updateOneDocument(model, { _id: user._id }, { loginTime: loginTime, logoutTime: "" })
        if (updateLogIn.modifiedCount !== 0 && updateLogIn.matchedCount !== 0) {

          return res.send({
            status: 1,
            response: message.login,
            data: JSON.stringify({
              userId: user._id,
              token: generatedToken,
            })
          })
        }
      } else {
        if (triesLeft === 0) {
          return res.send({ status: 0, response: message.loginExceeded })
        }
        triesLeft--
        res.send({ status: 0, response: message.wrongPassword });
      }
    }
    else {
      if (user.password === undefined) {

        return res.send({ status: 0, response: message.userNotFound })
      }

      return res.send({ status: 0, response: message.alreadyLogin });
    }
  }
  else {

    return res.send({ status: 0, response: message.loginFailed })
  }
}

const logoutParameter = async (model, logoutData, res) => {
  let logoutTime, updateLogOut

  logoutTime = Date.now()
  updateLogOut = await db.updateOneDocument(model, { _id: new ObjectId(logoutData.id) }, { logoutTime: logoutTime })
  if (updateLogOut.modifiedCount !== 0 && updateLogOut.matchedCount !== 0) {

    return res.send({
      status: 1,
      response: message.logoutSucess
    })
  }
  else {

    return res.send({ status: 0, response: message.invalidCredential })
  }
}

module.exports = {
  uploadFileAzure,
  downloadFileAzure,
  createDir,
  createFile,
  hasDuplicates,
  duplicate,
  otpGenerate,
  encryptDB,
  decryptDB,
  encryptAPI,
  decryptAPI,
  loginParameter,
  logoutParameter
}

