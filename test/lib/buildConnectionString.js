const nconf = require('nconf');
const { expect } = require('chai');

const buildConnectionString = require('../../lib/buildConnectionString');

describe('buildConnectionString', () => {
  afterEach(() => {
    nconf.reset();
  });

  it('builds connection string properly with host definition', () => {
    nconf.set('mongo', {
      db: 'mySuperDatabase',
      host: 'localhost',
      port: 27017,
    });

    expect(buildConnectionString.sync(nconf, 'mongo:')).to.eql('mongodb://localhost:27017/mySuperDatabase');
  });

  it('builds connection string properly with a single host in the hosts array', () => {
    nconf.set('mongo', {
      db: 'mySuperDatabase',
      hosts: ['localhost'],
      port: 27017,
    });
    expect(buildConnectionString.sync(nconf, 'mongo:')).to.eql('mongodb://localhost:27017/mySuperDatabase');
  });

  it('builds connection string properly with multiple hosts in the hosts array', () => {
    nconf.set('mongo', {
      db: 'mySuperDatabase',
      hosts: ['localhost', 'outerhost'],
      port: 27017,
    });
    expect(buildConnectionString.sync(nconf, 'mongo:')).to.eql('mongodb://localhost:27017/mySuperDatabase,outerhost:27017/mySuperDatabase');
  });

  it('builds connection string properly when connectionString is passed without protocol prefix', () => {
    nconf.set('mongo', {
      connectionString: 'andnowfor:20771/something,completely:222222/different',
      user: 'face',
      password: 'pw',
      db: 'mySuperDatabase',
      hosts: ['localhost', 'outerhost'],
      port: 27017,
    });
    expect(buildConnectionString.sync(nconf, 'mongo:')).to.eql('mongodb://face:pw@andnowfor:20771/something,completely:222222/different');
  });

  it('builds connection string properly when full connectionString is passed', () => {
    nconf.set('mongo', {
      connectionString: 'mongodb://andnowfor:20771/something,completely:222222/different',
      user: 'face',
      password: 'pw',
      db: 'mySuperDatabase',
      hosts: ['localhost', 'outerhost'],
      port: 27017,
    });
    expect(buildConnectionString.sync(nconf, 'mongo:')).to.eql('mongodb://face:pw@andnowfor:20771/something,completely:222222/different');
  });

  it('ignores user and password when they are passed into the connection string', () => {
    nconf.set('mongo', {
      connectionString: 'mongodb://realuser:realpassword@andnowfor:20771/something,completely:222222/different',
      user: 'face',
      password: 'pw',
      db: 'mySuperDatabase',
      hosts: ['localhost', 'outerhost'],
      port: 27017,
    });
    expect(buildConnectionString.sync(nconf, 'mongo:')).to.eql('mongodb://realuser:realpassword@andnowfor:20771/something,completely:222222/different');
  });
});
