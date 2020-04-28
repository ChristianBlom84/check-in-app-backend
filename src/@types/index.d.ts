declare namespace NodeJS {
  export interface ProcessEnv {
    GITHUB_AUTH_TOKEN: string;
    NODE_ENV: 'development' | 'production';
    PORT?: string;
    CORS: string;
    CREDENTIALS: string;
    MONGO_URI: string;
    MONGO_DB: string;
    MONGO_USER: string;
    USE_MOCK_DB: string;
    COOKIE_JWT_EXP_DAYS: string;
    HTTP_ONLY_COOKIE: string;
    SIGNED_COOKIE: string;
    COOKIE_DOMAIN: string;
    JWT_COOKIE_PATH: string;
    SECURE_COOKIE: string;
    JWT_SECRET: string;
    COOKIE_SECRET: string;
  }
}
