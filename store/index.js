/* eslint-disable no-underscore-dangle */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { SCHEMA } = require('./schema');


class Store {
  constructor(folderPath) {
    this._folderPath = folderPath;
    this._dataSource = null;
    this._data = undefined;
  }

  load(name) {
    this._dataSource = name;
    const data = fs.readFileSync(path.join(this._folderPath, `${name}.yaml`), 'utf8');
    this._data = yaml.load(data, { schema: SCHEMA });
    return this._data;
  }

  reload() {
    return this.load(this._dataSource);
  }

  get data() {
    return this._data;
  }

  // eslint-disable-next-line class-methods-use-this
  document(name) {
    const filePath = path.join('store/documents', name);
    const fileRelativePath = path.resolve(filePath);
    if (!fs.existsSync(fileRelativePath)) {
      throw Error(`File '${fileRelativePath}' does not exist!`);
    }
    return fileRelativePath;
  }
}

module.exports = Store;
