const HoneyPot = artifacts.require('HoneyPot');

contract('HoneyPot', function(accounts) {
  it('HoneyPot testing', async function() {
    // This give a truffle abstraction which allow us to interact with our contracts.
    const contract = await HoneyPot.deployed();

    // Call the put function with value
    await contract.put({value: 6000000});
    // Get sender account balance information
    // Because in default the first address in Avaiable accounts of testrpc is sender
    const putBalance = await contract.balances.call(accounts[0]);
    // Get the value of balance
    const putAmount = putBalance.c[0];

    assert.equal(putAmount, 6000000, 'Put function');

    // Call the get function to get back ether
    await contract.get();
    const getBalance = await contract.balances.call(accounts[0]);
    const getAmount = getBalance.c[0];

    assert.equal(getAmount, 0, 'Get function');
  });
});
