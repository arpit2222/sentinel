// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "forge-std/interfaces/IERC20.sol";

contract MockLendingPool {
    mapping(address => mapping(address => uint256)) public userCollateral; // user => token => amount
    mapping(address => mapping(address => uint256)) public userDebt; // user => token => amount

    event Repay(address indexed user, address indexed reserve, uint256 amount);

    function deposit(address token, uint256 amount) external {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        userCollateral[msg.sender][token] += amount;
    }

    function borrow(address token, uint256 amount) external {
        // Mock borrow without proper LTV check for testing
        userDebt[msg.sender][token] += amount;
        IERC20(token).transfer(msg.sender, amount);
    }

    function repay(address reserve, uint256 amount, address onBehalfOf) external {
        IERC20(reserve).transferFrom(msg.sender, address(this), amount);
        userDebt[onBehalfOf][reserve] -= amount;
        emit Repay(onBehalfOf, reserve, amount);
    }
}
