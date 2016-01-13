var Q = require('q');

var buildConnectionString = require('./buildConnectionString');

module.exports = {
    connectMongo: connectMongo,
    getConnection: getConnection
};

var connection;

function init(nconf) {
    buildConnectionString(nconf, 'mongo:authmaker:').then(function(connectionString) {

        if (!connection) {
            connection = mongoose.createConnection(connectionString);
            resolveConnections();
        }

        connection.on('connecting', function() {
            winston.info("Mongoose connecting");
        });

        connection.on('connected', function() {
            winston.info("Mongoose connected", {
                connectionString: connectionString
            });
        });

        connection.on('error', function(err) {
            winston.error("Error connecting to mongoose", {
                error: err.message,
                stack: err.stack
            });
        });
    });
}

var pendingConnections = [];

function getConnection(){
    if(connection) {
        return Q(connection);
    }

    var deferred = Q.defer();

    pendingConnections.push(deferred);

    return deferred.promise;
}

function resolveConnections(){
    pendingConnections.forEach(function(deferred){
        deferred.resolve(connection);
    });
}
