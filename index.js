var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var db = require('./models');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');

//initialize connect-session-sequelize
var SequelizeStore = require('connect-session-sequelize')(session.Store);
//Connect sequelize session to our sequelize db
var myStore = new SequelizeStore({
  db: db.sequelize
});
var app = express();

app.use(cookieParser());
//set the store to myStore where we connect the DB details
app.use(session({
  secret: 'mySecret',
  resave: false,
  saveUninitialized: true,
  store: myStore
}));

myStore.sync();

app.use(bodyParser.urlencoded({ extended: false }))

app.set('view engine', 'ejs');
app.set('views', 'app/views');

app.get("/signup", function(req, res, next){
  if(req.session.user_id !== undefined){
    res.redirect("/welcome");
    return;
  }

  res.render('signup');
})

app.post("/signup", function (req, res, next) {
  if(req.session.user_id !== undefined){
    res.redirect("/welcome");
    return;
  }

  var email = req.body.email;
  var password = req.body.password;
  bcrypt.hash(password, 10, function(err, hash){ // the hash allows the password to be private 
    db.user.create({email: email, password_hash: hash}).then(function(user){  // creating new values in the database and saving it to the db
      req.session.user_id = user.id;
      res.redirect("/welcome");
    });
  });
});

app.get("/welcome", function(req, res, next) {
  if(req.session.user_id === undefined){
    res.redirect("/login");
    return
  }

  var user_id = req.session.user_id;

  db.user.findByPk(user_id).then(function(user){
    var email = user.email;

    res.render('welcome', {
      email: email,
      user_id: user_id
    });
  })
});

app.get("/signOut", function(req, res, next){
  req.session.destroy();
  res.redirect("/login");
});

app.get("/login", function(req, res, next){
  res.render('login', { error_message: '' });
});

app.post("/login", function(req, res, next){
  var email = req.body.email;
  var password = req.body.password;

  db.user.findOne({where: {email: email}}).then(function(user){
    if(user === null) {
      res.render('login', { error_message: 'User Not Found'});
    } else {
      bcrypt.compare(password, user.password_hash, function(err, matched){
        if(matched){
          // set user_id in the session
          req.session.user_id = user.id
          // redirect to welcome page
          res.redirect("/welcome");
        } else {
          // render the login form
          res.render("login", { error_message: 'Bad Password'});
        }
      });
    }
  });
});

app.listen(3000, function () {
  console.log("listening on port 3000...");
})