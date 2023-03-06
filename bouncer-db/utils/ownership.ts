import { Owner } from "../types/wallet.js";

// No of nfts held per owner, as well as tokenIds owned
export const getDetailedBalancesFromTxes = (txes: any[], project: any) => {
  let balances = new Map<string, Owner>();
  balances.set(
    project.ownerAddress,
    new Owner(project.ownerAddress, getInitialTokens(project.tokenIds), false)
  );

  txes.forEach((tx) => {
    if (balances.has(tx.fromAddress)) {
      const ownerTokenBalances = balances.get(tx.fromAddress)!.tokensBalances;
      const ownerTokenBalance = ownerTokenBalances.get(tx.tokenId);

      ownerTokenBalances.set(
        tx.tokenId,
        ownerTokenBalance === undefined ? -1 : ownerTokenBalance - 1
      );
    } else {
      // May have 0xapi tx (which has transferBatch event signature), which is not yet supported
      // Can just ignore, will still resolve to correct final values
    }

    if (balances.has(tx.toAddress)) {
      const ownerTokenBalances = balances.get(tx.toAddress)!.tokensBalances;
      const ownerTokenBalance = ownerTokenBalances.get(tx.tokenId);

      ownerTokenBalances.set(
        tx.tokenId,
        ownerTokenBalance === undefined ? 1 : ownerTokenBalance + 1
      );
    } else {
      const ownerTokenBalances = new Map<string, number>();
      ownerTokenBalances.set(tx.tokenId, 1);

      balances.set(tx.toAddress, new Owner(tx.toAddress, ownerTokenBalances));
    }
  });

  // Filter negative or zero tokens
  for (let [walletAddress, owner] of Array.from(balances.entries())) {
    for (let [tokenId, tokenBalance] of Array.from(
      owner.tokensBalances.entries()
    )) {
      if (tokenBalance <= 0) {
        owner.tokensBalances.delete(tokenId);
      }
    }

    if (owner.tokensBalances.size === 0) {
      balances.delete(walletAddress);
    }
  }

  return balances;
};

export const getInitialTokens = (tokenIds: string[]): Map<string, number> => {
  const tokenBalances = new Map<string, number>();

  for (let tokenId of tokenIds) {
    tokenBalances.set(tokenId, 1);
  }

  return tokenBalances;
};
