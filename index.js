var express = require('express');
var session = require('express-session');
var db = require('./models');
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
//initialize connect-session-sequelize
var SequelizeStore = require('connect-session-sequelize')(session.Store);
//Connect sequelize session to our sequelize db
var myStore = new SequelizeStore({
  db: db.sequelize
});
var app = express();

//set the store to myStore where we connect the DB details
app.use(session({
  secret: 'mySecret',
  resave: false,
  saveUninitialized: true,
  store: myStore
}));

myStore.sync();
//* Middleware
app.use(bodyParser.urlencoded({ extended: false }))

app.use(function (req, res, next) {
  if (req.session.user_id !== undefined) {
    next();
  } else if (req.path === "/login") {
    next();
  } else if (req.path === "/signup") {
    next();
  } else {
    res.redirect("/login");
  }
});

app.set('view engine', 'ejs');
app.set('views', 'app/views');

app.get("/signup", function (req, res, next) {
  if (req.session.user_id !== undefined) {
    res.redirect("/welcome");
    return;
  }

  res.render('signup');
})

app.post("/signup", function (req, res, next) {
  if (req.session.user_id !== undefined) {
    res.redirect("/welcome");
    return;
  }

  var email = req.body.email;
  var password = req.body.password;
  var firstName = req.body.firstName;
  bcrypt.hash(password, 10, function (err, hash) { // the hash allows the password to be private 
    db.user.create({ email: email, password_hash: hash, firstName: firstName }).then(function (user) {  // creating new values in the database and saving it to the db
      req.session.user_id = user.id;
      res.redirect("/welcome");
    });
  });
});

app.get("/welcome", function (req, res, next) {

  var user_id = req.session.user_id;

  db.user.findByPk(user_id).then(function (user) {
    db.message.
      findAll({ include: 
        [{ model: db.user },
         { as: 'likedUsers', model: db.user }] }).
      then(function (messages) {
        res.render('welcome', {
          user: user,
          user_id: user_id,
          messages: messages
        });
      });
  })
});

app.get("/signOut", function (req, res, next) {
  req.session.destroy(function () {
    res.redirect("/login");
  });
});

app.get("/login", function (req, res, next) {
  res.render('login', { error_message: '' });
});

app.post("/login", function (req, res, next) {
  var email = req.body.email;
  var password = req.body.password;

  db.user.findOne({ where: { email: email } }).then(function (user) {
    if (user === null) {
      res.render('login', { error_message: 'User Not Found' });
    } else {
      bcrypt.compare(password, user.password_hash, function (err, matched) {
        if (matched) {
          // set user_id in the session
          req.session.user_id = user.id
          // redirect to welcome page
          res.redirect("/welcome");
        } else {
          // render the login form
          res.render("login", { error_message: 'Bad Password' });
        }
      });
    }
  });
});

app.get("/", (req, res, next) => {
  res.redirect('/welcome');
});

app.post("/messages", function (req, res, next) {
  var subject = req.body.subject;
  var body = req.body.body;
  const user_id = req.session.user_id;

  // create a new message with user_id = to the user's id
  db.message.create({ subject: subject, body: body, userId: user_id }).then(
    function (message) {
      res.redirect("/welcome");
    });
});

app.get("/deleteMessage/:id", function(req, res, next){
  var messageId = req.params.id;
  var userId = req.session.user_id;

  db.like.destroy({where: { messageId: messageId }}).then(function(){
    db.message.destroy({ where: {id: messageId, userId: userId}}).then(function(){
      res.redirect("/welcome");
    });
  });
});

app.get("/likeMessage/:id", function(req, res, next){
  var messageId = req.params.id;
  var userId = req.session.user_id;

  db.like.create({userId: userId, messageId: messageId}).then(function(){
    res.redirect("/welcome");
  });
})

var port = process.env.PORT || 3000

app.listen(port, function () {
  console.log(`listening on port ${port}...`);
})