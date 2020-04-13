/* eslint-disable no-underscore-dangle */
const _ = require('lodash');
const { Key } = require('protractor');
const Wait = require('./wait');
const utils = require('../utils/functions');
const conf = require('../conf');


function replaceDoubleQuotes(locator, append = '') {
  let value = `${locator.value} ${append}`;
  value = value.trim();
  value = _.replace(value, /"/g, "'");
  return value;
}

class Action {
  constructor(browser) {
    this.browser = browser;
    this._wait = new Wait(browser);
  }

  // eslint-disable-next-line class-methods-use-this
  jsUtils(locator, action) {
    let script = '';
    if (locator.using === 'xpath') {
      // eslint-disable-next-line max-len
      script += `var element = document.evaluate("${replaceDoubleQuotes(locator)}", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;`;
    } else if (locator.using === 'css selector') {
      script += `var element = document.querySelector("${replaceDoubleQuotes(locator)}");`;
    }
    return `${script}\n${action}`;
  }

  get wait() {
    return this._wait;
  }

  // eslint-disable-next-line class-methods-use-this
  get _utilLocators() {
    return {
      reactDatePickerSelectedDate: by.xpath("//div[contains(@class,'react-datepicker') and contains(@class,'selected')]"),
    };
  }

  clearUserData() {
    logger.debug('Action: Clear User Data');
    return Promise.all([
      this.browser.executeScript('window.sessionStorage.clear();'),
      this.browser.executeScript('window.localStorage.clear();'),
    ]);
  }

  getPage(url) {
    logger.debug(`Action: Get Page ${url}`);
    return this.browser.get(url);
  }

  isEnabled(locator) {
    logger.debug(`Action: Is Enabled ${locator}`);
    return this.browser.element(locator).isEnabled();
  }

  getText(locator) {
    logger.debug(`Action: Get text ${locator}`);
    return this.browser.element(locator).getText();
  }

  click(locator) {
    logger.debug(`Action: Click ${locator}`);
    return this.browser.element(locator).click();
  }

  doubleClick(locator) {
    logger.debug(`Action: Click ${locator}`);
    return this.browser.element(locator).click().then(() => this.browser.element(locator).click());
  }

  clear(locator) {
    logger.debug('Action: Clear Input Text');
    const elem = this.browser.element(locator);
    return elem.clear()
      // Workaround for issue https://github.com/w3c/webdriver/issues/1354
      .then(() => elem.getAttribute('value'))
      .then((value) => {
        if (value.length !== 0) {
          return utils.repeat(value.length, () => elem.sendKeys(Key.BACK_SPACE));
        }
        return null;
      });
  }

  upload(locator, path) {
    logger.debug(`Action: Upload "${path}"`);
    const uploaderLoading = by.xpath(`${locator[1]}/ancestor::div[contains(@class,"uploader-file")]//img[@alt="Loading"]`);
    return this.browser.element(locator).sendKeys(path)
      .then(() => this.wait.forInvisibilityOfElement(uploaderLoading, conf.timeout.documentUpload));
  }

  sendKeys(locator, ...keys) {
    logger.debug(`Action: Send Keys "${keys}"`);
    return this.browser.element(locator).sendKeys(...keys);
  }

  isPresent(locator) {
    logger.debug(`Action: Is Present ${locator}`);
    return this.browser.element(locator).isPresent();
  }

  getInputValue(locator) {
    return this.getAttributeValue(locator, 'value');
  }

  setInputValue(locator, text) {
    logger.debug(`Action: Set Input Value "${text}"`);
    let action = `function setNativeValue(element, value) {
      const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
      const prototype = Object.getPrototypeOf(element);
      const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
      if (valueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value);
      } else {
        valueSetter.call(element, value);
      }
    }\n`;
    action += `setNativeValue(element, "${text}");\n`;
    action += 'var inputEvent = new Event("input", { bubbles: true });\n';
    action += 'var changeEvent = new Event("change", { bubbles: true });\n';
    action += 'element.dispatchEvent(inputEvent);\n';
    action += `element.value = "${text}";\n`;
    action += 'element.dispatchEvent(changeEvent);\n';
    const script = this.jsUtils(locator, action);
    return this.browser.executeScript(script);
  }

  getAttributeValue(locator, attribute) {
    logger.debug(`Action: Get Attribute ${attribute} Value ${locator}`);
    return this.browser.element(locator).getAttribute(attribute);
  }

  updateInput(locator, ...keys) {
    logger.debug(`Action: Update Input ${locator} with value: ${keys}`);
    // Valid email,zip and ssn workaround, sendKeys does not set the keys in the correct order
    const patterns = [
      /^\w+([\.\-\+]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(keys[0]),
      /\d{3}-\d{2}-\d{4}/.test(keys[0]),
      /\d{5}/.test(keys[0]),
    ];
    const elem = this.browser.element(locator);
    return elem.getAttribute('value')
      .then((v) => v === keys[0])
      .then((equals) => {
        if (!equals) {
          if (_.includes(patterns, true)) {
            return this.clear(locator).then(() => this.setInputValue(locator, keys[0]));
          }
          return this.clear(locator).then(() => this.sendKeys(locator, ...keys));
        }
        return null;
      });
  }

  updateInputValue(locator, text) {
    logger.debug(`Action: Update Input ${locator} with value: ${text}`);
    const elem = this.browser.element(locator);
    return elem.getAttribute('value')
      .then((v) => v === text)
      .then((equals) => {
        if (!equals) {
          return this.clear(locator).then(() => this.setInputValue(locator, text));
        }
        return null;
      });
  }

  selectDatePickerDate(locator, ...keys) {
    return this.updateInput(locator, ...keys).then(() => this.click(this._utilLocators.reactDatePickerSelectedDate));
  }

  getPageAndWaitToLoad(targetPage) {
    return this.getPage(targetPage.url).then(() => this.wait.forPageToLoad(targetPage));
  }

  markCheckbox(locator, status) {
    return this.isChecked(locator).then((currentStatus) => {
      if (currentStatus !== status) {
        logger.debug(`Action: Mark Checkbox ${locator} from ${currentStatus} to ${status}`);
        if (currentStatus === true) {
           this.click(locator);
        }
        return this.click(locator);
      }
      return undefined;
    });
  }

  closeCurrentTabAndOpenNewTab() {
    logger.debug('Action: Close Current Tab And Open New Tab');
    return this.browser.executeScript('window.open()')
      .then(() => this.browser.getAllWindowHandles())
      .then((handles) => {
        this.browser.driver.switchTo().window(handles[1]);
        this.browser.driver.close();
        this.browser.driver.switchTo().window(handles[0]);
        this.browser.get('data:,');
      });
  }

  isChecked(locator) {
    logger.debug(`Action: Is Checked ${locator}`);
    // const script = `var checkbox = document.${replaceDoubleQuotes(locator, '+ label')};
    // return window.getComputedStyle(checkbox, ':after').getPropertyValue("content") === '"✓"';`;
    return this.browser.element(locator).isSelected();
  }

  selectOption(locator, optionText) {
    logger.debug(`Action: Select Option ${locator} by text '${optionText}'`);
    const option = String(optionText);
    const select = this.browser.element(locator);
    return select.click()
      .then(() => select.element(by.cssContainingText('.item', option)))
      .then((elem) => elem.click());
  }

  getSelectOptions(locator) {
    logger.debug(`Action: Get Select Options ${locator}`);
    const select = this.browser.element(locator);
    return select.click()
      .then(() => select.all(by.className('item')).getText())
      .then((options) => {
        select.click();
        return options;
      });
  }

  getSelectedOption(locator) {
    logger.debug(`Action: Get Selected Option ${locator}`);
    return this.browser.element(locator).element(by.className('selected')).getText();
  }
}

module.exports = Action;
