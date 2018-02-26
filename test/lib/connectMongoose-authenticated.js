const nconf = require('nconf');
const mongoose = require('mongoose');
const Q = require('q');
const sinon = require('sinon');

const mongooseConnect = require('../../');

// TODO: figure out how to get auth to actually connect on travis or mock the whole thing :/
describe.skip('connect mongoose authenticated', () => {
  afterEach(() => {
    nconf.reset();
  });

  it('obscures the username@password from connection log when it is passed with object config', () => {
    nconf.set('mongo', {
      db: 'mySuperDatabase',
      hosts: ['localhost'],
      port: 27017,
      user: 'superface',
      password: 'superpassword',
    });

    const infoStub = sinon.stub();

    const connection = mongooseConnect.connectNewMongoSync(nconf, mongoose, {
      logger: {
        info: infoStub,
        error: console.error,
      },
    });
    const faces = connection.collection('faces');
    return Q.ninvoke(faces, 'find').then(() => {
      sinon.assert.calledWith(infoStub, 'Mongoose connected', 'mongodb://<username_redacted>:<password_redacted>@localhost:27017/mySuperDatabase');
    });
  });

  it('obscures the username@password from connection log when it is passed with mixture of object config and connectionString', () => {
    nconf.set('mongo', {
      connectionString: 'mongodb://localhost:27017/mySuperDatabase',
      user: 'superface',
      password: 'superpassword',
    });

    const infoStub = sinon.stub();

    const connection = mongooseConnect.connectNewMongoSync(nconf, mongoose, {
      logger: {
        info: infoStub,
        error: console.error,
      },
    });
    const faces = connection.collection('faces');
    return Q.ninvoke(faces, 'find').then(() => {
      sinon.assert.calledWith(infoStub, 'Mongoose connected', 'mongodb://<username_redacted>:<password_redacted>@localhost:27017/mySuperDatabase');
    });
  });

  it('obscures the username@password from connection log when it is passed with connectionString only', () => {
    nconf.set('mongo', {
      connectionString: 'mongodb://superface:superpassword@localhost:27017/mySuperDatabase',
    });

    const infoStub = sinon.stub();

    const connection = mongooseConnect.connectNewMongoSync(nconf, mongoose, {
      logger: {
        info: infoStub,
        error: console.error,
      },
    });
    const faces = connection.collection('faces');
    return Q.ninvoke(faces, 'find').then(() => {
      sinon.assert.calledWith(infoStub, 'Mongoose connected', 'mongodb://<username_redacted>:<password_redacted>@localhost:27017/mySuperDatabase');
    });
  });
});
