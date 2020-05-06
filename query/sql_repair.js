/*
--подсчет к починке. Логика = пришло на склад непочиненного минус то что уже починено
--1 шаг на складе пришло как непочиненное
SELECT id_nom, sum(quant) FROM acceptance_laundry_detail WHERE id_accept IN
(SELECT id FROM acceptance_laundry WHERE id_shift IN
(SELECT id FROM shift WHERE id_branch=1))
AND bitspoiled=1 GROUP BY id_nom
--подсчет к починке. Логика = пришло на склад непочиненного минус то что уже починено
--2 шаг пришло как починенное
SELECT id_nom, sum(quant) FROM repair_laundry_detail WHERE id_repair IN
(SELECT id FROM repair_laundry WHERE id_shift IN
(SELECT id FROM shift WHERE id_branch=1))
GROUP BY id_nom

--3 шаг вычитаем из одного другое
 */

const sqlRepair =
' SELECT id_nom, SUM(quant) as quant '+
' FROM ( '+
' '+
'    SELECT id_nom, SUM(quant) AS quant '+
' FROM acceptance_laundry_detail WHERE id_accept IN (SELECT id FROM acceptance_laundry '+
' WHERE id_address=? and id_shift IN (SELECT id FROM shift WHERE id_branch=?)) AND bitspoiled=1 '+
' GROUP BY id_nom '+
' '+
' UNION ALL '+
' '+
' SELECT id_nom, -1* SUM(quant) FROM repair_laundry_detail '+
' WHERE id_repair IN (SELECT id FROM repair_laundry WHERE id_address=? and id_shift IN  (SELECT id '+
' FROM shift WHERE id_branch=?)) GROUP BY id_nom '+
' '+
' ) AS T '+
' GROUP BY id_nom ';

module.exports=sqlRepair;
