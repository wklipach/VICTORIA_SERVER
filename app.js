var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var forgotpasswordRouter = require('./routes/forgotpassword');
var shift = require('./routes/shift');
var admin = require('./routes/admin');
var laundry = require('./routes/laundry');
var validators = require('./routes/validators');
var report = require('./routes/report');
var payment = require('./routes/payment');
var comment = require('./routes/comment');

var app = express();
app.use(express.json({ limit: '50mb' }));
// process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'
// Add headers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:4200"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/forgotpassword', forgotpasswordRouter);
app.use('/shift', shift);
app.use('/admin', admin);
app.use('/laundry', laundry);
app.use('/validators', validators);
app.use('/report', report);
app.use('/payment', payment);
app.use('/comment', comment);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

global.appRoot = path.resolve(__dirname);

module.exports = app;
