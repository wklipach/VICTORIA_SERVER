/*
--доступно для ремонта = принятое поврежденным в приемку - то что в ремонте
*/

const sqlReportRepair =
" select f.id_nom, v.name, v.`type`, sum(summa) as summa, sum(massa) as massa   from ( "+
"    select d.id_nom, sum(d.quant) as summa, sum(al.massa) as massa "+
" from acceptance_laundry al, acceptance_laundry_detail d "+
" where al.id_address=? and d.id_accept = al.id and ifnull(d.bitspoiled,0)=1 "+
" group by id_nom "+
" union all "+
" select rd.id_nom, -1*sum(rd.quant), -1*sum(rl.massa) "+
" from repair_laundry rl, repair_laundry_detail rd "+
" where rl.id_address = ? and rl.id = rd.id_repair "+
" group by rd.id_nom) f, v_laundry_nomenclature v  where v.id_nom=f.id_nom "+
" group by f.id_nom ";

module.exports=sqlReportRepair;
