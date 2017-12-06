var books = require('google-books-search');
var Q = require('q');
var service = {};

service.find = find;

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