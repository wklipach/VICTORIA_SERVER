/*
    --ВАЛИДАЦИЯ РАЗРЕШЕННОГО К СТИРКЕ ПО ФИЛИАЛУ СУММАРНО ПО ВСЕ ПОЛЬЗОВАТЕЛЯМ
    -- ЛОГИКА:
    -->  принятое целым ранее + починенное ранее - отправленное в стирку ранее
*/

const sqlWashing =
    '    SELECT id_nom, SUM(quant) as quant '+
    ' FROM ( '+
    ' '+
    '    SELECT id_nom, SUM(quant) AS quant '+
    ' FROM acceptance_laundry_detail WHERE id_accept IN (SELECT id FROM acceptance_laundry '+
    ' WHERE id_address=? and id_shift IN (SELECT id FROM shift WHERE id_branch=?)) '+
    ' AND ifnull(bitspoiled,0)=0 GROUP BY id_nom '+
    ' '+
    ' union all '+
    ' '+
    ' SELECT id_nom, SUM(quant) AS quant FROM repair_laundry_detail '+
    ' WHERE id_repair IN (SELECT id FROM repair_laundry WHERE id_address=? and id_shift IN  (SELECT id '+
    ' FROM shift WHERE id_branch=?)) GROUP BY id_nom '+
    ' '+
    ' union all '+
    ' '+
    ' SELECT id_nom, -1* SUM(quant) AS quant FROM washing_laundry_detail '+
    ' WHERE id_washing IN (SELECT id FROM washing_laundry WHERE id_address=? and id_shift IN  (SELECT id '+
    ' FROM shift WHERE id_branch=?)) GROUP BY id_nom '+
    ' '+
    ' ) AS T '+
    ' GROUP BY id_nom ';

module.exports=sqlWashing;
