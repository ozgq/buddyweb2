const express = require('express');
const sqlite3 = require('sqlite3');
const session = require('express-session');
const { generateKey, getRandomValues, randomUUID } = require('crypto');

const db = new sqlite3.Database('./app.db');

const app = express();
const port = 80;

app.set('view engine', 'pug');
app.use(express.static('static'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: "23n1qe0(DU*WE$#H@",
    resave: false,
    saveUninitialized: true,
}));

app.get('/', async (req, res) => {
    db.all(`SELECT username FROM users`, (err, resu) => {
        if (err) { res.send(`${err}<br>Report to devs immediately please and thank you`); }
        if (resu) { res.render('index', { users: resu, currentUser: req.session.user }); }
    });
});

app.get('/auth', (req, res) => {
    res.render('auth');
});

app.post('/auth', (req, res) => {
    db.all(`SELECT username, password FROM users WHERE username = '${req.body.username}'`, (err, resu) => {
        if (err) {
            return res.send(`${err}<br>Report to devs immediately please and thank you`);
        } else {
            if (resu && resu.length > 0) {
                const passwordFromDB = resu[0].password;

                if (req.body.password === passwordFromDB) {
                    console.log("Authentication successful 👌");
                    req.session.user = req.body;
                    return res.redirect('/');
                } else {
                    console.log("Incorrect password ❌");
                    return res.render('auth', { message: "Wrong password..." } )
                }
            } else {
                db.run('INSERT INTO users (username, password) VALUES (?, ?)', [req.body.username, req.body.password], (err) => {
                    if (err) {
                        return res.send(`${err}<br>Report to devs immediately please and thank you`);
                    } else {
                        console.log("User registered ✅");
                        req.session.user = req.body;
                        return res.redirect('/');
                    }
                });
            }
        }
    });
});

app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        const username = req.session.user.username;

        db.get(`SELECT html FROM users WHERE username = ?`, [username], (err, html) => {
            if (err) {
                res.send(`${err}<br>Report to devs immediately please and thank you`);
            }
            if (html) {
                res.render('dashboard', { indexPage: html.html, currentUser: req.session.user });
            }
        });
    } else {
        res.redirect('/auth');
    }
});

app.post('/dashboard', (req, res) => {
    if (req.session.user) {
        const info = req.body;
        const username = req.session.user.username;

        db.run(`UPDATE users SET html = ? WHERE username = ?`, [info.html, username], (err) => {
            if (err) {
                return res.send(`${err}<br>Report to devs immediately please and thank you`);
            }
            console.log('Update successful');
            return res.redirect('/dashboard');
        });
    } else {
        return res.redirect('/auth', { message: "Please log in" });
    }
});

app.get('/blogs/:username', async (req, res) => {
    db.all(`SELECT post, id FROM blogs where user = '${req.params.username}'`, (err, resu) => {
        if (err) { res.send(`${err}<br>Report to devs immediately please and thank you`); }
        if (resu) { res.render('blogs', { posts: resu, currentUser: req.session.user, requ: req.params.username }); }
    });
});

app.get('/post/:id', async (req, res) => {
    db.get(`SELECT post FROM blogs WHERE id = ?`, [req.params.id], (err, result) => {
        if (err) {
            res.send(`${err}<br>Report to devs immediately please and thank you`);
        } else {
            if (result) {
                res.send(result.post);
            } else {
                res.send("Post not found");
            }
        }
    });
});

app.post("/blogging", (req, res) => {
    const info = req.body;
    const username = req.session.user ? req.session.user.username : null;

    if (username) {
        const formattedHtml = info.html.replace(/\n/g, '<br>'); // Convert newline characters to HTML line breaks

        db.run('INSERT INTO blogs (user, post) VALUES (?, ?)', [username, formattedHtml], (err) => {
            if (err) {
                return res.send(`${err}<br>Report to devs immediately please and thank you`);
            } else {
                console.log("Blogpost entered with formatted line breaks");
                res.redirect('/');
            }
        });
    } else {
        return res.redirect('/auth', { message: "Please log in" });
    }
});



app.get('/~:username', (req, res) => {
    db.get(`SELECT html FROM users WHERE username = ?`, [req.params.username], (err, result) => {
        if (err) {
            res.send(`${err}<br>Report to devs immediately please and thank you`);
        } else {
            if (result) {
                res.send(result.html);
            } else {
                res.send("HTML content not found");
            }
        }
    });
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
