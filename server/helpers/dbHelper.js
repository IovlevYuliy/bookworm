var config = require('config.json');
var sql = require('mssql');

function executeQuery(query) {
    var connection = new sql.ConnectionPool(config.dbConfig);
    return connection.connect()
        .then((pool) => {
            return pool.request().query(query);
        })
        .catch((err) => {
            console.log(err);
        })
}

function getStatus(title, authors, userId) {
    let queryGetStatus = `SELECT status from ((BookStatus BS inner join FavouriteBook FB on BS.BookStatusId = FB.BookStatusId) 
            inner join Book B ON 
            B.BookId = FB.BookId) where B.title = '${title}' AND B.authors = '${authors}' AND FB.UserId = '${userId}'`;

    return executeQuery(queryGetStatus)
        .then((res) => {
            if (res.recordset.rowsAffected === 0 || !response.recordset[0]) {
                return Promise.resolve([]);
            } else {
                return Promise.resolve(res.recordset);
            }
        });
}

function removeKeyWord(bookId, wordId) {
    let queryRemoveKw = `DELETE BookKeyWord where BookId = '${bookId}' AND KeyWordId = '${wordId}'`;

    return executeQuery(queryRemoveKw);
}

function addKeyWord(keyWord) {
    let queryAddKw = `INSERT INTO KeyWord(word) OUTPUT Inserted.KeyWordId values ('${keyWord}')`;

    return executeQuery(queryAddKw)
    	.then((res) => {
    		return Promise.resolve(res.recordset[0].KeyWordId);
    	})
}

function findKeyWord(keyWord) {
    let queryFindWord = `SELECT KeyWordId FROM KeyWord where word = '${word}'`;

    return executeQuery(queryFindWord)
    	if (res.recordset.rowsAffected === 0 || !response.recordset[0]) {
            return Promise.resolve(null);
        } else {
            return Promise.resolve(res.recordset[0].KeyWordId);
        }
}

module.exports = {
    executeQuery: executeQuery,
    getStatus: getStatus,
    removeKeyWord: removeKeyWord,
    addKeyWord: addKeyWord,
    findKeyWord: findKeyWord
};