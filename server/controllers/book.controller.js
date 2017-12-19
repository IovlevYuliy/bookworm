var config = require('config.json');
var express = require('express');
var router = express.Router();
var bookService = require('services/book.service');
var url = require('url');

// routes
router.get('/', findBook);
router.post('/favour', AddFavourite);
router.get('/catalog', getCatalog);
router.get('/bookDetails', getBookStatus);
router.get('/moderator', getBookWithNewKeyWords)

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

function getBookStatus(req, res)
{
    var params = url.parse(req.url, true);
    var query = params.query;
    console.log('qqqqqqqqq', query);
     bookService.getBookStatus(query)
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
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

