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
        login: 'ydi',
        password: '123',
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


    describe('/POST book', () => {
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

        it('it should POST a book and add her in favourite list', (done) => {
            let book = {
                title: "The Lord of the Rings",
                authors: "J.R.R. Tolkien",
                publishedDate: '1954',
                description: 'The Lord of the Rings is an epic high fantasy novel',
                link: '',
                thumbnail: '',
                status: 'Прочитана',
            }
            chai.request(server)
                .post('/books/favour')
                .set('Authorization', 'Bearer ' + token)
                .send({book: book, user: authUser})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.text.should.be.eql('Книга успешно добавлена в избранное');
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

    // describe('/GET book details', () => {
    //     it('it should GET book details', (done) => {
    //         chai.request(server)
    //             .get('/books/details')
    //             .set('Authorization', 'Bearer ' + token)
    //             .end((err, res) => {
    //                 // res.should.have.status(200);
    //                 // res.body.should.be.a('array');
    //                 // res.body.length.should.be.eql(1);
    //                 done();
    //             });
    //     });
    // });
});