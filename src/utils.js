// Cryptographic functions
const fs = require('fs')
const crypto = require('crypto')
const args = require('./args.json');

const IV = args.initial_vector;
function encrypt(filePath, key) {
    const readStream = fs.createReadStream(filePath);
    const writeStream = fs.createWriteStream(filePath + '.enc');
    const cipher = crypto.createCipheriv('aes-256-ctr', key, IV);
    return new Promise((resolve, reject) => {
        readStream.on('end',() => {
            resolve(filePath + '.enc');
        }).pipe(cipher).pipe(writeStream)
    })
}

function encryptSync(data, key) {
    const cipher = crypto.createCipheriv('aes-256-ctr', key, IV);
    let result = cipher.update(data, 'utf8', 'hex');
    result += cipher.final('hex');
    return result;
}


function decrypt(filePath, key) {
    const readStream = fs.createReadStream(filePath + '.enc');
    const saveStream = fs.createWriteStream(filePath + '.ret');
    const decipher = crypto.createDecipheriv('aes-256-ctr', key, IV);
    return new Promise((resolve, reject) => {
        readStream.on('end', () => {
            resolve(filePath + '.ret');
        }).pipe(decipher).pipe(saveStream);
    })
}

function decryptSync(data, key) {
    const decipher = crypto.createDecipheriv('aes-256-ctr', key, IV);
    let result = decipher.update(data, 'hex', 'utf8');
    result += decipher.final('utf8');
    return result;
}


function hash(filePath, extraBits) {
    const hash = crypto.createHash('sha256');
    const readStream = fs.createReadStream(filePath);
    if(extraBits !== undefined){
        hash.update(extraBits);
    }
    return new Promise((resolve, reject) => {
        readStream.on('end', () => {
            resolve(hash.digest());
        }).pipe(hash)
    })
}

function hashSync(data) {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest();
}

// IPFS
const base58 = require('bs58');
const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient.create(args.IPFS_api);

function IPFSAdd(filePath) {
    const readStream = fs.createReadStream(filePath);
    return ipfs.add(readStream).then(result => {
        return Buffer.from(base58.decode(result.path));
        // return result.path;
    });
}

function IPFSAddSync(data) {
    return ipfs.add(data).then(result => {
        return Buffer.from(base58.decode(result.path));
    });
}

async function IPFSCat(filePath, CID) {
    CID = base58.encode(CID);
    const writeStream = fs.createWriteStream(filePath);
    for await (const chunk of ipfs.cat(CID)) {
        writeStream.write(chunk);
    }
}

async function IPFSCatSync(CID) {
    let data = ''
    CID = base58.encode(CID);
    for await (const chunk of ipfs.cat(CID)){
        data += Buffer.from(chunk).toString('hex');
    }
    return Buffer.from(data, 'hex');
}


// Contract component
const Web3 = require('web3');
const web3 = new Web3();
let contract, account;
function initWeb3(mode){
    console.log("----------------------");
    console.log("Contract initializing ...");
    if(mode === 'ganache'){
        const truffleConfig = require('../contract/truffle-config');
        web3.setProvider(new Web3.providers.HttpProvider('http://localhost:' + truffleConfig.networks.loc_dcsdedup_dcsdedup.port));
    }else if(mode === 'rinkeby'){
        web3.setProvider(new Web3.providers.HttpProvider(args.rinkeby_url));
    }

    const signer = web3.eth.accounts.privateKeyToAccount(
        args.private_key
    );

    web3.eth.accounts.wallet.add(signer);
    account = signer.address;
    contract = new web3.eth.Contract(
        args.contract_abi,
        args.contract_address
    );
    console.log("  Successfully initialized\n----------------------");
}



function dedupCheck(fileTag) {
    return contract.methods.FIndexGet('0x'+fileTag.toString('hex')).call().then(result => {
        return result.head === "0x0000000000000000000000000000000000000000000000000000000000000000";
    });
}

/**
 * update metadata and check the ciphertext
 * @param fileTag
 * @param random
 * @param fileID
 * @param encAddress
 */
