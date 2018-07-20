const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');

mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;

//Check connection
db.once('open', function(){
  console.log('Connected to MongoDB');
});

//Check for DB errors
db.on('error', function(err){
  console.log(err);
});

//Init app
const app = express();

//Bring in Models
let Contact = require('./models/contact');

//Load view Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

//Expres Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

//Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//Home Route
app.get('/', function(req, res){
  Contact.find({}, function(err, contacts){
    if(err){
      console.log(err);
    }else{
      res.render('index', {
        title:'Contacts',
        contacts: contacts
      });
    }
  });
});

//Get Single Contact
app.get('/contact/:id', function(req, res) {
  Contact.findById(req.params.id, function(err, contact){
    res.render('contact', {
      contact:contact
    });
  });
});

//Add Route
app.get('/contacts/add', function(req, res){
  res.render('add_contact', {
    title:'Add Contacts'
  });
});

//Add Submit POST Route
app.post('/contacts/add', function(req, res){
  req.checkBody('title', 'Name is required').notEmpty();
  req.checkBody('number', 'Number is required').notEmpty();
  req.checkBody('body', 'Address is required').notEmpty();

  //Get errors
  let errors = req.validationErrors();

  if(errors){
    res.render('add_contact',{
      title:'Add Contact',
      errors:errors
    });
  } else{
    let contact = new Contact();
    contact.title = req.body.title;
    contact.number = req.body.number;
    contact.body = req.body.body;

    contact.save(function(err){
      if(err){
        console.log(err);
        return;
      }else{
        req.flash('success','Contact Added');
        res.redirect('/');
      }
    });
  }
});

//Load Edit Form
app.get('/contact/edit/:id', function(req, res) {
  Contact.findById(req.params.id, function(err, contact){
    res.render('edit_contact', {
      title:'Edit Contact',
      contact:contact
    });
  });
});

//Update Submit POST Route
app.post('/contacts/edit/:id', function(req, res){
  let contact = {};
  contact.title = req.body.title;
  contact.number = req.body.number;
  contact.body = req.body.body;

  let query = {_id:req.params.id}

  Contact.update(query, contact, function(err){
    if(err){
      console.log(err);
      return;
    }else{
      req.flash('success', 'Contact Updated');
      res.redirect('/');
    }
  });
});

app.delete('/contact/:id', function(req, res){
  let query = {_id:req.params.id}

  Contact.remove(query, function(err){
    if(err){
      console.log(err);
    }
    res.send('Success');
  });
});

//Start Server
app.listen(3000, function(){
  console.log('Server started on port 3000...');
});
