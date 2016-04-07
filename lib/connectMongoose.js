var Q = require('q');

var buildConnectionString = require('./buildConnectionString');

var commonConnection;

function addLoggers(connection, connectionString, options) {
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
}

function createNewConnection(nconf, mongoose, options) {
  return buildConnectionString(nconf, options.configPrefix || 'mongo:').then(function(connectionString) {
    var connection = mongoose.createConnection(connectionString);

    addLoggers(connection, connectionString, options);

    return connection;
  });
}

function connectGlobalMongo(nconf, mongoose, options) {
  return buildConnectionString(nconf, options.configPrefix || 'mongo:').then(function(connectionString) {

    mongoose.connect(connectionString);

    addLoggers(mongoose.connection, connectionString, options);
  });
}

function openConnection(nconf, connection, options) {
  return buildConnectionString(nconf, options.configPrefix || 'mongo:').then(function(connectionString) {

    connection.open(connectionString);

    addLoggers(connection, connectionString, options);
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
  openConnection: openConnection,
  getCommonConnection: getCommonConnection,
};
