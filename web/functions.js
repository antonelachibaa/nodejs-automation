const fs = require('fs');
const _ = require('lodash');


function saveCookies(browser, file) {
  return browser.manage().getCookies().then((cookies) => {
    fs.writeFileSync(file, JSON.stringify(cookies));
  });
}

function loadCookies(browser, file) {
  const pending = [];
  fs.readFile(file, (err, data) => {
    if (err) throw err;
    const cookies = JSON.parse(data);
    cookies.forEach((c) => {
      pending.push(browser.manage().addCookie(c));
    });
  });
  return Promise.all(pending);
}

function saveStorage(browser, type, path) {
  return browser.executeScript(`return window.${type}`).then((data) => {
    const parsed = _.pickBy(data, (value) => _.isString(value));
    fs.writeFileSync(path, JSON.stringify(parsed));
  });
}

function pushAction(func, value, list) {
  if (value !== undefined) {
    list.push(() => func(value));
  }
}

function loadStorage(browser, type, path) {
  const pending = [];
  fs.readFile(path, (err, data) => {
    if (err) throw err;
    const parsed = JSON.parse(data);
    Object.keys(data).forEach((key) => {
      const script = `return window.${type}.setItem("${key}",${JSON.stringify(parsed[key])})`;
      pending.push(browser.executeScript(script));
    });
  });
  return Promise.all(pending);
}

module.exports = {
  saveCookies,
  loadCookies,
  saveStorage,
  loadStorage,
  pushAction,
};
