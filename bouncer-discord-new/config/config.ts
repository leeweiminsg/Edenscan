import * as customEnv from "custom-env";
import Joi from "joi";

customEnv.env();

const envSchema = Joi.object().keys({
  NODE_ENV: Joi.string().valid("production", "development").required(),
  PORT: Joi.string().required(),
  DISCORD_CLIENT_TOKEN: Joi.string().required(),
  DISCORD_DOC_LINK: Joi.string().required(),
  FE_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  MONGODB_URL: Joi.string().required(),
  LOG_FILE_DIR: Joi.string().required(),
  CORS_OPTIONS: Joi.object({
    origin: Joi.string().required(),
    optionsSuccessStatus: Joi.number().required(),
  }).required(),
});

let {
  NODE_ENV,
  PORT,
  DISCORD_CLIENT_TOKEN,
  DISCORD_DOC_LINK,
  FE_URL,
  REDIS_URL,
  MONGODB_URL,
} = process.env;

const LOG_FILE_DIR = "logs";
const CORS_OPTIONS = {
  origin: "*",
  optionsSuccessStatus: 200,
};

export const config = {
  NODE_ENV,
  PORT,
  DISCORD_CLIENT_TOKEN,
  DISCORD_DOC_LINK,
  FE_URL,
  REDIS_URL,
  MONGODB_URL,
  LOG_FILE_DIR,
  CORS_OPTIONS,
};

const envSchemaValidationResult = envSchema.validate(config);

if (envSchemaValidationResult.error) {
  throw new Error(
    `Config validation error: ${envSchemaValidationResult.error.message}`
  );
}
