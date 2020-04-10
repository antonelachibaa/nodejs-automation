const _ = require('lodash');

class Model {
  constructor(data) {
    this.validate(data);
    this.update(data);
  }

  update(data) {
    this.fields.forEach((f) => {
      if (data[f] === undefined) {
        this[f] = this.schema.columns[f].defaultValue;
      } else {
        this[f] = data[f];
      }
    });
  }

  validate(data) {
    this.fields.forEach((f) => {
      if (this.schema.columns[f].required === true && data[f] === undefined) {
        throw Error(`Field '${f}' is required!`);
      }
    });
  }

  get fields() {
    return _.keys(this.schema.columns);
  }

  // eslint-disable-next-line class-methods-use-this
  get schema() {
    throw new Error('Implementations error');
  }
}

module.exports = Model;
