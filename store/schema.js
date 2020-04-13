const yaml = require('js-yaml');
const uuid = require('uuid');
const _ = require('lodash');
const { DateTime } = require('luxon');
const { randomInt, generatePassword, alphanumericString } = require('../utils/functions');

const RandomId = new yaml.Type('!randomId', {
  kind: 'sequence',
  construct(data) {
    const startingWith = data[0];
    const length = data[1];
    const min = startingWith.toLocaleString() + '0'.repeat(length - 1);
    const max = startingWith.toLocaleString() + '9'.repeat(length - 1);
    return randomInt(parseInt(min, 10), parseInt(max, 2));
  },
});

const RandomPassword = new yaml.Type('!randomPassword', {
  kind: 'scalar',
  construct(data) {
    return generatePassword(data);
  },
});

const RandomAlphanumericString = new yaml.Type('!randomAlphanumericString', {
  kind: 'scalar',
  construct(data) {
    return alphanumericString(data);
  },
});

const GenerateUUID = new yaml.Type('!uuid', {
  kind: 'scalar',
  construct() {
    return uuid.v4();
  },
});

const Date = new yaml.Type('!date', {
  kind: 'scalar',
  construct(data) {
    const patterns = {
      dateFuture: /^(\d+) days from now$/,
      dayFuture: /^day - (\d+) days from now$/,
      monthFuture: /^month - (\d+) days from now$/,
      yearFuture: /^year - (\d+) days from now$/,
      datePast: /^(\d+) days ago$/,
      dayPast: /^day - (\d+) days ago$/,
      monthPast: /^month - (\d+) days ago$/,
      yearPast: /^year - (\d+) days ago$/,
    };
    let result;
    Object.entries(patterns).forEach(([name, pattern]) => {
      const match = data.match(pattern);
      let date = DateTime.local();
      if (match) {
        const [format, period] = _.map(_.split(_.startCase(name), ' '), _.lowerCase);
        if (period === 'future') {
          date = date.plus({ days: parseInt(match[1], 10) });
        } else if (period === 'past') {
          date = date.minus({ days: parseInt(match[1], 10) });
        } else {
          throw new Error(`Unknown time period '${period}'`);
        }
        if (_.includes(['day', 'month', 'year'], format)) {
          result = date[format];
        } else if (format === 'date') {
          result = date.toISODate();
        } else {
          throw new Error(`Unknown time format '${format}'`);
        }
      }
    });
    return result;
  },
});

const GenerateEmail = new yaml.Type('!email', {
  kind: 'scalar',
  construct(data) {
    const splitEmail = data.split('@');
    return `${splitEmail[0]}+${alphanumericString(10)}@${splitEmail[1]}`;
  },
});



const SCHEMA = yaml.Schema.create([
  RandomId,
  RandomPassword,
  RandomAlphanumericString,
  GenerateUUID,
  GenerateEmail,
  Date,
]);

module.exports = { SCHEMA };
