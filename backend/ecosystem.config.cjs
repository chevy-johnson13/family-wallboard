require('dotenv').config();

module.exports = {
  apps: [{
    name: 'wallboard-backend',
    script: 'src/index.js',
    cwd: '/home/pi/Family-Wallboard/backend',
    env: {
      NODE_ENV: 'production',
      ...process.env
    }
  }]
};

