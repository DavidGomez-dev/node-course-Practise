//Function to redirect to 500 and manage errors
module.exports = (err, next) => {
  const error = new Error(err);
  console.log(err);
  error.httpStatusCode = 500;
  return next(error); //Skip to the error middleware\
};
