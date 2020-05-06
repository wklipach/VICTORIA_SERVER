var express = require('express');
var router = express.Router();
var pool=require('../connections/dbconnection');
var email 	= require("emailjs/email");
var connectionSMTP = require('../connections/SMTPServer');

router.get('/', function(req, res, next) {
    res.send(JSON.stringify(res));
});

async function asyncNewPasswordSend(hash, email, pwd) {
    let conn;
    try {

        conn = await pool.getConnection();
        let sql = "update tuser set password = ? where email = ?";
        const rows = await conn.query(sql, [hash, email]);

        bSend(email, pwd,  (err, message) =>
        {
            let sendRes='succesfull send';
            if (err) {
                sendRes='error send';
                console.log('valRes err',err)
            };
             return JSON.stringify(sendRes);
        });
        // return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

router.post('/', async function(req, res) {

    if (req.body['email'] && req.body['pwd'] && req.body['hash']) {
        const result = await asyncNewPasswordSend(req.body['hash'], req.body['email'], req.body['pwd']);
        res.send(result);
    }


});



 function bSend (sTo, sPwd, callback)  {

     console.log('sTo=', sTo);
     console.log('sPwd=', sPwd);

     var message	= {
        from:	connectionSMTP.userForFromLetter,
        to:		sTo,
        subject:	connectionSMTP.subject,
        attachment:
            [
                {data:"<html>Your new password: "+sPwd+"</html>", alternative:true}
            ]
    };

    var server 	= email.server.connect({
        user:   	connectionSMTP.user,
        password:   connectionSMTP.password,
        host: connectionSMTP.host,
        port: connectionSMTP.port,
        ssl:  connectionSMTP.ssl
    }).send(message, function(err, message) {
        callback(err, message);
    });

};



module.exports = router;
