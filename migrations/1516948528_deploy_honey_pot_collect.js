const HoneyPot = artifacts.require('HoneyPot');
const HoneyPotCollect = artifacts.require('HoneyPotCollect');

module.exports = function(deployer) {
  // Use deployer to state migration tasks.
  deployer.deploy(HoneyPot).then(function() {
    // deploy HoneyPotCollect with HoneyPot contract address is constructor arguments 
    return deployer.deploy(HoneyPotCollect, HoneyPot.address);
  });
};
