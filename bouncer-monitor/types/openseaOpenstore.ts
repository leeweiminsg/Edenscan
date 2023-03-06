export interface OpenseaLog {
  data: string;
  topics: string[];
  blockNumber: number;
  transactionHash: string;
}
// Example:
// {
//     blockNumber: 13896004,
//     blockHash: '0x10eca36f420a4919c8adac1b9a969c902f871aea31435736558e9363acfee7f7',
//     transactionIndex: 283,
//     removed: false,
//     address: '0x495f947276749Ce646f68AC8c248420045cb7b5e',
//     data: '0x1343ac1bc4d8ffe9334aff9216165934b39c87f60000000000000800000000010000000000000000000000000000000000000000000000000000000000000001',
//     topics: [
//       '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
//       '0x0000000000000000000000004c5bd844ec835fe59880c560431590961af2a3f7',
//       '0x0000000000000000000000001343ac1bc4d8ffe9334aff9216165934b39c87f6',
//       '0x0000000000000000000000005012d68f846bef12d8c8ce6ad3de311afc0706a5'
//     ],
//     transactionHash: '0xfc577468d2bac5c5f3dd8c471d3c485b5b61b39e9a72d66e40b0e4d28a93b82a',
//     logIndex: 387
//   }
