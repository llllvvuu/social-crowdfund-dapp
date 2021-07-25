// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import '@openzeppelin/contracts/utils/math/SafeMath.sol';

contract Crowdfund {
    using SafeMath for uint256;

    struct Campaign {
        // TODO: earmarks
        address admin;
        bool hasGoal;
        bool refundable;
        bool disbursed;
        uint goal;
        uint deadline; // block
        uint balance;
    }

    event CampaignStarted(
        address admin,
        bool hasGoal,
        uint goal,
        uint deadline
    );
    event Donation(address donor, address referrer, uint amount, uint campaignId);
    event Disbursement(uint campaignId, address recipient, uint amount);
    event Refund(uint campaignId, address donor, uint amount);

    uint nextCampaign = 0;
    mapping (uint => Campaign) public campaigns;
    mapping (uint => mapping(address => uint)) public contributions;
    mapping (uint => mapping(address => uint)) public referrals;
    mapping (uint => mapping(uint => address)) public leaderboards;

    function startCampaign(bool hasGoal, uint goal, uint deadline) external payable {
        campaigns[nextCampaign] = Campaign(
            msg.sender,
            hasGoal,
            false,
            false,
            goal,
            deadline,
            msg.value
        );
        contributions[nextCampaign][msg.sender] = msg.value;
        nextCampaign = nextCampaign.add(1);
        emit CampaignStarted(msg.sender, hasGoal, goal, deadline);
    }

    function donate(uint campaignId, address referrer) external payable {
        Campaign storage campaign = campaigns[campaignId];
        require(!campaign.refundable, 'r');
        require(!(campaign.hasGoal && block.number > campaign.deadline), 'd');
        campaign.balance = campaign.balance.add(msg.value);
        contributions[campaignId][msg.sender] =
            contributions[campaignId][msg.sender].add(msg.value);

        if (referrer != address(0)) {
            uint referralAmount = referrals[campaignId][referrer].add(
                msg.value
            );
            referrals[campaignId][referrer] = referralAmount;

            // update leaderboard
            mapping (uint => address) storage leaderboard = leaderboards[campaignId];
            address swp1;
            address swp2;
            bool updating = false;
            address updateAddress = address(0);
            for (uint i = 0; i < 10; i++) {
                if (leaderboard[i] == referrer) {
                    break;
                }
                if (updateAddress == address(0) &&
                    referralAmount > referrals[campaignId][leaderboard[i]])
                {
                    updateAddress = referrer;
                    swp1 = referrer;
                    updating = true;
                }
                if (updating) {
                    swp2 = leaderboard[i];
                    leaderboard[i] = swp1;
                    swp1 = swp2;
                    if (swp1 == updateAddress) {
                        break;
                    }
                }
            }
        }

        emit Donation(msg.sender, referrer, msg.value, campaignId);
    }

    function disburse(uint campaignId, address recipient, uint amount) external {
        Campaign storage campaign = campaigns[campaignId];
        require(msg.sender == campaign.admin, 'admin');
        require(campaign.balance >= amount, 'b');
        require(!campaign.refundable, 'r');
        require(!(campaign.hasGoal && campaign.balance < campaign.goal), 'g');
        campaign.balance = campaign.balance.sub(amount);
        campaign.disbursed = true;
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "tf");
        emit Disbursement(campaignId, recipient, amount);
    }

    function activateRefund(uint campaignId) external {
        Campaign storage campaign = campaigns[campaignId];
        require(msg.sender == campaign.admin, 'admin');
        require(!campaign.disbursed, 'dis');
        campaign.refundable = true;
    }

    function refund(uint campaignId, address payable refundee) external {
        Campaign storage campaign = campaigns[campaignId];
        if (!campaign.refundable) {
            require(
                campaign.hasGoal &&
                campaign.balance < campaign.goal &&
                block.number > campaign.deadline
            );
        }
        uint contribution = contributions[campaignId][refundee];
        contributions[campaignId][refundee] = 0;
        campaign.balance = campaign.balance.sub(contribution);
        (bool success, ) = refundee.call{value: contribution}("");
        require(success, "tf");
        emit Refund(campaignId, refundee, contribution);
    }

    function referralLeaderboard(uint campaignId) external view
        returns(address[10] memory addrs, uint[10] memory scores)
    {
        mapping (uint => address) storage leaderboard = leaderboards[campaignId];
        for (uint i = 0; i < 10; i++) {
            addrs[i] = leaderboard[i];
            scores[i] = referrals[campaignId][leaderboard[i]];
        }
    }
}
