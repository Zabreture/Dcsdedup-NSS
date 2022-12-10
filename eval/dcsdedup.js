const utils = require('../src/utils');
const crypto = require('crypto');

async function storeFile(filePath) {
    const start = new Date().getTime();
    const fileKey = await utils.hash(filePath);
    const cipherPath = await utils.encrypt(filePath, fileKey);
    const fileTag = await utils.hash(cipherPath);
    const RTT = await utils.roundTrip(32, 50);
    if(utils.dedupCheck(fileTag)){
        const fileID = await utils.IPFSAdd(cipherPath);
        const random = crypto.randomBytes(16);
        const addressKey = await utils.hash(cipherPath, random);
        const encAddress = utils.encryptSync(fileID, addressKey);
        const res = await utils.updateMetadata(fileTag, random, fileID, encAddress);
        return {
            filePath: filePath,
            flag: res.flag,
            fileID: fileID,
            fileKey: fileKey,
            gasUsed: res.gasUsed,
            timeCost: new Date().getTime() - start
        }
    }else{
        const metadata = await utils.getMetadata(fileTag);
        const addressKey = await utils.hash(cipherPath, metadata.random);
        const fileID = await utils.decryptSync(metadata.encAddress, addressKey);
        return {
            filePath: filePath,
            flag: true,
            fileID: fileID,
            fileKey: fileKey,
            timeCost: new Date().getTime() - start
        }
    }
}

async function retrieveFile(stInfo) {
    const start = new Date().getTime();
    const savePath = stInfo.filePath + '.enc';
    await utils.roundTrip(32, 0);
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