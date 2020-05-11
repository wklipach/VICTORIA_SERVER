var express = require('express');
var router = express.Router();
var pool=require('../connections/dbconnection');
var sNomView = require('../views_users/vnomenclature');



async function asyncDetailWarehouse(id_warehouse) {

    const sSQL =
        " select ald.id, ald.quant, cast(ald.bitadd as int) as bitadd, lb.name, nl.type "+
        " from warehouse_laundry_detail ald, "+
        " laundry_nomenclature ln left join laundry_typenl nl ON nl.id_ltp = ln.id_ltp, "+
        " laundry_basenom lb WHERE ln.id_nom = ald.id_nom and lb.id_lbn = ln.id_lbn and ald.id_warehouse = ? "+
        " order by ald.quant desc ";


    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sSQL, [id_warehouse]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncDetailRepair(id_repair) {

    const sSQL =
        " select ald.id, ald.quant, lb.name, nl.type "+
        " from repair_laundry_detail ald, "+
        " laundry_nomenclature ln left join laundry_typenl nl ON nl.id_ltp = ln.id_ltp, "+
        " laundry_basenom lb WHERE ln.id_nom = ald.id_nom and lb.id_lbn = ln.id_lbn and ald.id_repair = ? "+
        " order by ald.quant desc ";


    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sSQL, [id_repair]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}


async function asyncDetailWashing(id_washing) {

    const sSQL =
        " select ald.id, ald.quant, lb.name, nl.type "+
        " from washing_laundry_detail ald, "+
        " laundry_nomenclature ln left join laundry_typenl nl ON nl.id_ltp = ln.id_ltp, "+
        " laundry_basenom lb WHERE ln.id_nom = ald.id_nom and lb.id_lbn = ln.id_lbn and ald.id_washing = ? "+
        " order by ald.quant desc ";


    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sSQL, [id_washing]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncDetailAddWork(id_addwork) {

    const sSQL =
       " select ald.id, ald.quant, lb.name as work_name " +
       " from addwork_laundry_detail ald, laundry_add_work lb " +
       " WHERE lb.id = ald.id_addwork and ald.id_addwork_laundry = ? " +
       " order by ald.quant desc ";



    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sSQL, [id_addwork]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncDetailAcceptance(id_accept) {

    const sSQL =
        " select ald.id, ald.quant, cast(ald.bitspoiled as int) as bitspoiled, lb.name, nl.type "+
    " from acceptance_laundry_detail ald, "+
    " laundry_nomenclature ln left join laundry_typenl nl ON nl.id_ltp = ln.id_ltp, "+
    " laundry_basenom lb WHERE ln.id_nom = ald.id_nom and lb.id_lbn = ln.id_lbn and ald.id_accept = ? "+
    " order by bitspoiled asc, ald.quant desc ";


    let conn;
        try {
                conn = await pool.getConnection();
                const rows = await conn.query(sSQL, [id_accept]);
                return JSON.stringify(rows);
        } catch (err) {
                throw err;
        } finally {
                if (conn) conn.release(); //release to pool
        }
}


async function asyncAddWork() {
    const sSQL = "select * from laundry_add_work where ifnull(flagdelete,0)=0 order by id";
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sSQL);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncWashhouseAddress(id_branch) {

   const sSQL = "select * from laundry_address_shipment where ifnull(flagdelete,0)=0  order by id_address";
/*
            " select a.*, b.name as branch_name from laundry_address_shipment a "+
            " left join tbranch b on b.id = a.id_branch "+
            " where a.id_branch=? and ifnull(a.flagdelete,0)=0 order by a.id_address ";
*/

    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sSQL, [id_branch]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncLastWarehouse(id_user, id_branch) {
    const sSQL =
        " SELECT u.nick, "+
        "    u.surname, "+
        "    u.name AS usernane, "+
        "    u.patronymic, "+
        "    b.name AS branchname, "+
        "    sh.date_begin AS shiftdate, "+
        "    al.date_oper, "+
        "    al.massa, "+
        "    al.id," +
        "    las.address "+
        " FROM warehouse_laundry al, shift sh, tuser u, tbranch b, laundry_address_shipment las "+
        " WHERE al.date_oper = (SELECT MAX(date_oper) from warehouse_laundry where id in "+
        " (SELECT id_warehouse FROM warehouse_laundry_detail where ifnull(bitadd,0)=1)) "+
        " AND las.id_address = al.id_address and "+
        " sh.id=al.id_shift "+
        " AND "+
        " u.id = sh.id_user "+
        " AND "+
        " b.id=sh.id_branch "+
        " and "+
        " sh.id_user=? "+
        " and ifnull(al.id_address,0) > 0 and "+
        " sh.id_branch=? ";

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


async function asyncLastAddWork(id_user, id_branch) {
    const sSQL =
        " SELECT u.nick, "+
        "    u.surname, "+
        "    u.name AS usernane, "+
        "    u.patronymic, "+
        "    b.name AS branchname, "+
        "    sh.date_begin AS shiftdate, "+
        "    al.date_oper, "+
        "    al.id " +
        " FROM addwork_laundry al, shift sh, tuser u, tbranch b "+
        " WHERE al.date_oper = (SELECT MAX(date_oper) from addwork_laundry where id in "+
        " (SELECT id_addwork_laundry FROM addwork_laundry_detail)) "+
        " AND sh.id=al.id_shift "+
        " AND "+
        " u.id = sh.id_user "+
        " AND "+
        " b.id=sh.id_branch "+
        " and "+
        " sh.id_user=? "+
        " and "+
        " sh.id_branch=? ";

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

async function asyncLastShipment(id_user, id_branch) {
    const sSQL =
        " SELECT u.nick, "+
        "    u.surname, "+
        "    u.name AS usernane, "+
        "    u.patronymic, "+
        "    b.name AS branchname, "+
        "    sh.date_begin AS shiftdate, "+
        "    al.date_oper, "+
        "    al.massa, "+
        "    al.id," +
        "    las.address "+
        " FROM warehouse_laundry al, shift sh, tuser u, tbranch b, laundry_address_shipment las "+
        " WHERE al.date_oper = (SELECT MAX(date_oper) from warehouse_laundry where id in "+
        " (SELECT id_warehouse FROM warehouse_laundry_detail where ifnull(bitadd,0)=0)) "+
        " AND las.id_address = al.id_address and "+
        " sh.id=al.id_shift "+
        " AND "+
        " u.id = sh.id_user "+
        " AND "+
        " b.id=sh.id_branch "+
        " and "+
        " sh.id_user=? "+
        " and ifnull(al.id_address,0) > 0 and "+
        " sh.id_branch=? ";


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


async function asyncLastRepair(id_user, id_branch) {
    const sSQL =
        " SELECT u.nick, "+
        "    u.surname, "+
        "    u.name AS usernane, "+
        "    u.patronymic, "+
        "    b.name AS branchname, "+
        "    sh.date_begin AS shiftdate, "+
        "    al.date_oper, "+
        "    al.massa, "+
        "    al.id, "+
        "    las.address "+
        " FROM repair_laundry al, shift sh, tuser u, tbranch b, laundry_address_shipment las "+
        " WHERE al.date_oper = (SELECT MAX(date_oper) from repair_laundry) "+
        " AND las.id_address = al.id_address and "+
        " sh.id=al.id_shift "+
        " AND "+
        " u.id = sh.id_user "+
        " AND "+
        " b.id=sh.id_branch "+
        " and "+
        " sh.id_user=? "+
        " and "+
        " sh.id_branch=? ";


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

async function asyncLastWashing(id_user, id_branch) {
    const sSQL =
        " SELECT u.nick, "+
        "    u.surname, "+
        "    u.name AS usernane, "+
        "    u.patronymic, "+
        "    b.name AS branchname, "+
        "    sh.date_begin AS shiftdate, "+
        "    al.date_oper, "+
        "    al.massa, "+
        "    al.id, "+
        "    las.address "+
        " FROM washing_laundry al, shift sh, tuser u, tbranch b, laundry_address_shipment las "+
        " WHERE al.date_oper = (SELECT MAX(date_oper) from washing_laundry) "+
        " AND las.id_address = al.id_address and "+
        " sh.id=al.id_shift "+
        " AND "+
        " u.id = sh.id_user "+
        " AND "+
        " b.id=sh.id_branch "+
        " and "+
        " sh.id_user=? "+
        " and "+
        " sh.id_branch=? ";


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

async function asyncLastAcceptance(id_user, id_branch) {
        const sSQL =
            " SELECT u.nick, "+
        "    u.surname, "+
        "    u.name AS usernane, "+
        "    u.patronymic, "+
        "    b.name AS branchname, "+
        "    sh.date_begin AS shiftdate, "+
        "    al.date_oper, "+
        "    al.massa, "+
        "    al.id, "+
        "    las.address "+
        " FROM acceptance_laundry al, shift sh, tuser u, tbranch b, laundry_address_shipment las "+
        " WHERE al.date_oper = (SELECT MAX(date_oper) from acceptance_laundry) "+
        " AND las.id_address = al.id_address and "+
        " sh.id=al.id_shift "+
        " AND "+
        " u.id = sh.id_user "+
        " AND "+
        " b.id=sh.id_branch "+
        " and "+
        " sh.id_user=? "+
        " and "+
        " sh.id_branch=? ";


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


function createInsertMassive (id_acc, sVal, key) {
                // парсим key и получаем для него массив для инсерта
                let bitSpoiled = true;
                let sKey = key;
                let pos = sKey.indexOf("_spoiled");
                if (pos > -1) {
                        bitSpoiled = true;
                        sKey = sKey.substring(1, pos);
                } else {
                        bitSpoiled = false;
                        sKey = sKey.substring(1);
                }
        return [id_acc, sKey, sVal, bitSpoiled];

}


// если не пуситое значение и большее нуля возвращаем True
function CheckValue(value) {
        let sVal = value;
        if (sVal === '') {
                sVal = '0';
        }
        if (sVal > 0)  {
                return true;
        } else {
                return false;
        }
}



async function asyncNewWashing(value, id_shift, id_address) {
    let bitSpoiled = false;
    let numberCount = 0;
    let id_access = 0;
    let sKey = '';

    console.log('asyncNewWashing', value, id_shift, id_address);

    let conn;
    try {
        conn = await pool.getConnection();

        let sVal = '';

        // заносим складскую проводку с переданным бельем

        let sSQL = 'CALL insert_washing_laundry(?, ?, ?, ?)';
        const rows = await conn.query(sSQL, [id_shift, id_address, value['massa'], (new Date()).getTime()]);

        if (rows[0]) {
            value['massa'] = undefined;
            let batchMass = [];
            Object.keys(value).forEach(key => {
                if (CheckValue(value[key])) {
                    let Res = createInsertMassive(rows[0][0].id, value[key], key);
                    Res.splice(3, 1);
                    batchMass.push(Res);
                }
            });

            if (batchMass.length>0) {

                const aSQL ="insert washing_laundry_detail(id_washing, id_nom, quant) values(?,?,?)";
                const resbatch = await conn.batch(aSQL, batchMass);
            }
        }

        return JSON.stringify(true);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncNewRepair(value, id_shift, id_address) {
    let bitSpoiled = false;
    let numberCount = 0;
    let id_access = 0;
    let sKey = '';

    console.log('asyncNewRepair', value, id_shift, id_address);

    let conn;
    try {
        conn = await pool.getConnection();

        let sVal = '';

        // заносим складскую проводку с переданным бельем

        let sSQL = 'CALL insert_repair_laundry(?, ?, ?, ?)';
        const rows = await conn.query(sSQL, [id_shift, id_address, value['massa'], (new Date()).getTime()]);

        if (rows[0]) {
            value['massa'] = undefined;
            let batchMass = [];
            Object.keys(value).forEach(key => {
                if (CheckValue(value[key])) {
                    let Res = createInsertMassive(rows[0][0].id, value[key], key);
                    Res.splice(3, 1);
                    batchMass.push(Res);
                }
            });

            if (batchMass.length>0) {

                const aSQL ="insert repair_laundry_detail(id_repair, id_nom, quant) values(?,?,?)";
                const resbatch = await conn.batch(aSQL, batchMass);
            }
        }

        return JSON.stringify(true);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

// const result = await asyncNewAddWork(req.body.addwork_insert, req.body.id_shift);
async function asyncNewAddWork(value, id_shift) {

    let conn;
    try {
        conn = await pool.getConnection();

        // заносим складскую проводку с переданным бельем
        let sSQL = 'CALL insert_addwork_laundry(?, ?)';
        const rows = await conn.query(sSQL, [id_shift, (new Date()).getTime()]);

        if (rows[0]) {
            const aSQL ="insert addwork_laundry_detail(id_addwork_laundry, id_addwork, quant) values(?,?,?)";
            for (key of value) {

                const res_rows = await conn.query(aSQL,[rows[0][0].id, key.id, 1]);
            };
        }

        return JSON.stringify(true);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
};

//TODO 2
async function asyncNewWarehouse(value, id_shift, bitadd, id_address) {
    let bitSpoiled = false;
    let numberCount = 0;
    let id_access = 0;
    let sKey = '';

    let conn;
    try {
        conn = await pool.getConnection();

        let sVal = '';

        // заносим складскую проводку с переданным бельем
        let sSQL = 'CALL insert_warehouse_laundry(?, ?, ?, ?)';
        const rows = await conn.query(sSQL, [id_shift, id_address, value['massa'], (new Date()).getTime()]);

        if (rows[0]) {
            value['massa'] = undefined;
            let batchMass = [];
            Object.keys(value).forEach(key => {
                if (CheckValue(value[key])) {
                    let Res = createInsertMassive(rows[0][0].id, value[key], key);
                    Res[3] = bitadd;
                    batchMass.push(Res);
                }
            });

            if (batchMass.length>0) {

                const aSQL ="insert warehouse_laundry_detail(id_warehouse, id_nom, quant, bitadd) values(?,?,?,?)";
                const resbatch = await conn.batch(aSQL, batchMass);
            }
        }

        return JSON.stringify(true);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
};


async function asyncNewAcceptance(value, id_shift, id_address) {

        // console.log(value);

        let bitSpoiled = false;
        let numberCount = 0;
        let id_access = 0;
        let sKey = '';

        let conn;
        try {
                conn = await pool.getConnection();
                let sVal = '';

                // заносим проводку с переданным бельем
                let sSQL = 'CALL insert_acceptance_laundry(?, ?, ?, ?)';
                const rows = await conn.query(sSQL, [id_shift, id_address, value['massa'], (new Date()).getTime()]);

                if (rows[0]) {
                        value['massa'] = undefined;
                        let batchMass = [];
                        Object.keys(value).forEach(key => {
                                if (CheckValue(value[key])) {
                                        const Res = createInsertMassive(rows[0][0].id, value[key], key);
                                        batchMass.push(Res);
                                }
                        });

                        if (batchMass.length>0) {

                                const aSQL ="insert acceptance_laundry_detail(id_accept, id_nom, quant, bitspoiled) values(?,?,?,?)";
                                const resbatch = await conn.batch(aSQL, batchMass);
                        }
                }

                return JSON.stringify(true);
        } catch (err) {
                throw err;
        } finally {
                if (conn) conn.release(); //release to pool
        }

}


router.get('/', async function(req, res, next) {

    if (req.query.get_laundry_add_work) {
        const result = await asyncAddWork();
        res.send(result);
    }


        if (req.query.get_washhouse_address) {
           const result = await asyncWashhouseAddress(req.query.id_branch);
           res.send(result);
        }

        if (req.query.last_warehouse) {
            const result = await asyncLastWarehouse(req.query.id_user, req.query.id_branch);
            res.send(result);
        }

    if (req.query.last_washing) {
            const result = await asyncLastWashing(req.query.id_user, req.query.id_branch);
            res.send(result);
        }

        if (req.query.detail_washing) {
            const result = await asyncDetailWashing(req.query.id_washing);
            res.send(result);
        }


        if (req.query.last_acceptance) {
                const result = await asyncLastAcceptance(req.query.id_user, req.query.id_branch);
                res.send(result);
        }

        if (req.query.detail_acceptance) {
                const result = await asyncDetailAcceptance(req.query.id_accept);
                res.send(result);
        }

        if (req.query.detail_addwork) {
            const result = await asyncDetailAddWork(req.query.id_addwork);
            res.send(result);
        }

        if (req.query.detail_warehouse) {
            const result = await asyncDetailWarehouse(req.query.id_warehouse);
            res.send(result);
        }

    if (req.query.last_shipment) {
        const result = await asyncLastShipment(req.query.id_user, req.query.id_branch);
        res.send(result);
    }

    if (req.query.last_addwork) {
        const result = await asyncLastAddWork(req.query.id_user, req.query.id_branch);
        res.send(result);
    }


    if (req.query.last_repair) {
        const result = await asyncLastRepair(req.query.id_user, req.query.id_branch);
        res.send(result);
    }

    if (req.query.detail_repair) {
        const result = await asyncDetailRepair(req.query.id_repair);
        res.send(result);
    }

});

router.post('/', async function(req, res) {

        if (req.body.acceptance_insert) {
                const result = await asyncNewAcceptance(req.body.acceptance_insert, req.body.id_shift, req.body.id_address);
                res.send(result);
        }

        if (req.body.warehouse_insert) {
            const result = await asyncNewWarehouse(req.body.warehouse_insert, req.body.id_shift, true, req.body.id_address);
            res.send(result);
        }

        if (req.body.repair_insert) {
            const result = await asyncNewRepair(req.body.repair_insert, req.body.id_shift, req.body.id_address);
            res.send(result);
        }

    if (req.body.washing_insert) {
        const result = await asyncNewWashing(req.body.washing_insert, req.body.id_shift, req.body.id_address);
        res.send(result);
    }


    if (req.body.shipment_insert) {
        const result = await asyncNewWarehouse(req.body.shipment_insert, req.body.id_shift, false, req.body.id_address);
        res.send(result);
    }

    if (req.body.addwork_insert) {
        const result = await asyncNewAddWork(req.body.addwork_insert, req.body.id_shift);
        res.send(result);
    }


});


module.exports = router;
