var express = require('express');
var router = express.Router();
var pool=require('../connections/dbconnection');
var fs = require('fs');

function getFileExtension(a) {
    var a = a.split('.');
    if (a.length === 1 || (a[0] === "" && a.length === 2)) {
        return '';
    }
    return a.pop();    // feel free to tack .toLowerCase() here if you want
}

function CreateMyDir() {
    try {
        fs.statSync(appRoot + '/public/images/useravatar/');
        console.log('file or directory exists:', appRoot + '/public/images/useravatar/');
        return true;
    }
    catch (errCreateMyDir) {
        if (errCreateMyDir.code === 'ENOENT') {
            fs.mkdir(appRoot + '/public/images/useravatar', {recursive: true}, (err) => {
                if (err) { console.log('errCreateDirAvatar', err); return false;}
                if (!err) { return true;}
            });
        } else {console.log('errCreateMyDir',errCreateMyDir); return false;}

    }
}

function CreateMessagesDir() {
    try {
        fs.statSync(appRoot + '/public/images/messages/');
        console.log('file or directory exists:', appRoot + '/public/images/messages/');
        return true;
    }
    catch (errCreateMessagesDir) {
        if (errCreateMessagesDir.code === 'ENOENT') {
            fs.mkdir(appRoot + '/public/images/messages', {recursive: true}, (err) => {
                if (err) { console.log('errCreateMessagesDir', err); return false;}
                if (!err) { return true;}
            });
        } else {console.log('errCreateMessagesDir',errCreateMessagesDir); return false;}

    }
}


