const express = require('express')
const app = express()
const ejs = require('ejs');
const $ = require("jquery");
const mysql = require('mysql')
const bodyparser = require('body-parser')
const md5 = require('md5')
const session = require('express-session')
const slugify = require('slugify');

app.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: true
}));

var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "atp12a"
});

app.use(bodyparser.urlencoded({
    extended: false
}))
app.set('view engine', 'ejs')
app.use('/s', express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.render('index', {
        username: 'kaan',
        text: 'this is a text'
    });
})

app.get('/admin', (req, res) => {
    if (req.session.username !== undefined && req.session.username !== null && req.session.username != '') {
        res.redirect('/addtext')
    } else {
        res.render('admin', {
            message: undefined
        });
    }
})
app.get('/adminlogin', (req, res) => {
    res.redirect('/admin')
})

app.post('/adminlogin', (req, res) => {
    var username = req.body.username
    var password = md5(req.body.password)
    if (username == '') {
        res.render('admin', {
            message: 'you should write your username',
            status: undefined
        })
    } else if (password == '') {
        res.render('admin', {
            message: 'you should write your password too',
            status: undefined
        })
    } else {
        let sql = 'SELECT * FROM admins WHERE adminname = ? AND adminpass = ?';
        db.query(sql, [username, password], function (err, result) {
            if (err) res.render('admin', {
                message: 'Giriş yaparken teknik bir hata oluştu.',
                status: undefined
            })
            else {
                // res.render('admin', {message: JSON.stringify(result)})
                if (result.length > 0) {
                    username = JSON.parse(JSON.stringify(result))[0]['adminname']
                    req.session.username = username
                    res.redirect('/addtext')
                } else {
                    res.render('admin', {
                        message: 'username or password is wrong',
                        status: 'error'
                    })
                }
            }
        })
    }
})

app.route('/addtext')
    .get((req, res) => {
        if (req.session.username !== undefined && req.session.username !== null && req.session.username != '') {
            res.render('addtext', {
                message: ''
            })
        } else {
            res.redirect('/admin')
        }
    })
    .post((req, res) => {
        title = req.body.title.trim();
        article = req.body.article.trim();
        username = req.session.username;
        if (title === '') {
            res.render('addtext', {
                message: 'you should write an title',
                status: 'error'
            })
        } else if (article == '') {
            res.render('addtext', {
                message: 'you should write an article',
                status: 'error'
            })
        } else {
            let sql = "INSERT INTO blog_texts (textauthor, texttitle, textarticle) VALUES (?,?,?)";
            db.query(sql, [username, title, article], function (err, result) {
                result = JSON.stringify(result)
                if (err) {
                    res.render('addtext', {
                        message: 'There is an error while adding. exitcode: 1',
                        status: 'error'
                    })
                } else if (result.length > 0) {
                    res.render('addtext', {
                        message: 'successfuly added -not actually added. it is just alert :)-',
                        status: 'success'
                    })
                }
                else{
                    res.render('addtext', {
                        message: 'There is an error while adding. exitcode: 2',
                        status: 'error'
                    })
                }
            });
        }
    })
app.get('/adminlogout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin')
})
var server = app.listen(3000, function () {
    console.log('Server working at http://localhost:3000')
})