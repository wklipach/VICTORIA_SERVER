var express = require('express');
var router = express.Router();
var pool=require('../connections/dbconnection');

async function asyncAddress(id_address) {
    const sSQL = "select address from laundry_address_shipment where id_address = ?";
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sSQL, [id_address]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncSelectPie(id_branch, var_date1, var_date2, inttype) {

    const sSQL = "call select_pie (?, ?, ?, ?)";
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sSQL, [id_branch, var_date1, var_date2, inttype]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}



async function asyncAcceptance(id_address, id_branch) {
    const sSQL = "call bottom_acceptance (?, ?)";
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sSQL, [id_address, id_branch]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncWarehouse(id_address, id_branch) {
    const sSQL = "call bottom_warehouse (?, ?)";
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sSQL, [id_address, id_branch]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncShipment(id_address, id_branch) {
    const sSQL = "call bottom_shipment (?, ?)";
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sSQL, [id_address, id_branch]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncWashing(id_address, id_branch) {
    const sSQL = "call bottom_washing (?, ?)";
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sSQL, [id_address, id_branch]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncRepair(id_address, id_branch) {
    const sSQL = "CALL bottom_repair (?, ?)";
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sSQL, [id_address, id_branch]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncSelectReportWeek(id_user, id_branch, date_begin, date_end) {
    const sSQL = 'call select_report_advpay (?,?,?,?)';
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


async function asyncSelectReportGraph(id_user, id_branch, date_begin, date_end, type) {
    const sSQL = 'call select_payment_graph (?,?,?,?,?)';
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sSQL, [id_user, id_branch, date_begin, date_end, type]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncSelectReportFace(id_user, id_branch) {
    const sSQL = 'call week_face (?,?)';
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sSQL, [id_user, id_branch]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

router.post('/', async function(req, res) {
    res.send(res);
});

router.get('/', async function(req, res, next) {

    if (req.query.select_report_graph) {
        const result = await asyncSelectReportGraph(req.query.id_user,
                                                    req.query.id_branch,
                                                    req.query.date_begin,
                                                    req.query.date_end,
                                                    req.query.type);
        res.send(result);
    }

    if (req.query.select_pie) {
          const result = await asyncSelectPie(req.query.id_branch,
                                                      req.query.date_begin,
                                                      req.query.date_end,
                                                      req.query.type);
          res.send(result);
        }

    if (req.query.select_report_face) {
        const result = await asyncSelectReportFace(req.query.id_user, req.query.id_branch);
        res.send(result);
    }

    if (req.query.select_report_week) {
        const result = await asyncSelectReportWeek(req.query.id_user, req.query.id_branch, req.query.date_begin, req.query.date_end);
        res.send(result);
    }

    if (req.query.report_acceptance) {
        const result = await asyncAcceptance(req.query.id_address, req.query.id_branch);
        res.send(result);
    }

    if (req.query.report_warehouse) {
        const result = await asyncWarehouse(req.query.id_address, req.query.id_branch);
        res.send(result);
    }

    if (req.query.report_washing) {
        const result = await asyncWashing(req.query.id_address, req.query.id_branch);
        res.send(result);
    }

    if (req.query.report_shipment) {
        const result = await asyncShipment(req.query.id_address, req.query.id_branch);
        res.send(result);
    }


    if (req.query.report_repair) {
        const result = await asyncRepair(req.query.id_address, req.query.id_branch);
        res.send(result);
    }

    if (req.query.report_address) {
        const result = await asyncAddress(req.query.id_address);
        res.send(result);
    }

});

module.exports = router;
