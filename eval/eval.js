const fs = require('fs');
const utils = require('../src/utils');
const args = require('minimist')(process.argv.slice(2));
const basePath = "E:/TestData/randData/";
const reps = 1;
const nameSets = [
     '1KB.txt',  '2KB.txt',  '4KB.txt',  '8KB.txt', '16KB.txt',
    '32KB.txt', '64KB.txt', '128KB.txt', '256KB.txt', '512KB.txt',
     '1MB.txt', '2MB.txt', '4MB.txt', '8MB.txt', '16MB.txt',
    '32MB.txt', '64MB.txt'
]
async function evaluate(){
    let scheme;
    switch (args['mode']) {
        case 'plaintext': scheme = require('./plaintext');break;
        case 'mle' : scheme = require('./mle');break;
        case 'dupless' : scheme = require('./DupLESS');break;
        case 'dcsdedup' : {
            scheme = require('./dcsdedup');
            await utils.initWeb3('ganache');
            break;
        }
    }
    await warmUp();
    const storePath = './eval/store.txt';
    const retrievePath = './eval/retrieve.txt';
    const gasPath = './eval/gas.txt';
    fs.writeFileSync(storePath, '\n'+args['mode']+',',{flag:'a'});
    fs.writeFileSync(retrievePath, '\n'+args['mode']+',',{flag:'a'});
    fs.writeFileSync(gasPath, '\n'+args['mode']+',',{flag:'a'});
    for(const filename of nameSets){
        console.log('Testing ' + filename + ' ...');
        const filePath = basePath + filename;
        let storeTime = 0, retTime = 0, gasUsed = 0;
        for(let rep = 0; rep < reps; rep ++){
            const stInfo = await scheme.storeFile(filePath);
            await setTimeout(()=>{},2000);
            gasUsed += stInfo.gasUsed
            const retInfo = await scheme.retrieveFile(stInfo);
            storeTime += stInfo.timeCost; retTime += retInfo.timeCost;
        }
        fs.writeFileSync(storePath, storeTime/reps+',',{flag:'a'})
        fs.writeFileSync(retrievePath, retTime/reps+',',{flag:'a'})
        fs.writeFileSync(gasPath, gasUsed/reps+',',{flag:'a'})
    }
}

async function warmUp(){
    const filePath = basePath + nameSets[0];
    for(let i = 0; i< 10;i++){
        const scheme = require('./plaintext');
        await scheme.storeFile(filePath);
    }
}

evaluate();