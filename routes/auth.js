// routes/auth.js
const express = require("express");
const router = express.Router();
// User model
const User = require("../models/user");
// BCrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
// adding passport for auth routes
const passport = require("passport");


router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

router.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "" || password === "") {
    res.render("auth/signup", {
      errorMessage: "Indicate a username and a password to sign up"
    });
    return;
  }

  User.findOne({
      username
    })
    .then(user => {
      if (user) {
        res.render("auth/signup", {
          errorMessage: "The username already exists!"
        });
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      User.create({
          username,
          password: hashPass
        })
        .then(() => {
          res.redirect("/");
        })
        .catch(error => {
          console.log(error);
        })
    })
    .catch(error => {
      next(error);
    })

});

// login routes

router.get("/login", (req, res, next) => {
  res.render("auth/login", {
    message: req.flash("error")
  });
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/books",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
}));

// OLD - Basic auth

// router.post("/login", (req, res, next) => {
//   const theUsername = req.body.username;
//   const thePassword = req.body.password;

//   if (theUsername === "" || thePassword === "") {
//     res.render("auth/login", {
//       errorMessage: "Please enter both, username and password to sign up."
//     });
//     return;
//   }

//   User.findOne({
//       "username": theUsername
//     })
//     .then(user => {
//       if (!user) {
//         res.render("auth/login", {
//           errorMessage: "The username doesn't exist."
//         });
//         return;
//       }
//       if (bcrypt.compareSync(thePassword, user.password)) {
//         // Save the login in the session!
//         req.session.currentUser = user;
//         res.redirect("/books");
//       } else {
//         res.render("auth/login", {
//           errorMessage: "Incorrect password"
//         });
//       }
//     })
//     .catch(error => {
//       next(error);
//     })
// });

// passport logout

router.get("/logout", (req, res, next) => {
  req.logout();
  res.redirect("/login");
});

// OLD - basic auth - logout with session destroy
// router.get("/logout", (req, res, next) => {
//   req.session.destroy((err) => {
//     if (err) {
//       console.log(err);
//       return;
//     }
//     // cannot access session here
//     res.redirect("/login");
//   });
// });


// SLACK ROUTES

// GET from login form
router.get("/auth/slack", passport.authenticate("slack"));

// GET callback route from Slack
router.get("/auth/slack/callback", passport.authenticate("slack", {
  successRedirect: "/books",
  failureRedirect: "/login"
}));

// GOOGLE ROUTES

// GET from login form
router.get("/auth/google", passport.authenticate("google", {
  scope: [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email"
  ]
}));

// GET callback route from Google
router.get("/auth/google/callback", passport.authenticate("google", {
  successRedirect: "/books",
  failureRedirect: "/login"
}));

module.exports = router;