var config = require('config');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
const sql = require('mssql');
var logger = require('../log');

var service = {};

service.authenticate = authenticate;
service.getToken = getToken;
// service.getAll = getAll;
// service.getById = getById;
service.createUser = createUser;
// service.update = update;
// service.delete = _delete;
service.CurrentUser = null;

module.exports = service;

function authenticate(login, password) {
    var connection = new sql.ConnectionPool(config.dbConfig);
    return new Promise((resolve, reject) => {
        connection.connect()
            .then(() => {
                var request = new sql.Request(connection);
                var queryIsUserExist = `SELECT * FROM [User] where [login] = '${login}'`;

                return new Promise(function (resolve, reject) {
                    return request.query(queryIsUserExist, function (err, user) {
                        if (err) {
                            logger.error(err);
                            reject(err);
                        }
                        else {
                            if (user && bcrypt.compareSync(password, user.recordset[0].Password)) {
                                resolve({
                                    UserId: user.recordset[0].UserId,
                                    UserRoleId: user.recordset[0].UserRoleId,
                                    Login: user.recordset[0].Login,
                                    Password: user.recordset[0].hash,
                                    Email: user.recordset[0].Email,
                                    token: jwt.sign({ sub: user.UserId }, config.secret)
                                });
                                service.CurrentUser = user;
                            } else {
                                resolve();
                            }
                        }
                    });
                });
            })
            .then((data) => {
                resolve(data);
                connection.close();
            })
            .catch((err) => {
                reject(err);
                connection.close();
            })
    });
}

function getToken(login, password) {
    var deferred = Q.defer();
    deferred.resolve(jwt.sign({ sub: login }, config.secret));
    return deferred.promise;
};

// function getAll() {
//     var deferred = Q.defer();

//     db.users.find().toArray(function (err, users) {
//         if (err) deferred.reject(err.name + ': ' + err.message);

//         // return users (without hashed passwords)
//         users = _.map(users, function (user) {
//             return _.omit(user, 'hash');
//         });

//         deferred.resolve(users);
//     });

//     return deferred.promise;
// }

// function getById(_id) {
//     var deferred = Q.defer();

//     db.users.findById(_id, function (err, user) {
//         if (err) deferred.reject(err.name + ': ' + err.message);

//         if (user) {
//             // return user (without hashed password)
//             deferred.resolve(_.omit(user, 'hash'));
//         } else {
//             // user not found
//             deferred.resolve();
//         }
//     });

//     return deferred.promise;
// }

function createUser(userParam) {
    var connection = new sql.ConnectionPool(config.dbConfig);
    var user = _.omit(userParam, 'password');
    user.hash = bcrypt.hashSync(userParam.password, 10);

    //connect to your database
    return new Promise((resolve, reject) => {
        connection.connect()
            .then(() => {
                var request = new sql.Request(connection);
                var queryInsertUser = `insert into [User](UserRoleId, Login, Password, Email) values
                                       (1, '${user.Login}', '${user.hash}', '${user.email}')`;

                return new Promise(function (resolve, reject) {
                    return request.query(queryInsertUser, function (err, recordset) {
                        if (err) {
                            logger.error(err);
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            })
            .then((data) => {
                resolve(data);
                connection.close();
            })
            .catch((err) => {
                reject(err);
                connection.close();
            })
    });

}

// function update(_id, userParam) {
//     var deferred = Q.defer();

//     // validation
//     db.users.findById(_id, function (err, user) {
//         if (err) deferred.reject(err.name + ': ' + err.message);

//         if (user.username !== userParam.username) {
//             // username has changed so check if the new username is already taken
//             db.users.findOne(
//                 { username: userParam.username },
//                 function (err, user) {
//                     if (err) deferred.reject(err.name + ': ' + err.message);

//                     if (user) {
//                         // username already exists
//                         deferred.reject('Username "' + req.body.username + '" is already taken')
//                     } else {
//                         updateUser();
//                     }
//                 });
//         } else {
//             updateUser();
//         }
//     });

//     function updateUser() {
//         // fields to update
//         var set = {
//             firstName: userParam.firstName,
//             lastName: userParam.lastName,
//             username: userParam.username,
//         };

//         // update password if it was entered
//         if (userParam.password) {
//             set.hash = bcrypt.hashSync(userParam.password, 10);
//         }

//         db.users.update(
//             { _id: mongo.helper.toObjectID(_id) },
//             { $set: set },
//             function (err, doc) {
//                 if (err) deferred.reject(err.name + ': ' + err.message);

//                 deferred.resolve();
//             });
//     }

//     return deferred.promise;
// }

// function _delete(_id) {
//     var deferred = Q.defer();

//     db.users.remove(
//         { _id: mongo.helper.toObjectID(_id) },
//         function (err) {
//             if (err) deferred.reject(err.name + ': ' + err.message);

//             deferred.resolve();
//         });

//     return deferred.promise;
// }