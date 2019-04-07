const express = require('express');
const bodyParser = require('body-parser');
let {Users} = require('./models/user');
const _ = require('lodash');
let mongoose = require('mongoose');
let {authenticate} = require('./middlewares/authenticate');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/userAPI', { useNewUrlParser: true });

let app = express();
app.use(bodyParser.json()); // Parse incoming request bodies in a middleware before your handlers, available under the req.body property.

app.post('/users', (req, res) => {
    res.send(`Welcome to userAPI. You can register, login, logout, authenticate`);
});

app.post('/users/register', (req, res) => {
    console.log(req.body);
    let body = _.pick(req.body, ['email', 'password']); // Pick up the email and password field from request body
    let user = new Users(body);

    user.save().then((user) => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((err) => {
        res.status(400).send(err);
    });
});

app.post('/users/login', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);
    Users.findByCredentials(body.email, body.password).then((user) => {
        user.generateAuthToken().then(token => {
            res.header('x-auth', token).send(user);
        });
    }).catch((err) => {
        res.status(400).send(err);
    });
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send()
    }, () => {
        res.status(400).send();
    });
});

app.listen(3000, () => {
   console.log('The server is listening on port 3000.');
});
