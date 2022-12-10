// const fs = require('fs');
// const path = require('path');
// const crypto = require('crypto');
// const basePath = "E:/TestData/GoLang/";
//
// async function getHashes(_path, writePath) {
//     let files = [];
//     try {
//         files = fs.readdirSync(_path);
//     } catch (e) {
//         console.log('Error reading directory');
//     }
//     if (files.length > 0) {
//         for (const file of files) {
//             const fullPath = path.join(_path, file);
//             if (fs.lstatSync(fullPath).isFile()) {
//                 const hash = crypto.createHash('sha256');
//                 hash.update(fs.readFileSync(fullPath));
//                 const data = fullPath + ','
//                     + hash.digest('hex') + ','
//                     + fs.statSync(fullPath)['size'] + '\n';
//                 fs.writeFileSync(writePath, data, {flag: "a"});
//             } else if (fs.lstatSync(fullPath).isDirectory()) {
//                 await getHashes(fullPath, writePath);
//             } else {
//                 console.log('Unhandled file type');
//             }
//         }
//     }
// }
//
// async function remove(_path) {
//     let files = [];
//     try {
//         files = fs.readdirSync(_path);
//     } catch (e) {
//         console.log('Error reading directory');
//     }
//     if (files.length > 0) {
//         for (const file of files) {
//             const fullPath = path.join(_path, file);
//             if (fs.lstatSync(fullPath).isFile()) {
//                 await fs.rmSync(fullPath);
//             } else if (fs.lstatSync(fullPath).isDirectory()) {
//                 await remove(fullPath);
//                 await fs.rmdirSync(fullPath);
//             } else {
//                 await fs.unlinkSync(fullPath);
//             }
//         }
//     }
// }
//
// async function handleData(){
//     const files = fs.readdirSync(basePath);
//     if(files){
//         for (const file of files){
//             const fullPath = basePath + file;
//             if(fs.lstatSync(fullPath).isDirectory()){
//                 console.log('Hashing ' + fullPath + ' ...');
//                 // await fs.writeFileSync(fullPath+'.txt', 'path,hash,size\n');
//                 // await getHashes(fullPath, fullPath + '.txt');
//                 await remove(fullPath);
//                 await fs.rmdirSync(fullPath);
//                 console.log("Hashing Finished\n");
//                 await setTimeout(()=>{},2000);
//             }else if(fs.statSync(fullPath).isFile()){
//                 await fs.rmSync(fullPath);
//             }
//         }
//         await fs.rmdirSync(basePath);
//     }else{
//         console.log("Empty directory");
//     }
// }




// // Test server code
// const toServer = require('../src/toServer');
//
// async function testKeyServer(){
//     // await toServer.init()
//     const hash = crypto.createHash('sha256').update('test').digest('hex');
//     console.log(hash);
//     const res = await toServer.blindSign(hash);
//     console.log(Buffer.from(res).toString('hex'));
// }


// // Web3 test code
// const utils = require('../src/utils');
// const args = require('../src/args.json');
// const crypto = require('crypto');
// const base58 = require('bs58');
// const reps = 20;
//
// async function test(){
//     const fileKey = Buffer.from('cc4718f93705b277ff80a59bddbbad9466b9cbfbcb65bf7c4423e7e9a77ca437', 'hex');
//     const random = crypto.randomBytes(16);
//     const fileID = await utils.IPFSAdd('E:/TestData/randData/1GB.txt');
//     utils.initWeb3('ganache')
//
//     let latency = 0, gas = 0;
//     for(let i = 0; i < reps; i ++){
//         const start = new Date().getTime();
//         await utils.getMetadata(fileKey);
//         const cost = new Date().getTime()-start;
//         console.log('FIndexGet round '+i+': ' + cost + ' ms');
//         latency += cost/reps;
//     }
//     console.log(latency);
//
//     latency = 0;
//     Gas = 0;
//     for(let i = 0; i < reps; i ++){
//         const start = new Date().getTime();
//         const gas = (await utils.contractPutRTT()).gasUsed;
//         const cost = new Date().getTime()-start;
//         console.log('FIndexPut round '+i+': ' + cost + ' ms, ' + gas + ' gas');
//         latency += cost/reps;
//         Gas += gas/reps;
//     }
//     console.log(latency);
//     console.log(Gas);
//
//
//     // UList
//     for(let i = 0; i < reps; i ++){
//         const start = new Date().getTime();
//         await utils.getOwner(fileKey);
//         const cost = new Date().getTime()-start;
//         console.log('UListGet round '+i+': ' + cost + ' ms');
//         latency += cost/reps;
//     }
//     console.log(latency);
//
//     latency = 0;
//     Gas = 0;
//     for(let i = 0; i < reps; i ++){
//         const start = new Date().getTime();
//         const gas = (await utils.putOwner(fileKey,random, fileID, fileID)).gasUsed;
//         const cost = new Date().getTime()-start;
//         console.log('UListPut round '+i+': ' + cost + ' ms, ' + gas + ' gas');
//         latency += cost/reps;
//         Gas += gas/reps;
//     }
//     console.log(latency);
//     console.log(Gas);
// }
const fs = require('fs');
const crypto = require('crypto');

function test(path){
    const hash = crypto.createHash('sha256');
    const readStream = fs.createReadStream(path);
    readStream.on('end',()=>{
        console.log(hash.digest('hex'));
    }).pipe(hash);
}


test('D:\\NutCloud\\BoAndHarry\\DCSDedup\\nss2022\\paper\\dcsdedup.pdf')
test('D:\\Download\\NSS_2022_paper_52.pdf')
