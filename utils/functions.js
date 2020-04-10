const fs = require('fs');
const path = require('path');
const _ = require('lodash');


function deleteAllFilesFromDirectory(dirPath) {
  return fs.readdir(dirPath, (err, files) => {
    if (err) throw err;
    files.forEach((file) => {
      fs.unlink(path.join(dirPath, file), (e) => {
        if (e) throw e;
      });
    });
  });
}

function chainPromise(list) {
  let promise = Promise.resolve();
  list.forEach((p) => { promise = promise.then(() => p()); });
  return promise;
}

function randomInt(min, max) {
  const minimum = Math.ceil(min);
  const maximum = Math.floor(max);
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

function generatePassword(length) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*(){}:|<>?,';
  let retVal = '';
  for (let i = 0, n = charset.length; i < length; i += 1) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

function alphanumericString(length) {
  const loops = Math.ceil(length / 13);
  return new Array(loops)
    .fill(() => Math.random().toString(16).substring(2, 15))
    .reduce((string, func) => string + func(), '')
    .substring(0, length);
}

function repeat(n, func) {
  const pending = [];
  let count = 0;
  while (count <= n) {
    pending.push(func());
    count += 1;
  }
  return Promise.all(pending);
}

function convertValueToYesOrNo(value) {
  const yes = [1, true, '1', 'true'];
  const no = [0, false, '0', 'false'];
  if (_.includes(yes, value)) {
    return 'Yes';
  } if (_.includes(no, value)) {
    return 'No';
  }
  return value;
}

function convertNoneToValue(value) {
  const zero = ['None'];
  if (_.includes(zero, value)) {
    return '0';
  }
  return value;
}

function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}


module.exports = {
  repeat,
  randomInt,
  generatePassword,
  alphanumericString,
  chainPromise,
  deleteAllFilesFromDirectory,
  convertValueToYesOrNo,
  formatNumber,
  convertNoneToValue,
};
