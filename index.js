var connectMongoose = require('./lib/connectMongoose');

module.exports = {
  connectCommonMongo: connectMongoose.connectCommonMongo,
  connectNewMongo: connectMongoose.connectNewMongo,
  getConnection: connectMongoose.getConnection,
  connectGlobalMongo: connectMongoose.connectGlobalMongo,
};
