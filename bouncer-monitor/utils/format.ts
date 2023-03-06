import ethers from "ethers";
import { BigNumber } from "ethers";

// For wei only
export const bigNumberWeiToNumber = (value: BigNumber) => {
  return parseFloat(ethers.utils.formatEther(value));
};

export const BNtoInt = (BN: BigNumber) => {
  return parseInt(BN.toString());
};
