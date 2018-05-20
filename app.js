const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const expressValidator = require('express-validator');
const mongojs = require('mongojs');
const db = mongojs('express-crash', ['users']); // db and collections
const ObjectId = mongojs.ObjectId;

const app = express();

/* middlewares are the functions that have access to
   request and response and also the next middleware that is going to run after that
*/
const logger = (req, res, next) => {
  console.log('Req: ', req.url);
  next(); // very important to avoid loading forever
};
app.use(logger);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Set static path for static resources like css, images
app.use(express.static(path.join(__dirname, 'public'))); // client or public in general

// Global vars
app.use(function(req, res, next) {
  res.locals.errors = null;
  next();
});

// Express Validator
app.use(expressValidator({
  errorFormatter: function(params, msg, value) {
    var namespace = params.split('.')
    , root        = namespace.shift()
    , formParam   = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }

    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/person', (req, res) => {
  const person = { name: 'Jaquen Haghar' };
  res.json(person);
});

app.get('/index', (req, res) => {
  res.render('index');
});

app.get('/index/custom', (req, res) => {
  res.render('index-custom', {
    title: 'Customers'
  });
});

app.get('/users', (req, res) => {
  db.users.find(function(err, docs) {
    res.render('users', {
      title: 'Users',
      users: docs
    });
  });
});

app.post('/users/add', (req, res) => {
  req.checkBody('firstName', 'First Name is Required').notEmpty();
  req.checkBody('lastName', 'Last Name is Required').notEmpty();
  req.checkBody('email', 'Email is Required').notEmpty();

  var errors = req.validationErrors();
  if (errors) {
    db.users.find(function(err, docs) {
      res.render('users', {
        title: 'Users',
        users: docs,
        errors: errors,
      });
    });
  } else {
    var newUser = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    };
    db.users.insert(newUser, function(err, result) {
      if (err) {
        console.log(err);
      }
      res.redirect('/users');
    });
  }
});

app.delete('/users/delete/:id', function(req, res) {
  db.users.remove({ _id: ObjectId(req.params.id)}, function(err, result) {
    if (err) {
      console.log(err);
      res.sendStatus(400);
    } else {
      console.log('Delete SUCCESS');
      res.redirect('/users');
    }
  });
});

app.listen(8080, () => {
  console.log('Server started. Listening on 8080')
});
