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
service.getFaveBooksStat = getFaveBooksStat;
service.getFavouriteBooksList = getFavouriteBooksList;
service.getStatusNameById = getStatusNameById;
service.getRandomBook = getRandomBook;
service.getBookById = getBookById;

module.exports = service;

function find(key) {
    logger.info('find');
    return new Promise((resolve, reject) => {
        books.search(key, function(error, results) {
            return error ? reject(error) : resolve(results);
        });
    });
}

function getBookInfo(book) {
    logger.info('getBookInfo');
    return getInfo(book.title, book.authors, book.userId);
}

function getFaveBooksStat(userId){
    logger.info('getFaveBooksStat');
  
    let queryfaveStat = `select max(t.readNow) readNow, max(t.wantToRead) wantToRead, max(t.alreadyRead) alreadyRead, max(t.gaveUp) gaveUp
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
           
    return db.executeQuery(queryfaveStat)
        .then((res) => {
            return Promise.resolve(res.recordset);
        })
}

function getInfo(title, authors, userId) {
    logger.info('getInfo');
    // var queryGetStatus = `SELECT B.BookId, status, UserRating, RatingCount, EstimatedRating from ((BookStatus BS inner join FavouriteBook FB on BS.BookStatusId = FB.BookStatusId) 
    //         inner join Book B ON 
    //         B.BookId = FB.BookId) where B.title = '${title}' AND B.authors = '${authors}' AND FB.UserId = '${userId}'`;
    var queryGetStatus = `select B.BookId, FB.Status, FB.UserRating, B.RatingCount, B.EstimatedRating, KW.Word
            from (((Book B left join 
                ( select FB.BookId, FB.UserRating, BS.Status, FB.UserId
                from FavouriteBook FB inner join
                        BookStatus BS on FB.BookStatusId = BS.BookStatusId 
                where FB.UserId = '${userId}'
                ) FB on B.BookId = FB.BookId )
                left join BookKeyWord BKW ON B.BookId = BKW.BookId)
                left join KeyWord KW ON KW.KeyWordId = BKW.KeyWordId) where (BKW.IsChecked = 'true' OR 
                BKW.IsChecked IS NULL) AND B.title = '${title}' AND B.authors = '${authors}'`;

    console.log(queryGetStatus);
    return db.executeQuery(queryGetStatus)
        .then((res) => {
            console.log(res);
            return Promise.resolve(res.recordset);
        })
        .catch((err) =>{
            console.log(err);
        })
}

function getBookWithNewKeyWords() {
    logger.info('getBookWithNewKeyWords');
    return getBooks()
        .catch((err) => {
            logger.error(err);
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
    logger.info('getCatalog');
    var queryGetAllBooks = `select * from Book`;
                    
    return db.executeQuery(queryGetAllBooks)
        .then((res) => {
            return Promise.resolve(res.recordset);
        });
}

function addInFavourite(favouriteBook) {
    logger.info('addInFavourite');
    
    let favouriteBookInfo = {};
   
    return checkBook(favouriteBook.book)
        .then((book_id) => {
            if (!book_id)
                return AddBook(favouriteBook.book);
            else
            {
                //return Promise.resolve(book_id);
                favouriteBook.book.BookId = book_id;
                return updateBook(favouriteBook.book);
            }
        })
        .then((book_id) => {
            console.log('11111');
            favouriteBookInfo.book_id = book_id;
            return CheckFavouriteBook(book_id, favouriteBook.user.UserId);
        })
        .then((IsFavExists) => {
            favouriteBookInfo.IsFavExists = IsFavExists;
            return GetStatusIdByName(favouriteBook.book.status);
        })
        .then((statusId) => {
            favouriteBookInfo.statusId = statusId;
            if (!favouriteBookInfo.IsFavExists)
                return AddBookFavourite(favouriteBookInfo.book_id, favouriteBook, favouriteBookInfo.statusId);
            else
                return UpdateFavouriteBook(favouriteBookInfo.book_id, favouriteBook, favouriteBookInfo.statusId);
        })
        .then(() => {
            return Promise.resolve(favouriteBookInfo.book_id);
        })
}

function checkBook(book) {
    logger.info('checkBook');
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

function updateBook(book) {
    logger.info('UpdateBook');

    var queryUpdateBook = `UPDATE Book SET title = '${book.title}', authors = '${book.authors}', 
    EstimatedRating = ${book.estimatedRating}, RatingCount = ${book.ratingCount}
    where BookId = '${book.BookId}'`;
    
    console.log(queryUpdateBook);
    return db.executeQuery(queryUpdateBook)
        .then(() => {
            return Promise.resolve(book.BookId);
        })
}

function CheckFavouriteBook(book_id, userId) {
    logger.info('CheckFavouriteBook');
    var queryExistFavBook = `select BookId from FavouriteBook where BookId = '${book_id}'  and UserId = '${userId}'`;
    
    return db.executeQuery(queryExistFavBook)
        .then((res) => {
            let ok = !(res.recordset.rowsAffected === 0 || !res.recordset[0]);
            return Promise.resolve(ok);
        })
}

function AddBook(book) {
    logger.info('add book');
    prepareBook(book);
    var queryInsertBook = `insert into Book(title, authors, link, thumbnail, publishedDate, description, EstimatedRating) OUTPUT Inserted.BookId values
            ('${book.title}', '${book.authors}', '${book.link}', '${book.thumbnail}', ${book.publishedDate},
             '${book.description}', '${book.estimatedRating}')`;
    logger.info(queryInsertBook);
    return db.executeQuery(queryInsertBook)
        .then((res) => {
            return Promise.resolve(res.recordset[0].BookId);
        })
}

function AddBookFavourite(bookId, favourBook, statusId) {
    logger.info('AddFavourite');
    var queryInsertFavouriteBook = `insert into FavouriteBook(UserId, BookId, BookStatusId, UserRating) values
            ('${favourBook.user.UserId}', '${bookId}', '${statusId}', '${favourBook.book.userRating}')`;

    return db.executeQuery(queryInsertFavouriteBook)
        .then(() => {
            return Promise.resolve('Книга успешно добавлена в избранное');
        })
}

function UpdateFavouriteBook(bookId, favourBook, statusId) {
    logger.info('UpdateFavourite');
    var queryUpdateFavouriteBook = `UPDATE FavouriteBook SET BookStatusId = '${statusId}', UserRating = ${favourBook.book.userRating} where
        UserId = '${favourBook.user.UserId}' AND BookId = '${bookId}'`;
    return db.executeQuery(queryUpdateFavouriteBook);
}

function GetStatusIdByName(statusName) {
    logger.info('GetStatusIdByName');
    var queryGetStatus = `SELECT BookStatusId from BookStatus where Status = '${statusName}'`;

    return db.executeQuery(queryGetStatus)
        .then((res) => {
            return Promise.resolve(res.recordset[0].BookStatusId);
        })
}

function updateTags(tags) {
    logger.info('updateTags');
    return removeTags(tags.removed)
        .then(() => {
            return addTags(tags.added);
        })
}

function removeTags(tags) {
    logger.info('removeTags');
    let promises = [];

    for (let bookId in tags) {
        tags[bookId].forEach(function(wordId) {
            promises.push(db.removeKeyWord(bookId, wordId));
        });
    }
    return Promise.all(promises);
}

function addTags(tags) {
    logger.info('addTags');
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
    logger.info('getWordId');
    return checkWord(word)
        .then((word_id) => {
            if (!word_id)
                return addWord(word);
            else
                return Promise.resolve(word_id);
        })
}

function checkWord(keyWord) {
    logger.info('checkWord');
    return db.findKeyWord(keyWord);
}

function addWord(keyWord) {
    logger.info('addWord');
    return db.addKeyWord(keyWord);
}

function getStatusNameById(statusId) {
    logger.info('getStatusNameById');
    let queryStatus = `SELECT        Status
                        FROM            BookStatus
                        WHERE        (BookStatusId = '${statusId}')`;  

    return db.executeQuery(queryStatus)
        .then((res) => {
            return Promise.resolve(res.recordset[0].Status);
        })
}

function getFavouriteBooksList(userFave) {
    let queryfaveStat = `SELECT       Book.*
                         FROM            FavouriteBook INNER JOIN
                                         Book ON FavouriteBook.BookId = Book.BookId
                         WHERE        (FavouriteBook.UserId = '${userFave.userId}') AND 
                                      (FavouriteBook.BookStatusId = '${userFave.statusId}')`;    
    return db.executeQuery(queryfaveStat)
        .then((res) => {
            return Promise.resolve(res.recordset);
        })
}


function getRandomBook(){
    return getCatalog()
        .then((books) => {
            let randomIndex = Math.floor((Math.random() * books.length) + 1);
            return Promise.resolve(books[randomIndex]); 
               
function getBookById(bookId)
{
    logger.info('getBookById');
    let queryGetBook = `SELECT * FROM Book where BookId = '${bookId}'`;    
    return db.executeQuery(queryGetBook)
        .then((res) => {
            return Promise.resolve(res.recordset[0]);
        })
}

function prepareBook(book) {
    logger.info('prepareBook');
    for (key in book) {
        if (book[key] === undefined)
            book[key] = null;
    }
    book.title = mysql_real_escape_string(book.title);
    book.authors = mysql_real_escape_string(book.authors);
    if (book.description)
        book.description = mysql_real_escape_string(book.description);

    if (!book.publishedDate)
        book.publishedDate = null;
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
