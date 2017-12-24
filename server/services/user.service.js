var config = require('config');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
const sql = require('mssql');
var logger = require('../log');
var db = require('../helpers/dbHelper.js');

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
    return authenticateUser(login, password);
}

function authenticateUser(login, password) {
    logger.info('authenticateUser');
    return db.existUser(login)
        .then((user) => {
            if (user && bcrypt.compareSync(password, user.Password)) {
                user.token = jwt.sign({ sub: user.UserId }, config.secret);
                service.CurrentUser = user;
                return Promise.resolve(user);
            } else {
                return Promise.resolve();
            }
        })
        .catch((err) => {
            logger.error(err);
        })
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

    return db.existUser(user.Login)
        .then((existUser) => {
            if (!existUser)
                return addUser(user);
            else
                return Promise.resolve({user: existUser, isExist: true});
        })
 }
  
function addUser(user) {  
    logger.info('addUser');
    let queryInsertUser = `insert into [User](UserRoleId, Login, Password, Email) values
        (2, '${user.Login}', '${user.hash}', '${user.email}')`;

    return db.executeQuery(queryInsertUser)
        .then(() => {
            return db.existUser(user.Login);
        })
}