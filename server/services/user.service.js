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

    // db.users.findOne({ username: username }, function (err, user) {
    //     if (err) deferred.reject(err.name + ': ' + err.message);

    //     if (user && bcrypt.compareSync(password, user.hash)) {
    //         // authentication successful
    //         deferred.resolve({
    //             _id: user._id,
    //             username: user.username,
    //             firstName: user.firstName,
    //             lastName: user.lastName,
    //             token: jwt.sign({ sub: user._id }, config.secret)
    //         });
    //     } else {
    //         // authentication failed
    //         deferred.resolve();
    //     }
    // });

    return deferred.promise;
}

function getAll() {
    var deferred = Q.defer();

    db.users.find().toArray(function (err, users) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        // return users (without hashed passwords)
        users = _.map(users, function (user) {
            return _.omit(user, 'hash');
        });

        deferred.resolve(users);
    });

    return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();

    db.users.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user) {
            // return user (without hashed password)
            deferred.resolve(_.omit(user, 'hash'));
        } else {
            // user not found
            deferred.resolve();
        }
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

function update(_id, userParam) {
    var deferred = Q.defer();

    // validation
    db.users.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user.username !== userParam.username) {
            // username has changed so check if the new username is already taken
            db.users.findOne(
                { username: userParam.username },
                function (err, user) {
                    if (err) deferred.reject(err.name + ': ' + err.message);

                    if (user) {
                        // username already exists
                        deferred.reject('Username "' + req.body.username + '" is already taken')
                    } else {
                        updateUser();
                    }
                });
        } else {
            updateUser();
        }
    });

    function updateUser() {
        // fields to update
        var set = {
            firstName: userParam.firstName,
            lastName: userParam.lastName,
            username: userParam.username,
        };

        // update password if it was entered
        if (userParam.password) {
            set.hash = bcrypt.hashSync(userParam.password, 10);
        }

        db.users.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();

    db.users.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}