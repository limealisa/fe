module.exports = {
  apps: [
    {
      name: "CSN365_SYSTEM_CORE",
      script: "./server.js",              // File chạy chính của bạn
      interpreter: "node",               // Dùng Node.js 18 trở lên
      instances: 1,
      exec_mode: "fork",                 // Hoặc "cluster" nếu muốn tận dụng đa nhân CPU
      watch: false,
      env: {
        // =============== Cấu hình môi trường ===============
        NODE_ENV: "development",
        ENV_ENVIROMENT: "develop",
        NODE_OPTIONS: "--openssl-legacy-provider",

        APPLICATION_NAME: "CSN365_SYSTEM_CORE",
        APPLICATION_SCRET_KEY: "application_scret_key",

        // =============== JWT Config ===============
        JWT_SCRET_KEY: "bUfxkJXG5xOtaOqRyTmXqWGl4ZxNSyAPbJGVfc7DKix2lyBMJn6TtmKQER52q2eC",
        JWT_EXPIRES_IN: "1d",
        SESSION_SECRET: "bUfxkJXG5xOtaOqRyTmXqWGl4ZxNS",

        // =============== Port ===============
        PORT: 8009,
        PORT_SOCKET_IO: 8008,

        // =============== MySQL ===============
        MYSQL_HOST: "localhost",
        MYSQL_PORT: 3306,
        MYSQL_USERNAME: "admin",
        MYSQL_PASSWORD: "Noname@2022",
        MYSQL_DATABASE: "cgame",

        // =============== Redis ===============
        REDIS_HOST: "localhost",
        REDIS_PORT: 6379,
        REDIS_PASSWORD: "12345678",

        // =============== Other ===============
        SITE_DOMAIN: "bc88bet.com",
        TELEGRAM_TOKEN_DEPLOY: "7740871198:AAHCkgprsCo4gTQRF1XqKtnTBdQK4FNf20w",
        TELEGRAM_GROUP_DEPLOY: "-4514225825",

      },

      // =============== Logging ===============
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
};
