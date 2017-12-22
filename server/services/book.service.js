var books = require('google-books-search');
var Q = require('q');
var service = {};
var config = require('config.json');
var sql = require('mssql');

service.find = find;
service.AddInFavourite = AddInFavourite;
service.getCatalog = getCatalog;
service.getBookWithNewKeyWords = getBookWithNewKeyWords;
service.getBookInfo = getBookInfo;
service.getFaveBooksStat = getFaveBooksStat;

module.exports = service;

function find(key) {
    return new Promise((resolve, reject) => {
        books.search(key, function(error, results) {
            return error ? reject(error) : resolve(results);
        });
    });
}

function getFaveBooksStat(userId){
    var connection = new sql.ConnectionPool(config.dbConfig);
    return new Promise((resolve, reject) => {
        connection.connect()
            .then(() =>{
                var request = new sql.Request(connection);
                var queryfaveStat = `select max(t.readNow) readNow, max(t.wantToRead) wantToRead, max(t.alreadyRead) alreadyRead, max(t.gaveUp) gaveUp
                                from (
                                    SELECT 
                                count(case when FavouriteBook.BookStatusId = '4BA77A47-7A4A-40D4-9643-DB856125F6B2'then FavouriteBook.BookStatusId else null end) readNow,
                                count(case when FavouriteBook.BookStatusId = '9B86AD37-88ED-4CE7-9029-1030A42719F8'then FavouriteBook.BookStatusId else null end) wantToRead,
                                count(case when FavouriteBook.BookStatusId = '8CBB414C-ED49-414B-8631-3DF4F92CD9C9'then FavouriteBook.BookStatusId else null end) alreadyRead,
                                count(case when FavouriteBook.BookStatusId = '407FBC8A-9AB4-4DB4-9D9C-4D71B926593C'then FavouriteBook.BookStatusId else null end) gaveUp
                                    FROM            FavouriteBook INNER JOIN
                                                            BookStatus ON FavouriteBook.BookStatusId = BookStatus.BookStatusId
                                    WHERE        (FavouriteBook.UserId = '${userId}')
                                    GROUP BY FavouriteBook.UserId, BookStatus.Status
                                )t`;    
                return new Promise(function (resolve, reject) {
                    return request.query(queryfaveStat, function (err, response) {
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

function getBookInfo(book)
{
    PrepareBook(book);
    var connection = new sql.ConnectionPool(config.dbConfig);
     return new Promise((resolve, reject) => {
        connection.connect()
            .then(() => {
                return getInfo(connection, book.title, book.authors, book.userId);
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

function getInfo(connection, title, authors, userId)
{
    var request = new sql.Request(connection);
    // var queryGetStatus = `SELECT B.BookId, status, UserRating, RatingCount, EstimatedRating from ((BookStatus BS inner join FavouriteBook FB on BS.BookStatusId = FB.BookStatusId) 
    //         inner join Book B ON 
    //         B.BookId = FB.BookId) where B.title = '${title}' AND B.authors = '${authors}' AND FB.UserId = '${userId}'`;
    var queryGetStatus = `select B.BookId, FB.Status, FB.UserRating, B.RatingCount, B.EstimatedRating
            from Book B left join 
                ( select FB.BookId, FB.UserRating, BS.Status, FB.UserId
                from FavouriteBook FB inner join
                        BookStatus BS on FB.BookStatusId = BS.BookStatusId 
                where FB.UserId = '${userId}'
                ) FB on B.BookId = FB.BookId 
            where B.title = '${title}' AND B.authors = '${authors}'`;
    console.log(queryGetStatus);

    return new Promise(function (resolve, reject) {
        return request.query(queryGetStatus, function (err, response) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                    console.log(response);
                    resolve(response.recordset);
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
                {
                    // return Promise.resolve(book_id);
                    favouriteBook.book.BookId = book_id;
                    return updateBook(connection, favouriteBook.book);
                }
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
            .then((book_id) => {
                connection.close();
                let bookId = {
                    bookId: book_id
                }
                resolve(bookId);
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

function updateBook(connection, book)
{
    console.log('UpdateBook', book);
    var request = new sql.Request(connection);

    var queryUpdateBook = `UPDATE Book SET title = '${book.title}', authors = '${book.authors}', 
    description = '${book.description}', EstimatedRating = ${book.estimatedRating}, RatingCount = ${book.ratingCount}
    where BookId =  '${book.BookId}'`;
    
    console.log(queryUpdateBook);

    return new Promise(function (resolve, reject) {
        return request.query(queryUpdateBook, function (err, response) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                resolve(book.BookId);
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
                console.log('aaaaaaaaaaaa', response);
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
             '${book.description}', '${book.estimatedRating}')`;

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
    var queryInsertFavouriteBook = `insert into FavouriteBook(UserId, BookId, BookStatusId, UserRating)  OUTPUT Inserted.BookId values
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
            return resolve(bookId);
        });
    });
}

function UpdateFavouriteBook(connection, bookId, favourBook, statusId)
{
    console.log('UpdateFavourite', bookId, favourBook);
    var queryUpdateFavouriteBook = `UPDATE FavouriteBook SET BookStatusId = '${statusId}', 
    UserRating = ${favourBook.book.userRating} where
    UserId = '${favourBook.user.UserId}' AND BookId = '${bookId}'`;


    console.log(queryUpdateFavouriteBook);
    var request = new sql.Request(connection);

    return new Promise(function (resolve, reject) {
        return request.query(queryUpdateFavouriteBook, function (err, response) {
            if (err) {
                console.log(queryUpdateFavouriteBook, err);
                return reject(err);
            }
            console.log('UpdateFav', bookId);
            return resolve(bookId);
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

