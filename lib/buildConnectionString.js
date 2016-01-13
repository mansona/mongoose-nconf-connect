var Q = require('q');
var util = require('util');

function getManyParams(keys, prefix, nconf) {
    var promises = keys.map(function(key) {
        return Q.ninvoke(nconf, 'get', prefix + key);
    });

    return Q.all(promises);
}

module.exports = function buildConnectionString(nconf, configPrefix) {
    return getManyParams(['user', 'password', 'hosts', 'host', 'port', 'db'], configPrefix, nconf).then(function(results) {
        var connectionString = 'mongodb://';

        var user = results[0];
        var password = results[1];
        var hosts = results[2];
        var host = results[3];
        var port = results[4];
        var db = results[5];

        if (user) {
            connectionString += util.format('%s:%s@', user, password);
        }

        //if we have multiple dbs compile the connection string
        if (hosts) {
            connectionString += hosts.map(function(rsHost) {
                return util.format('%s:%d/%s', rsHost, port, db);
            }).join(',');
        } else {
            connectionString += util.format('%s:%d/%s', host, port, db);
        }

        return connectionString;
    });
};
