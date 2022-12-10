// const OPRF = require('oprf')
// const oprf = new OPRF();
//
// async function IPFSCatSync(CID) {
//     let data = '';
//     for await (const chunk of ipfs.cat(CID)){
//         data += chunk;
//     }
//     return data;
// }
//
// async function test(){
//     await oprf.ready;
//     const input = '11111';
//     const masked = oprf.maskInput(input);
//     const secretKey = "5ee51e8a6bf45a877c1c6deec0a270c7502fdf09dfd15598fdc089692182dd0e";
//     const maskedPoint = masked.point;
//     const salted = oprf.scalarMult(maskedPoint, Buffer.from(secretKey, 'hex'));
//     const unmasked = oprf.unmaskPoint(salted, masked.mask);
//     console.log(unmasked);
// }


const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const basePath = "E:/TestData/GoLang/";

async function getHashes(_path, writePath) {
    let files = [];
    try {
        files = fs.readdirSync(_path);
    } catch (e) {
        console.log('Error reading directory');
    }
    if (files.length > 0) {
        for (const file of files) {
            const fullPath = path.join(_path, file);
            if (fs.lstatSync(fullPath).isFile()) {
                const hash = crypto.createHash('sha256');
                hash.update(fs.readFileSync(fullPath));
                const data = fullPath + ','
                    + hash.digest('hex') + ','
                    + fs.statSync(fullPath)['size'] + '\n';
                fs.writeFileSync(writePath, data, {flag: "a"});
            } else if (fs.lstatSync(fullPath).isDirectory()) {
                await getHashes(fullPath, writePath);
            } else {
                console.log('Unhandled file type');
            }
        }
    }
}

async function remove(_path) {
    let files = [];
    try {
        files = fs.readdirSync(_path);
    } catch (e) {
        console.log('Error reading directory');
    }
    if (files.length > 0) {
        for (const file of files) {
            const fullPath = path.join(_path, file);
            if (fs.lstatSync(fullPath).isFile()) {
                await fs.rmSync(fullPath);
            } else if (fs.lstatSync(fullPath).isDirectory()) {
                await remove(fullPath);
                await fs.rmdirSync(fullPath);
            } else {
                await fs.unlinkSync(fullPath);
            }
        }
    }
}

async function test(){
    const files = fs.readdirSync(basePath);
    if(files){
        for (const file of files){
            const fullPath = basePath + file;
            if(fs.lstatSync(fullPath).isDirectory()){
                console.log('Hashing ' + fullPath + ' ...');
                // await fs.writeFileSync(fullPath+'.txt', 'path,hash,size\n');
                // await getHashes(fullPath, fullPath + '.txt');
                await remove(fullPath);
                await fs.rmdirSync(fullPath);
                console.log("Hashing Finished\n");
                await setTimeout(()=>{},2000);
            }else if(fs.statSync(fullPath).isFile()){
                await fs.rmSync(fullPath);
            }
        }
        await fs.rmdirSync(basePath);
    }else{
        console.log("Empty directory");
    }
}


test()
// getHashes(filePath);
// console.log(1111);