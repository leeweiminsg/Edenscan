import ethers from "ethers";

import { ERC20, ERC721, ERC1155 } from "./localContract.js";

class Event {}

class EventData {}

export class TransferEventData extends EventData {
  readonly from: string;
  readonly to: string;

  readonly contractName: string;

  constructor(from: string, to: string, contractName: string) {
    super();
    this.from = from;
    this.to = to;

    this.contractName = contractName;
  }

  toString() {
    return `TransferEventData: contract name - ${this.contractName} from - ${this.from} to - ${this.to})`;
  }
}

class ERC20TransferData extends TransferEventData {
  /* converted from wei */
  readonly value: number;

  constructor(from: string, to: string, value: string, contractName: string) {
    super(from, to, contractName);
    this.value = parseFloat(ethers.utils.formatEther(value));
  }
}

class ERC721TransferData extends TransferEventData {
  readonly tokenId: number;

  constructor(from: string, to: string, tokenId: number, contractName: string) {
    super(from, to, contractName);
    this.tokenId = tokenId;
  }
}

class ERC1155TransferData extends TransferEventData {
  readonly tokenId: any;

  constructor(from: string, to: string, tokenId: any, contractName: string) {
    super(from, to, contractName);
    this.tokenId = tokenId;
  }

  toString() {
    return super.toString() + ` tokenId - ${this.tokenId}`;
  }
}

export abstract class TransferEvent extends Event {
  abstract signature: string;
  abstract transferData: TransferEventData;

  static readonly eventName = "Transfer";

  abstract setEventData(ethersEvent: Array<any>, contractName: string);

  static fromEventType(contractType: string) {
    if (contractType === ERC20) {
      return new ERC20TransferEvent();
    } else if (contractType === ERC721) {
      return new ERC721TransferEvent();
    } else {
      return new ERC1155TransferEvent();
    }
  }

  toString() {
    return this.transferData.toString();
  }
}

export class ERC20TransferEvent extends TransferEvent {
  signature: string;
  transferData!: ERC20TransferData;

  constructor() {
    super();
    this.signature = "Transfer(address,address,uint256)";
  }

  setEventData(ethersEvent: Array<any>, contractName: string) {
    // Workaround due to rest ("...") syntax operator issues
    this.transferData = new ERC20TransferData(
      // from
      ethersEvent[0] as string,
      // to
      ethersEvent[1] as string,
      // value
      // Will be converted to number
      ethersEvent[2] as string,
      contractName
    );
  }
}

export class ERC721TransferEvent extends TransferEvent {
  signature: string;
  transferData!: ERC721TransferData;

  constructor() {
    super();
    this.signature = "Transfer(address,address,uint256)";
  }

  setEventData(ethersEvent: Array<any>, contractName: string) {
    // Workaround due to rest ("...") syntax operator issues
    this.transferData = new ERC721TransferData(
      // from
      ethersEvent[0] as string,
      // to
      ethersEvent[1] as string,
      // tokenId
      // Will be converted to number
      ethersEvent[2] as number,
      contractName
    );
  }
}

export class ERC1155TransferEvent extends TransferEvent {
  signature: string;
  transferData!: ERC721TransferData;

  constructor() {
    super();
    this.signature = "TransferSingle(address,address,address,uint256,uint256)";
  }

  setEventData(ethersEvent: Array<any>, contractName: string) {
    // Workaround due to rest ("...") syntax operator issues
    this.transferData = new ERC1155TransferData(
      // from
      ethersEvent[1] as string,
      // to
      ethersEvent[2] as string,
      // tokenId (obfuscated)
      // Will be converted to number
      ethersEvent[3],
      contractName
    );
  }
}
