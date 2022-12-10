const OPRF = require('oprf');
const utils = require('../src/utils');

async function storeFile(filePath) {
    const start = new Date().getTime();
    const oprf = new OPRF();
    await oprf.ready;
    const fileKey = await utils.hash(filePath);
    await utils.roundTrip(32,0);
    const realKey = Buffer.from(await utils.blindSign(fileKey));
    const cipherPath = await utils.encrypt(filePath, realKey);
    const fileID = await utils.IPFSAdd(cipherPath);
    const keyID = await utils.IPFSAddSync(realKey);
    return {
        filePath: filePath,
        fileID: fileID,
        keyID: keyID,
        timeCost: new Date().getTime() - start
    }
}

async function retrieveFile(stInfo) {
    const start = new Date().getTime();
    const savePath = stInfo.filePath + '.enc';
    const realKey = await utils.IPFSCatSync(stInfo.keyID);
    await utils.roundTrip(32,0);
    await utils.IPFSCat(savePath, stInfo.fileID);
    const retPath = await utils.decrypt(stInfo.filePath, realKey);
    return {
        retPath: retPath,
        timeCost: new Date().getTime() - start,
    }
}

module.exports = {
    storeFile,
    retrieveFile,
}