function create_nomenclature(id_user) {
return sView =  ' CREATE OR REPLACE VIEW view_nomenclature_'+id_user+' AS '+
                ' SELECT LN.id_nom, lb.name, lt.`type`, lb.id_lbn, lt.id_ltp  FROM laundry_nomenclature LN '+
                ' left join laundry_basenom lb ON lb.id_lbn = LN.id_lbn ' +
                ' left join laundry_typenl lt ON lt.id_ltp = LN.id_ltp where ifnull(LN.bitdelete,0)=0';
}

module.exports=create_nomenclature;
