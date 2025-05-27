module.exports = {
  apps: [{
    name: 'controleai-vendas',
    script: 'dist/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/pm2/error.log',
    out_file: 'logs/pm2/out.log',
    log_file: 'logs/pm2/combined.log',
    time: true,
    merge_logs: true,
    max_restarts: 10,
    restart_delay: 4000,
    exp_backoff_restart_delay: 100,
    listen_timeout: 8000,
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    shutdown_with_message: true,
    source_map_support: true,
    node_args: '--max-old-space-size=4096',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}; 