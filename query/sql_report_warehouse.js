/*
--склад = принятое из стирки- отданное в отгрузку
*/
const sqlReportWarehouse =
" select id_nom, name, type, summa, massa from ( "+
"    select v.id_nom, v.name, v.type, z.summa, z.massa "+
" from v_laundry_nomenclature v "+
" left join ( "+
"    select id_nom, summa, massa from ( "+
"    SELECT id_nom, SUM(summa) AS summa, SUM(massa) AS massa "+
" FROM ( "+
"    SELECT d.id_nom, SUM(d.quant) AS summa, SUM(rl.massa) AS massa "+
" FROM warehouse_laundry rl, warehouse_laundry_detail d "+
" WHERE rl.id_address=? AND d.id_warehouse = rl.id AND IFNULL(bitadd,0)=1 "+
" GROUP BY id_nom UNION ALL "+
" SELECT d2.id_nom, -1* SUM(d2.quant), SUM(rl2.massa) "+
" FROM warehouse_laundry rl2, warehouse_laundry_detail d2 "+
" WHERE rl2.id_address=? AND d2.id_warehouse = rl2.id AND IFNULL(d2.bitadd,0)=0 "+
" GROUP BY d2.id_nom) y "+
" GROUP BY y.id_nom) x) as z on z.id_nom=v.id_nom) H where ifnull(summa,0)>0 ";

module.exports=sqlReportWarehouse;
