import { utils } from "ethers";

export const verifyEthSignature = (
  signature: string,
  walletAddress: string,
  nonce: string
): boolean => {
  try {
    const message = `Please sign your wallet for verification\n\nNonce: ${nonce}`;
    const walletAddressRes = utils.verifyMessage(message, signature);

    return walletAddressRes === walletAddress;
  } catch (err) {
    return false;
  }
};
