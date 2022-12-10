const utils = require('../src/utils');

async function storeFile(filePath) {
    const start = new Date().getTime();
    const fileKey = await utils.hash(filePath);
    const cipherPath = await utils.encrypt(filePath, fileKey);
    const fileTag = await utils.hash(cipherPath);
    await utils.roundTrip(32,0);
    const fileID = await utils.IPFSAdd(cipherPath);
    return {
        filePath: filePath,
        fileID: fileID,
        fileKey: fileKey,
        fileTag: fileTag,
        timeCost: new Date().getTime() - start
    }
}

async function retrieveFile(stInfo) {
    const start = new Date().getTime();
    const savePath = stInfo.filePath + '.enc';
    await utils.roundTrip(32,0);
    await utils.IPFSCat(savePath, stInfo.fileID);
    const retPath = await utils.decrypt(stInfo.filePath, stInfo.fileKey);
    return {
        retPath: retPath,
        timeCost: new Date().getTime() - start
    }
}

module.exports = {
    storeFile,
    retrieveFile,
}