var express = require('express');
var router = express.Router();
var pool=require('../connections/dbconnection');


async function asyncCurrentMessage(id_message) {
    const sSQL = "select * from message where id=?";
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sSQL, [id_message]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncSelectCheckPositionBranch(id_branch) {
    let conn;
    try {
        conn = await pool.getConnection();

        let sql =
            " select p.id, p.name from tposition p, tpositionbranch tpb where tpb.id_position=p.id and " +
            " ifnull(tpb.flagdelete,0)=0 and ifnull(p.flagdelete,0)=0 and " +
            " tpb.id_branch = ? order by p.id asc ";


        const rows = await conn.query(sql, [id_branch]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncMessageImageList(id_message) {
    const sSQL = "select * from message_image where id_message = ? order by name asc";

    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sSQL, [id_message]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncMessage(id_message) {
    const sSQL =
        " select m.id, m.date_from, m.id_position_to,  m.id_branch, m.situation, m.data_situation,  m.data_solution, m.summa, "+
        " b.name as branch_name, p.name as position_name, ifnull(m.result_response, 0) as result_response, m.comment_response "+
        " from message m "+
        " left join tposition p on p.id=m.id_position_to "+
        " left join tbranch b on b.id = m.id_branch "+
        " where m.id = ? ";

    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sSQL, [id_message]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncPositionUser(id_user, id_branch) {
    const sSQL = "select id_position from tuserbranch tub where id_user = ? and id_branch = ?";
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


async function asyncLastMessage(id_user, id_branch) {
    const sSQL =
    " select m.id, m.date_from, m.id_position_to,  m.id_branch, m.situation, m.data_situation, m.data_solution, m.summa, "+
    " b.name as branch_name, p.name as position_name "+
    " from message m "+
    " left join tposition p on p.id=m.id_position_to "+
    " left join tbranch b on b.id = m.id_branch "+
    " where m.id in (select max(id) from message where id_user_from = ? and id_branch = ? ) ";

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


async function asyncSelectUnreadCount(id_user, id_branch, date_begin, date_end) {
    const sSQL = "call select_unread_count (?,?,?,?)";
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

async function asyncInstructionList(id_user, id_branch, id_position) {
    const sSQL = "call select_instruction (?,?,?)";
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sSQL, [id_user, id_branch, id_position]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncMessageList(id_user, id_branch, id_position, date_begin, date_end) {

    const sSQL = "call select_message (?,?,?,?,?)"
/*
    " select d.id, d.id_position, p.name as position_name, d.date_from, d.little_situation, d.summa, d.InputOutput from ( "+
    " SELECT id, id_position_to as id_position,  date_from, SUBSTRING(situation, 1, 50)  as  little_situation, summa, 0 as InputOutput "+
    " FROM message WHERE id_position_from = ? and  id_branch= ? "+
    " union all "+
    " SELECT id, id_position_from as id_position, date_from, SUBSTRING(situation, 1, 50)  as little_situation, summa, 1 as InputOutput "+
    " FROM message WHERE id_position_to = ?  and id_branch= ? "+
    ") d, tposition p where p.id = d.id_position and Date(d.date_from) >= Date(?) and Date(d.date_from) <= Date(?) ";
 */
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sSQL, [id_user, id_branch, id_position, date_begin, date_end]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

router.get('/', async function(req, res, next) {


    // select_unread_count
    if (req.query.get_unread_count) {
        const result = await asyncSelectUnreadCount(req.query.id_user, req.query.id_branch, req.query.date_begin, req.query.date_end);
        res.send(result);
    }

    if (req.query.get_instruction_list) {
        const result = await asyncInstructionList(req.query.id_user, req.query.id_branch, req.query.id_position);
        res.send(result);
    }

     if (req.query.get_message_list) {
            const result = await asyncMessageList(req.query.id_user, req.query.id_branch,req.query.id_position,
                                                  req.query.date_begin, req.query.date_end );
            res.send(result);
     }

    if (req.query.get_position_user) {
        const result = await asyncPositionUser(req.query.id_user, req.query.id_branch);
        res.send(result);
    }

    if (req.query.message_image_list) {
        const result = await asyncMessageImageList(req.query.id_message);
        res.send(result);
    }

    if (req.query.get_message) {
        const result = await asyncMessage(req.query.id_message);
        res.send(result);
    }

    if (req.query.get_last_message) {
        const result = await asyncLastMessage(req.query.id_user, req.query.id_branch);
        res.send(result);
    }

    if (req.query.get_checkposition_branch) {
        const result = await asyncSelectCheckPositionBranch(req.query.id_branch);
        res.send(result);
    }

    if (req.query.current_message) {
        const result = await asyncCurrentMessage(req.query.id_message);
        res.send(result);
    }


});

async function asyncReadMessage(id_message, id_user) {
    const sSQL = " insert message_read (id_message, id_user) values (?, ?) ";
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sSQL, [id_message, id_user]);
        return JSON.stringify(rows);
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}

async function asyncUpdateMessage(id_message, id_user, summa, comment_response, int_resp) {
    const sSQL = " update message set id_user_response=?, summa=?, comment_response=?, result_response=?, " +
                 " bit_response=1, date_response= now() "+
                 " where id = ? ";

    let conn;
    try {

        comment_response = comment_response.replace(/[']/g, "\'");

        conn = await pool.getConnection();
        const rows = await conn.query(sSQL, [id_user, summa, comment_response, int_resp, id_message]);


        // удаляем из прочитанного всех кроме отправителя, который прочел изначально т.к. отправитель
        if (rows) {
            const deleteRow = await conn.query('delete from message_read where id_message = ? and id_user <> ?', [id_message, id_user]);
            return JSON.stringify(deleteRow);
        }

    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}


async function asyncNewMessage(id_user_from, id_position_from, id_position_to, id_branch, situation, data_situation, data_solution, summa, int_instruction) {
    const sSQL = "insert message (id_user_from, id_position_from, id_position_to, id_branch, situation, " +
                                 " data_situation, data_solution, summa, " +
                                  " result_response, date_from) " +
                 " values (?,?,?,?,?,?,?,?,?, now())";

    let int_response = 0;
    if (int_instruction === 1) {
        int_response = 3;
    }

    let conn;
    try {

        situation = situation.replace(/[']/g, "\'");
        data_situation = data_situation.replace(/[']/g, "\'");

        conn = await pool.getConnection();
        const rows = await conn.query(sSQL, [id_user_from, id_position_from, id_position_to, id_branch, situation, data_situation, data_solution, summa, int_response]);

                       // вставляем отправителя в прочитавшие письмо
                       if (rows.insertId) {
                           const insertRow = await conn.query('insert message_read (id_message, id_user) value (?, ?)', [rows.insertId, id_user_from]);
                           // из функции возвращаем инсерт-ид от ГЛАВНОГО запроса
                           return JSON.stringify(rows);
                       }
    } catch (err) {
        throw err;
    } finally {
        if (conn) conn.release(); //release to pool
    }
}


router.post('/', async function(req, res) {

    if (req.body.insert_new_message) {
        const result = await asyncNewMessage(req.body.id_user_from,
                                             req.body.id_position_from,
                                             req.body.id_position_to,
                                             req.body.id_branch,
                                             req.body.situation,
                                             req.body.data_situation,
                                             req.body.data_solution,
                                             req.body.summa,
                                             req.body.int_instruction);

        res.send(result);
    }


    if (req.body.read_message) {
        const result = await asyncReadMessage(req.body.id_message, req.body.id_user);
        res.send(result);
    }




    if (req.body.update_message) {
        const result = await asyncUpdateMessage(
            req.body.id_message,
            req.body.id_user,
            req.body.summa,
            req.body.comment_response,
            req.body.int_resp);

        res.send(result);
    }



});

module.exports = router;
