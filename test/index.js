const Q = require('q');
const nconf = require('nconf');
const mongoose = require('mongoose');

mongoose.Promise = Q.Promise;
nconf.use('memory');
Q.longStackSupport = true;

after(function () {
  mongoose.disconnect();
});
