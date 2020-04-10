const winston = require('winston');
const path = require('path');
const ScreenShotUtils = require('protractor-screenshot-utils').ProtractorScreenShotUtils;
const AllureReporter = require('jasmine-allure-reporter');
const conf = require('./conf');


const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.cli(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: path.join(__dirname, 'reports/combined.log') }),
    new winston.transports.Console(),
  ],
});

exports.config = {
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: [
          '--window-size=1920,1080',
        // '--headless',
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
    maxInstances: 1,
    shardTestFiles: true,
    specs: [
      'examples/webSpec.js',
    ],
  },
  seleniumAddress: conf.seleniumAddress,
  onPrepare: () => {
    global.logger = logger;
    global.screenShotUtils = new ScreenShotUtils({
      browserInstance: browser,
    });
    // jasmine.getEnv().addReporter(new jr.JUnitXmlReporter({
    //   consolidateAll: true,
    //   savePath: 'reports',
    //   filePrefix: 'junit',
    // }));
    jasmine.getEnv().addReporter(new AllureReporter({
      resultsDir: 'allure-results',
    }));
    jasmine.getEnv().afterEach((done) => {
      screenShotUtils.takeScreenshot().then((png) => {
        allure.createAttachment('Screenshot', () => Buffer.from(png, 'base64'), 'image/png')();
        done();
      });
    });
    jasmine.getEnv().addReporter({
      specStarted(result) {
        logger.debug(`********* Start of: ${result.fullName} *********`);
      },
      specDone(result) {
        logger.debug(`********* End of: ${result.fullName} *********`);
      },
    });
    return browser.waitForAngularEnabled(false);
  },
  afterLaunch: () => {
    global.logger = logger;
  },
  jasmineNodeOpts: {
    defaultTimeoutInterval: 120 * 1000,
  },
};
