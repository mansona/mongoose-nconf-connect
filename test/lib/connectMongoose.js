const nconf = require('nconf');
const mongoose = require('mongoose');
const Q = require('q');
const sinon = require('sinon');

const mongooseConnect = require('../../');

describe('connect mongoose', () => {
  afterEach(() => {
    nconf.reset();
  });

  it('can connect with host definition', () => {
    nconf.set('mongo', {
      db: 'mySuperDatabase',
      host: 'localhost',
      port: 27017,
    });
    return mongooseConnect.connectNewMongo(nconf, mongoose).then((connection) => {
      const faces = connection.collection('faces');
      return Q.ninvoke(faces, 'find').then(() => {
        console.log('¯\\_(ツ)_/¯');
      });
    });
  });

  it('can connect with a single host in the hosts array', () => {
    nconf.set('mongo', {
      db: 'mySuperDatabase',
      hosts: ['localhost'],
      port: 27017,
    });
    return mongooseConnect.connectNewMongo(nconf, mongoose).then((connection) => {
      const faces = connection.collection('faces');
      return Q.ninvoke(faces, 'find').then(() => {
        console.log('¯\\_(ツ)_/¯');
      });
    });
  });

  it('can connect with sync methods', () => {
    nconf.set('mongo', {
      db: 'mySuperDatabase',
      hosts: ['localhost'],
      port: 27017,
    });
    const connection = mongooseConnect.connectNewMongoSync(nconf, mongoose)
    const faces = connection.collection('faces');
    return Q.ninvoke(faces, 'find').then(() => {
      console.log('¯\\_(ツ)_/¯');
    });
  });
});
