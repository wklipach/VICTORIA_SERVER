var express = require('express');
var router = express.Router();
var pool=require('../connections/dbconnection');
var sql_repair = require('../query/sql_repair');
var sql_washing = require('../query/sql_washing');
var sql_warehouse = require('../query/sql_warehouse');
var sql_shipment = require('../query/sql_shipment')

async function asyncGetRepair(id_address, id_branch) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = sql_repair;
        const rows = await conn.query(sql, [id_address, id_branch, id_address, id_branch]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncGetShipment(id_address, id_branch) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = sql_shipment;
        const rows = await conn.query(sql, [id_address, id_branch, id_address, id_branch]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncGetWarehouse(id_address, id_branch) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = sql_warehouse;
        const rows = await conn.query(sql, [id_address, id_branch, id_address, id_branch]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncGetWashing(id_address, id_branch) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = sql_washing;
        const rows = await conn.query(sql, [id_address, id_branch, id_address, id_branch, id_address, id_branch]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

router.get('/', async function(req, res, next) {

    if (req.query.get_valid_repair) {
        const result = await asyncGetRepair(req.query.id_address, req.query.id_branch);
        res.send(result);
    }

    if (req.query.get_valid_washing) {
        const result = await asyncGetWashing(req.query.id_address, req.query.id_branch);
        res.send(result);
    }

    if (req.query.get_valid_warehouse) {
        const result = await asyncGetWarehouse(req.query.id_address, req.query.id_branch);
        res.send(result);
    }

    if (req.query.get_valid_shipment) {
        const result = await asyncGetShipment(req.query.id_address, req.query.id_branch);
        res.send(result);
    }

});

module.exports = router;
