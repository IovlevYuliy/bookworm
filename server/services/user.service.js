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
    logger.info('authenticate');
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

function authenticateUser(connection, login, password) {
    logger.info('authenticateUser');
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


function getToken(login, password) {
    logger.info('getToken');
    var deferred = Q.defer();
    deferred.resolve(jwt.sign({ sub: login }, config.secret));
    return deferred.promise;
};

function createUser(userParam) {
    logger.info('createUser');
    var user = _.omit(userParam, 'password');
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
  
function addUser(connection, userParam) {  
    logger.info('addUser');
    var queryInsertUser = `insert into [User](UserRoleId, Login, Password, Email) values
            (1, '${user.Login}', '${user.hash}', '${user.email}')`;

    return new Promise(function (resolve, reject) {
        return request.query(queryInsertUser, function (err, response) {
            if (err) {
                logger.error('err');
                reject(err);
            }
            else 
                resolve(true);
            })
        });
}

function checkUserExists(connection, user) {
    logger.info('CheckUser');
    var request = new sql.Request(connection);
    var queryExistUser = `select UserId from [User] where Login = '${user.Login}'`;
    
    return new Promise(function (resolve, reject) {
        return request.query(queryExistUser, function (err, response) {
            if (err) {
                logger.error('err');
                reject(err);
            }
            else {
                if (response.recordset.rowsAffected === 0 || !response.recordset[0]) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            }
        });
    });
}