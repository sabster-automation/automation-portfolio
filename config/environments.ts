export type Environment = 'dev' | 'staging' | 'prod';

export interface EnvConfig {
  baseURL: string;
  apiBaseURL: string;
  name: string;
}

export const environments: Record<Environment, EnvConfig> = {
  dev: {
    name: 'Development',
    baseURL: 'https://www.saucedemo.com',
    apiBaseURL: 'https://jsonplaceholder.typicode.com',
  },
  staging: {
    name: 'Staging',
    baseURL: 'https://www.saucedemo.com',
    apiBaseURL: 'https://reqres.in/api',
  },
  prod: {
    name: 'Production',
    baseURL: 'https://www.saucedemo.com',
    apiBaseURL: 'https://jsonplaceholder.typicode.com',
  },
};

export function getEnvConfig(): EnvConfig {
  const env = (process.env.ENV as Environment) || 'dev';
  if (!environments[env]) {
    throw new Error(`Unknown ENV="${env}". Valid: ${Object.keys(environments).join(', ')}`);
  }
  return environments[env];
}

export function getBaseURL(): string {
  if (process.env.BASE_URL) return process.env.BASE_URL;
  return getEnvConfig().baseURL;
}
