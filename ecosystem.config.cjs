/** One process only. Site content is stored in data/site.json and kept in memory. */
module.exports = {
  apps: [
    {
      name: 'navnikunj',
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 7200',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '700M',
      min_uptime: '10s',
      max_restarts: 10,
      exp_backoff_restart_delay: 200,
      kill_timeout: 5000,
      time: true,
      merge_logs: true,
      out_file: 'logs/pm2-out.log',
      error_file: 'logs/pm2-error.log',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
