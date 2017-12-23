var config = require('config.json');
var express = require('express');
var router = express.Router();
var bookService = require('services/book.service');
var url = require('url');

// routes
router.get('/', findBook);
router.post('/favour', AddFavourite);
router.get('/catalog', getCatalog);
router.get('/bookstatus', GetBookStatus);
router.get('/bookDetails', getBookInfo);
router.get('/moderator', getBookWithNewKeyWords);
router.get('/favebooksstat',getFaveBooksStat);
router.get('/favebookslist',getFaveBooksList);
router.get('/statusname', getStatusNameById);

module.exports = router;

function findBook(req, res)
{
	var params = url.parse(req.url, true);
 	var query = params.query;
    bookService.find(query.title)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
} 

function getFaveBooksStat(req, res) 
{
    var params = url.parse(req.url, true);
    var query = params.query;
    console.log('getFaveBooksStat');    
    bookService.getFaveBooksStat(query.userId)
        .then(function (data) {
            console.log(data);  
            res.send(data);
        })
        .catch(function (err) {
            console.log(err);  
            res.status(400).send(err);
        });
}

function getFaveBooksList(req, res){
    var params = url.parse(req.url, true);
    var query = params.query; 
    bookService.getFavouriteBooksList(query)
    .then(function (data) {
        res.send(data);
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

function getStatusNameById(req, res) {
    var params = url.parse(req.url, true);
    var query = params.query; 
    console.log(query); 
    bookService.getStatusNameById(query.statusId)
    .then(function (data) {
        res.send(data);
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

function getBookInfo(req, res)
{
    var params = url.parse(req.url, true);
    var query = params.query;
     bookService.getBookInfo(query)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getBookWithNewKeyWords(req, res)
{
     console.log('getBookWithNewKeyWords');
     bookService.getBookWithNewKeyWords()
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCatalog(req, res)
{
    console.log('getCatalog');
     bookService.getCatalog()
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function AddFavourite(req, res)
{
    bookService.AddInFavourite(req.body)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function GetBookStatus(req, res)
{
    var params = url.parse(req.url, true);
    var query = params.query;
    bookService.GetBookStatus(query.title)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
