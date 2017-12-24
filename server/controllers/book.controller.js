var express = require('express');
var router = express.Router();
var bookService = require('services/book.service');
var url = require('url');
var logger = require('../log');

// routes
router.get('/', findBook);
router.post('/favour', AddFavourite);
router.post('/moderator', updateTags)
router.get('/catalog', getCatalog);
router.get('/bookstatus', GetBookStatus);
router.get('/bookDetails', getBookInfo);
router.get('/moderator', getBookWithNewKeyWords);
router.get('/favebooksstat',getFaveBooksStat)

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
    // console.log(query);   
    
    bookService.getFaveBooksStat(query.userId)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getBookInfo(req, res) {
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

function getBookWithNewKeyWords(req, res) {
    bookService.getBookWithNewKeyWords()
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCatalog(req, res) {
    bookService.getCatalog()
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function AddFavourite(req, res) {
    bookService.addInFavourite(req.body)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateTags(req, res) {
    bookService.updateTags(req.body)
        .then(function () {
            res.sendStatus(200);
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
            res.send(200, data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getBookRates(req, res)
{
  //  var params = url.parse(req.url, true);
  //  var query = params.query;
    res.send('1');
    // bookService.getBookRates()
    //     .then(function (data) {
    //         res.send(data);
    //     })
    //     .catch(function (err) {
    //         res.status(400).send(err);
    //     });
}
