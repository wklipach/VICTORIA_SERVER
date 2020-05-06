var express = require('express');
var router = express.Router();
var pool=require('../connections/dbconnection');

async function asyncUpdatePosition(id, name) {
    let conn;
    try {
        conn = await pool.getConnection();

        let sql = "update tposition set name=? where id=?";
        const rows = await conn.query(sql, [name, id]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}


async function asyncSelectPositionBranch(id_branch) {
    let conn;
    try {
        conn = await pool.getConnection();

        let sql = " select p.*, ifnull(tpb.price,0) as price, (not not ifnull(tpb.id,0)) as check_price "+
            " from tposition p "+
            " left join tpositionbranch tpb on tpb.id_position=p.id "+
            " and ifnull(tpb.flagdelete,0)=0 and id_branch = ? "+
            " where ifnull(p.flagdelete,0)=0 order by p.id asc";

        const rows = await conn.query(sql, [id_branch]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}



async function asyncSelectAddworkBranch(id_branch) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql =
        "select w.id, w.name, ifnull(tab.price,0) as price, w.flagdelete, (not not ifnull(tab.id,0)) as check_price "+
        "from laundry_add_work w "+
        "left join taddworkbranch tab on tab.id_addwork = w.id "+
        "and ifnull(tab.flagdelete,0)=0 and tab.id_branch = ? "+
        "where ifnull(w.flagdelete,0)=0 order by w.id asc";

        const rows = await conn.query(sql, [id_branch]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}


async function asyncInsertPosition(name, price, id_branch) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = "call insert_position(?)";
        const rows = await conn.query(sql, [name]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncGetBranchUser(id_user,) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql =
        " select b.id, b.name as branch_name, ifnull(ub.id_user, 0) as id_user, "+
        " ifnull(ub.check_ip,0) as check_ip, ifnull(ub.id_position,0) as id_position, "+
        " ifnull(p.name, '') as position_name, ifnull(ub.ip, '') as ip, "+
        "   NOT NOT (ifnull(ub.id_user, 0)) as branch_check "+
        " from tbranch b "+
        " left join tuserbranch ub on b.id = ub.id_branch and ub.flagdelete=0 and ub.id_user=? "+
        " left join tposition p on ub.id_position = p.id "+
        " where b.bitdelete=0 order by b.id asc";
        const rows = await conn.query(sql, [id_user]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}


async function asyncGetBranch(id_city) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = "SELECT * FROM tbranch WHERE IFNULL(bitdelete,0) = 0 and id_city=? ORDER BY id asc";
        const rows = await conn.query(sql, [id_city]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncGetPosition(id_branch) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql ="select t.* from tposition t where flagdelete=0 order by t.id asc";
        const rows = await conn.query(sql, [id_branch]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncGetUniqueNick(id_user, nick) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql ="select count(id) as res  from tuser where id<> ? and nick = ? ";
        const rows = await conn.query(sql, [id_user, nick]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncGetBranchInfo(id_branch) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = ' SELECT * from tbranch where id=? ';
        const rows = await conn.query(sql, [id_branch]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncGetUsers(id_branch) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql =
        ' SELECT id, nick, surname, name, ip, check_ip, filial, id_position, position_name from ( '+
        ' SELECT u.id, u.nick, u.surname, u.name, t.ip, t.check_ip, 1 as filial, ifnull(t.id_position,0) as id_position, p.name as position_name  '+
        ' FROM tuser u, tuserbranch t left join tposition p on p.id=t.id_position  '+
        ' WHERE IFNULL(u.bitdelete,0)=0 AND u.id = t.id_user AND t.id_branch=?  '+
        ' union all '+
        ' SELECT u.id, u.nick, u.surname, u.name, null, null, 0 as filial, 0, "" '+
        ' FROM tuser u '+
        ' where u.id not in (select id_user from tuserbranch t) '+
        ' and IFNULL(u.bitdelete,0)=0 ) as d order by d.nick asc';

        const rows = await conn.query(sql, [id_branch]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}


async function asyncNewBranch(id_city, BranchName) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = "CALL insert_branch(?, ?)";
        const rows = await conn.query(sql, [id_city, BranchName]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}


async function asyncNewAddress(name, id_branch) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = "CALL insert_address(?, ?)";
        const rows = await conn.query(sql, [name, id_branch]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncNewAddWork(name) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = "CALL insert_addwork ( ? )";
        const rows = await conn.query(sql, [name]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncDeleteAddress(id_address) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = "update laundry_address_shipment set flagdelete=1 where id_address=?";
        const rows = await conn.query(sql, [id_address]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncDeleteAddWork(id) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = "update laundry_add_work set flagdelete=1 where id=?";
        const rows = await conn.query(sql, [id]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncUpdateAddress(id_address, address, id_branch) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = "update laundry_address_shipment set address=?, id_branch=? where id_address=?";
        const rows = await conn.query(sql, [address, id_branch, id_address]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncUpdateAddWork(id, work_name) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = "update laundry_add_work set name=? where id=?";
        const rows = await conn.query(sql, [work_name, id]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}


async function asyncUpdateBranchName(id, branch_name) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = "update tbranch set name=? where id=?";
        const rows = await conn.query(sql, [branch_name, id]);
        return JSON.stringify(true);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncDeleteUserBranch(id_user, id_branch) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = "delete from tuserbranch where id_user = ? and id_branch = ?";
        const rows = await conn.query(sql, [id_user, id_branch]);
        return JSON.stringify(true);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncDeleteUser(id_user) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = "update tuser set bitdelete=1 where id = ? and id<>1";
        const rows = await conn.query(sql, [id_user]);
        return JSON.stringify(true);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncUpdatePositionDelete(id) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = "update tposition set flagdelete=1 where id=?";
        const rows = await conn.query(sql, [id]);
        return JSON.stringify(true);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}


async function asyncUpdateBranchDelete(id) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = "update tbranch set bitdelete=1 where id=?";
        const rows = await conn.query(sql, [id]);
        return JSON.stringify(true);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}


async function asyncUpdateBranchAddworkPrice(id_branch, mas_res) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sSQL = "call ins_br_addwork_price (?, ?, ?, ?)";

        for (key of mas_res) {
            const rows = await conn.query(sSQL,
                [id_branch,  key.id_addwork,
                    key.price, key.check_addwork]);
        };

        return JSON.stringify(true);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncUpdateBranchPositionPrice(id_branch, mas_res) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sSQL = "call ins_br_pos_price (?, ?, ?, ?)";

        for (key of mas_res) {
            const rows = await conn.query(sSQL,
                [id_branch,  key.id_position,
                    key.price, key.check_position]);
        };

        return JSON.stringify(true);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncUpdateUserNick(id_user, nick) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = " update tuser set nick=? where id=?";
        const rows = await conn.query(sql, [nick, id_user]);
        return JSON.stringify(true);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncUpdateLinkUser(id_user, mas_res) {
    let conn;
    try {

        conn = await pool.getConnection();
        let sSQL = "CALL update_link_user(?, ?, ?, ?, ?, ?)";

        for (key of mas_res) {
            const rows = await conn.query(sSQL,
                [id_user,  key.id_branch, key.checkBranch, key.checkIP, key.IP, key.id_position]);
        };

        return JSON.stringify(true);

    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}


router.get('/', async function(req, res, next) {

    if (req.query.get_addwork_branch) {
        const result = await asyncSelectAddworkBranch(req.query.id_branch);
        res.send(result);
    }

    if (req.query.get_position_branch) {
        const result = await asyncSelectPositionBranch(req.query.id_branch);
        res.send(result);
    }

    if (req.query.get_position) {
        const result = await asyncGetPosition();
        res.send(result);
    }

    if (req.query.get_unique_nick) {
        const result = await asyncGetUniqueNick(req.query.id_user, req.query.nick);
        res.send(result);
    }

    if (req.query.get_branch_user) {
        const result = await asyncGetBranchUser(req.query.id_user);
        res.send(result);
    }

    if (req.query.get_branch) {
        const result = await asyncGetBranch(req.query.id_city);
        res.send(result);
    }

    if (req.query.get_users) {
        const result = await asyncGetUsers(req.query.id_branch);
        res.send(result);
    }

    if (req.query.get_branch_info) {
        const result = await asyncGetBranchInfo(req.query.get_branch_info);
        res.send(result);
    }

});


router.post('/', async function(req, res) {

    if (req.body.set_branch_position_price) {
        const result = await  asyncUpdateBranchPositionPrice(req.body.id_branch, req.body.mas_res);
        res.send(result);
    }

    if (req.body.set_branch_addwork_price) {
        const result = await  asyncUpdateBranchAddworkPrice(req.body.id_branch, req.body.mas_res);
        res.send(result);
    }


    if (req.body.update_position) {
        const result = await  asyncUpdatePosition(req.body.id, req.body.name);
        res.send(result);
    }


    if (req.body.insert_position) {
        const result = await  asyncInsertPosition(req.body.name, req.body.price, req.body.id_branch);
        res.send(result);
    }

    if (req.body.id_addwork_delete) {
        const result = await  asyncDeleteAddWork(req.body.id_addwork_delete);
        res.send(result);
    }

    if (req.body.id_address_delete) {
        const result = await  asyncDeleteAddress(req.body.id_address_delete);
        res.send(result);
    }


    if (req.body.update_addwork) {
        const result = await  asyncUpdateAddWork(req.body.id, req.body.work_name);
        res.send(result);
    }

    if (req.body.update_address) {
        const result = await  asyncUpdateAddress(req.body.id_address, req.body.address, req.body.id_branch);
        res.send(result);
    }

    if (req.body.user_nick) {
        const result = await  asyncUpdateUserNick(req.body.id_user, req.body.nick);
        res.send(result);
    }

    if (req.body.linkbranchuser) {
        const result = await  asyncUpdateLinkUser(req.body.id_user, req.body.mas_res);
        res.send(result);
    }

    if (req.body.insert_branch) {
        const result = await  asyncNewBranch(req.body.id_city, req.body.insert_branch);
        res.send(result);
    }

    if (req.body.insert_addwork) {
        const result = await  asyncNewAddWork(req.body.name);
        res.send(result);
    }

    if (req.body.insert_address) {
        const result = await  asyncNewAddress(req.body.name, req.body.id_branch);
        res.send(result);
    }


    if (req.body.insert_branch_name) {
        const result = await  asyncUpdateBranchName(req.body.id_update, req.body.insert_branch_name);
        res.send(result);
    }

    if (req.body.id_branch_delete) {
        const result = await  asyncUpdateBranchDelete(req.body.id_branch_delete);
        res.send(result);
    }

    if (req.body.id_position_delete) {
        const result = await  asyncUpdatePositionDelete(req.body.id_position_delete);
        res.send(result);
    }


    if (req.body.userbranch_delete) {
        const result = await  asyncDeleteUserBranch(req.body.id_user, req.body.id_branch);
        res.send(result);
    }

    if (req.body.user_delete) {
        const result = await  asyncDeleteUser(req.body.id_user);
        res.send(result);
    }

});
//const sUrl = this.gr.sUrlGlobal + 'admin';
//const data_branch = { 'insert_branch': newName};
//return this.http.post(sUrl, data_branch);


module.exports = router;
