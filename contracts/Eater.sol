// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; // Import SafeERC20 library
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // Import IERC20 interface

contract Eater is Pausable, Ownable {
    using SafeERC20 for IERC20; // Use SafeERC20 library

    mapping (address=>uint256) public tokenBalances;
    mapping (address=>address) public iouMap;
    mapping (address=>mapping (address=>uint256)) claimMap;


    // Safe transfer of ERC20 tokens using safeERC20
    function _safeTransferERC20(
        address token,
        address to,
        uint256 amount
    ) internal {
        IERC20(token).safeTransfer(to, amount);
    }

    // Safe transferFrom of ERC20 tokens using safeERC20
    function _safeTransferFromERC20(
        address token,
        address from,
        address to,
        uint256 amount
    ) internal {
        IERC20(token).safeTransferFrom(from, to, amount);
    }

    // Deposit ERC20 tokens into the contract
    function depositToken(address token, uint256 amount) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than 0");

        tokenBalances[token] += amount;
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
    }

    function updateIouMap(address iouAddress, address tokenAddress) external onlyOwner {
        
        require(iouAddress != address(0) && tokenAddress != address(0), "Invalid token address");

        iouMap[tokenAddress] = iouAddress;
        
    }

    function _burnIOU(address iouToken, uint256 amount) internal {
        require(iouMap[iouToken]!=address(0),"Not a valid IOU Token");
        claimMap[msg.sender][iouToken] += amount;
        _safeTransferFromERC20(iouMap[iouToken], msg.sender, address(this), amount);
    }

    function _claimIOU(address iouToken, uint256 amount) internal {
        require(iouMap[iouToken]!=address(0),"Not a valid IOU Token");
        claimMap[msg.sender][iouToken] -= amount;
        address actualToken = iouMap[iouToken];
        tokenBalances[actualToken] -= amount;
        _safeTransferERC20(actualToken, msg.sender, amount);
    }

    function burnIOU(address iouToken, uint256 amount) external {

        _burnIOU(iouToken, amount);
        
    }

    function claimIOU(address iouToken, uint256 amount) external {

        _claimIOU(iouToken, amount);
        
    }

    function burnAndClaim(address iouToken, uint256 amount) external {
        _burnIOU(iouToken, amount);
        _claimIOU(iouToken, amount);
    }


}
