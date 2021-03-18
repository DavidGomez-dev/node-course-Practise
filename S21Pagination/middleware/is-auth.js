//To protect Routes if not logged
module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login"); //If not logged redirect to login
  }
  next();
};
