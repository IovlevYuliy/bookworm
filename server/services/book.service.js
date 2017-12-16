var books = require('google-books-search');
var Q = require('q');
var service = {};
var config = require('config.json');
var sql = require('mssql');

service.find = find;
service.AddInFavourite = AddInFavourite;

module.exports = service;

function find(key) {
    return new Promise((resolve, reject) => {
        books.search(key, function(error, results) {
            return error ? reject(error) : resolve(results);
        });
    });
}

function AddInFavourite(book) {
    var connection = new sql.ConnectionPool(config.dbConfig);
    PrepareBook(book);
    return new Promise((resolve, reject) => {
        connection.connect()
            .then(() => {
                return CheckBook(connection, book);
            })
            .then(() => {
                return AddBook(connection, book);
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
    var request = new sql.Request(connection);
    var queryExistBook = `select * from Book where title = '${book.title}'  and author = '${book.authors}'`;
    
    return new Promise(function (resolve, reject) {
        return request.query(queryExistBook, function (err, recordset) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                if (recordset.rowsAffected > 0)
                    reject('Данная книга уже содержится в избранном');
                else
                    resolve();
            }
        });
    });
}

function AddBook(connection, book)
{
    var queryInsertBook = `insert into Book(Title, Author, Link, CoverImage, PublishedDate, Description, EstimatedRating) values
            ('${book.title}', '${book.authors}', '${book.link}', '${book.thumbnail}', '${book.publishedDate}',
             '${book.description}', 1)`;

    var request = new sql.Request(connection);

    return new Promise(function (resolve, reject) {
        return request.query(queryInsertBook, function (err, recordset) {
            if (err) {
                console.log(queryInsertBook, err);
                return reject(err);
            }
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


