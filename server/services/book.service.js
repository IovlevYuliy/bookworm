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
    sql.connect(config, function (err) {
        if (err) console.log(err);

        CheckBook(book)
            .then(function(){
                AddBook(book)
                .then(function(){
                    sql.close();
                })
                deferred.resolve();
            })
            
            .catch(function(err){
                deferred.reject(err);
                sql.close();
            });
    })
    return deferred.promise;
}

function CheckBook(book)
{
    var deferred = Q.defer();
    var request = new sql.Request();
    var queryExistBook = `select * from Book where title = '${book.title}'  and author = '${book.authors}'`;
    //queryExistBook.replace(/(['"])/g, "\\$1");
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