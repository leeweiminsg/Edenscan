import { syncAllOpenseaLogs } from "../indexer/opensea.js";
import { syncProject } from "../indexer/project.js";
import { testProject } from "../tests/ownership.js";

const onBoardProject = async (projectName: string) => {
  await syncAllOpenseaLogs();
  await syncProject(projectName);
  await testProject(projectName);
};

await onBoardProject("cryptobengz");
