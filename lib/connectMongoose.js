var Q = require('q');

var buildConnectionString = require('./buildConnectionString');



var commonConnection;

function createNewConnection(nconf, mongoose, options) {
  return buildConnectionString(nconf, options.configPrefix || 'mongo:').then(function(connectionString) {
    var connection = mongoose.createConnection(connectionString);

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

function connectGlobalMongo(nconf, mongoose, options) {
  return buildConnectionString(nconf, options.configPrefix || 'mongo:').then(function(connectionString) {

    mongoose.connect(connectionString);

    if (options.logger) {
      mongoose.connection.on('connecting', function() {
        options.logger.info('Mongoose connecting');
      });

      mongoose.connection.on('connected', function() {
        options.logger.info('Mongoose connected', {
          connectionString: connectionString,
        });
      });

      mongoose.connection.on('error', function(err) {
        options.logger.error('Error connecting to mongoose', {
          error: err.message,
          stack: err.stack,
        });
      });
    }
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

function getCommonConnection() {
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

module.exports = {
  connectCommonMongo: connectCommonMongo,
  connectNewMongo: createNewConnection,
  connectGlobalMongo: connectGlobalMongo,
  getCommonConnection: getCommonConnection,
};