async function asyncUser(sUser) {
    let conn;
    try {

        conn = await pool.getConnection();

        let sql = "call get_user_login('')";
        if (sUser != null) sql = "call get_user_login(?)";

        const rows = await conn.query(sql, [sUser]);
        return JSON.stringify(rows);

    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncEmailUser(email) {
    let conn;
    try {

        conn = await pool.getConnection();

        let sql = "select * from tUser where ifnull(bitdelete,0)=0 and email=?";

        const rows = await conn.query(sql, [email]);
        // rows: [ {val: 1}, meta: ... ]

        return JSON.stringify(rows);
        //const res = await conn.query("INSERT INTO myTable value (?, ?)", [1, "mariadb"]);
        // res: { affectedRows: 1, insertId: 1, warningStatus: 0 }

    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncNickUser(nick) {
    let conn;
    try {

        conn = await pool.getConnection();
        let sql = "select * from tuser where ifnull(bitdelete,0)=0 and nick=?";
        const rows = await conn.query(sql, [nick]);
        // rows: [ {val: 1}, meta: ... ]

        return JSON.stringify(rows);
        //const res = await conn.query("INSERT INTO myTable value (?, ?)", [1, "mariadb"]);
        // res: { affectedRows: 1, insertId: 1, warningStatus: 0 }

    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncIdUser(id_user) {
    let conn;
    try {

        conn = await pool.getConnection();
        let sql = "select * from tuser where id=?";
        const rows = await conn.query(sql, [id_user]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncEmailWithoutUser(email, id_user) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = "select * from tuser where id<>? and email=?";
        const rows = await conn.query(sql, [id_user, email]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncIpAddress(id_user, id_branch, req) {

    bSucc = true;
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = "SELECT ip FROM tuserbranch WHERE id_user=? AND id_branch=? AND ifnull(check_ip,0) = 1 AND length(ip)>0";
        const rows = await conn.query(sql, [id_user, id_branch]);

        if (rows[0]) {
            clientIP = getIpAddressFromRequest(req);
            dbIP = rows[0].ip;
            // -1 если не нашла
            const intSucc = clientIP.toLowerCase().trim().indexOf(dbIP.toLowerCase().trim()); // 7
            if (intSucc === -1) bSucc = false;
        };

        return JSON.stringify(bSucc);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}


async function checkIpAddress(dbIP, req) {
    bSucc = true;
    try {
            clientIP = getIpAddressFromRequest(req);
            // -1 если не нашла
            const intSucc = clientIP.toLowerCase().trim().indexOf(dbIP.toLowerCase().trim()); // 7
            if (intSucc === -1) bSucc = false;

            return bSucc;
    } catch (err) {
        throw err;
    } finally {

    }
}

async function asyncGetUserLink(id_user) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = " select t.id_branch,  b.name, t.check_ip, ifnull(t.ip,'') as ip "+
                  " from tuserbranch t left join tbranch b on b.id=t.id_branch "+
                  " where t.id_user=? and t.flagdelete=0 ";

        const rows = await conn.query(sql, [id_user]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncGetBranchName(id_branch) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = " select * from tbranch where id=?";
        const rows = await conn.query(sql, [id_branch]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

router.get('/', async function(req, res, next) {

    if (req.query.branch_name) {
        const result = await asyncGetBranchName(req.query.id_branch);
        res.send(result);
    }

    if (req.query.get_user_link) {
        const result = await asyncGetUserLink(req.query.id_user);
        res.send(result);
    }

    if (req.query.get_ip_arrress) {
        const result = await asyncIpAddress(req.query.id_user, req.query.id_branch, req);
        res.send(result);
    }

    if (req.query.get_ip_easy) {
        const result = await checkIpAddress(req.query.ip, req);
        res.send(result);
    }

  if (req.query.get_user) {
      const result = await asyncUser(req.query.get_user);
      res.send(result);
  }

   if (req.query.email_without_user) {
       const result = await asyncEmailWithoutUser(req.query.email_without_user, req.query.email_without_iduser);
       res.send(result);
   }



    if (req.query.get_email_user) {
        const result = await asyncEmailUser(req.query.get_email_user);
        res.send(result);
    }

    if (req.query.get_nick_user) {
        const result = await asyncNickUser(req.query.get_nick_user);
        res.send(result);
    }

    if (req.query.get_id_user) {
        const result = await asyncIdUser(req.query.get_id_user);
        res.send(result);
    }

});



async function asyncNewUser(newuser) {
    let conn;
    try {

        conn = await pool.getConnection();
        let sql = "CALL set_new_user(?, ?, ?)";
        const rows = await conn.query(sql, [newuser.nick, newuser.password, newuser.email]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

function deleteOldAvatar(avatar_name) {
    const sOldFileName = appRoot + '/public/images/useravatar/' + avatar_name;
    fs.access(sOldFileName, fs.F_OK, (err) => {
        if (!err) {
            fs.unlink(sOldFileName, (err) => {
                if (err) console.log('ErrFileDeleted', err);
                if (!err) console.log('FileDeleted', sOldFileName);
            });
            if (err) console.error('ErrFileAccess', err);
        }
    }); // file exists
}

function newName(id_user, avatar_name) {
    let sNewFileName = '';
    const sPrefix = new Date().getTime().toString();
    sNewFileName = id_user.toString() + '_' + sPrefix + '.' + getFileExtension(avatar_name);
    return sNewFileName;
}

async function asyncUpdateAvatar(id_user, avatar_name, Avatar) {
    let conn;
    try {

        conn = await pool.getConnection();
        let sql = "select * from tuser where id=?";
        const rows = await conn.query(sql, [id_user]);
        if (rows[0]) {
            if (rows[0].avatar_name) {
            // удаляем старый аватар
                deleteOldAvatar(rows[0].avatar_name);
            }
            //создаем новое имя файла
             const sNewFileName = newName(rows[0].id, avatar_name);
            //сохраняем новое имя файла в базе
            if (sNewFileName) {
                const sSql = 'update tuser set avatar_name=? where id=?';
                const resupdate = await conn.query(sSql, [sNewFileName, id_user]);
                // сохраняем файл на диске
                if (CreateMyDir()) {
                    var data = Avatar.replace('{"value":', "").replace('}', "");

                    fs.writeFile(appRoot + '/public/images/useravatar/' + sNewFileName, data, 'base64', function (err) {
                        if (err) console.log('errSaveAvatarToDisc', err);
                        if (!err) console.log('File saved.')
                    });
                }
                //
            }
        };
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}


async function asyncUpdateImageMessage(id_message, id_prefix, message_image, ext) {
    let conn;
    try {

       conn = await pool.getConnection();
         //создаем новое имя файла
        let sNewFileName = id_message + '_' + id_prefix;
        if (ext !== undefined) {
            sNewFileName = sNewFileName + '.' + ext;
        }
            //сохраняем новое имя файла в базе
                const sSql = 'insert message_image (id_message, name) values(?,?)';
                const resupdate = await conn.query(sSql, [id_message, sNewFileName]);

                // сохраняем файл на диске
                if (CreateMessagesDir()) {

                    const message_data =  decodeBase64Image(message_image)

                    fs.writeFile(appRoot + '/public/images/messages/' + sNewFileName, message_data.data, 'base64', function (err) {
                        if (err) console.log('errSaveMessagesToDisc', err);
                        if (!err) console.log('File saved.')
                    });
                }
                //
        return JSON.stringify(resupdate);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncClearAvatar(id_user) {

    let conn;
    try {

        conn = await pool.getConnection();
        let sql = "select * from tuser where id=?";
        const rows = await conn.query(sql, [id_user]);
        if (rows[0]) {
            if (rows[0].avatar_name) {
                // удаляем старый аватар
                deleteOldAvatar(rows[0].avatar_name);
            }

        };
        const sSql = 'update tuser set avatar_name=null where id=?';
        const resupdate = await conn.query(sSql, [id_user]);

        return JSON.stringify(resupdate);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}


async function asyncUserPostPassword(password, id_user) {
    let conn;
    try {
        conn = await pool.getConnection();
        const sSql = 'update tuser set password=? where id=?';
        const resupdate = await conn.query(sSql, [password, id_user]);
        return JSON.stringify(resupdate);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}


async function asyncUserUpdate(user, id_user) {
/*
    update_user: 'update_user',
        inputName: 'Виталий', name
        inputLastName: 'Клипач',surname
        inputPatronymic: 'Степанович',patronymic
        inputZip: '2343434',zip
        inputAddress: '23232342424',address
        inputPhone: '1234',phone1
        inputPhone2: '7890',phone2
        inputEmail: 'klipach1@mail.ru1',email
        gender: 1,gender
        date: 1582848000000,datebirth
*/

    let conn;
    try {
        conn = await pool.getConnection();

        const sSql = ' update tuser set name=?, surname=?, patronymic=?, zip=?, address=?, ' +
                     ' phone1=?, phone2=?, email=?, gender=?, datebirth = FROM_UNIXTIME(0) + INTERVAL ?/1000 SECOND where id=?';
        const Param = [user.inputName, user.inputLastName, user.inputPatronymic, user.inputZip, user.inputAddress,
            user.inputPhone, user.inputPhone2, user.inputEmail, user.gender, user.date, id_user];

        const resupdate = await conn.query(sSql, Param);
        return JSON.stringify(resupdate);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }

}

router.post('/', async function(req, res) {

    if (req.body.post_user) {
        const result = await  asyncUserUpdate(req.body.post_user, req.body.id_user);
        res.send(result);
    }

    if (req.body.update_password) {
        const result = await asyncUserPostPassword(req.body.update_password, req.body.id_user);
        res.send(result);
    }

    if (req.body.newuser) {
        const result = await asyncNewUser(req.body.newuser);
        res.send(result);
    }

    if (req.body.message_image) {
        const result = await asyncUpdateImageMessage(req.body.id_message, req.body.id_prefix, req.body.message_image, req.body.ext);
        res.send(result);
    }

    if (req.body.avatar) {
        const result = await asyncUpdateAvatar(req.body.id_user, req.body.avatar.Name, req.body.avatar.Avatar);
        res.send(result);
    }

    if (req.body.clear_avatar) {
        const result = await asyncClearAvatar(req.body.id_user);
        res.send(result);
    }


});

const getIpAddressFromRequest = (request) => {
    let ipAddr = request.connection.remoteAddress;

    if (request.headers && request.headers['x-forwarded-for']) {
        [ipAddr] = request.headers['x-forwarded-for'].split(',');
    }

    return ipAddr;
};


function decodeBase64Image(dataString)
{
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    var response = {};

    if (matches.length !== 3)
    {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = Buffer.from(matches[2], 'base64');

    return response;
}

module.exports = router;
