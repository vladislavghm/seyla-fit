// Конфигурация PM2 для Seyla Fit
// Переменные окружения загружаются из .env.production через скрипт установки
// или можно использовать: pm2 start ecosystem.config.js --env production

const path = require('path');

module.exports = {
  apps: [
    {
      name: 'seyla-fit',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: process.cwd(),
      instances: 1,
      exec_mode: 'fork',
      // Переменные будут установлены из .env.production перед запуском
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Если нужны конкретные значения, раскомментируйте:
      // env: {
      //   NODE_ENV: 'production',
      //   PORT: 3000,
      //   NEXT_PUBLIC_TINA_CLIENT_ID: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || '',
      //   TINA_TOKEN: process.env.TINA_TOKEN || '',
      //   NEXT_PUBLIC_TINA_BRANCH: process.env.NEXT_PUBLIC_TINA_BRANCH || 'main',
      // },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
    },
    {
      name: 'webhook-server',
      script: path.join(__dirname, 'webhook-server.js'),
      cwd: process.cwd(),
      instances: 1,
      exec_mode: 'fork',
      env: {
        WEBHOOK_PORT: 9000,
        WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || '',
        PROJECT_DIR: process.cwd(),
      },
      error_file: './logs/webhook-error.log',
      out_file: './logs/webhook-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};

