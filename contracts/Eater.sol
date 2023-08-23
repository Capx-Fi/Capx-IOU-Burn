// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; // Import SafeERC20 library
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // Import IERC20 interface

contract ClaimCapx is Pausable, Ownable {
    using SafeERC20 for IERC20; // Use SafeERC20 library

    IERC20 public CAPX;
	IERC20 public xCAPX;

    mapping (IERC20=>uint256) public tokenBalances;
    mapping (address=>uint256) public claimMap;

    constructor(address _CAPXAddress, address _xCAPXAddress) {
		CAPX = IERC20(_CAPXAddress);
		xCAPX = IERC20(_xCAPXAddress);
	}

    // Deposit ERC20 tokens into the contract
    function depositToken(IERC20 token, uint256 amount) external onlyOwner {
        require(token == CAPX, "Should Be capx token");
        require(amount > 0, "Amount must be greater than 0");

        tokenBalances[token] += amount;
        token.safeTransferFrom(msg.sender, address(this), amount);
    }


    function _burnIOU(IERC20 iouToken, uint256 amount) internal {
        require(iouToken==xCAPX,"Not a valid CAPX IOU Token");
        claimMap[msg.sender] += amount;
       iouToken.safeTransferFrom(msg.sender, address(this), amount);
    }

    function _claimIOU(IERC20 iouToken, uint256 amount) internal {
         require(iouToken==xCAPX,"Not a valid CAPX IOU Token");
        claimMap[msg.sender] -= amount;
        tokenBalances[CAPX] -= amount;
        CAPX.safeTransfer(msg.sender, amount);
    }

    function burnIOU(IERC20 iouToken, uint256 amount) external {

        _burnIOU(iouToken, amount);
        
    }

    function claimIOU(IERC20 iouToken, uint256 amount) external {

        _claimIOU(iouToken, amount);
        
    }

    function burnAndClaim(IERC20 iouToken, uint256 amount) external {
        _burnIOU(iouToken, amount);
        _claimIOU(iouToken, amount);
    }


}
