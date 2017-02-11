# Mongoose NConf Connect

This is a very simple module that takes [mongoose](https://www.npmjs.com/package/mongoose) and [nconf](https://www.npmjs.com/package/nconf) and builds you a connection with config that is laid out in a *"standard"* way.

## Usage
```
var mongooseConnect = require('mongoose-nconf-connect');

// Initialise the common connection
mongooseConnect.connectCommonMongo(nconf, mongoose);

// Get a connection and use it
mongooseConnect.getConnection().then(function(connection){
  //register models on the connection
  connection.model('myModel', mongoose.Schema({example: String})
})
```

It is important to note that `getConnection()` returns a promise. This allows us to use the `nconf.get()` async methods so that you can keep your config in redis for example.


You can also pass a logger (eg. winston instance) into `mongooseConnect()` so that it reports any connection errors.

```
// Initialise the common connection with winston
mongooseConnect.connectCommonMongo(nconf, mongoose, {logger: winston});
```

## Config
The default config layout is like this:

```
{
    "mongo": {
        "db": "mySuperDatabase",
        "host": "localhost",
        "port": 27017
    }
}    
```

if you don't send a new prefix in the options to mongooseConnect this is where it will expect to find the config for your Mongodb host

you can even pass replica sets as an array of hosts here:

```
{
    "mongo": {
        "db": "mySuperDatabase",
        "host": ["host1", "host2", "host3"],
        "port": 27017
}    
```
