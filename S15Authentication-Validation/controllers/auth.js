const User = require("../models/user");

const errorHandler = require("../util/errorHandler"); //Import a function to handle errors

const { validationResult } = require("express-validator");

const crypto = require("crypto");

const bcrypt = require("bcryptjs");

const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY); //Save API Key in environment

exports.getLogin = (req, res, next) => {
  let errMessage = req.flash("error");
  errMessage = errMessage.length > 0 ? errMessage[0] : null; //flash an empty array by default

  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    errorMessage: errMessage,
    oldInput: { email: "" },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  //req.body user....
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req); //Validation
  const errorParsed = errors
    .array()
    .reduce((acc, err) => acc + err.msg + "<br>", "");
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errorParsed,
      oldInput: { email: email },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email }) //Check user and password
    .then((user) => {
      if (!user) {
        //If the email is not correct
        req.flash("error", "Invalid email or password.");
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password) //Compare the hasing password
        .then((doMatch) => {
          if (doMatch) {
            //if the passwrod is correct
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              // To guarantee the sesion is created and stored before sendings
              res.redirect("/");
            });
          } else {
            //if the passwrod is NOT correct
            req.flash("error", "Invalid email or password.");
            return res.redirect("/login");
          }
        })
        .catch((err) => errorHandler(err, next));
    })
    .catch((err) => errorHandler(err, next));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  let errMessage = req.flash("error");
  errMessage = errMessage.length > 0 ? errMessage[0] : null; //flash an empty array by default

  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: errMessage,
    oldInput: { email: "" },
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req); //Validation
  const errorParsed = errors
    .array()
    .reduce((acc, err) => acc + err.msg + "<br>", "");
  console.log(errors);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errorParsed,
      oldInput: { email: email },
      validationErrors: errors.array(),
    });
  }
  bcrypt
    .hash(password, 12)
    .then((hassedPassword) => {
      return new User({
        email: email,
        password: hassedPassword, // Encrypt the password async
        cart: { items: [] },
      }).save();
    })
    .then(() => {
      req.flash("error", "User created. Please log in.");
      res.redirect("/login");
      const msg = {
        to: email,
        from: "david.gomez@tailored.systems", // Use the email address or domain you verified above
        subject: "User Created Succesfully",
        text: "Welcome to the Shop",
        html: "<strong>Welcome to the Shop</strong>",
      };
      //ES6
      sgMail.send(msg).then(
        () => {},
        (error) => {
          console.error(error);
          if (error.response) {
            console.error(error.response.body);
          }
        }
      );
    })
    .catch((err) => errorHandler(err, next));
};

exports.getResetPassword = (req, res, next) => {
  let errMessage = req.flash("error");
  errMessage = errMessage.length > 0 ? errMessage[0] : null; //flash an empty array by default

  res.render("auth/reset-password", {
    pageTitle: "Reset password",
    path: "/reset-password",
    errorMessage: errMessage,
  });
};

exports.postResetPassword = (req, res, next) => {
  const email = req.body.email;

  crypto.randomBytes(32, (err, buffer) => {
    //For creting a unique token
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex"); //Passing to string the buffer
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email on the database");
          return res.redirect("/reset");
        }
        user.resetToken = token; //Saving the token for later check
        user.resetTokenExpiration = Date.now() + 3600000; //One hour expiration
        return user.save();
      })
      .then((user) => {
        req.flash("error", "An email has been sent to you email address");
        res.redirect("/login");
        const msg = {
          to: email,
          from: "david.gomez@tailored.systems", // Use the email address or domain you verified above
          subject: "Reset your password",
          text: "Reset your password",
          html: `<a href='http://localhost:3000/reset/${token}'>Reset password</a>`, //Token sent in the email link
        };
        //ES6
        sgMail.send(msg).then(
          () => {},
          (error) => {
            console.error(error);
            if (error.response) {
              console.error(error.response.body);
            }
          }
        );
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } }) //$gt greater than
    .then((user) => {
      let errMessage = req.flash("error");
      errMessage = errMessage.length > 0 ? errMessage[0] : null; //flash an empty array by default

      res.render("auth/new-password", {
        pageTitle: "New password",
        path: "/reset-password",
        errorMessage: errMessage,
        passwordToken: token,
        userId: user._id.toString(),
      });
    })
    .catch((err) => errorHandler(err, next));
};

exports.postNewPassword = (req, res, next) => {
  const userId = req.body.userId;
  const newPassword = req.body.password;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() }, //Checking again if the token and time is correct
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hassedPassword) => {
      resetUser.password = hassedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(() => {
      req.flash("error", "Password changed successfully. Please log in");
      res.redirect("/login");
    })
    .catch((err) => errorHandler(err, next));
};
