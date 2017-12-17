var books = require('google-books-search');
var Q = require('q');
var service = {};
var config = require('config.json');
var sql = require('mssql');

service.find = find;
service.AddInFavourite = AddInFavourite;
service.getCatalog = getCatalog;

module.exports = service;

function find(key) {
    return new Promise((resolve, reject) => {
        books.search(key, function(error, results) {
            return error ? reject(error) : resolve(results);
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
    return new Promise((resolve, reject) => {
        connection.connect()
            .then(() => {
                return CheckBook(connection, favouriteBook.book);
            })
            .then((_id) => {
                if (!_id)
                    return AddBook(connection, favouriteBook.book);
                else
                    return Promise.resolve(_id);
            })
            .then((_id) => {
                //return GetBookStatusId();
                return SetBookFavourite(connection, _id, favouriteBook.user);
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
    var queryExistBook = `select BookId from Book where title = '${book.title}'  and author = '${book.authors}'`;
    
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

function AddBook(connection, book)
{
    console.log('ADDBook');
    var queryInsertBook = `insert into Book(Title, Author, Link, CoverImage, PublishedDate, Description, EstimatedRating) OUTPUT Inserted.BookId values
            ('${book.title}', '${book.authors}', '${book.link}', '${book.thumbnail}', '${book.publishedDate}',
             '${book.description}', 1)`;

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

function SetBookFavourite(connection, _id, user)
{
    console.log('Favourite');
    console.log(user);
    var queryInsertFavouriteBook = `insert into FavouriteBook(UserId, BookId, BookStatusId, UserRating) values
            ('${user.UserId}', '${_id}', '9b86ad37-88ed-4ce7-9029-1030a42719f8', 0)`;


    console.log(queryInsertFavouriteBook);
    var request = new sql.Request(connection);

    return new Promise(function (resolve, reject) {
        return request.query(queryInsertFavouriteBook, function (err, response) {
            if (err) {
                console.log(queryInsertFavouriteBook, err);
                return reject(err);
            }
            console.log('added');
            return resolve();
        });
    });
}

function PrepareBook(book)
{
    book.title = mysql_real_escape_string(book.title);
    book.authors = mysql_real_escape_string(book.authors);
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


