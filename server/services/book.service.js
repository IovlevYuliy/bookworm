var books = require('google-books-search');
var Q = require('q');
var service = {};
var config = require('config.json');
var sql = require('mssql');

service.find = find;
service.AddInFavourite = AddInFavourite;
service.getCatalog = getCatalog;
service.getBookWithNewKeyWords = getBookWithNewKeyWords;
service.getBookStatus = getBookStatus;

module.exports = service;

function find(key) {
    return new Promise((resolve, reject) => {
        books.search(key, function(error, results) {
            return error ? reject(error) : resolve(results);
        });
    });
}

function getBookStatus(book)
{
    PrepareBook(book);
    var connection = new sql.ConnectionPool(config.dbConfig);
     return new Promise((resolve, reject) => {
        connection.connect()
            .then(() => {
                return getStatus(connection, book.title, book.authors, book.userId);
            })
            .then((data) => {
                connection.close();
                resolve(data);
            })
            .catch((err) => {
                connection.close();
                reject(err);
            })
        });
}

function getStatus(connection, title, authors, userId)
{
    var request = new sql.Request(connection);
    var queryGetStatus = `SELECT status from ((BookStatus BS inner join FavouriteBook FB on BS.BookStatusId = FB.BookStatusId) 
            inner join Book B ON 
            B.BookId = FB.BookId) where B.title = '${title}' AND B.authors = '${authors}' AND FB.UserId = '${userId}'`;
    console.log(queryGetStatus);

    return new Promise(function (resolve, reject) {
        return request.query(queryGetStatus, function (err, response) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                if (response.recordset.rowsAffected == 0 || response.recordset[0] == undefined)
                    return resolve([]);
                else
                {
                    console.log(response);
                    resolve(response.recordset);
                }
            }
        });
    });
}

function getBookWithNewKeyWords()
{
    var connection = new sql.ConnectionPool(config.dbConfig);
   
    return new Promise((resolve, reject) => {
        connection.connect()
            .then(() => {
                return getBooks(connection);
            })
            .then((data) => {
                connection.close();
                resolve(data);
            })
            .catch((err) => {
                connection.close();
                reject(err);
            })
        });
}

function getBooks(connection)
{
    console.log('getBooks');
    var request = new sql.Request(connection);
    var queryGetBook = `SELECT * from ((Book inner join BookKeyWord on BookKeyWord.BookId = Book.BookId) 
            inner join KeyWord ON 
            KeyWord.KeyWordId = BookKeyWord.KeyWordId)`;
    
    return new Promise(function (resolve, reject) {
        return request.query(queryGetBook, function (err, response) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                    console.log(response.recordset);
                    resolve(response.recordset);
            }
        });
    });
}

function getCatalog()
{
    var connection = new sql.ConnectionPool(config.dbConfig);
    
    return new Promise((resolve, reject) => {
        connection.connect()
            .then(() =>{
                var request = new sql.Request(connection);
                var queryGetAllBooks = `select * from Book`;
                    
                return new Promise(function (resolve, reject) {
                    return request.query(queryGetAllBooks, function (err, response) {
                        if (err) {
                            console.log(err);
                            reject(err);
                        }
                        else {
                            resolve(response.recordset);
                        }
                    });
                });
            })
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                reject(err);
            })
    });
}

function AddInFavourite(favouriteBook) {
    var connection = new sql.ConnectionPool(config.dbConfig);
    PrepareBook(favouriteBook.book);
   let favouriteBookInfo = {};
   
    return new Promise((resolve, reject) => {
        connection.connect()
            .then(() => {
                return CheckBook(connection, favouriteBook.book);
            })
            .then((book_id) => {
                if (!book_id)
                    return AddBook(connection, favouriteBook.book);
                else
                    return Promise.resolve(book_id);
            })
            .then((book_id) => {
                favouriteBookInfo.book_id = book_id;
                return CheckFavouriteBook(connection, book_id, favouriteBook.user.UserId);
                
            })
            .then((IsFavExists) => {
                favouriteBookInfo.IsFavExists = IsFavExists;
                console.log(favouriteBookInfo);
                return GetStatusIdByName(connection, favouriteBook.book.status);
            })
            .then((statusId) => {
                favouriteBookInfo.statusId = statusId;
                if (!favouriteBookInfo.IsFavExists)
                    return AddBookFavourite(connection, favouriteBookInfo.book_id, favouriteBook, favouriteBookInfo.statusId);
                else
                    return UpdateFavouriteBook(connection, favouriteBookInfo.book_id, favouriteBook, favouriteBookInfo.statusId);
            })
            .then(() => {
                connection.close();
                resolve();
            })
            .catch((err) => {
                connection.close();
                reject(err);
            })
    });
}

