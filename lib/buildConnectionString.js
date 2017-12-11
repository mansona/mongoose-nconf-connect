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

  if (user) {
    connectionString += util.format('%s:%s@', user, password);
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

module.exports = function buildConnectionString(nconf, configPrefix) {
  return getManyParams([
    'user',
    'password',
    'hosts',
    'host',
    'port',
    'db',
    'poolSize',
  ], configPrefix, nconf).then(function(results) {
    return compileString(results);
  });
};

module.exports.sync = function buildConnectionStringSync(nconf, configPrefix) {
  const results = getManyParamsSync([
    'user',
    'password',
    'hosts',
    'host',
    'port',
    'db',
    'poolSize',
  ], configPrefix, nconf);

  return compileString(results);
};
