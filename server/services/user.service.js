var configJson = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(configJson.connectionString, { native_parser: true });
const sql = require('mssql');
var config = require('config.json');
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
     var connection = new sql.ConnectionPool(config.dbConfig);
     return new Promise((resolve, reject) => {
        connection.connect()
            .then(() => {
                return authenticateUser(connection, login, password);
            })
            .then((user) => {
                connection.close();
                resolve(user);
            })
            .catch((err) => {
                connection.close();
                reject(err);
            })
        });
}

function authenticateUser(connection, login, password)
{
    console.log('authUser');
     var request = new sql.Request(connection);
    var queryIsUserExist = `SELECT * FROM [User] where [login] = '${login}'`;

    return new Promise(function (resolve, reject) {
        return request.query(queryIsUserExist, function (err, response) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else
            {
                if (response.recordset[0] && bcrypt.compareSync(password, response.recordset[0].Password)) {
                    service.CurrentUser = response;
                    let user = {
                        UserId: response.recordset[0].UserId,
                        UserRoleId: response.recordset[0].UserRoleId,
                        Login: response.recordset[0].Login,
                        Password: response.recordset[0].hash,
                        Email: response.recordset[0].Email,
                        token: jwt.sign({ sub: response.UserId }, configJson.secret)
                    }
                    resolve(user);
                    
                } else 
                    resolve();
            }
        })
    });
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
    var user = _.omit(userParam, 'password');
    // add hashed password to user object
    user.hash = bcrypt.hashSync(userParam.password, 10);

    var connection = new sql.ConnectionPool(config.dbConfig);
     return new Promise((resolve, reject) => {
        connection.connect()
            .then(() => {
                return checkUserExists(connection, user);
            })
            .then((isExist) => {
                if (!isExist)
                    return addUser(connection, user);
                else
                    resolve(false);
            })
            .then((data) => {
                let isExist = {
                    isExist: data
                }
                connection.close();
                resolve(isExist);
            })
            .catch((err) => {
                connection.close();
                reject(err);
            })
        });
 }
  
function addUser(connection, userParam)
{  
    var queryInsertUser = `insert into [User](UserRoleId, Login, Password, Email) values
            (1, '${user.Login}', '${user.hash}', '${user.email}')`;

    return new Promise(function (resolve, reject) {
        return request.query(queryInsertUser, function (err, response) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else 
                resolve(true);
            })
        });
}

function checkUserExists(connection, user)
{
    console.log('CheckUser');
    var request = new sql.Request(connection);
    var queryExistUser = `select UserId from [User] where Login = '${user.Login}'`;
    
    return new Promise(function (resolve, reject) {
        return request.query(queryExistUser, function (err, response) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                if (response.recordset.rowsAffected == 0 || response.recordset[0] == undefined)
                {
                    console.log(false);
                    resolve(false);
                }
                else
                {
                    console.log(true);
                    resolve(true);
                }
            }
        });
    });
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