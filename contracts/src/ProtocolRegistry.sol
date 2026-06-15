// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProtocolRegistry {
  address public owner;

  struct Protocol {
    string id;
    string name;
    uint chainId;
    address poolAddress;
    address oracleAddress;
    uint16 liquidationThreshold; // 8000 = 80%
    uint16 liquidationPenalty; // 1500 = 15%
    bool isActive;
    uint8 riskScore; // 0-100
    uint tvl;
    uint lastUpdated;
    bytes metadata; // JSON
  }
  
  mapping(string => Protocol) public protocols;
  mapping(uint => string[]) public protocolsByChain;
  
  event ProtocolAdded(string indexed id);
  event ProtocolUpdated(string indexed id);

  modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
  }

  constructor() {
    owner = msg.sender;
  }
  
  function addProtocol(Protocol memory p) external onlyOwner {
    protocols[p.id] = p;
    protocolsByChain[p.chainId].push(p.id);
    emit ProtocolAdded(p.id);
  }
  
  function updateProtocolRisk(string calldata id, uint8 score) external onlyOwner {
    protocols[id].riskScore = score;
    protocols[id].lastUpdated = block.timestamp;
    emit ProtocolUpdated(id);
  }
  
  function getProtocolsByChain(uint chainId) external view returns (string[] memory) {
    return protocolsByChain[chainId];
  }
  
  function isProtocolActive(string calldata id) external view returns (bool) {
    return protocols[id].isActive;
  }
}
