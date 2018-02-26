const Q = require('q');
const util = require('util');

function getManyParams(keys, prefix, nconf) {
  const promises = keys.map(function(key) {
    return Q.ninvoke(nconf, 'get', prefix + key);
  });

  return Q.all(promises);
}

function getManyParamsSync(keys, prefix, nconf) {
  return keys.map(function(key) {
    return nconf.get(prefix + key);
  });
}

function compileString(results) {
  let connectionString = 'mongodb://';

  const user = results[0];
  const password = results[1];
  const hosts = results[2];
  const host = results[3];
  const port = results[4];
  const db = results[5];
  const poolSize = results[6];
  const fullConnectionString = results[7];

  if (user) {
    connectionString += util.format('%s:%s@', user, password);
  }

  if (fullConnectionString) {
    if (fullConnectionString.match(/^mongodb:\/\/.*:.*@.*/)) {
      // connection string contains username & password
      connectionString = fullConnectionString;
    } else if (fullConnectionString.startsWith('mongodb://') && user && password) {
      // connection string does not contain username & password but startsWith mongodb://
      const match = fullConnectionString.match(/^mongodb:\/\/(.*)/);

      connectionString = `mongodb://${user}:${password}@${match[1]}`;
    } else {
      connectionString += fullConnectionString;
    }

    return connectionString;
  }

  // if we have multiple dbs compile the connection string
  if (hosts) {
    connectionString += hosts.map(function(rsHost) {
      return util.format('%s:%d/%s', rsHost, port, db);
    }).join(',');
  } else {
    connectionString += util.format('%s:%d/%s', host, port, db);
  }

  if (poolSize) {
    connectionString += `?poolSize=${poolSize}`;
  }

  return connectionString;
}

const params = [
  'user',
  'password',
  'hosts',
  'host',
  'port',
  'db',
  'poolSize',
  'connectionString',
];

module.exports = function buildConnectionString(nconf, configPrefix) {
  return getManyParams(params, configPrefix, nconf).then(function(results) {
    return compileString(results);
  });
};

module.exports.sync = function buildConnectionStringSync(nconf, configPrefix) {
  const results = getManyParamsSync(params, configPrefix, nconf);

  return compileString(results);
};
