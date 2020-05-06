var express = require('express');
var router = express.Router();
var pool=require('../connections/dbconnection');


async function asyncNewShift(id_user, id_branch) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = "CALL insert_shift(?, ?)";
        const rows = await conn.query(sql, [id_user, id_branch]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}


async function asyncEndShift(id_user, id_branch) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = "CALL end_shift(?, ?)";
        const rows = await conn.query(sql, [id_user, id_branch]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}


router.post('/', async function(req, res) {
    if (req.body['new_shift']) {
        const result = await asyncNewShift(req.body['id_user'], req.body['id_branch']);
        res.send(result);
    }


    if (req.body['end_shift']) {
        const result = await asyncEndShift(req.body['id_user'], req.body['id_branch']);
        res.send(result);
    }

});


async function asyncGetShift(id_user, id_branch) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = "SELECT * FROM shift WHERE id_user=? AND id_branch=? AND ifnull(date_end,0)<date_begin";
        const rows = await conn.query(sql, [id_user, id_branch]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

router.get('/', async function(req, res, next) {

    if (req.query.get_shiftuserbranch) {
        const result = await asyncGetShift(req.query.id_user, req.query.id_branch);
        res.send(result);
    }

});

module.exports = router;
