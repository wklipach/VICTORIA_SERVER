var express = require('express');
var router = express.Router();
var pool=require('../connections/dbconnection');


async function asyncNewPayment(id_user, id_branch, payment) {
    const sSQL = "call insert_pay (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    let conn;
    let conn2
    try {
        conn = await pool.getConnection();

        //цикл фор синхронный, ожидает выполнения каждой итерации
        for (key of payment) {
            console.log('payment-key', key);
            const rows = await conn.query(sSQL,
                        [id_user,  id_branch, key.payhour,
                                key.hour, key.koeff, key.addwork,
                                key.dd,   key.mm,    key.yyyy] );
        };
        return JSON.stringify(true);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncPaymentVirtual(id_user, id_branch, date_begin, date_end) {
    const sSQL = "call select_payment_virtual (?, ?, ?, ?) ";
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sSQL, [id_user, id_branch, date_begin, date_end]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncPaymentReal(id_user, id_branch, date_begin, date_end) {
    const sSQL = "call select_payment_real (?, ?, ?, ?) ";
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sSQL, [id_user, id_branch, date_begin, date_end]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

router.post('/', async function(req, res) {

    if (req.body['payment_insert']) {
        const result = await asyncNewPayment(req.body['id_user'], req.body['id_branch'], req.body['payment']);
        res.send(result);
    }

});

router.get('/', async function(req, res, next) {

    if (req.query.payment_real) {
        const result = await asyncPaymentReal(req.query.id_user, req.query.id_branch, req.query.date_begin, req.query.date_end);
        res.send(result);
    }

    if (req.query.payment_virtual) {
        const result = await asyncPaymentVirtual(req.query.id_user, req.query.id_branch, req.query.date_begin, req.query.date_end);
        res.send(result);
    }

});

module.exports = router;
