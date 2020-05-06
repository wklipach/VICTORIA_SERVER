/*
---в приемке  ЦЕЛОЕ = ПРИЕМКА - В СТИРКУ
---           ПОВРЕЖДЕННОЕ = ПОВРЕЖДЕННОЕ - РЕМОНТ

--первый left join целое
--второй left join поврежденное
*/

const sqlReportAcceptance =
"    select v.id_nom, v.name, v.type, Res1.summa, Res1.massa, Res2.summa_spoiled, Res2.massa_spoiled from v_laundry_nomenclature v "+
" "+
"    left join ( "+
"    select id_nom, sum(summa) as summa, sum(massa) as massa from ( "+
"    select d.id_nom, sum(d.quant) as summa, sum(al.massa) as massa "+
" from acceptance_laundry al, "+
"    acceptance_laundry_detail d "+
" where al.id_address= ? and d.id_accept = al.id and ifnull(d.bitspoiled,0)=0 "+
" group by id_nom "+
" union all "+
" select wd.id_nom, -1*sum(wd.quant) as SUMMA, -1*sum(wl.massa) as MASSA "+
" from washing_laundry wl, "+
"    washing_laundry_detail wd "+
" where wl.id_address = ? and wl.id = wd.id_washing "+
" group by wd.id_nom) T "+
" group by id_nom) Res1  on Res1.id_nom=v.id_nom "+
" "+
"    left join ( "+
"    select id_nom, sum(summa) as summa_spoiled, sum(massa) as massa_spoiled from ( "+
"    select d.id_nom, sum(d.quant) as summa, sum(al.massa) as massa "+
" from acceptance_laundry al, "+
"    acceptance_laundry_detail d "+
" where al.id_address= ? and d.id_accept = al.id and ifnull(d.bitspoiled,0)=1 "+
" group by id_nom "+
" union all "+
" select rd.id_nom, -1*sum(rd.quant) as SUMMA, -1*sum(rl.massa) as MASSA "+
" from repair_laundry rl, "+
"    repair_laundry_detail rd "+
" where rl.id_address = ? and rl.id = rd.id_repair "+
" group by rd.id_nom) as P "+
" group by id_nom) Res2 on Res2.id_nom=v.id_nom "+
" "+
"    where Res1.summa+Res2.summa_spoiled>0 ";

module.exports=sqlReportAcceptance;
