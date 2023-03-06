import _ from "lodash";
export class Owner {
  readonly address: string;
  tokensBalances: Map<string, number>;
  isDiamondHand!: boolean | null;
  firstPurchase!: Date | null;

  constructor(
    address: string,
    tokensBalances: Map<string, number>,
    isDiamondhand?: boolean,
    firstPurchase?: Date
  ) {
    this.address = address;
    this.tokensBalances = tokensBalances;
    this.isDiamondHand = isDiamondhand === undefined ? null : isDiamondhand;
    this.firstPurchase = firstPurchase === undefined ? null : firstPurchase;
  }

  public balance(): number {
    return _.sum(Array.from(this.tokensBalances.values()));
  }
}
