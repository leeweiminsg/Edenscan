import { createERC721MemberRule } from "@0xkomada/bouncer-db";
import { dbConn } from "../db/mongodb/mongodb.js";

const rule = await createERC721MemberRule(
  dbConn,
  "902031705962061915",
  "cryptobengz-test"
);

console.log(rule);
