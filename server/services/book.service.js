var books = require('google-books-search');
var Q = require('q');
var service = {};
var config = require('config');
var sql = require('mssql');
var db = require('../helpers/dbHelper.js');
var logger = require('../log');

service.find = find;
service.addInFavourite = addInFavourite;
service.getCatalog = getCatalog;
service.getBookWithNewKeyWords = getBookWithNewKeyWords;
service.updateTags = updateTags;
service.getBookInfo = getBookInfo;

module.exports = service;

function find(key) {
    return new Promise((resolve, reject) => {
        books.search(key, function(error, results) {
            return error ? reject(error) : resolve(results);
        });
    });
}

function getBookInfo(book) {
    return getInfo(book.title, book.authors, book.userId);
}

function getInfo(title, authors, userId) {
    var queryGetStatus = `SELECT status, UserRating, RatingCount, EstimatedRating from ((BookStatus BS inner join FavouriteBook FB on BS.BookStatusId = FB.BookStatusId) 
            inner join Book B ON 
            B.BookId = FB.BookId) where B.title = '${title}' AND B.authors = '${authors}' AND FB.UserId = '${userId}'`;

    return db.executeQuery(queryGetStatus)
        .then((res) => {
            return Promise.resolve(res.recordset);
        })
}

function getBookWithNewKeyWords() {
    return getBooks()
        .catch((err) => {
            console.log(err);
        })
}

function getBooks() {
    logger.info('getBooks');
    var queryGetBook = `SELECT * from ((Book inner join BookKeyWord on BookKeyWord.BookId = Book.BookId) 
            inner join KeyWord ON 
            KeyWord.KeyWordId = BookKeyWord.KeyWordId)`;
    return db.executeQuery(queryGetBook)
        .then((res) => {
            return Promise.resolve(res.recordset);
        })
}

function getCatalog() {
    var queryGetAllBooks = `select * from Book`;
                    
    return db.executeQuery(queryGetAllBooks)
        .then((res) => {
            return Promise.resolve(res.recordset);
        });
}

function addInFavourite(favouriteBook) {
    prepareBook(favouriteBook.book);
    let favouriteBookInfo = {};
   
    return checkBook(favouriteBook.book)
        .then((book_id) => {
            if (!book_id)
                return AddBook(favouriteBook.book);
            else
                return Promise.resolve(book_id);
        })
        .then((book_id) => {
            favouriteBookInfo.book_id = book_id;
            return checkFavouriteBook(book_id, favouriteBook.user.UserId);
        })
        .then((IsFavExists) => {
            favouriteBookInfo.IsFavExists = IsFavExists;
            console.log(favouriteBookInfo);
            return GetStatusIdByName(favouriteBook.book.status);
        })
        .then((statusId) => {
            favouriteBookInfo.statusId = statusId;
            if (!favouriteBookInfo.IsFavExists)
                return AddBookFavourite(favouriteBookInfo.book_id, favouriteBook, favouriteBookInfo.statusId);
            else
                return UpdateFavouriteBook(favouriteBookInfo.book_id, favouriteBook, favouriteBookInfo.statusId);
        })
        .catch((err) => {
            console.log(err);
        })
}

function checkBook(book) {
    console.log('checkBook');
    var queryExistBook = `select BookId from Book where title = '${book.title}'  and authors = '${book.authors}'`;
    
    return db.executeQuery(queryExistBook)
        .then((res) => {
            if (res.recordset.rowsAffected === 0 || !res.recordset[0]) {
                return Promise.resolve(null);
            } else {
                return Promise.resolve(res.recordset[0].BookId);
            }
        });
}

function checkFavouriteBook(book_id, userId) {
    console.log('CheckFavouriteBook');
    var queryExistFavBook = `select BookId from FavouriteBook where BookId = '${book_id}'  and UserId = '${userId}'`;
    
    return db.executeQuery(queryExistFavBook)
        .then((res) => {
            let ok = !(res.recordset.rowsAffected === 0 || !res.recordset[0]);
            return Promise.resolve(ok);
        })
}

function AddBook(book) {
    logger.info('add book');
    var queryInsertBook = `insert into Book(title, authors, link, thumbnail, publishedDate, description, EstimatedRating) OUTPUT Inserted.BookId values
            ('${book.title}', '${book.authors}', '${book.link}', '${book.thumbnail}', ${book.publishedDate},
             '${book.description}', 1)`;

    return db.executeQuery(queryInsertBook)
        .then((res) => {
            return Promise.resolve(res.recordset[0].BookId);
        })
}

function AddBookFavourite(bookId, favourBook, statusId) {
    logger.info('AddFavourite');
    var queryInsertFavouriteBook = `insert into FavouriteBook(UserId, BookId, BookStatusId, UserRating) values
            ('${favourBook.user.UserId}', '${bookId}', '${statusId}', 0)`;

    return db.executeQuery(queryInsertFavouriteBook)
        .then(() => {
            return Promise.resolve('Книга успешно добавлена в избранное');
        });
}

function UpdateFavouriteBook(bookId, favourBook, statusId)
{
    logger.info('UpdateFavourite');
    var queryUpdateFavouriteBook = `UPDATE FavouriteBook SET BookStatusId = '${statusId}' where
        UserId = '${favourBook.user.UserId}' AND BookId = '${bookId}'`;

    return db.executeQuery(queryUpdateFavouriteBook);
}

function GetStatusIdByName(statusName)
{
    console.log('GetStatusIdByName');
    var queryGetStatus = `SELECT BookStatusId from BookStatus where Status = '${statusName}'`;

    return db.executeQuery(queryGetStatus)
        .then((res) => {
            return Promise.resolve(res.recordset[0].BookStatusId);
        })
}

function updateTags(tags) {
    console.log('updateTags');
    return removeTags(tags.removed)
        .then(() => {
            return addTags(tags.added);
        })
}

function removeTags(tags) {
    console.log('removeTags', tags);
    let promises = [];

    for (let bookId in tags) {
        tags[bookId].forEach(function(wordId) {
            promises.push(db.removeKeyWord(bookId, wordId));
        });
    }
    return Promise.all(promises);
}

function addTags(tags) {
    console.log('addTags');
    let promises = [];
    for (let bookId in tags) {
        tags[bookId].forEach(function(wordId) {
            let promis = getWordId(wordId)
                .then((word_id) => {
                    var queryAddTag = `INSERT INTO BookKeyWord(BookId, KeyWordId, IsChecked) values('${bookId}', '${word_id}', 'true')`;
                    return db.executeQuery(queryAddTag);
                })
            promises.push(promis);
        });
    }
    return Promise.all(promises);
}

function getWordId(word) {
    console.log('getWordId');
    return checkWord(word)
        .then((word_id) => {
            if (!word_id)
                return addWord(word);
            else
                return Promise.resolve(word_id);
        })
}

function checkWord(keyWord) {
    console.log('checkWord');
    return db.findKeyWord(keyWord);
}

function addWord(keyWord) {
    console.log('addWord');
    return db.addKeyWord(keyWord);
}

function prepareBook(book) {
    for (key in book) {
        book[key] = book[key] || null;
        if (book[key]) {
            mysql_real_escape_string(book[key]);
        }
    }
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
