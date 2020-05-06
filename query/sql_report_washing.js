/*
в стирке = в стирке - приход на склад
 */

const sqlReportWashing =
" select s.id_nom, v.name, v.`type`, sum(summa) as summa, sum(massa) as massa from ( "
"    select d.id_nom, sum(d.quant) as summa, sum(wl.massa) as massa "
" from washing_laundry wl, washing_laundry_detail d "
" where wl.id_address= ? and d.id_washing = wl.id group by d.id_nom "
" union all "
" select d2.id_nom, -1*sum(d2.quant) as SUMMA, -1*sum(w2.massa) as MASSA "
" from warehouse_laundry w2, warehouse_laundry_detail d2 "
" where ifnull(d2.bitadd,0)=1 and w2.id_address = ? and w2.id = d2.id_warehouse  group by d2.id_nom) as s, "
"    v_laundry_nomenclature v where v.id_nom=s.id_nom"
" group by s.id_nom"


module.exports=sqlReportWashing;
