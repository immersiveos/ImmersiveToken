pragma solidity ^0.4.11;

import './Ownable.sol';
/*
 * Contactable token
 * Basic version of a contactable contract
 */
contract Contactable is Ownable{

     string public contactInformation;

     function setContactInformation(string info) onlyOwner{
         contactInformation = info;
     }

}
