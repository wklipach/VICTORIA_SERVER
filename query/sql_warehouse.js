/*
    --ВАЛИДАЦИЯ РАЗРЕШЕННОГО К ПРИЕМКЕ НА СКЛАД ПО ФИЛИАЛУ СУММАРНО ПО ВСЕ ПОЛЬЗОВАТЕЛЯМ
    -- ЛОГИКА:
    -->  все постиранное ранее - отправленное в склад ранее как приход
*/

const sqlWarehouse =
    '    SELECT id_nom, SUM(quant) as quant '+
    ' FROM ( '+
    ' '+
    ' SELECT id_nom, SUM(quant) as quant FROM washing_laundry_detail '+
    ' WHERE id_washing IN (SELECT id FROM washing_laundry WHERE id_address=? and id_shift IN  (SELECT id '+
    ' FROM shift WHERE id_branch=?)) GROUP BY id_nom '+
    ' '+
    ' union all '+
    ' '+
    ' SELECT id_nom, -1* SUM(quant) as quant FROM warehouse_laundry_detail '+
    ' WHERE ifnull(bitadd,0)=1 and id_warehouse IN (SELECT id FROM warehouse_laundry WHERE id_address=? and id_shift IN  (SELECT id '+
    ' FROM shift WHERE id_branch=?)) GROUP BY id_nom '+
    ' '+
    ' ) AS T '+
    ' GROUP BY id_nom ';

module.exports=sqlWarehouse;
