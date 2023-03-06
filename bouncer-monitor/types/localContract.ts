import ethers from "ethers";
import { Contract, BigNumber } from "ethers";
import { TransferEvent } from "./localEvent.js";

import { openseaStorefrontContract } from "../contracts/contracts.js";
import { genericLogger, queueLogger } from "../logger/logger.js";
import { eventQueue } from "../queue/queue.js";

export const ERC20 = "ERC20";
export const ERC721 = "ERC721";
export const ERC1155 = "ERC1155";

// Data Transfer Object for ethers Contract class
// Avoids making more calls to ethers than necessary
export class LocalContract {
  readonly ethersContract: Contract;
  readonly contractType: string;
  symbol!: string;

  constructor(ethersContract: Contract, contractType: string) {
    this.ethersContract = ethersContract;
    this.contractType = contractType;
  }

  async getSymbol(): Promise<string> {
    if (this.contractType === ERC1155) {
      return `opensea storefront project`;
    }

    if (this.symbol === undefined) {
      this.symbol = await this.ethersContract.symbol();
    }

    return this.symbol;
  }

  getAddress(): string {
    return this.ethersContract.address;
  }

  addEventListener(eventName: string) {
    if (eventName === TransferEvent.eventName) {
      const transferEvent = TransferEvent.fromEventType(this.contractType);

      genericLogger.info(`addEventListener: listening`);

      this.ethersContract.on(
        {
          topics: [ethers.utils.id(transferEvent.signature)],
        },
        async (...eventData) => {
          // TEST
          // genericLogger.info(eventData);
          transferEvent.setEventData(eventData, await this.getSymbol());

          genericLogger.info(
            `addEventListener: received ${await transferEvent.toString()}`
          );

          let transferEventJob;
          try {
            transferEventJob = await eventQueue.add(transferEvent.transferData);
          } catch (err) {
            genericLogger.error(
              `addEventListener ${await this.getSymbol()} error: ${err}`
            );
          }

          queueLogger.info(
            `eventQueue: ingested ${await transferEvent.toString()}`
          );
        }
      );
    }
  }
}

export class localOpenseaStorefrontContract extends LocalContract {
  readonly projectName: string;
  readonly tokenIds: string[];

  constructor(projectData: any) {
    super(openseaStorefrontContract, ERC1155);

    this.projectName = projectData.name;
    this.tokenIds = projectData.tokenIds;
  }

  async balanceOf(walletAddress: string, tokenId: string): Promise<BigNumber> {
    return await this.ethersContract.balanceOf(walletAddress, tokenId);
  }
}
