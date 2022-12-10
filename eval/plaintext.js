const utils = require('../src/utils');

async function storeFile(filePath) {
    const start = new Date().getTime();
    const fileTag = await utils.hash(filePath);
    await utils.contractGetRTT();
    const fileID = await utils.IPFSAdd(filePath);
    await utils.contractPutRTT();
    return {
        filePath: filePath,
        fileID: fileID,
        fileTag: fileTag,
        timeCost: new Date().getTime() - start
    }
}

async function retrieveFile(stInfo) {
    const start = new Date().getTime();
    const savePath = stInfo.filePath + '.ret';
    await utils.roundTrip(34, 0);
    await utils.IPFSCat(savePath, stInfo.fileID);
    return {
        retPath: savePath,
        timeCost: new Date().getTime() - start
    }
}

module.exports = {
    storeFile,
    retrieveFile,
}