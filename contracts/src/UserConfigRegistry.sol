// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UserConfigRegistry {
  address public owner;

  struct Position {
    string id;
    string protocolId;
    address collateralToken;
    uint collateralAmount;
    address debtToken;
    uint debtAmount;
    bool monitored;
    uint rescueCount;
    uint lastRescueTime;
  }
  
  struct UserConfig {
    string[] whitelistedProtocols;
    string[] whitelistedAgents;
    address[] whitelistedCollaterals;
    address[] blacklistedTokens;
    uint maxRepayPercent;
    uint minTimeToLiquidation;
    address preferredStablecoin;
    bool autoRepayEnabled;
    bytes parentDelegation;
    address monitorAgent;
    address executorAgent;
    uint maxRepayPerTx;
    uint delegationValidUntil;
  }
  
  mapping(address => UserConfig) public configs;
  mapping(address => Position[]) public userPositions;
  
  event ConfigUpdated(address indexed user);
  event PositionAdded(address indexed user, string positionId);
  event RescueRecorded(address indexed user, string positionId);

  modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
  }

  constructor() {
    owner = msg.sender;
  }
  
  function setUserWhitelist(
    string[] calldata protocols,
    string[] calldata agents,
    address[] calldata collaterals
  ) external {
    UserConfig storage config = configs[msg.sender];
    
    delete config.whitelistedProtocols;
    for(uint i = 0; i < protocols.length; i++) {
        config.whitelistedProtocols.push(protocols[i]);
    }
    
    delete config.whitelistedAgents;
    for(uint i = 0; i < agents.length; i++) {
        config.whitelistedAgents.push(agents[i]);
    }
    
    delete config.whitelistedCollaterals;
    for(uint i = 0; i < collaterals.length; i++) {
        config.whitelistedCollaterals.push(collaterals[i]);
    }
    
    emit ConfigUpdated(msg.sender);
  }
  
  function addPosition(Position calldata pos) external {
    userPositions[msg.sender].push(pos);
    emit PositionAdded(msg.sender, pos.id);
  }
  
  function recordRescue(string calldata posId) external {
    // Find position, increment rescueCount
    Position[] storage positions = userPositions[msg.sender];
    for(uint i = 0; i < positions.length; i++) {
        if(keccak256(bytes(positions[i].id)) == keccak256(bytes(posId))) {
            positions[i].rescueCount++;
            positions[i].lastRescueTime = block.timestamp;
            break;
        }
    }
    emit RescueRecorded(msg.sender, posId);
  }
  
  function getUserConfig(address user) external view returns (UserConfig memory) {
    return configs[user];
  }
  
  function disableDelegation(address user) external {
    require(msg.sender == user || msg.sender == owner, "Not authorized");
    configs[user].autoRepayEnabled = false;
    emit ConfigUpdated(user);
  }
}
