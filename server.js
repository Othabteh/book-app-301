'use strict';

const dotenv = require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const client = new pg.Client(process.env.DATABASE_URL);

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(methodOverride('_method'));


app.get('/', mainRouteHandler);
app.post('/searches/show', apiDataHandler);
app.get('/searches/new', newSearchHandler);
app.post('/addBook', addBookHandler);

function mainRouteHandler(req, res) {
    res.render('pages/books/show')
}

function newSearchHandler(req, res) {
    res.render('pages/searches/new')
}

function apiDataHandler(req, res) {
    let searchBox = req.body.searchBox;
    let authorOrTitle = req.body.titleAuthor;
    let url = `https://www.googleapis.com/books/v1/volumes?q=+in${authorOrTitle}:${searchBox}`
    superagent.get(url)
        .then((result) => {
            let bookData = result.body.items.map(val => {
                return new Book(val)
            });
            // console.log(bookData);
            res.render('pages/searches/show', { data: bookData })

        })



    // console.log(req.body);
}

function addBookHandler(req, res) {
    // console.log(req.body);
    let { image_url, title, author, isbn, description } = req.body;
    // console.log(title);
    let SQL = 'INSERT INTO books (image_url, title, author, isbn, description) VALUES($1,$2,$3,$4,$5);'
    let safeValues = [image_url, title, author, isbn, description];
    client.query(SQL, safeValues)
        .then(() => {
            let SQL2 = 'SELECT * FROM books WHERE isbn=$1;'
            let values = [isbn];
            client.query(SQL2, values)
                .then((results) => {
                    res.redirect(`/newBook/${results.rows[0].id}`)
                })
        })
}

// constructor function
function Book(data) {
    this.author = data.volumeInfo ? data.volumeInfo.authors : 'there is no authors';
    this.title = data.volumeInfo ? data.volumeInfo.title : 'there is no title';
    this.isbn = data.volumeInfo.industryIdentifiers ? data.volumeInfo.industryIdentifiers[0].identifier : 'there is no isbn';
    this.image_url = data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail : 'there is no pic for this book';
    this.description = data.volumeInfo ? data.volumeInfo.description : 'there is no discription'

}


client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`listening to port: ${PORT}`);
        })
    })