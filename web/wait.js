const _ = require('lodash');
const { ExpectedConditions } = require('protractor');
const conf = require('../conf');


class Wait {
  constructor(browser) {
    this.browser = browser;
  }

  forPresenceOfElement(locator, time = conf.timeout.default) {
    logger.debug(`Action: Wait For Presence Of Element ${locator}`);
    return this.browser.wait(ExpectedConditions.presenceOf(this.browser.element(locator)), time);
  }

  forAbsenceOfElement(locator, time = conf.timeout.default) {
    logger.debug(`Action: Wait For Absence Of Element ${locator}`);
    return this.browser.wait(ExpectedConditions.not(ExpectedConditions.presenceOf(this.browser.element(locator))), time);
  }

  forVisibilityOfElement(locator, time = conf.timeout.default) {
    logger.debug(`Action: Wait For Visibility Of Element ${locator}`);
    return this.browser.wait(ExpectedConditions.visibilityOf(this.browser.element(locator)), time);
  }

  forInvisibilityOfElement(locator, time = conf.timeout.default) {
    logger.debug(`Action: Wait For Element To Be Invisible ${locator}`);
    return this.browser.wait(ExpectedConditions.invisibilityOf(this.browser.element(locator)), time);
  }

  forToBeClickable(locator, time = conf.timeout.default) {
    logger.debug(`Action: Wait To Be Clickable ${locator}`);
    return this.browser.wait(ExpectedConditions.elementToBeClickable(this.browser.element(locator)), time);
  }

  forTextToBePresentInElement(locator, time = conf.timeout.default) {
    logger.debug(`Action: Wait For Text To Be Present In Element ${locator}`);
    return this.browser.wait(ExpectedConditions.textToBePresentInElement(this.browser.element(locator)), time);
  }

  forPageToLoad(targetPage, timeout = conf.timeout.onLoad) {
    logger.debug(`Action: Wait For Page To Load ${targetPage.url}`);
    return this.browser.wait(() => this.browser.getCurrentUrl()
      .then((url) => _.includes(url, targetPage.url)), timeout, 'url has not changed')
      .then(() => this.forPresenceOfElement(targetPage.locator.content.element, timeout))
      .then(() => {
        if (targetPage.locator.other.loader) {
          return this.forAbsenceOfElement(targetPage.locator.other.loader, timeout);
        }
        return null;
      });
  }

  forInputValue(locator, time = conf.timeout.default) {
    logger.debug(`Action: Wait For Inout Value ${locator}`);
    return this.browser.wait(
      () => this.browser.element(locator).getAttribute('value').then((v) => Boolean(v)),
      time,
    );
  }
}


module.exports = Wait;
