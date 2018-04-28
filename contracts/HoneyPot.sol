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
