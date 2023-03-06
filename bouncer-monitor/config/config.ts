import * as customEnv from "custom-env";
import Joi from "joi";

customEnv.env();

const envSchema = Joi.object().keys({
  NODE_ENV: Joi.string().valid("production", "development").required(),
  PORT: Joi.string().required(),
  MORALIS_SERVER_URL: Joi.string().required(),
  MORALIS_APP_ID: Joi.string().required(),
  PROVIDER_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  MONGODB_URL: Joi.string().required(),
  LOG_FILE_DIR: Joi.string().required(),
  TIMEOUT: Joi.number().required(),
});

const {
  NODE_ENV,
  PORT,
  MORALIS_SERVER_URL,
  MORALIS_APP_ID,
  PROVIDER_URL,
  REDIS_URL,
  MONGODB_URL,
} = process.env;

const LOG_FILE_DIR = "logs";
// mocha timeout
const TIMEOUT = 100000;

export const config = {
  NODE_ENV,
  PORT,
  MORALIS_SERVER_URL,
  MORALIS_APP_ID,
  PROVIDER_URL,
  REDIS_URL,
  MONGODB_URL,
  LOG_FILE_DIR,
  TIMEOUT,
};

const envSchemaValidationResult = envSchema.validate(config);

if (envSchemaValidationResult.error) {
  throw new Error(
    `Config validation error: ${envSchemaValidationResult.error.message}`
  );
}
