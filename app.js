const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');






// Making a connection to the database via mongoose
mongoose.connect(config.database);
let db = mongoose.connection;

// check connection
db.once('open', function() {
  console.log('Connected to MongoDB');
});

//Check for db errors

db.on('error', function(err) {
  console.log(err);
});

//Bring in models
let Article = require('./models/article')

// Making Pug as the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,

}));

//Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express Validator middleware
app.use(expressValidator({
  errorFormatter: function(param,msg,value){
    var namespace = param.split('.'),
    root = namespace.shift(),
    formParam = root ;
    while(namespace.length){
      formParam += '[' + namespace.shift() + ']';
    }
    return{
      param :formParam,
      msg : msg,
      value:value
    };
  }
}));

//Passport config
require('./config/passport')(passport);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*',function(req,res,next){
  res.locals.user = req.user || null ;
  next(); 
})


// Home Route
app.get('/', function(req, res) {
  Article.find({}, function(err, articles) {
    if (err) {
      console.log(err)
    } else {
      res.render('home', {
        title: 'Articles',
        articles: articles,
      })
    }
  });

});

// Routes files
let articles = require('./routes/articles') ;
let users = require('./routes/users') ;
app.use('/articles',articles)
app.use('/users',users)



// Server starting

app.listen(3000, console.log('Server started at 3000'));
