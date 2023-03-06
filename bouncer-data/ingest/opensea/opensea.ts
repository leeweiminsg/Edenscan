import axios from "axios";
import { URLSearchParams } from "url";
import _ from "lodash";

import { genericLogger } from "../../logger/logger.js";
import { dbConn } from "../../db/mongodb/mongodb.js";
import { createProject } from "@0xkomada/bouncer-db";

const OPENSEA_OPENSTORE_ADDRESS = "0x495f947276749ce646f68ac8c248420045cb7b5e";
const COLLECTION_BASE_URL = "https://api.opensea.io/api/v1/collection";
const ASSETS_BASE_URL = "https://api.opensea.io/api/v1/assets";

export const createAndInitCollection = async (projectName: string) => {
  try {
    const newProject = await createProject(dbConn, projectName);
    const openseaIngestedProject = await getCollectionOverview(newProject);

    await openseaIngestedProject.save();

    genericLogger.info(`createAndInitCollection ${projectName} completed`);
  } catch (err) {
    genericLogger.error(`createAndInitCollection error: ${err}`);
  }
};

export const getCollectionOverview = async (project) => {
  let collection;
  try {
    collection = await getCollection(project.name);
  } catch (err) {
    genericLogger.error(`getCollectionOverview error: ${err}`);

    throw err;
  }

  // For storing opensea api results, so unstructured
  let tokenIds = new Array<string>();
  let left = collection.stats.total_supply;
  let offset = 0;
  let limit;

  while (left > 0) {
    limit = Math.min(left, 50);

    let assets;
    try {
      assets = await getAssets(project.name, limit, offset);
    } catch (err) {
      genericLogger.error(`getCollectionOverview error: ${err}`);

      throw err;
    }

    tokenIds = tokenIds.concat(_.map(assets, (asset) => asset.token_id));
    left -= limit;
    offset += limit;
  }

  project.meta.set("collection", collection);
  project.meta.set("tokenIds", tokenIds);

  project.contractAddress = OPENSEA_OPENSTORE_ADDRESS;

  project.ownerAddress = project.meta.get("collection").payout_address;
  project.tokenIds = project.meta.get("tokenIds");
  project.totalSupply = project.meta.get("collection").stats.total_supply;

  genericLogger.info(`getCollectionOverview ${project.name} completed`);

  return project;
};

export const getAssets = async (
  projectName: string,
  limit: number,
  offset: number
): Promise<any[]> => {
  const offsetStr = offset.toString();
  const limitStr = limit.toString();
  const urlSearchParams = new URLSearchParams({
    collection: projectName,
    offset: offsetStr,
    limit: limitStr,
  });

  let data;
  try {
    ({ data } = await axios.get(`${ASSETS_BASE_URL}?${urlSearchParams}`));
  } catch (err) {
    genericLogger.error(`getAssets error: ${err}`);

    throw err;
  }

  // Opensea
  const { assets } = data;

  genericLogger.info(
    `getAssets ${projectName} offset - ${offset} limit - ${limit} completed`
  );

  return assets;
};

export const getCollection = async (name: string): Promise<any[]> => {
  let data;
  try {
    ({ data } = await axios.get(`${COLLECTION_BASE_URL}/${name}`));
  } catch (err) {
    genericLogger.error(`getCollection error: ${err}`);

    throw err;
  }

  // Opensea
  const { collection } = data;

  genericLogger.info(`getCollection ${name} completed`);

  return collection;
};
