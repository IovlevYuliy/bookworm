var configJson = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(configJson.connectionString, { native_parser: true });
const sql = require('mssql');
var config = {
    user: 'sa',
    password: '1',
    server: 'localhost', 
    database: 'BookWormDB'
};
db.bind('users');

var service = {};

service.authenticate = authenticate;
service.getAll = getAll;
service.getById = getById;
service.createUser = createUser;
service.update = update;
service.delete = _delete;
service.CurrentUser = null;

module.exports = service;

function authenticate(login, password) {
    var deferred = Q.defer();
     sql.connect(config, function (err) {
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();

        // query to the database and get the records
        var queryIsUserExist = `SELECT * FROM [User] where [login] = '${login}'`;
        request.query(queryIsUserExist, function (err, user) {
            if (err)
            {
                deferred.reject(err);
                console.log(err);
            }
            else
            {
                 if (user && bcrypt.compareSync(password, user.recordset[0].Password)) {
                    // authentication successful
                    deferred.resolve({
                        UserId: user.recordset[0].UserId,
                        UserRoleId: user.recordset[0].UserRoleId,
                        Login: user.recordset[0].Login,
                        Password: user.recordset[0].hash,
                        Email: user.recordset[0].Email,
                        token: jwt.sign({ sub: user.UserId }, configJson.secret)
                    });
                    service.CurrentUser = user;
                } else {
                    // authentication failed
                    deferred.resolve();
                }
            }
            sql.close();
        });
    });

    return deferred.promise;
}

function createUser(userParam) {
   var deferred = Q.defer();
    // set user object to userParam without the cleartext password
    var user = _.omit(userParam, 'password');
    // add hashed password to user object
    user.hash = bcrypt.hashSync(userParam.password, 10);

    //connect to your database
    sql.connect(config, function (err) {
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
        
        // query to the database and get the records
        var queryInsertUser = `insert into [User](UserRoleId, Login, Password, Email) values
            (1, '${user.Login}', '${user.hash}', '${user.email}')`;
        request.query(queryInsertUser, function (err, recordset) {
            if (err)
            {
                deferred.reject(err);
                console.log(err);
            }
            else
            {
                deferred.resolve();
            }
            sql.close();
        });
    });
    return deferred.promise;
}