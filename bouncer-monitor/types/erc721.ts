export interface erc721Log {
  topics: string[];
  blockNumber: number;
  transactionHash: string;
}
// Example:
// {
//     blockNumber: 12878194,
//     blockHash: '0x45e03b4b693a36a27ed69a422361dce3a77e2bc759bb82fa474628118b18761b',
//     transactionIndex: 3,
//     removed: false,
//     address: '0xBd3531dA5CF5857e7CfAA92426877b022e612cf8',
//     data: '0x',
//     topics: [
//       '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
//       '0x0000000000000000000000000000000000000000000000000000000000000000',
//       '0x00000000000000000000000084f3028236c9ab1b628e0ba7e7daed471f7a05d9',
//       '0x0000000000000000000000000000000000000000000000000000000000000030'
//     ],
//     transactionHash: '0x4175ca78570c44572357b8a83c26d5469217d0f10159285feeb40b27ce29b057',
//     logIndex: 20
//   }
