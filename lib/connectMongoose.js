var Q = require('q');

var buildConnectionString = require('./buildConnectionString');

var commonConnection;
var pendingConnections = [];

function createNewConnection(nconf, mongoose, options) {
  if (!options) {
    // eslint-disable-next-line no-param-reassign
    options = {};
  }

  const prefix = options.configPrefix || 'mongo:';
  return Q.ninvoke(nconf, 'get', prefix + 'options').then(function(mongoOptions) {
    return buildConnectionString(nconf, prefix).then(function(connectionString) {
      var connection = mongoose.createConnection(connectionString, mongoOptions);

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
  });
}

function connectGlobalMongo(nconf, mongoose, options) {
  var prefix = options.configPrefix || 'mongo:';
  return Q.ninvoke(nconf, 'get', prefix + 'options').then(function(mongoOptions) {
    return buildConnectionString(nconf, prefix).then(function(connectionString) {
      mongoose.connect(connectionString, mongoOptions);

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
  });
}

function resolveConnections() {
  pendingConnections.forEach(function(deferred) {
    deferred.resolve(commonConnection);
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

function getCommonConnection() {
  if (commonConnection) {
    return Q(commonConnection);
  }

  // eslint-disable-next-line vars-on-top
  var deferred = Q.defer();

  pendingConnections.push(deferred);

  return deferred.promise;
}

module.exports = {
  connectCommonMongo: connectCommonMongo,
  connectNewMongo: createNewConnection,
  connectGlobalMongo: connectGlobalMongo,
  getCommonConnection: getCommonConnection,
};
