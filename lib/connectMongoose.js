var Q = require('q');

var buildConnectionString = require('./buildConnectionString');

module.exports = {
  connectCommonMongo: connectCommonMongo,
  connectNewMongo: createNewConnection,
  getConnection: getConnection,
};

var commonConnection;

function createNewConnection(nconf, mongoose, options) {
  return buildConnectionString(nconf, options.configPrefix || 'mongo:').then(function(connectionString) {
    let connection = mongoose.createConnection(connectionString);

    if (options.logger) {
      connection.on('connecting', function() {
        options.logger.info('Mongoose connecting');
      });

      connection.on('connected', function() {
        options.logger.info('Mongoose connected', {
          connectionString: connectionString,
        });
      });

      connection.on('error', function(err) {
        options.logger.error('Error connecting to mongoose', {
          error: err.message,
          stack: err.stack,
        });
      });
    }

    return connection;
  });
}

function connectCommonMongo(nconf, mongoose, logger) {
  if (commonConnection) {
    return Q(commonConnection);
  }

  return createNewConnection(nconf, mongoose, logger).then(function(connection) {
    commonConnection = connection;
    resolveConnections();

    return connection;
  });
}

var pendingConnections = [];

function getConnection() {
  if (commonConnection) {
    return Q(commonConnection);
  }

  var deferred = Q.defer();

  pendingConnections.push(deferred);

  return deferred.promise;
}

function resolveConnections() {
  pendingConnections.forEach(function(deferred) {
    deferred.resolve(commonConnection);
  });
}
