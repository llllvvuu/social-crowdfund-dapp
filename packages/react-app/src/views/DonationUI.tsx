import React, { useState } from "react";

import { Button, Divider, Input, Modal, Progress } from "antd";
import { FacebookOutlined, TwitterOutlined } from "@ant-design/icons";
import { ethers } from "ethers";

import { useContractReader } from "src/hooks";
import NFTSmall from "src/components/NFTSmall";
import NFTLarge from "src/components/NFTLarge";

const LEADERBOARD_SPOTS = 10;

interface DonationUIProps {
  tx?: any;
  readContracts?: any;
  contract?: ethers.Contract;
  address?: string;
};

function currency(str: string) {
    if (str.includes('.')) {
        const parts = str.split('.');
        if (parts[1] === '0' || parts[1].length === 0) {
          return parts[0];
        } else if (parts[1].length === 1) {
          return `${parts[0]}.${parts[1]}0`;
        }
        return parts[0] + '.' + parts[1].slice(0, 2);
    }
    return str;
}

const DonationUI: React.FunctionComponent<DonationUIProps> = (props) => {
  const urlParams = new URLSearchParams(window.location.search);
  const referrer = urlParams.get("referrer");
  // const campaignId = urlParams.get("campaignId");
  const campaignId = 0;

  const { readContracts, contract, tx, address } = props;
  const [donationAmount, setDonationAmount] = React.useState<string>("");
  const [shareOpen, setShareOpen] = React.useState<boolean>(false);
  const donationValid = !isNaN(Number(donationAmount)) && Number(donationAmount) > 0;
  const openShare = () => setShareOpen(true);
  const closeShare = () => setShareOpen(false);

  let yourContribution: any = useContractReader(readContracts, "Crowdfund", "contributions", [campaignId, address]);
  yourContribution = yourContribution && currency(ethers.utils.formatUnits(yourContribution, "gwei"));
  const leaderboard: any = useContractReader(readContracts, "Crowdfund", "referralLeaderboard", [campaignId]);
  const campaign: any = useContractReader(readContracts, "Crowdfund", "campaigns", [campaignId]);
  const donated = campaign && currency(ethers.utils.formatUnits(campaign.balance, "gwei"));
  const hasGoal = campaign?.hasGoal;
  const goal = campaign && currency(ethers.utils.formatUnits(campaign.goal, "gwei"));
  const deadline = campaign?.deadline.toString();
  const getRank = (donor: string) => leaderboard?.addrs.findIndex(
    (addr: string) => addr.toLowerCase() === donor?.toLowerCase()
  );
  const referrerRank = referrer && getRank(referrer);
  const myRank = address && getRank(address);
  const twitterLink = `https://twitter.com/intent/tweet?text=https%3A%2F%2Ftribute.desci.pub%2F%3FcampaignId%3D${campaignId}%26referrer%3D${address}`;
  const fbLink = `https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Ftribute.desci.pub%2F%3FcampaignId%3D${campaignId}%26referrer%3D${address}&amp;src=sdkpreparse`;

  const newButton = <Button>Create new campaign</Button>
  const donationBox = (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h2>Qualia Research Institute</h2>
        {referrer && <>
          Referrer: {referrer.slice(0, 10)}...
          <NFTSmall rank={referrerRank} address={referrer} style={{ marginBottom: -5, marginLeft: 5 }} />
        </>}
        {hasGoal && <>
          <Divider />
          <h4>Deadline: Block {deadline.length > 20 ? `${Number(deadline).toPrecision(20)}` : `${deadline}`}</h4>
          <h4>${donated} raised of ${goal} goal</h4>
          <Progress percent={100.0 * donated/goal} showInfo={false} />
        </>}
        <Divider />
        <div style={{ margin: 8 }}>
          <Input
            onChange={e => {
              setDonationAmount(e.target.value);
            }}
            suffix={<Button
              disabled={!donationValid || !tx || !contract}
              onClick={async () => {
                if (donationValid && tx && contract) {
                  /* notice how you pass a call back for tx updates too */
                  const result = tx(
                    contract.donate(
                      0,
                      referrer,
                      { value: ethers.utils.parseUnits(donationAmount, "gwei") },
                    ),
                    (update: any) => {
                      console.log("📡 Transaction Update:", update);
                      if (update && (update.status === "confirmed" || update.status === 1)) {
                        console.log(" 🍾 Transaction " + update.hash + " finished!");
                        console.log(
                          " ⛽️ " +
                          update.gasUsed +
                          "/" +
                          (update.gasLimit || update.gas) +
                          " @ " +
                          parseFloat(update.gasPrice) / 1000000000 +
                          " gwei",
                        );
                      }
                    }
                  );
                  console.log("awaiting metamask/web3 confirm result...", result);
                  console.log(await result);
                }
              }}
            >
              Donate
            </Button>}
          />
        </div>
        <div>
          <h4>Your contribution: ${yourContribution}</h4>
          <Button onClick={openShare} disabled={!address}>Share</Button>
          <Modal title="Share" visible={shareOpen} footer={null} onCancel={closeShare}>
          <NFTLarge
            rank={myRank}
            address={address || ethers.constants.AddressZero}
            style={{ marginBottom: "1em" }}
          />
            <br />
            <Button
              type="text"
              icon={<TwitterOutlined style={{ color: "#1DA1F2", fontSize: "1.5em" }} />}
              href={twitterLink}
              target="_blank"
            />
            <Button
              type="text"
              icon={<FacebookOutlined style={{ color: "#4267B2", fontSize: "1.5em" }} />}
              href={fbLink}
              target="_blank"
            />
          </Modal>
        </div>
        <Divider />
        <h3>Referral Leaderboard</h3>
        <table style={{ width: "100%" }}>
          <tr>
            <td style={{ textAlign: "left" }}><h4>Address</h4></td>
            <td style={{ textAlign: "right" }}><h4>Referrals Raised</h4></td>
          </tr>
          {leaderboard?.addrs?.filter(
              (addr: string) => addr !== ethers.constants.AddressZero).map(
              (addr: string, i: number) => (<tr>
                  <td style={{ textAlign: "left" }}>
                    <NFTSmall rank={i} address={addr} style={{ marginRight: 5, marginBottom: -5 }} />
                      <a href={`https://rinkeby.etherscan.io/address/${addr}`} target="_blank">
                        {addr.slice(0, 10)}...
                      </a>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    ${currency(ethers.utils.formatUnits(leaderboard.scores[i], "gwei"))}
                  </td>
                </tr>)
          )}
        </table>
      </div>
    </div>
  );

  return (campaign && campaign.admin !== ethers.constants.AddressZero) ? donationBox : newButton;
};

export default DonationUI;
