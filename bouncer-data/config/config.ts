import * as dotenv from "dotenv";
import Joi from "joi";

dotenv.config();

const envSchema = Joi.object().keys({
  NODE_ENV: Joi.string().valid("production", "development").required(),
  HTTP_PORT: Joi.string().required(),
  HTTPS_PORT: Joi.string().required(),
  SSL_KEY_URL: Joi.string().required(),
  SSL_CERT_URL: Joi.string().required(),
  ETH_MONITOR_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  MONGODB_URL: Joi.string().required(),
  ALCHEMY_URL: Joi.string().required(),
  LOG_FILE_DIR: Joi.string().required(),
  CORS_OPTIONS: Joi.object({
    origin: Joi.string().required(),
    optionsSuccessStatus: Joi.number().required(),
  }).required(),
  TIMEOUT: Joi.number().required(),
});

const {
  NODE_ENV,
  HTTP_PORT,
  HTTPS_PORT,
  SSL_KEY_URL,
  SSL_CERT_URL,
  ETH_MONITOR_URL,
  REDIS_URL,
  MONGODB_URL,
  ALCHEMY_KEY,
} = process.env;

const LOG_FILE_DIR = "logs";
const CORS_OPTIONS = {
  origin: "*",
  optionsSuccessStatus: 200,
};
// mocha timeout
const TIMEOUT = 100000;
const ALCHEMY_URL = `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`;

export const config = {
  NODE_ENV,
  HTTP_PORT,
  HTTPS_PORT,
  SSL_KEY_URL,
  SSL_CERT_URL,
  ETH_MONITOR_URL,
  REDIS_URL,
  MONGODB_URL,
  ALCHEMY_URL,
  LOG_FILE_DIR,
  CORS_OPTIONS,
  TIMEOUT,
};

const envSchemaValidationResult = envSchema.validate(config);

if (envSchemaValidationResult.error) {
  throw new Error(
    `Config validation error: ${envSchemaValidationResult.error.message}`
  );
}
