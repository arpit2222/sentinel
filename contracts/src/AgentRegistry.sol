// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AgentRegistry {
  address public owner;

  enum AgentType { Monitor, Executor, RiskScorer }
  
  struct Agent {
    string id;
    address agentOwner;
    AgentType agentType;
    bool isActive;
    uint successCount;
    uint failCount;
    uint8 riskScore; // 0-100
    uint lastExecution;
  }
  
  mapping(string => Agent) public agents;
  
  event AgentRegistered(string indexed id);
  event AgentStatusUpdated(string indexed id, bool active);
  event ExecutionReported(string indexed agentId, bool success);

  modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
  }

  constructor() {
    owner = msg.sender;
  }
  
  function registerAgent(string calldata id, AgentType agentType) external {
    agents[id] = Agent(id, msg.sender, agentType, true, 0, 0, 95, 0);
    emit AgentRegistered(id);
  }
  
  function updateAgentStatus(string calldata id, bool active) external onlyOwner {
    agents[id].isActive = active;
    emit AgentStatusUpdated(id, active);
  }
  
  function reportExecution(string calldata id, bool success) external {
    // Basic implementation: anyone can report for now
    if (success) agents[id].successCount++;
    else agents[id].failCount++;
    agents[id].lastExecution = block.timestamp;
    emit ExecutionReported(id, success);
  }
  
  function getSuccessRate(string calldata id) external view returns (uint) {
    Agent memory agent = agents[id];
    uint total = agent.successCount + agent.failCount;
    if (total == 0) return 100;
    return (agent.successCount * 100) / total;
  }
}
