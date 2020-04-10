const path = require('path');

const conf = {
  protractor: {
    maxInstances: 2,
    shardTestFiles: true,
    capabilities: {
      browserName: 'chrome',
      chromeOptions: {
        args: [
          '--window-size=1920,1080',
          '--headless',
          '--disable-gpu',
          '--disable-impl-side-painting',
          '--disable-gpu-sandbox',
          '--disable-accelerated-2d-canvas',
          '--disable-accelerated-jpeg-decoding',
          '--disable-dev-shm-usage',
          '--no-sandbox',
          '--test-type=ui',
        ],
      },
    },
  },
  seleniumAddress: process.env.SELENIUM_ADDRESS || 'http://localhost:4444/wd/hub',
  domain: process.env.SITE_URL || '',
  timeout: {
    default: 5000,
    onLoad: 50000,
    documentUpload: 50000,
    email: {
      interval: 1000,
      retries: 30,
    },
  },
  db: {
    credentials: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      timezone: 'utc',
    },
    encryption: {
      global: process.env.GLOBAL_ENCRYPTION,
      algorithm: 'aes-256-ctr',
    },
  },
  reports: {
    path: path.join(__dirname, 'allure-results'),
  },
  session: {
    path: {
      cookies: './tmp/session/cookiesLogin.json',
      localStorage: './tmp/session/localStorage.json',
      sessionStorage: './tmp/session/sessionStorage.json',
    },
  },
  store: {
    path: `${path.resolve(__dirname)}/store`,
  },
};


module.exports = conf;
