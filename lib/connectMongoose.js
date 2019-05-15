const Q = require('q');

const buildConnectionString = require('./buildConnectionString');

let commonConnection;
const pendingConnections = [];

function setupLoggers(connection, options, connectionString) {
  if (options.logger) {
    connection.on('connecting', function() {
      options.logger.info('Mongoose connecting');
    });

    let filteredConnectionString;

    // if the connection string has a username:password combination remove that
    const match = connectionString.match(/mongodb:\/\/(\w+:\w+@).*/);

    if (!match) {
      filteredConnectionString = connectionString;
    } else {
      filteredConnectionString = connectionString.replace(match[1], '<username_redacted>:<password_redacted>@');
    }

    connection.on('connected', function() {
      options.logger.info('Mongoose connected', filteredConnectionString);
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
  if (!options) {
    // eslint-disable-next-line no-param-reassign
    options = {};
  }

  const prefix = options.configPrefix || 'mongo:';
  return Q.ninvoke(nconf, 'get', prefix + 'options').then(function(mongoOptions) {
    return buildConnectionString(nconf, prefix).then(function(connectionString) {
      const connection = mongoose.createConnection(connectionString, {
        useNewUrlParser: true,
        ...mongoOptions,
      });

      setupLoggers(connection, options, connectionString);

      return connection;
    });
  });
}

function connectNewMongoSync(nconf, mongoose, options) {
  if (!options) {
    // eslint-disable-next-line no-param-reassign
    options = {};
  }

  const prefix = options.configPrefix || 'mongo:';

  const mongoOptions = nconf.get(`${prefix}options`);

  const connectionString = buildConnectionString.sync(nconf, prefix);

  const connection = mongoose.createConnection(connectionString, {
    useNewUrlParser: true,
    ...mongoOptions,
  });

  setupLoggers(connection, options, connectionString);

  return connection;
}

function connectGlobalMongo(nconf, mongoose, options) {
  const prefix = options.configPrefix || 'mongo:';
  return Q.ninvoke(nconf, 'get', prefix + 'options').then(function(mongoOptions) {
    return buildConnectionString(nconf, prefix).then(function(connectionString) {
      mongoose.connect(connectionString, {
        useNewUrlParser: true,
        ...mongoOptions,
      });

      setupLoggers(mongoose.connection, options, connectionString);
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
  const deferred = Q.defer();

  pendingConnections.push(deferred);

  return deferred.promise;
}

module.exports = {
  connectCommonMongo,
  connectNewMongo: createNewConnection,
  connectGlobalMongo,
  getCommonConnection,
  connectNewMongoSync,
};
