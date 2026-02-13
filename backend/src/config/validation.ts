import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3002),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  
  DATABASE_URL: Joi.string().required(),
  
  JWT_SECRET: Joi.string().min(32).required().messages({
    'string.min': 'JWT_SECRET must be at least 32 characters long',
  }),
  JWT_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required().messages({
    'string.min': 'JWT_REFRESH_SECRET must be at least 32 characters long',
  }),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
  
  BCRYPT_ROUNDS: Joi.number().default(12),
  RATE_LIMIT_TTL: Joi.number().default(60),
  RATE_LIMIT_MAX: Joi.number().default(100),
  
  APP_NAME: Joi.string().default('HR Enterprise'),
  APP_VERSION: Joi.string().default('1.0.0'),
});
