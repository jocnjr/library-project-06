require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const SlackStrategy = require("passport-slack").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// adding user model for passport local strategy
const User = require('./models/user');
const bcrypt = require("bcrypt");
const flash = require("connect-flash");

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

// Express View engine setup

app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// auth middleware

app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    maxAge: 60000
  },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  }),
  resave: true,
  saveUninitialized: true
}));

// passport config

// cookie
passport.serializeUser((user, cb) => {
  cb(null, user._id);
});

// session
passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
});

// initialising passport
app.use(passport.initialize());
app.use(passport.session());

// adding error handling flash
app.use(flash());

// passport local strategy config
passport.use(new LocalStrategy({
  passReqToCallback: true
}, (req, username, password, next) => {
  User.findOne({
    username
  }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(null, false, {
        message: "Incorrect username"
      });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return next(null, false, {
        message: "Incorrect password"
      });
    }

    // success - user is logged in!
    app.locals.user = user;
    return next(null, user);
  });
}));

// passport slack strategy config

passport.use(new SlackStrategy({
    clientID: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    callbackURL: "/auth/slack/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    // to see the structure of the data in received response:
    console.log("Slack account details:", profile);

    User.findOne({
        slackID: profile.id
      })
      .then(user => {
        if (user) {
          done(null, user);
          return;
        }

        User.create({
            slackID: profile.id
          })
          .then(newUser => {
            done(null, newUser);
          })
          .catch(err => done(err)); // closes User.create()
      })
      .catch(err => done(err)); // closes User.findOne()
  }
));

// passport google strategy config

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    // to see the structure of the data in received response:
    console.log("Google account details:", profile);

    User.findOne({
        googleID: profile.id
      })
      .then(user => {
        if (user) {
          done(null, user);
          return;
        }

        User.create({
            googleID: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value
          })
          .then(newUser => {
            done(null, newUser);
          })
          .catch(err => done(err)); // closes User.create()
      })
      .catch(err => done(err)); // closes User.findOne()
  }
));

// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';

const index = require('./routes/index');
app.use('/', index);

// book routes import!
const book = require('./routes/book');
app.use('/books', book);

// auth routes
const router = require('./routes/auth');
app.use('/', router);

module.exports = app;