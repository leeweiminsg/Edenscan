import { genericLogger } from "../../logger/logger.js";
import { toHumanDocument, toHumanDocumentArray } from "../../utils/utils.js";

export const getProjectGeneric = async (dbConn, filters: any) => {
  const projectModel = dbConn.model("Project");

  filters.isDeleted = false;

  let project;
  try {
    project = await projectModel.findOne(filters);
  } catch (err) {
    genericLogger.error(`getProjectGeneric error: ${err}`);

    throw err;
  }

  if (project == null) {
    const err = new Error(
      `getProjectGeneric error: Project not found in database`
    );

    genericLogger.error(err);

    throw err;
  }

  genericLogger.info(`getProjectGeneric completed`);

  return toHumanDocument(project);
};

export const getProject = async (dbConn, name: string) => {
  const projectModel = dbConn.model("Project");

  let project;
  try {
    project = await projectModel
      .findOne({
        name,
        isDeleted: false,
      })
      .select({
        name: 1,
        contractAddress: 1,
        ownerAddress: 1,
        tokenIds: 1,
        totalSupply: 1,
        block: 1,
      });
  } catch (err) {
    genericLogger.error(`getProject error: ${err}`);

    throw err;
  }

  if (project == null) {
    const err = new Error(
      `getProject error: Project ${name} not found in database`
    );

    genericLogger.error(err);

    throw err;
  }

  genericLogger.info(`getProject ${name} completed`);

  return toHumanDocument(project);
};

export const getAllProjects = async (dbConn) => {
  const projectModel = dbConn.model("Project");

  const filters = {
    isDeleted: false,
  };

  let projects;
  try {
    projects = await projectModel.find(filters);
  } catch (err) {
    genericLogger.error(`getAllProjects error: ${err}`);

    throw err;
  }

  if (projects == null) {
    const err = new Error(
      `getAllProjects error: No projects found in database`
    );

    genericLogger.error(err);

    throw err;
  }

  genericLogger.info(`getAllProject completed`);

  return toHumanDocumentArray(projects);
};

export const createProjectGeneric = async (dbConn, projectData: any) => {
  const projectModel = dbConn.model("Project");

  const project = new projectModel(projectData);

  genericLogger.info(`createProjectGeneric: ${projectData.name} completed`);

  return project;
};

// Note: created for tokenIds
export const updateProjectGeneric = async (dbConn, projectData: any) => {
  const { name, tokenIds } = projectData;

  const projectModel = dbConn.model("Project");

  const query = { name };

  let update;
  if (tokenIds !== undefined) {
    update = { $addToSet: { tokenIds } };
  }

  const options = { new: true };

  const projectRes = await projectModel.findOneAndUpdate(
    query,
    update,
    options
  );

  genericLogger.info(`updateProjectGeneric completed: name - ${name}`);

  return projectRes;
};
