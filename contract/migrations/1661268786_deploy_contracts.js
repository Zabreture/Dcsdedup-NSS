let dcsdedup = artifacts.require("dcsdedup");



module.exports = async function(_deployer) {
  // Use deployer to state migration tasks.
    _deployer.deploy(dcsdedup);
    let instance = await dcsdedup.deployed();
    let args = require('../../src/args.json');
    args.contract_abi = instance.abi;
    args.contract_address = instance.address;

};
