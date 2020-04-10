/* eslint-disable no-underscore-dangle,max-classes-per-file */
const crypto = require('crypto');
const iocane = require('iocane');
const _ = require('lodash');

class Deserialize {
  constructor(model, globalSalt, userSalt) {
    this.model = model;
    this.globalSalt = globalSalt;
    this.userSalt = userSalt;
    this.algorithm = 'aes-256-ctr';
  }

  _decryptGlobal(text) {
    if (!text) return text;
    const decipher = crypto.createDecipher(this.algorithm, this.globalSalt);
    let dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  }

  _decrypt(text) {
    if (_.isEmpty(text)) return Promise.resolve(text);
    return iocane.crypto.decryptWithPassword(text, this.userSalt);
  }

  decrypt(value, type) {
    let v;
    switch (type) {
      case 'global':
        v = this._decryptGlobal(value);
        break;
      case 'super':
        v = this._decrypt(value);
        break;
      default:
        break;
    }
    return v;
  }
}

class Serialize {
  constructor(model, globalSalt, userSalt) {
    this.model = model;
    this.globalSalt = globalSalt;
    this.userSalt = userSalt;
    this.algorithm = 'aes-256-ctr';
  }

  _encryptGlobal(text) {
    if (!text) return Promise.resolve(text);
    const cipher = crypto.createCipher(this.algorithm, this.globalSalt);
    let crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return Promise.resolve(crypted);
  }

  _encrypt(text) {
    if (_.isEmpty(text)) return Promise.resolve(text);
    return iocane.crypto.encryptWithPassword(text, this.userSalt);
  }

  _encryptPassword(text) {
    return Promise.resolve(crypto
      .createHmac('sha512', this.userSalt)
      .update(text)
      .digest('hex'));
  }

  encrypt(value, fieldSchema) {
    switch (fieldSchema.encryption) {
      case 'global':
        return this._encryptGlobal(value);
      case 'super':
        return this._encrypt(value);
      case 'password':
        return this._encryptPassword(value);
      default:
        return Promise.resolve(value);
    }
  }

  create() {
    return this.prepare()
      .then((f) => {
        const keys = _.keys(f);
        const placeholder = Array(keys.length).fill('?').join(',');
        return {
          sql: `INSERT INTO ${this.model.schema.table} (${_.join(keys, ',')}) VALUES (${placeholder});`,
          values: _.values(f),
        };
      });
  }

  update() {
    return this.prepare()
      .then((f) => {
        const { id } = f;
        // eslint-disable-next-line no-param-reassign
        delete f.id;
        const set = _.keys(f);
        const data = _.transform(set, (result, n) => {
          result.push(`${n} = ?`);
        });
        const values = _.values(f);
        values.push(id);
        return {
          sql: `UPDATE ${this.model.schema.table} SET ${data.join(',')} WHERE id = ?;`,
          values,
        };
      });
  }

  delete() {
    return this.prepare()
      .then((f) => ({
        sql: `DELETE FROM ${this.model.schema.table} WHERE id = ?;`,
        values: [f.id],
      }));
  }

  prepare() {
    const fields = {};
    this.model.fields.forEach((field) => {
      const fieldSchema = this.model.schema.columns[field];
      let value = this.model[field];
      value = this.encrypt(value, fieldSchema);
      fields[fieldSchema.name] = value;
    });
    return Promise.all(_.values(fields))
      .then(() => _.keys(fields).forEach((k) => fields[k].then((v) => { fields[k] = v; })))
      .then(() => fields);
  }
}

module.exports = { Serialize, Deserialize };
