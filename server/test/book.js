process.env.NODE_ENV = 'test';

let sql = require("mssql");

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
let config = require('config');

chai.use(chaiHttp);

describe('Books', () => {
    var token = null;
    var authUser = null;
    var user = {
        login: 'Nas',
        password: '251000',
    }
    // before(function(done) {
    //     chai.request(server)
    //         .post('/users/token')
    //         .send(user)
    //         .end(function(err, res) {
    //             res.should.have.status(200);
    //             token = res.text;
    //             done();
    //         });
    // });

    before(function(done) {
        chai.request(server)
            .post('/users/authenticate')
            .send(user)
            .end(function(err, res) {
                res.should.have.status(200);
                token = res.body.token;
                authUser = res.body;
                done(); 
            });
    });


  /*
  * Test for /GET books 
  */
    describe('/GET books', () => {
        it('it should GET all the books from DB', (done) => {
            chai.request(server)
                .get('/books/catalog')
                .set('Authorization', 'Bearer ' + token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });
    });


    describe('/POST book and ADD book in favourite list', () => {
        before((done) => {
            var connection = new sql.ConnectionPool(config.dbConfig);
            connection.connect()
                .then(() => {
                    var request = new sql.Request(connection);
                    var queryClearTable = `TRUNCATE TABLE FavouriteBook TRUNCATE TABLE Book`;
                    return request.query(queryClearTable, function (err, response) {
                        should.not.exist(err);
                        done();
                    })
                });
        });

        it('it should POST a book and add it in favourite list', (done) => {
            let book = {
                title: "The Lord of the Rings",
                authors: "J.R.R. Tolkien",
                publishedDate: '1954',
                description: 'The Lord of the Rings is an epic high fantasy novel',
                link: '',
                thumbnail: '',
                estimatedRating: 0,
                ratingCount: 0,
                userRating: 0,
                status: 'Прочитана',
                estimatedRating: 0,
                userRating: 0
            }
            chai.request(server)
                .post('/books/favour')
                .set('Authorization', 'Bearer ' + token)
                .send({book: book, user: authUser})
                .end((err, res) => {
                    res.should.have.status(200);
                  done();
                });
        });
        
        it('it should GET all the books from DB and check that book table contains 1 book', (done) => {
            chai.request(server)
                .get('/books/catalog')
                .set('Authorization', 'Bearer ' + token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(1);
                    done();
                });
        });
    });

    describe('/POST key words', () => {
        before((done) => {
            var connection = new sql.ConnectionPool(config.dbConfig);
            connection.connect()
                .then(() => {
                    var request = new sql.Request(connection);
                    var queryClearTable = `TRUNCATE TABLE FavouriteBook TRUNCATE TABLE Book TRUNCATE TABLE KeyWord`;
                    return request.query(queryClearTable, function (err, response) {
                        should.not.exist(err);
                        done();
                    })
                });
        });
        var bookId;
        let book = {
            title: "The Lord of the Rings",
            authors: "J.R.R. Tolkien",
            publishedDate: '1954',
            description: 'The Lord of the Rings is an epic high fantasy novel',
            link: '',
            thumbnail: '',
            status: 'Читаю',
            estimatedRating: 0,
            userRating: 0
        }
        it('it should POST a book', (done) => {
            chai.request(server)
                .post('/books/favour')
                .set('Authorization', 'Bearer ' + token)
                .send({book: book, user: authUser})
                .end((err, res) => {
                    res.should.have.status(200);
                    bookId = res.body;
                    done();
                });
        });

        let tags = {
            added: {},
            removed: {}
        };
        it('it should POST key words for added book', (done) => {
            
            tags.added[bookId] = ['fantasy', 'hobbit', 'magic']
            chai.request(server)
                .post('/books/moderator')
                .set('Authorization', 'Bearer ' + token)
                .send(tags)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });

        it('it should GET book and check key words', (done) => {
            let bookInfo;
            chai.request(server)
                .get('/books/bookDetails')
                .query({title: book.title, authors: book.authors, userId: authUser.UserId}) 
                .set('Authorization', 'Bearer ' + token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(tags.added[bookId].length);
                    done();
                });
        });
    });

    describe('/POST and UPDATE book', () => {
        before((done) => {
            var connection = new sql.ConnectionPool(config.dbConfig);
            connection.connect()
                .then(() => {
                    var request = new sql.Request(connection);
                    var queryClearTable = `TRUNCATE TABLE FavouriteBook TRUNCATE TABLE Book TRUNCATE TABLE KeyWord`;
                    return request.query(queryClearTable, function (err, response) {
                        should.not.exist(err);
                        done();
                    })
                });
        });
        var bookId;
        let book = {
            title: "Winnie-the-Pooh",
            authors: "A. A. Milne",
            publishedDate: '1924',
            description: 'The Winnie-the-Pooh stories are set in Ashdown Forest, East Sussex, England',
            link: '',
            thumbnail: '',
            status: 'Прочитана',
            estimatedRating: 0,
            userRating: 0
        }
        it('it should POST a book', (done) => {
            chai.request(server)
                .post('/books/favour')
                .set('Authorization', 'Bearer ' + token)
                .send({book: book, user: authUser})
                .end((err, res) => {
                    res.should.have.status(200);
                    bookId = res.body;
                    done();
                });
        });

        it('it should UPDATE book description and published date', (done) => {
            book.description = 'Winnie-the-Pooh and Pig';
            book.publishedDate = '1925';
            book.BookId = bookId;
            chai.request(server)
                .post('/books/updateBook')
                .set('Authorization', 'Bearer ' + token)
                .send(book)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });

        it('it should GET book and check its fields', (done) => {
            chai.request(server)
                .get('/books/bookEdit')
                .query({bookId: bookId})
                .set('Authorization', 'Bearer ' + token)
                .end((err, res) => {
                    res.should.have.status(200);

                    res.body.description.should.eql(book.description);
                    res.body.publishedDate.should.eql(book.publishedDate);
                    res.body.title.should.eql(book.title);
                    res.body.authors.should.eql(book.authors);
                    done();
                });
        });
    });
});