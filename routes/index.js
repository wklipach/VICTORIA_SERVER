var express = require('express');
var router = express.Router();

/* GET home page. */

const getIpAddressFromRequest = (request) => {
  let ipAddr = request.connection.remoteAddress;

  if (request.headers && request.headers['x-forwarded-for']) {
    [ipAddr] = request.headers['x-forwarded-for'].split(',');
  }

  return ipAddr;
};


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express '+getIpAddressFromRequest(req)});
});

module.exports = router;