function CheckBook(connection, book)
{
    console.log('CheckBook');
    var request = new sql.Request(connection);
    var queryExistBook = `select BookId from Book where title = '${book.title}'  and authors = '${book.authors}'`;
    
    return new Promise(function (resolve, reject) {
        return request.query(queryExistBook, function (err, response) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                if (response.recordset.rowsAffected == 0 || response.recordset[0] == undefined)
                {
                    console.log(null);
                    resolve(null);
                }
                else
                {
                    console.log(response.recordset[0].BookId);
                    resolve(response.recordset[0].BookId);
                }
            }
        });
    });
}

function CheckFavouriteBook(connection, book_id, userId)
{
    console.log('CheckFavouriteBook');
    var request = new sql.Request(connection);
    var queryExistFavBook = `select BookId from FavouriteBook where BookId = '${book_id}'  and UserId = '${userId}'`;
    
    console.log(queryExistFavBook);

    return new Promise(function (resolve, reject) {
        return request.query(queryExistFavBook, function (err, response) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                if (response.recordset.rowsAffected == 0 || response.recordset[0] == undefined || response.recordset[0] == null)
                    resolve(false);
                else
                    resolve(true);
            }
        });
    });
}

function AddBook(connection, book)
{
    console.log('ADDBook', book);
    if (book.publishedDate == undefined)
        book.publishedDate = null;
    var queryInsertBook = `insert into Book(title, authors, link, thumbnail, publishedDate, description, EstimatedRating) OUTPUT Inserted.BookId values
            ('${book.title}', '${book.authors}', '${book.link}', '${book.thumbnail}', ${book.publishedDate},
             '${book.description}', 1)`;

    console.log(queryInsertBook);
    var request = new sql.Request(connection);

    return new Promise(function (resolve, reject) {
        return request.query(queryInsertBook, function (err, response) {
            if (err) {
                console.log(queryInsertBook, err);
                return reject(err);
            }
            console.log(response.recordset[0].BookId);
            return resolve(response.recordset[0].BookId);
        });
    });
}

function AddBookFavourite(connection, bookId, favourBook, statusId)
{
    console.log('AddFavourite');
    var queryInsertFavouriteBook = `insert into FavouriteBook(UserId, BookId, BookStatusId, UserRating) values
            ('${favourBook.user.UserId}', '${bookId}', '${statusId}', 0)`;


    console.log(queryInsertFavouriteBook);
    var request = new sql.Request(connection);

    return new Promise(function (resolve, reject) {
        return request.query(queryInsertFavouriteBook, function (err, response) {
            if (err) {
                console.log(queryInsertFavouriteBook, err);
                return reject(err);
            }
            console.log('addedFav');
            return resolve();
        });
    });
}

function UpdateFavouriteBook(connection, bookId, favourBook, statusId)
{
    console.log('UpdateFavourite', bookId, favourBook);
    var queryUpdateFavouriteBook = `UPDATE FavouriteBook SET BookStatusId = '${statusId}' where
    UserId = '${favourBook.user.UserId}' AND BookId = '${bookId}'`;


    console.log(queryUpdateFavouriteBook);
    var request = new sql.Request(connection);

    return new Promise(function (resolve, reject) {
        return request.query(queryUpdateFavouriteBook, function (err, response) {
            if (err) {
                console.log(queryUpdateFavouriteBook, err);
                return reject(err);
            }
            console.log('UpdateFav');
            return resolve();
        });
    });
}

function GetStatusIdByName(connection, statusName)
{
    console.log('GetStatusIdByName');
    var queryGetStatus = `SELECT BookStatusId from BookStatus where Status = '${statusName}'`;

    console.log(queryGetStatus);
    var request = new sql.Request(connection);

    return new Promise(function (resolve, reject) {
        return request.query(queryGetStatus, function (err, response) {
            if (err) {
                console.log(queryGetStatus, err);
                return reject(err);
            }
            console.log(response.recordset[0].BookStatusId);
            return resolve(response.recordset[0].BookStatusId);
        });
    });
}

function PrepareBook(book)
{
    book.title = mysql_real_escape_string(book.title);
    book.authors = mysql_real_escape_string(book.authors);
    if (book.description)
        book.description = mysql_real_escape_string(book.description);
}

function mysql_real_escape_string (str) {
    if (!str)
        return str;

    return str.toString().replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return char + char; // prepends a backslash to backslash, percent,
                                    // and double/single quotes
        }
    });
}


