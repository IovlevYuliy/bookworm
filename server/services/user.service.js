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
    return deferred.promise;
}

function getToken(login, password) {
    var deferred = Q.defer();
    deferred.resolve(jwt.sign({ sub: login }, config.secret));
    return deferred.promise;
};

function createUser(userParam) {
    var connection = new sql.ConnectionPool(config.dbConfig);
    var user = _.omit(userParam, 'password');
    user.hash = bcrypt.hashSync(userParam.password, 10);

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