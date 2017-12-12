var books = require('google-books-search');
var Q = require('q');
var service = {};
const sql = require('mssql');
var config = {
    user: 'sa',
    password: '1',
    server: 'localhost', 
    database: 'BookWormDB'
};

service.find = find;
service.AddInFavourite = AddInFavourite;

module.exports = service;

function find(key) {
    var deferred = Q.defer();
    books.search(key, function(error, results) {
        if (!error) {
            deferred.resolve(results);
        } else {
            deferred.reject(error);
        }
    });
    return deferred.promise;
}

function AddInFavourite(book) {
    var deferred = Q.defer();

    //connect to your database
     return new Promise((resolve, reject) => {

        var qq = sql.connect(config, function (err) {
            if (err) console.log(err);
            PrepareBook(book);
            CheckBook(book)
                .then(function(){
                    AddBook(book)
                    .then(function(){
                        qq.close();
                    })
                   resolve();
                })
                
                .catch(function(err){
                    qq.close();
                   reject(err);
                });
        })
    });
    return deferred.promise;
}

function CheckBook(book)
{
    var deferred = Q.defer();
    var request = new sql.Request();

    var queryExistBook = `select * from Book where title = '${book.title}'  and author = '${book.authors}'`;
    console.log(queryExistBook);
    request.query(queryExistBook, function (err, recordset) {
        if (err)
        {
            deferred.reject(err);
            console.log(err);
        }
        else
        {
            if (recordset.rowsAffected > 0)
                deferred.reject('Данная книга уже содержится в избранном');
            else
                deferred.resolve();
        }
    });
    return deferred.promise;
}

function AddBook(book)
{
    var deferred = Q.defer();
    var queryInsertBook = `insert into Book(Title, Author, Link, CoverImage, PublishedDate, Description, EstimatedRating) values
            ('${book.title}', '${book.authors}', '${book.link}', '${book.thumbnail}', '${book.publishedDate}',
             '${book.description}', 1)`;
    var request = new sql.Request();
    request.query(queryInsertBook, function (err, recordset) {
        if (err)
        {
            deferred.reject(err);
            console.log(err);
        }
        else
        {
            deferred.resolve();
        }
    }); 
    return deferred.promise;
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
                return char+char; // prepends a backslash to backslash, percent,
                                  // and double/single quotes
        }
    });
}


