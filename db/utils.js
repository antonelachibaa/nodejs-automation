const conf = require('../conf');
const Db = require('./index');

function start(data) {
  const db = new Db(conf.db.credentials, conf.db.encryption.global, conf.db.encryption.algorithm);
  db.connect();
  db.encryptUsingSalt(data.user.salt);
  return db;
}

function createUser(data, applicationCache) {
  const db = start(data);
  return Promise.all([
    db.create(data.user),
    db.create(data.userEmail),
    db.create(data.userFlag),
    db.create(applicationCache || data.applicationCacheClear),
  ]).then(() => db.close()).catch((err) => {
    db.close();
    throw err;
  });
}

function update(data, ...models) {
  const db = start(data);
  const pending = [];
  models.forEach((m) => pending.push(db.update(m)));
  return Promise.all(pending).then(() => db.close()).catch((err) => {
    db.close();
    throw err;
  });
}

module.exports = {
  createUser,
  update,
};
