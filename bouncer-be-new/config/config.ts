import * as customEnv from "custom-env";
import Joi from "joi";

customEnv.env();

const envSchema = Joi.object().keys({
  NODE_ENV: Joi.string().valid("production", "development").required(),
  HTTP_PORT: Joi.string().required(),
  HTTPS_PORT: Joi.string().required(),
  SSL_KEY_URL: Joi.string().required(),
  SSL_CERT_URL: Joi.string().required(),
  DISCORD_CLIENT_TOKEN: Joi.string().required(),
  DISCORD_SERVER_URL: Joi.string().required(),
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
  HTTP_PORT,
  HTTPS_PORT,
  SSL_KEY_URL,
  SSL_CERT_URL,
  DISCORD_CLIENT_TOKEN,
  DISCORD_SERVER_URL,
  REDIS_URL,
  MONGODB_URL,
} = process.env;

const LOG_FILE_DIR = "logs";
const CORS_OPTIONS = {
  origin: process.env.FE_URL,
  optionsSuccessStatus: 200,
};

export const config = {
  NODE_ENV,
  HTTP_PORT,
  HTTPS_PORT,
  SSL_KEY_URL,
  SSL_CERT_URL,
  DISCORD_CLIENT_TOKEN,
  DISCORD_SERVER_URL,
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
