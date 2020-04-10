/* eslint-disable no-underscore-dangle */
const mysql = require('mysql');
const { Serialize } = require('./parser');


class Db {
  constructor(credentials, globalSalt, algorithm) {
    this._globalSalt = globalSalt;
    this._algorithm = algorithm;
    this._userSalt = undefined;
    this._conn = mysql.createConnection(credentials);
  }

  connect() {
    logger.debug('Mysql connect: start');
    return this._conn.connect();
  }

  encryptUsingSalt(string) {
    this._userSalt = string;
    return this;
  }

  query(sql, args) {
    return new Promise((resolve, reject) => {
      this._conn.query(sql, args, (err, rows) => {
        if (err) {
          logger.debug(`MySQL: ${sql} - ${args}`);
          logger.error(`MySQL-ERROR: ${err}`);
          return reject(err);
        }
        logger.debug(`MySQL: ${sql} - ${args}`);
        logger.debug(`MySQL: ${JSON.stringify(rows)}`);
        return resolve(rows);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this._conn.end((err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }

  action(model, method) {
    if (this._userSalt === undefined) {
      throw new Error("User 'encryptUsingSalt' to before performing any action");
    }
    const serializer = new Serialize(model, this._globalSalt, this._userSalt, this._algorithm);
    return serializer[method]()
      .then((d) => {
        logger.debug(`Mysql ${method}: ${d.sql} ${d.values}`);
        return this.query(d.sql, d.values);
      });
  }

  create(model) {
    return this.action(model, 'create');
  }

  update(model) {
    return this.action(model, 'update');
  }

  delete(model) {
    return this.action(model, 'delete');
  }
}

module.exports = Db;
