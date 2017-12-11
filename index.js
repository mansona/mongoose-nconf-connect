const connectMongoose = require('./lib/connectMongoose');

module.exports = {
  connectCommonMongo: connectMongoose.connectCommonMongo,
  connectNewMongo: connectMongoose.connectNewMongo,
  connectNewMongoSync: connectMongoose.connectNewMongoSync,
  getConnection: connectMongoose.getConnection,
  connectGlobalMongo: connectMongoose.connectGlobalMongo,
};