async function updateMetadata(fileTag, random, fileID, encAddress){
    fileTag = '0x' + fileTag.toString('hex');
    random = random.toString('hex');
    fileID = base58.encode(fileID);
    encAddress = encAddress.toString('hex');

    const head = '0x' + random + encAddress.substr(0, 32);
    const tail = '0x' + encAddress.substr(32,encAddress.length) + '0000000000000000000000000000'
    const promise1 = contract.methods.FIndexPut(fileTag, head, tail).send({
        gasLimit: 500000,
        from: account,
    });
    const promise2 = new Promise(async function(resolve, reject) {
        const hash = crypto.createHash('sha256');
        for await(const chunk of ipfs.cat(fileID)){
            hash.update(chunk);
        }
        resolve(hash.digest());
    })
    return Promise.all([promise1, promise2]).then(async value => {
        const fileTagStored = '0x' + value[1].toString('hex');
        return {
            flag: (fileTagStored === fileTag) && value[0].status,
            gasUsed: value[0].gasUsed,
        }
    })
}

/**
 * just get metadata
 * @param fileTag
 */
async function getMetadata(fileTag){
    fileTag = '0x' + fileTag.toString('hex');
    return await contract.methods.FIndexGet(fileTag).call().then(res => {
        const all = res.head.substr(2) + res.tail.substr(2);
        return {
            random: Buffer.from(all.substr(0, 32)),
            encAddress: Buffer.from(all.substr(32, 68)),
        }
    })
}


// Http part
const caller = require('axios');
const OPRF = require('oprf');
const baseUrl = args.base_url;

async function blindSign(fileKey) {
    while(true){
        const oprf = new OPRF();
        await oprf.ready;
        const masked = oprf.maskInput(fileKey);
        const sendData = oprf.encodePoint(masked.point, 'UTF-8');
        const salted = await caller.post(baseUrl + '/keyServer', {
            maskedPoint: sendData
        }).then(response => {
            return oprf.decodePoint(response.data.salted, 'UTF-8');
        })
        if(oprf.isValidPoint(salted)){
            return oprf.unmaskPoint(salted, masked.mask)
        }else{
            console.log('Error when signing key, start resign ...');
        }
    }

}

async function roundTrip(reqSize, resSize){
    const start = new Date().getTime();
    return await caller.post(baseUrl + '/roundTrip', {
        data: crypto.randomBytes(reqSize),
        resSize: resSize,
    }).then(()=>{
        return new Date().getTime() - start;
    })
}

async function contractGetRTT(){
    fileTag = '0x' + crypto.randomBytes(32).toString('hex');
    await contract.methods.FIndexGet(fileTag).call();
}

async function contractPutRTT(){
    const fileTag = '0x0000000000000000000000000000000000000000000000000000000000000001';
    return await contract.methods.FIndexPut(fileTag, fileTag, fileTag).send({
        gasLimit: 500000,
        from: account,
    }).then(res => {
        return {
            gasUsed: res.gasUsed
        };
    });
}

async function getOwner(fileTag){
    fileTag = '0x' + fileTag.toString('hex');
    return await contract.methods.UListGet(fileTag).call().then(res => {
        // console.log(res);
    })
}

async function putOwner(fileTag){
    fileTag = '0x' + fileTag.toString('hex');
    return await contract.methods.UListPut(fileTag, account).send({
        from: account,
        gasLimit: 500000,
    }).then(res => {
        // console.log(res);
        return {
            gasUsed: res.gasUsed
        };
    })
}

module.exports = {
    encrypt,
    encryptSync,
    decrypt,
    decryptSync,
    hash,
    hashSync,
    IPFSAdd,
    IPFSAddSync,
    IPFSCat,
    IPFSCatSync,
    dedupCheck,
    updateMetadata,
    getMetadata,
    initWeb3,
    blindSign,
    roundTrip,
    contractGetRTT,
    contractPutRTT,
    getOwner,
    putOwner,
}