-- --------------------------------------------------------
-- Хост:                         127.0.0.1
-- Версия сервера:               10.4.12-MariaDB - mariadb.org binary distribution
-- Операционная система:         Win64
-- HeidiSQL Версия:              10.2.0.5599
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Дамп структуры базы данных victoria
DROP DATABASE IF EXISTS `victoria`;
CREATE DATABASE IF NOT EXISTS `victoria` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `victoria`;

-- Дамп структуры для таблица victoria.acceptance_laundry
DROP TABLE IF EXISTS `acceptance_laundry`;
CREATE TABLE IF NOT EXISTS `acceptance_laundry` (
  `id` int(11) NOT NULL,
  `id_shift` int(11) NOT NULL,
  `massa` int(11) NOT NULL,
  `date_oper` datetime NOT NULL,
  `id_address` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Дамп данных таблицы victoria.acceptance_laundry: ~1 rows (приблизительно)
/*!40000 ALTER TABLE `acceptance_laundry` DISABLE KEYS */;
INSERT INTO `acceptance_laundry` (`id`, `id_shift`, `massa`, `date_oper`, `id_address`) VALUES
	(1, 34, 33, '2020-05-15 17:51:09', 1);
/*!40000 ALTER TABLE `acceptance_laundry` ENABLE KEYS */;

-- Дамп структуры для таблица victoria.acceptance_laundry_detail
DROP TABLE IF EXISTS `acceptance_laundry_detail`;
CREATE TABLE IF NOT EXISTS `acceptance_laundry_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_accept` int(11) NOT NULL,
  `id_nom` int(11) NOT NULL,
  `quant` int(11) NOT NULL,
  `bitspoiled` bit(1) NOT NULL DEFAULT b'0',
  KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Дамп данных таблицы victoria.acceptance_laundry_detail: ~2 rows (приблизительно)
/*!40000 ALTER TABLE `acceptance_laundry_detail` DISABLE KEYS */;
INSERT INTO `acceptance_laundry_detail` (`id`, `id_accept`, `id_nom`, `quant`, `bitspoiled`) VALUES
	(3, 1, 1, 4, b'1'),
	(4, 1, 2, 4, b'1');
/*!40000 ALTER TABLE `acceptance_laundry_detail` ENABLE KEYS */;

-- Дамп структуры для таблица victoria.addwork_laundry
DROP TABLE IF EXISTS `addwork_laundry`;
CREATE TABLE IF NOT EXISTS `addwork_laundry` (
  `id` int(11) NOT NULL,
  `id_shift` int(11) NOT NULL,
  `date_oper` datetime NOT NULL,
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Дамп данных таблицы victoria.addwork_laundry: ~0 rows (приблизительно)
/*!40000 ALTER TABLE `addwork_laundry` DISABLE KEYS */;
/*!40000 ALTER TABLE `addwork_laundry` ENABLE KEYS */;

-- Дамп структуры для таблица victoria.addwork_laundry_detail
DROP TABLE IF EXISTS `addwork_laundry_detail`;
CREATE TABLE IF NOT EXISTS `addwork_laundry_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_addwork_laundry` int(11) NOT NULL,
  `id_addwork` int(11) NOT NULL,
  `quant` int(11) NOT NULL,
  KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Дамп данных таблицы victoria.addwork_laundry_detail: ~0 rows (приблизительно)
/*!40000 ALTER TABLE `addwork_laundry_detail` DISABLE KEYS */;
/*!40000 ALTER TABLE `addwork_laundry_detail` ENABLE KEYS */;

-- Дамп структуры для процедура victoria.bottom_acceptance
DROP PROCEDURE IF EXISTS `bottom_acceptance`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `bottom_acceptance`(
	IN `var_id_address` INT,
	IN `var_id_branch` INT


)
BEGIN

    select v.id_nom, v.name, v.type, Res1.summa, Res1.massa, Res2.summa_spoiled, Res2.massa_spoiled from v_laundry_nomenclature v 
    left join ( 
    select id_nom, sum(summa) as summa, sum(massa) as massa from ( 
    select d.id_nom, sum(d.quant) as summa, sum(al.massa) as massa 
 from acceptance_laundry al, acceptance_laundry_detail d, shift s 
 where al.id_address= var_id_address and d.id_accept = al.id and ifnull(d.bitspoiled,0)=0 
       and s.id=al.id_shift and s.id_branch = var_id_branch
 group by id_nom 
 union all 
 select wd.id_nom, -1*sum(wd.quant) as SUMMA, -1*sum(wl.massa) as MASSA 
 from washing_laundry wl, washing_laundry_detail wd, shift s  
 where wl.id_address = var_id_address and wl.id = wd.id_washing 
          and s.id=wl.id_shift and s.id_branch = var_id_branch
 group by wd.id_nom) T 
 group by id_nom) Res1  on Res1.id_nom=v.id_nom 

    left join ( 
    select id_nom, sum(summa) as summa_spoiled, sum(massa) as massa_spoiled from ( 
    select d.id_nom, sum(d.quant) as summa, sum(al.massa) as massa 
 from acceptance_laundry al, acceptance_laundry_detail d, shift s 
 where al.id_address= var_id_address and d.id_accept = al.id and ifnull(d.bitspoiled,0)=1 
           and s.id=al.id_shift and s.id_branch = var_id_branch
 group by id_nom 
 union all
 select rd.id_nom, -1*sum(rd.quant) as SUMMA, -1*sum(rl.massa) as MASSA 
 from repair_laundry rl,  repair_laundry_detail rd, shift s 
 where rl.id_address = var_id_address and rl.id = rd.id_repair
            and s.id=rl.id_shift and s.id_branch = var_id_branch
 group by rd.id_nom) as P 
 group by id_nom) Res2 on Res2.id_nom=v.id_nom
  
 where ifnull(Res1.summa,0)>0 or  ifnull(Res2.summa_spoiled,0)>0;

END//
DELIMITER ;

-- Дамп структуры для процедура victoria.bottom_repair
DROP PROCEDURE IF EXISTS `bottom_repair`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `bottom_repair`(
	IN `var_id_address` INT,
	IN `var_id_branch` INT
)
BEGIN
 select f.id_nom, v.name, v.`type`, sum(summa) as summa, sum(massa) as massa   from ( 
    select d.id_nom, sum(d.quant) as summa, sum(al.massa) as massa 
 from acceptance_laundry al, acceptance_laundry_detail d, shift s 
 where al.id_address= var_id_address and d.id_accept = al.id and ifnull(d.bitspoiled,0)=1 
 and s.id=al.id_shift and s.id_branch=var_id_branch
 group by id_nom 
 union all 
 select rd.id_nom, -1*sum(rd.quant), -1*sum(rl.massa) 
 from repair_laundry rl, repair_laundry_detail rd, shift s 
 where rl.id_address = var_id_address and rl.id = rd.id_repair and rl.id_shift=s.id and s.id_branch = var_id_branch
 group by rd.id_nom) f, v_laundry_nomenclature v  where v.id_nom=f.id_nom 
 group by f.id_nom; 
 END//
DELIMITER ;

-- Дамп структуры для процедура victoria.bottom_shipment
DROP PROCEDURE IF EXISTS `bottom_shipment`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `bottom_shipment`(
	IN `var_id_address` INT,
	IN `var_id_branch` INT
)
BEGIN
     SELECT t.id_nom, SUM(quant) as summa, v.name, v.type, sum(massa) as massa 
     FROM ( 
     
	  SELECT id_nom, SUM(wld1.quant) as quant, sum(w1.massa) as massa 
	  FROM warehouse_laundry_detail wld1, warehouse_laundry w1, shift s
     WHERE ifnull(wld1.bitadd,0)=1 and wld1.id_warehouse = w1.id and w1.id_address = var_id_address
     and w1.id_shift = s.id and s.id_branch = var_id_branch
	  GROUP BY wld1.id_nom 
     union all 
	  SELECT id_nom, -1*SUM(wld2.quant) as quant, -1*sum(w2.massa) as massa 
	  FROM warehouse_laundry_detail wld2, warehouse_laundry w2, shift s
     WHERE ifnull(wld2.bitadd,0)=0 and wld2.id_warehouse = w2.id and w2.id_address= var_id_address
     and w2.id_shift = s.id and s.id_branch = var_id_branch
	  GROUP BY wld2.id_nom 
    
    
     ) AS t,  v_laundry_nomenclature v where v.id_nom=t.id_nom
     GROUP BY t.id_nom; 
END//
DELIMITER ;

-- Дамп структуры для процедура victoria.bottom_warehouse
DROP PROCEDURE IF EXISTS `bottom_warehouse`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `bottom_warehouse`(
	IN `var_id_address` INT,
	IN `var_id_branch` INT

)
BEGIN
 select id_nom, name, type, summa, massa from ( 
    select v.id_nom, v.name, v.type, z.summa, z.massa 
 from v_laundry_nomenclature v 
 left join ( 
    select id_nom, summa, massa from ( 
    SELECT id_nom, SUM(summa) AS summa, SUM(massa) AS massa 
 FROM ( 
    SELECT d.id_nom, SUM(d.quant) AS summa, SUM(rl.massa) AS massa 
 FROM warehouse_laundry rl, warehouse_laundry_detail d, shift s 
 WHERE rl.id_address=var_id_address AND d.id_warehouse = rl.id AND IFNULL(bitadd,0)=1 
 and s.id=rl.id_shift and s.id_branch = var_id_branch
 GROUP BY id_nom UNION ALL 
 SELECT d2.id_nom, -1* SUM(d2.quant), SUM(rl2.massa) 
 FROM warehouse_laundry rl2, warehouse_laundry_detail d2, shift s2 
 WHERE rl2.id_address=var_id_address AND d2.id_warehouse = rl2.id AND IFNULL(d2.bitadd,0)=0 
 and s2.id=rl2.id_shift and s2.id_branch = var_id_branch
 GROUP BY d2.id_nom) y 
 GROUP BY y.id_nom) x) as z on z.id_nom=v.id_nom) H where ifnull(summa,0)>0;
END//
DELIMITER ;

-- Дамп структуры для процедура victoria.bottom_washing
DROP PROCEDURE IF EXISTS `bottom_washing`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `bottom_washing`(
	IN `var_id_address` INT,
	IN `var_id_branch` INT
)
BEGIN

 select s.id_nom, v.name, v.`type`, sum(summa) as summa, sum(massa) as massa from ( 
    select d.id_nom, sum(d.quant) as summa, sum(wl.massa) as massa 
 from washing_laundry wl, washing_laundry_detail d, shift s  
 where wl.id_address = var_id_address and d.id_washing = wl.id and
               wl.id_shift=s.id and s.id_branch = var_id_branch
 group by d.id_nom 
 union all 
 select d2.id_nom, -1*sum(d2.quant) as SUMMA, -1*sum(w2.massa) as MASSA 
 from warehouse_laundry w2, warehouse_laundry_detail d2, shift s  
 where ifnull(d2.bitadd,0)=1 and w2.id_address = var_id_address and w2.id = d2.id_warehouse and 
              w2.id_shift=s.id and s.id_branch = var_id_branch
 group by d2.id_nom) as s, 
    v_laundry_nomenclature v where v.id_nom=s.id_nom
 group by s.id_nom;

END//
DELIMITER ;

-- Дамп структуры для процедура victoria.end_shift
DROP PROCEDURE IF EXISTS `end_shift`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `end_shift`(
	IN `var_id_user` INT,
	IN `var_id_branch` INT
)
BEGIN
 
update shift set  date_end = now() where id_user = var_id_user and  id_branch = var_id_branch 
and ifnull(date_end, STR_TO_DATE('31.12.1970', '%d.%m.%Y')) < date_begin;
 
select 1 as Res; 
 
 
END//
DELIMITER ;

-- Дамп структуры для процедура victoria.get_user_login
DROP PROCEDURE IF EXISTS `get_user_login`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_user_login`(
	IN `@name` TINYTEXT


)
BEGIN
 
SELECT u.*, count(tub.id_user) as CountBranch 
FROM tuser u left join tuserbranch tub on tub.id_user = u.id
where ifnull(u.bitdelete,0)=0 and (u.nick=`@name` or u.email=`@name`);

END//
DELIMITER ;

-- Дамп структуры для процедура victoria.insert_acceptance_laundry
DROP PROCEDURE IF EXISTS `insert_acceptance_laundry`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_acceptance_laundry`(
	IN `var_id_shift` INT,
	IN `var_id_address` INT,
	IN `var_summa` INT,
	IN `date_begin_int` BIGINT

)
BEGIN

DECLARE id_record INT DEFAULT 0;  
DECLARE date_begin datetime;

SELECT ifnull(MAX(id),0)+1 INTO id_record FROM acceptance_laundry;

select FROM_UNIXTIME(0) + INTERVAL date_begin_int/1000 SECOND INTO date_begin;
 
insert acceptance_laundry (id, id_shift, id_address, massa, date_oper) 
values(id_record, var_id_shift, var_id_address, var_summa, date_begin);
 
SELECT * from acceptance_laundry where id=id_record;
END//
DELIMITER ;

-- Дамп структуры для процедура victoria.insert_address
DROP PROCEDURE IF EXISTS `insert_address`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_address`(
	IN `var_name` TINYTEXT,
	IN `var_branch` integer



)
BEGIN

DECLARE id_record INT DEFAULT 0;  

SELECT ifnull(MAX(id_address),0)+1 INTO id_record FROM laundry_address_shipment;


insert laundry_address_shipment (id_address, address, id_branch) values(id_record, var_name, var_branch);
 
SELECT * from laundry_address_shipment where id_address=id_record;
END//
DELIMITER ;

-- Дамп структуры для процедура victoria.insert_addwork
DROP PROCEDURE IF EXISTS `insert_addwork`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_addwork`(
	IN `var_name` TINYTEXT
)
BEGIN

DECLARE id_record INT DEFAULT 0;  

SELECT ifnull(MAX(id),0)+1 INTO id_record FROM laundry_add_work;

 
insert laundry_add_work (id, name) values(id_record, var_name);
 
SELECT * from laundry_add_work where id=id_record;
END//
DELIMITER ;

-- Дамп структуры для процедура victoria.insert_addwork_laundry
DROP PROCEDURE IF EXISTS `insert_addwork_laundry`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_addwork_laundry`(
	IN `var_id_shift` INT,
	IN `date_begin_int` BIGINT


)
BEGIN

DECLARE id_record INT DEFAULT 0;  
DECLARE date_begin datetime;

SELECT ifnull(MAX(id),0)+1 INTO id_record FROM addwork_laundry;

select FROM_UNIXTIME(0) + INTERVAL date_begin_int/1000 SECOND INTO date_begin;
 
insert addwork_laundry (id, id_shift, date_oper) values(id_record, var_id_shift, date_begin);
 
SELECT * from addwork_laundry where id=id_record;
END//
DELIMITER ;

-- Дамп структуры для процедура victoria.insert_a_l_d
DROP PROCEDURE IF EXISTS `insert_a_l_d`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_a_l_d`(
	IN `var_id_accept` INT,
	IN `var_id_nom` INT,
	IN `var_quant` INT,
	IN `var_bitspoiled` BIT

)
BEGIN

DECLARE id_record INT DEFAULT 0;  

SELECT ifnull(MAX(id),0)+1 INTO id_record FROM acceptance_laundry_detail;

 
insert acceptance_laundry_detail (id, id_accept, id_nom, quant, bitspoiled) 
values(id_record, var_id_accept, var_id_nom, var_quant, var_bitspoiled);
 
SELECT * from acceptance_laundry_detail where id=id_record;
END//
DELIMITER ;

-- Дамп структуры для процедура victoria.insert_branch
DROP PROCEDURE IF EXISTS `insert_branch`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_branch`(
	IN `id_city` INT,
	IN `branch_name` TINYTEXT

)
BEGIN

DECLARE id_record INT DEFAULT 0;  

SELECT ifnull(MAX(id),0)+1 INTO id_record FROM tbranch;

 
insert tbranch (id, id_city, name, bitdelete) values(id_record, id_city, branch_name, 0);
 
SELECT * from tbranch where id=id_record;
END//
DELIMITER ;

-- Дамп структуры для процедура victoria.insert_pay
DROP PROCEDURE IF EXISTS `insert_pay`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_pay`(
	IN `var_id_user` INT,
	IN `var_id_branch` INT,
	IN `var_payhour` INT,
	IN `var_hour` INT,
	IN `var_koeff` DECIMAL(10,1),
	IN `var_addwork` INT,
	IN `var_dd` INT,
	IN `var_mm` INT,
	IN `var_yyyy` INT







)
BEGIN

declare t_rec int default(0);


set t_rec=(select count(id) as KOL from payment_laundry where id_user=var_id_user and 
												id_branch=var_id_branch and 
												pay_dd=var_dd and 
												pay_mm=var_mm and 
												pay_year=var_yyyy); 


if t_rec = 0 
then
insert payment_laundry (id_user, id_branch, hour, pay, addwork, pay_year, pay_mm, pay_dd, koeff, pay_date)
values (var_id_user, var_id_branch, var_hour, var_payhour, var_addwork, var_yyyy, var_mm, var_dd, var_koeff, 
        STR_TO_DATE(CONCAT(var_mm,'/', var_dd,'/',var_yyyy), '%m/%d/%Y'));

elseif t_rec > 0
then

update payment_laundry set pay=var_payhour, hour=var_hour, koeff=var_koeff, addwork=var_addwork,
pay_date=STR_TO_DATE(CONCAT(var_mm,'/', var_dd,'/',var_yyyy), '%m/%d/%Y')
where id_user=var_id_user and id_branch=var_id_branch and pay_dd=var_dd and pay_mm=var_mm and pay_year=var_yyyy;

end if;

/*
var_id_user
var_id_branch
var_payhour
var_hour
var_koeff
var_addwork
var_dd
var_mm
var_yyyy

*/


END//
DELIMITER ;

-- Дамп структуры для процедура victoria.insert_position
DROP PROCEDURE IF EXISTS `insert_position`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_position`(
	IN `var_name` varchar(250)
)
BEGIN

DECLARE id_record INT DEFAULT 0;  

SELECT ifnull(MAX(id),0)+1 INTO id_record FROM tposition;


insert tposition (id, name) values(id_record, var_name);
 
SELECT * from tposition where id=id_record;
END//
DELIMITER ;

-- Дамп структуры для процедура victoria.insert_repair_laundry
DROP PROCEDURE IF EXISTS `insert_repair_laundry`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_repair_laundry`(
	IN `var_id_shift` INT,
	IN `var_id_address` INT,
	IN `var_summa` INT,
	IN `date_begin_int` BIGINT

)
BEGIN

DECLARE id_record INT DEFAULT 0;  
DECLARE date_begin datetime;

SELECT ifnull(MAX(id),0)+1 INTO id_record FROM repair_laundry;

select FROM_UNIXTIME(0) + INTERVAL date_begin_int/1000 SECOND INTO date_begin;
 
insert repair_laundry (id, id_shift, id_address, massa, date_oper) 
values (id_record, var_id_shift, var_id_address, var_summa, date_begin);
 
SELECT * from repair_laundry where id=id_record;
END//
DELIMITER ;

-- Дамп структуры для процедура victoria.insert_shift
DROP PROCEDURE IF EXISTS `insert_shift`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_shift`(
	IN `var_id_user` INT,
	IN `var_id_branch` INT
)
BEGIN

DECLARE id_record INT DEFAULT 0;  

set id_record = (select ifnull(max(id),-1) from shift where id_user=var_id_user and id_branch=var_id_branch and date_end is null);

if id_record <= 0 then 
   SELECT ifnull(MAX(id),0)+1 INTO id_record FROM shift;
   insert shift (id, id_user, id_branch, date_begin) values(id_record, var_id_user, var_id_branch, now());   
end if;

SELECT * from shift where id=id_record;

END//
DELIMITER ;

-- Дамп структуры для процедура victoria.insert_warehouse_laundry
DROP PROCEDURE IF EXISTS `insert_warehouse_laundry`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_warehouse_laundry`(
	IN `var_id_shift` INT,
	IN `var_id_address` INT
,
	IN `var_summa` INT,
	IN `date_begin_int` BIGINT

)
BEGIN

DECLARE id_record INT DEFAULT 0;  
DECLARE date_begin datetime;

SELECT ifnull(MAX(id),0)+1 INTO id_record FROM warehouse_laundry;

select FROM_UNIXTIME(0) + INTERVAL date_begin_int/1000 SECOND INTO date_begin;
 
insert warehouse_laundry (id, id_shift, massa, date_oper, id_address) values(id_record, var_id_shift, var_summa, date_begin, var_id_address);
 
SELECT * from warehouse_laundry where id=id_record;
END//
DELIMITER ;

-- Дамп структуры для процедура victoria.insert_washing_laundry
DROP PROCEDURE IF EXISTS `insert_washing_laundry`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_washing_laundry`(
	IN `var_id_shift` INT,
	IN `var_id_address` INT,
	IN `var_summa` INT,
	IN `date_begin_int` BIGINT

)
BEGIN

DECLARE id_record INT DEFAULT 0;  
DECLARE date_begin datetime;

SELECT ifnull(MAX(id),0)+1 INTO id_record FROM washing_laundry;

select FROM_UNIXTIME(0) + INTERVAL date_begin_int/1000 SECOND INTO date_begin;
 
insert washing_laundry (id, id_shift, id_address, massa, date_oper) 
values (id_record, var_id_shift, var_id_address, var_summa, date_begin);
 
SELECT * from washing_laundry where id=id_record;
END//
DELIMITER ;

-- Дамп структуры для процедура victoria.ins_br_addwork_price
DROP PROCEDURE IF EXISTS `ins_br_addwork_price`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `ins_br_addwork_price`(
	IN `var_id_branch` INT,
	IN `var_id_addwork` INT,
	IN `var_price` INT,
	IN `var_check_addwork` BIT

)
BEGIN

declare p_count_rec integer default(0);
set p_count_rec = (select count(id_addwork) from taddworkbranch where id_addwork = var_id_addwork and
                                                                        id_branch   = var_id_branch);

if p_count_rec > 0 
then

 update taddworkbranch set price = var_price, flagdelete = not var_check_addwork
 where id_addwork = var_id_addwork and id_branch   = var_id_branch;

elseif p_count_rec = 0 and var_check_addwork = 1
then

 insert taddworkbranch (id_branch, id_addwork, price, flagdelete)
 values (var_id_branch, var_id_addwork, var_price, not var_check_addwork);

end if;					 

END//
DELIMITER ;

-- Дамп структуры для процедура victoria.ins_br_pos_price
DROP PROCEDURE IF EXISTS `ins_br_pos_price`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `ins_br_pos_price`(
	IN `var_id_branch` INT,
	IN `var_id_position` INT,
	IN `var_price` INT,
	IN `var_check_position` BIT

)
BEGIN

declare p_count_rec integer default(0);
set p_count_rec = (select count(id_position) from tpositionbranch where id_position = var_id_position and
                                                                        id_branch   = var_id_branch);

if p_count_rec > 0 
then

 update tpositionbranch set price = var_price, flagdelete = not var_check_position
 where id_position = var_id_position and id_branch   = var_id_branch;

elseif p_count_rec = 0 and var_check_position=1
then

 insert tpositionbranch (id_branch, id_position, price, flagdelete)
 values (var_id_branch, var_id_position, var_price, not var_check_position);

end if;					 

END//
DELIMITER ;

-- Дамп структуры для таблица victoria.laundry_address_shipment
DROP TABLE IF EXISTS `laundry_address_shipment`;
CREATE TABLE IF NOT EXISTS `laundry_address_shipment` (
  `id_address` int(11) DEFAULT NULL,
  `address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_branch` int(11) DEFAULT NULL,
  `flagdelete` bit(1) DEFAULT NULL,
  KEY `id_adress` (`id_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Дамп данных таблицы victoria.laundry_address_shipment: ~7 rows (приблизительно)
/*!40000 ALTER TABLE `laundry_address_shipment` DISABLE KEYS */;
INSERT INTO `laundry_address_shipment` (`id_address`, `address`, `id_branch`, `flagdelete`) VALUES
	(1, 'Парковая 72', 1, NULL),
	(2, 'Молодежная 72', 1, NULL),
	(3, 'Красных Фортов 13', 1, NULL),
	(4, 'Мира 5', 1, NULL),
	(5, 'Апартаменты', 1, NULL),
	(6, 'Тестовый 1', 3, NULL),
	(7, 'Тестовый 2', 3, NULL);
/*!40000 ALTER TABLE `laundry_address_shipment` ENABLE KEYS */;

-- Дамп структуры для таблица victoria.laundry_add_work
DROP TABLE IF EXISTS `laundry_add_work`;
CREATE TABLE IF NOT EXISTS `laundry_add_work` (
  `id` int(11) NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `flagdelete` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Дамп данных таблицы victoria.laundry_add_work: ~5 rows (приблизительно)
/*!40000 ALTER TABLE `laundry_add_work` DISABLE KEYS */;
INSERT INTO `laundry_add_work` (`id`, `name`, `flagdelete`) VALUES
	(1, 'помывка полов', b'0'),
	(2, 'помывка окон', b'0'),
	(3, 'вынос мусора', b'0'),
	(4, 'Заправка постелей', b'0'),
	(5, 'Протирка зеркал', b'0');
/*!40000 ALTER TABLE `laundry_add_work` ENABLE KEYS */;

-- Дамп структуры для таблица victoria.laundry_basenom
DROP TABLE IF EXISTS `laundry_basenom`;
CREATE TABLE IF NOT EXISTS `laundry_basenom` (
  `id_lbn` int(11) NOT NULL,
  `name` tinytext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type_nl` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_lbn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Дамп данных таблицы victoria.laundry_basenom: ~9 rows (приблизительно)
/*!40000 ALTER TABLE `laundry_basenom` DISABLE KEYS */;
INSERT INTO `laundry_basenom` (`id_lbn`, `name`, `type_nl`) VALUES
	(1, 'Наволочка', 0),
	(2, 'Простынь', 0),
	(3, 'Пододеяльник', 0),
	(4, 'Полотенце', 0),
	(5, 'Коврик', 0),
	(6, 'Одеяло', 0),
	(7, 'Подушка', 0),
	(8, 'Наматрасник', 0),
	(9, 'Шторы', 0);
/*!40000 ALTER TABLE `laundry_basenom` ENABLE KEYS */;

-- Дамп структуры для таблица victoria.laundry_nomenclature
DROP TABLE IF EXISTS `laundry_nomenclature`;
CREATE TABLE IF NOT EXISTS `laundry_nomenclature` (
  `id_nom` int(11) DEFAULT NULL,
  `id_lbn` int(11) DEFAULT NULL,
  `id_ltp` int(11) DEFAULT NULL,
  `bitdelete` bit(1) DEFAULT NULL,
  KEY `id_nom` (`id_nom`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Дамп данных таблицы victoria.laundry_nomenclature: ~19 rows (приблизительно)
/*!40000 ALTER TABLE `laundry_nomenclature` DISABLE KEYS */;
INSERT INTO `laundry_nomenclature` (`id_nom`, `id_lbn`, `id_ltp`, `bitdelete`) VALUES
	(1, 1, 1, NULL),
	(2, 1, 2, NULL),
	(3, 2, 3, NULL),
	(4, 2, 4, NULL),
	(5, 3, 3, NULL),
	(6, 3, 4, NULL),
	(7, 4, 5, NULL),
	(8, 4, 2, NULL),
	(9, 4, 6, NULL),
	(10, 4, 9, NULL),
	(11, 5, 7, NULL),
	(12, 5, 8, NULL),
	(13, 6, 3, NULL),
	(14, 6, 4, NULL),
	(15, 7, 1, NULL),
	(16, 7, 2, NULL),
	(17, 8, 3, NULL),
	(18, 8, 4, NULL),
	(19, 9, NULL, NULL);
/*!40000 ALTER TABLE `laundry_nomenclature` ENABLE KEYS */;

-- Дамп структуры для таблица victoria.laundry_typenl
DROP TABLE IF EXISTS `laundry_typenl`;
CREATE TABLE IF NOT EXISTS `laundry_typenl` (
  `id_ltp` int(11) NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_ltp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Дамп данных таблицы victoria.laundry_typenl: ~9 rows (приблизительно)
/*!40000 ALTER TABLE `laundry_typenl` DISABLE KEYS */;
INSERT INTO `laundry_typenl` (`id_ltp`, `type`) VALUES
	(1, '50x70'),
	(2, '70x70'),
	(3, '1,5 сп'),
	(4, '2 сп'),
	(5, '30x60'),
	(6, '70x140'),
	(7, 'Для ванны'),
	(8, 'Придверный'),
	(9, 'Кухонное');
/*!40000 ALTER TABLE `laundry_typenl` ENABLE KEYS */;

-- Дамп структуры для таблица victoria.message
DROP TABLE IF EXISTS `message`;
CREATE TABLE IF NOT EXISTS `message` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_user_from` bigint(20) DEFAULT 0,
  `id_position_from` int(11) DEFAULT NULL,
  `date_from` datetime DEFAULT NULL,
  `id_position_to` bigint(20) DEFAULT 0,
  `id_branch` bigint(20) DEFAULT 0,
  `situation` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `data_situation` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `data_solution` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `summa` int(11) DEFAULT NULL,
  `result_response` int(11) DEFAULT NULL,
  `bit_response` bit(1) DEFAULT NULL,
  `date_response` datetime DEFAULT NULL,
  `id_user_response` int(11) DEFAULT NULL,
  `comment_response` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `flagdelete` bit(1) DEFAULT b'0',
  KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=162 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Дамп данных таблицы victoria.message: ~5 rows (приблизительно)
/*!40000 ALTER TABLE `message` DISABLE KEYS */;
INSERT INTO `message` (`id`, `id_user_from`, `id_position_from`, `date_from`, `id_position_to`, `id_branch`, `situation`, `data_situation`, `data_solution`, `summa`, `result_response`, `bit_response`, `date_response`, `id_user_response`, `comment_response`, `flagdelete`) VALUES
	(157, 6, 1, '2020-05-11 00:13:36', 2, 3, 'Выбили дверь в прачечную.', 'Во время праздников сломали дверь.  Замок выломан. Фото прилагаю Прошу выделить 2350 рублей на починку и 600 слесарю как гонорар. Итого 2950', NULL, 2950, 2, b'1', '2020-05-15 13:31:50', 1, 'тут отказ', b'0'),
	(158, 6, 1, '2020-05-11 00:20:24', 2, 3, 'Не включается стиральная машина', 'Сломалась розетка и оборван шнур. На починку 500 руб материалы и 500 руб электрику. Итого 1000 руб.', NULL, 1000, 1, b'1', '2020-05-15 13:31:33', 1, '', b'0'),
	(159, 1, 2, '2020-05-11 00:25:15', 1, 3, 'Инструкция о включении стиральной машины.', 'Подробности на фото.', NULL, 0, 3, NULL, NULL, NULL, NULL, b'0'),
	(160, 1, 2, '2020-05-15 14:36:23', 1, 3, 'ситуация data_solution', 'данные data_solution', 'решение data_solution', 1000, 0, NULL, NULL, NULL, NULL, b'0'),
	(161, 1, 2, '2020-05-15 14:42:33', 1, 3, 'тут описание ситуации', 'тут описание данных', 'тут предложенное решение', 1000, 0, NULL, NULL, NULL, NULL, b'0');
/*!40000 ALTER TABLE `message` ENABLE KEYS */;

-- Дамп структуры для таблица victoria.message_image
DROP TABLE IF EXISTS `message_image`;
CREATE TABLE IF NOT EXISTS `message_image` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_message` int(11) DEFAULT NULL,
  `name` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Дамп данных таблицы victoria.message_image: ~9 rows (приблизительно)
/*!40000 ALTER TABLE `message_image` DISABLE KEYS */;
INSERT INTO `message_image` (`id`, `id_message`, `name`) VALUES
	(62, 157, '157_1.jpg'),
	(63, 157, '157_2.jpg'),
	(64, 157, '157_3.jpg'),
	(67, 158, '158_3.jpg'),
	(66, 158, '158_2.jpg'),
	(65, 158, '158_1.jpg'),
	(69, 159, '159_3.jpg'),
	(68, 159, '159_1.jpg'),
	(70, 159, '159_2.jpg');
/*!40000 ALTER TABLE `message_image` ENABLE KEYS */;

-- Дамп структуры для таблица victoria.message_read
DROP TABLE IF EXISTS `message_read`;
CREATE TABLE IF NOT EXISTS `message_read` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_message` bigint(20) DEFAULT NULL,
  `id_user` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Дамп данных таблицы victoria.message_read: ~1 rows (приблизительно)
/*!40000 ALTER TABLE `message_read` DISABLE KEYS */;
INSERT INTO `message_read` (`id`, `id_message`, `id_user`) VALUES
	(47, 161, 1);
/*!40000 ALTER TABLE `message_read` ENABLE KEYS */;

-- Дамп структуры для таблица victoria.payment_laundry
DROP TABLE IF EXISTS `payment_laundry`;
CREATE TABLE IF NOT EXISTS `payment_laundry` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) DEFAULT NULL,
  `id_branch` int(11) DEFAULT NULL,
  `hour` int(11) DEFAULT NULL,
  `pay` int(11) DEFAULT NULL,
  `addwork` int(11) DEFAULT NULL,
  `pay_year` int(11) DEFAULT NULL,
  `pay_mm` int(11) DEFAULT NULL,
  `pay_dd` int(11) DEFAULT NULL,
  `koeff` decimal(10,1) NOT NULL DEFAULT 0.0,
  `pay_date` datetime DEFAULT NULL,
  KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Дамп данных таблицы victoria.payment_laundry: ~0 rows (приблизительно)
/*!40000 ALTER TABLE `payment_laundry` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_laundry` ENABLE KEYS */;

-- Дамп структуры для таблица victoria.repair_laundry
DROP TABLE IF EXISTS `repair_laundry`;
CREATE TABLE IF NOT EXISTS `repair_laundry` (
  `id` int(11) NOT NULL,
  `id_shift` int(11) NOT NULL,
  `massa` int(11) NOT NULL,
  `date_oper` datetime NOT NULL,
  `id_address` int(11) NOT NULL,
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Дамп данных таблицы victoria.repair_laundry: ~0 rows (приблизительно)
/*!40000 ALTER TABLE `repair_laundry` DISABLE KEYS */;
/*!40000 ALTER TABLE `repair_laundry` ENABLE KEYS */;

-- Дамп структуры для таблица victoria.repair_laundry_detail
DROP TABLE IF EXISTS `repair_laundry_detail`;
CREATE TABLE IF NOT EXISTS `repair_laundry_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_repair` int(11) NOT NULL DEFAULT 0,
  `id_nom` int(11) NOT NULL,
  `quant` int(11) NOT NULL,
  KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Дамп данных таблицы victoria.repair_laundry_detail: ~0 rows (приблизительно)
/*!40000 ALTER TABLE `repair_laundry_detail` DISABLE KEYS */;
/*!40000 ALTER TABLE `repair_laundry_detail` ENABLE KEYS */;

-- Дамп структуры для процедура victoria.SELECT_ALL
DROP PROCEDURE IF EXISTS `SELECT_ALL`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `SELECT_ALL`(
	IN `@name` VARCHAR(50)
)
BEGIN
 
SELECT*FROM tuser where nick=`@name` or email=`@name`;
 
END//
DELIMITER ;

-- Дамп структуры для процедура victoria.select_instruction
DROP PROCEDURE IF EXISTS `select_instruction`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `select_instruction`(
	IN `var_id_user` INT,
	IN `var_id_branch` INT,
	IN `var_id_position` INT


)
BEGIN

     select d.id, d.result_response, d.id_position, p.name as position_name, d.date_from, 
	         d.little_situation, d.summa, d.InputOutput, not not not ifnull(unread,0) as unread
	  from ( 
     SELECT id, result_response, id_position_to as id_position,  date_from, SUBSTRING(situation, 1, 50)  as  little_situation, summa, 0 as InputOutput 
     FROM message WHERE id_position_from = var_id_position and  id_branch = var_id_branch and ifnull(flagdelete,0)=0 and ifnull(result_response,0)=3
     union all 
     SELECT id, result_response, id_position_from as id_position, date_from, SUBSTRING(situation, 1, 50)  as little_situation, summa, 1 as InputOutput 
     FROM message WHERE id_position_to = var_id_position  and id_branch= var_id_branch and ifnull(flagdelete,0)=0 and ifnull(result_response,0)=3
	  ) d 
     LEFT JOIN (
     SELECT id_message, count(id) AS unread
     FROM message_read where id_user=var_id_user GROUP BY id_message) mr ON (d.id = mr.id_message), 
	  tposition p 
	 where p.id = d.id_position
 	 order by d.date_from desc; 

END//
DELIMITER ;

-- Дамп структуры для процедура victoria.select_message
DROP PROCEDURE IF EXISTS `select_message`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `select_message`(
	IN `var_id_user` INT,
	IN `var_id_branch` INT,
	IN `var_id_position` INT,
	IN `var_date_begin` VARCHAR(60),
	IN `var_date_end` VARCHAR(60)






)
BEGIN
     select d.id, d.result_response, d.id_position, p.name as position_name, d.date_from, 
	         d.little_situation, d.summa, d.InputOutput, not not not ifnull(unread,0) as unread
	  from ( 
     SELECT id, result_response, id_position_to as id_position,  date_from, SUBSTRING(situation, 1, 50)  as  little_situation, summa, 0 as InputOutput 
     FROM message WHERE id_position_from = var_id_position and  id_branch = var_id_branch and ifnull(flagdelete,0)=0 and ifnull(result_response,0)<>3
     union all 
     SELECT id, result_response, id_position_from as id_position, date_from, SUBSTRING(situation, 1, 50)  as little_situation, summa, 1 as InputOutput 
     FROM message WHERE id_position_to = var_id_position  and id_branch= var_id_branch and ifnull(flagdelete,0)=0 and ifnull(result_response,0)<>3
	  ) d 
     LEFT JOIN (
     SELECT id_message, count(id) AS unread
     FROM message_read where id_user=var_id_user GROUP BY id_message) mr ON (d.id = mr.id_message), 
	  tposition p 
	 where p.id = d.id_position 
	 and Date(d.date_from) >= Date(var_date_begin) and Date(d.date_from) <= Date(var_date_end)
	 order by d.date_from desc; 

END//
DELIMITER ;

-- Дамп структуры для процедура victoria.select_payment_graph
DROP PROCEDURE IF EXISTS `select_payment_graph`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `select_payment_graph`(
	IN `var_id_user` INT,
	IN `var_id_branch` INT,
	IN `date_begin_int` BIGINT,
	IN `date_end_int` BIGINT,
	IN `var_type` INT


)
BEGIN


declare t_price int default 0;
declare t_date_begin date;
declare t_date_end date;

select FROM_UNIXTIME(0) + INTERVAL date_begin_int/1000 SECOND INTO t_date_begin;
select FROM_UNIXTIME(0) + INTERVAL date_end_int/1000 SECOND INTO t_date_end;

/*
set t_date_begin = date_begin_int;
set t_date_end = date_end_int;
*/

drop table if exists tmp_userwork;
drop table if exists tmp_addwork;
drop table if exists tmp_graph; 


/* получаем оплату в час для должности в отделении*/
set t_price = 
(select max(ifnull(p.price,0)) from tuserbranch u
left join tpositionbranch p on p.id_position=u.id_position and p.id_branch=u.id_branch
where u.id_user= var_id_user and u.id_branch = var_id_branch); 



/* получаем обычные смены за период, группируем позднее */
CREATE TEMPORARY TABLE tmp_userwork AS (
SELECT id as id_shift,  cast(date_begin as date) as date_shift, 
ROUND(cast(TIMESTAMPDIFF(MINUTE, date_begin, ifnull(date_end, NOW()))/60 as decimal(10,2)), 0) as RoundedTime,
TIMESTAMPDIFF(second, date_begin, ifnull(date_end, now())) as ExactTime, t_price as price_position
FROM shift
WHERE id_user=var_id_user AND id_branch=var_id_branch AND 
cast(date_begin as date) between t_date_begin and t_date_end
 );
 
 
/* дополнительная оплата за эти смены */ 
CREATE TEMPORARY TABLE tmp_addwork AS ( 
select a.id_shift, round(sum(adl.quant*ttt.price/60*t_price),0) as summa_add 
from addwork_laundry_detail adl, laundry_add_work l, addwork_laundry a, shift s, taddworkbranch ttt  
where adl.id_addwork=l.id and a.id=adl.id_addwork_laundry and a.id_shift in (select id_shift from tmp_userwork)
and s.id=a.id_shift and ttt.id_branch=s.id_branch and ttt.id_addwork=adl.id_addwork
group by a.id_shift 
);
 
 
CREATE TEMPORARY TABLE tmp_graph AS (
select             date_shift, 
						 sum(RoundedTime) as rounded_time, 
                   sum(ExactTime) as exact_time, 
						 max(price_position) as price_position, 
						 sum(ifnull(summa_add,0)) as summa_add
						 from tmp_userwork u left join tmp_addwork a on a.id_shift=u.id_shift
group by date_shift
);


/* годичный по месяцам */

if var_type = 3 then 
SELECT max(date_shift) as date_shift, sum(price_position*rounded_time)+sum(summa_add) as summa
  FROM tmp_graph
  GROUP BY month(date_shift);
end if;


/* квартальный по неделям */

if var_type = 2 then 
SELECT max(date_shift) as date_shift, sum(price_position*rounded_time)+sum(summa_add) as summa
  FROM tmp_graph
  group by week(date_shift, 3);
end if;


/* месячный по дням */

if var_type = 1 then 
SELECT max(date_shift) as date_shift, sum(price_position*rounded_time)+sum(summa_add) as summa
  FROM tmp_graph
  group by day(date_shift);
end if;


/* если тип не задан выводим все подряд */


if var_type <> 1 and var_type <> 2 and var_type <> 3 then
   SELECT * FROM tmp_graph;
end if;


drop table if exists tmp_userwork;
drop table if exists tmp_addwork;
drop table if exists tmp_graph; 

 
END//
DELIMITER ;

-- Дамп структуры для процедура victoria.select_payment_real
DROP PROCEDURE IF EXISTS `select_payment_real`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `select_payment_real`(
	IN `var_id_user` INT,
	IN `var_id_branch` INT,
	IN `date_begin_int` BIGINT,
	IN `date_end_int` BIGINT


)
BEGIN

declare date_begin date;
declare date_end date;

select FROM_UNIXTIME(0) + INTERVAL date_begin_int/1000 SECOND INTO date_begin;
select FROM_UNIXTIME(0) + INTERVAL date_end_int/1000 SECOND INTO date_end;

SELECT id, id_user, id_branch, hour, pay, ifnull(addwork,0) as addwork, pay_year, pay_mm, pay_dd, koeff
                 from payment_laundry where id_user = var_id_user and
												 id_branch = var_id_branch and	
											  	 STR_TO_DATE(CONCAT(pay_mm,'/', pay_dd,'/',pay_year), '%m/%d/%Y')>=date_begin and 
                     			       STR_TO_DATE(CONCAT(pay_mm,'/', pay_dd,'/',pay_year), '%m/%d/%Y')<=date_end
												 order by STR_TO_DATE(CONCAT(pay_mm,'/', pay_dd,'/',pay_year), '%m/%d/%Y') asc;

END//
DELIMITER ;

-- Дамп структуры для процедура victoria.select_payment_virtual
DROP PROCEDURE IF EXISTS `select_payment_virtual`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `select_payment_virtual`(
	IN `var_id_user` INT,
	IN `var_id_branch` INT,
	IN `date_begin_int` BIGINT,
	IN `date_end_int` BIGINT




)
BEGIN


declare t_price int default 0;
declare t_date_begin date;
declare t_date_end date;

select FROM_UNIXTIME(0) + INTERVAL date_begin_int/1000 SECOND INTO t_date_begin;
select FROM_UNIXTIME(0) + INTERVAL date_end_int/1000 SECOND INTO t_date_end;

drop table if exists tmp_userwork;
drop table if exists tmp_addwork;


/* получаем оплату в час для должности в отделении*/
set t_price = 
(select max(ifnull(p.price,0)) from tuserbranch u
left join tpositionbranch p on p.id_position=u.id_position and p.id_branch=u.id_branch
where u.id_user= var_id_user and u.id_branch = var_id_branch); 



/* получаем обычные смены за период, группируем позднее */
CREATE TEMPORARY TABLE tmp_userwork AS (
SELECT id as id_shift,  cast(date_begin as date) as date_shift, 
ROUND(cast(TIMESTAMPDIFF(MINUTE, date_begin, ifnull(date_end, NOW()))/60 as decimal(10,2)), 0) as RoundedTime,
TIMESTAMPDIFF(second, date_begin, ifnull(date_end, now())) as ExactTime, t_price as price_position
FROM shift
WHERE id_user=var_id_user AND id_branch=var_id_branch AND 
cast(date_begin as date) between t_date_begin and t_date_end
 );
 
 
/* дополнительная оплата за эти смены */ 
CREATE TEMPORARY TABLE tmp_addwork AS ( 
select a.id_shift, round(sum(adl.quant*ttt.price/60*t_price),0) as summa_add 
from addwork_laundry_detail adl, laundry_add_work l, addwork_laundry a, shift s, taddworkbranch ttt  
where adl.id_addwork=l.id and a.id=adl.id_addwork_laundry and a.id_shift in (select id_shift from tmp_userwork)
and s.id=a.id_shift and ttt.id_branch=s.id_branch and ttt.id_addwork=adl.id_addwork
group by a.id_shift 
);
 
 
select             date_shift, 
						 sum(RoundedTime) as rounded_time, 
                   sum(ExactTime) as exact_time, 
						 max(price_position) as price_position, 
						 sum(ifnull(summa_add,0)) as summa_add
						 from tmp_userwork u left join tmp_addwork a on a.id_shift=u.id_shift
group by date_shift;

drop table if exists tmp_userwork;
drop table if exists tmp_addwork;

 
END//
DELIMITER ;

-- Дамп структуры для процедура victoria.select_report_advpay
DROP PROCEDURE IF EXISTS `select_report_advpay`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `select_report_advpay`(
	IN `var_id_user` INT,
	IN `var_id_branch` INT,
	IN `date_begin_int` BIGINT,
	IN `date_end_int` BIGINT





)
BEGIN

declare _t_date_b date;
declare t_date_begin date;
declare t_date_end date;
declare t_price int default(0);

set t_date_begin = FROM_UNIXTIME(0) + INTERVAL date_begin_int/1000 SECOND;
set t_date_end = FROM_UNIXTIME(0) + INTERVAL date_end_int/1000 SECOND;


drop table if exists tmp_week_adv;
drop table if exists tmp_virtpay_without_addwork;
drop table if exists tmp_virtpay_addwork;

/*
ПОЛУЧАЕМ СПИСОК НЕДЕЛЬ И ПРОМЕЖУТКОВ ДАТ ЗА ПЕРИОД
*/

set _t_date_b = DATE_ADD(t_date_begin, INTERVAL -1*WEEKDAY(t_date_begin) DAY);
 

 CREATE TEMPORARY TABLE tmp_week_adv (id_key int AUTO_INCREMENT key, week_number int, date_begin date, date_end date, summa bigint, summa_addwork bigint, flagvirtual boolean, itogo bigint);


  WHILE _t_date_b < t_date_end DO

        if _t_date_b <  t_date_end then 
             insert into tmp_week_adv (week_number, date_begin, date_end, flagvirtual, summa, summa_addwork)         
             values (WEEKOFYEAR(_t_date_b), _t_date_b, DATE_ADD(_t_date_b, INTERVAL 6 DAY), 1, 0, 0);
         end if;    
         
        set _t_date_b = DATE_ADD(_t_date_b, INTERVAL 7 DAY);

  END WHILE;


/* реально оплачено
CREATE TEMPORARY TABLE tmp_realpay AS (

select sum(ifnull(addwork,0)) as summa_addwork, 
       DATE(DATE_ADD(min(pay_date), INTERVAL -1*WEEKDAY(pay_date) DAY)) as date_begin,
       DATE(DATE_ADD(DATE_ADD(min(pay_date), INTERVAL -1*WEEKDAY(pay_date) DAY), INTERVAL 6 DAY)) as date_end,
       sum(hour*pay*koeff+ifnull(addwork,0)) as summa,
       WEEKOFYEAR(min(pay_date)) as w
 from payment_laundry
 where id_user = var_id_user and id_branch= var_id_branch and DATE(pay_date) >= t_date_begin and DATE(pay_date) <= t_date_end
 group by week(pay_date,3)
); 
 */



/* получаем оплату в час для должности в отделении*/
set t_price = 
(select max(ifnull(p.price,0)) from tuserbranch u
left join tpositionbranch p on p.id_position=u.id_position and p.id_branch=u.id_branch
where u.id_user= var_id_user and u.id_branch = var_id_branch); 

/* виртуальный доход без учета допуслуг */
CREATE TEMPORARY TABLE tmp_virtpay_without_addwork AS (
select week(date_begin,3) as w, sum(summa) as summa from (
select s.date_begin,
ROUND(cast(TIMESTAMPDIFF(MINUTE, s.date_begin, ifnull(s.date_end, NOW()))/60 as decimal(10,2)), 0)*t_price as summa 
from shift s, tuserbranch tub
where s.id_user=var_id_user and s.id_branch=var_id_branch and tub.id_user=s.id_user and tub.id_branch=s.id_branch
and DATE(date_begin) >= t_date_begin and DATE(date_begin) <= t_date_end
) as D
group by week(date_begin,3)
);


/* виртуальные допуслуги */
CREATE TEMPORARY TABLE tmp_virtpay_addwork AS (
select week(s.date_begin,3) as w, round(sum(adl.quant*ttt.price/60*t_price),0) as summa_addwork
from shift s, addwork_laundry_detail adl, laundry_add_work l, addwork_laundry a, taddworkbranch ttt 
where adl.id_addwork=l.id and a.id=adl.id_addwork_laundry and a.id_shift=s.id and
s.id_user=var_id_user and s.id_branch=var_id_branch and 
ttt.id_branch=s.id_branch and ttt.id_addwork=adl.id_addwork and
DATE(date_begin) >= t_date_begin and  DATE(date_begin) <= t_date_end
group by week(s.date_begin, 3)
);


/* вносим виртуальные допуслуги */
update tmp_week_adv main, tmp_virtpay_addwork va
set main.summa_addwork = va.summa_addwork
where va.w=main.week_number and main.flagvirtual=1;

/* вносим виртуальные итоговые суммы без допуслуг */
update tmp_week_adv main, tmp_virtpay_without_addwork ta
set main.summa = ta.summa
where ta.w=main.week_number and main.flagvirtual=1;

/* вносим виртуальные итоговые суммы + допуслуги */
update tmp_week_adv set itogo = summa + summa_addwork
where flagvirtual=1;

insert into tmp_week_adv (summa, summa_addwork, itogo)         
select sum(summa) as summa, sum(summa_addwork) as summa_addwork, sum(itogo) from tmp_week_adv;



/* данные по сменам */
select * from tmp_week_adv order by id_key asc;


drop table if exists tmp_week_adv;
drop table if exists tmp_virtpay_without_addwork;
drop table if exists tmp_virtpay_addwork;

 
END//
DELIMITER ;

-- Дамп структуры для процедура victoria.select_report_week
DROP PROCEDURE IF EXISTS `select_report_week`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `select_report_week`(
	IN `var_id_user` INT,
	IN `var_id_branch` INT,
	IN `date_begin_int` BIGINT,
	IN `date_end_int` BIGINT

)
BEGIN

declare t_date_begin date;
declare t_date_end date;

set t_date_begin = FROM_UNIXTIME(0) + INTERVAL date_begin_int/1000 SECOND;
set t_date_end = FROM_UNIXTIME(0) + INTERVAL date_end_int/1000 SECOND;

select sum(ifnull(addwork,0)) as summa_addwork, 
       DATE(DATE_ADD(min(pay_date), INTERVAL -1*WEEKDAY(pay_date) DAY)) as date_begin,
       DATE(DATE_ADD(DATE_ADD(min(pay_date), INTERVAL -1*WEEKDAY(pay_date) DAY), INTERVAL 6 DAY)) as date_end,
       sum(hour*pay*koeff+ifnull(addwork,0)) as summa,
       WEEKOFYEAR(min(pay_date)) as w
 from payment_laundry
 where id_user = var_id_user and id_branch= var_id_branch and DATE(pay_date) >= t_date_begin and DATE(pay_date) <= t_date_end
 group by week(pay_date,3);
 
END//
DELIMITER ;

-- Дамп структуры для процедура victoria.select_unread_count
DROP PROCEDURE IF EXISTS `select_unread_count`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `select_unread_count`(
	IN `var_id_user` INT,
	IN `var_id_branch` INT,
	IN `var_date_begin` VARCHAR(60),
	IN `var_date_end` VARCHAR(60)

)
BEGIN

declare t_id_position int default(0);
set t_id_position = ( select max(id_position) from tuserbranch where id_branch= var_id_branch and id_user= var_id_user and ifnull(flagdelete, 0)=0);

select count(id) as unread_message from message 
where (id_position_from=t_id_position or id_position_to=t_id_position) 
       and id_branch=var_id_branch 
       and ifnull(flagdelete,0) = 0 
       and Date(date_from) >= Date(var_date_begin) 
		 and Date(date_from) <= Date(var_date_end) 
		 and id not in (select id_message from message_read where id_user = var_id_user);

END//
DELIMITER ;

-- Дамп структуры для процедура victoria.SELECT_WEEK
DROP PROCEDURE IF EXISTS `SELECT_WEEK`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `SELECT_WEEK`(
	IN `var_date_begin` DATE,
	IN `var_date_end` DATE


)
BEGIN

drop table if exists tmp_week;
CREATE TEMPORARY TABLE tmp_week (week_number int, date_begin date, date_end date);

 set var_date_begin = DATE_ADD(var_date_begin, INTERVAL -1*WEEKDAY(var_date_begin) DAY);


  WHILE var_date_begin < var_date_end DO

        if var_date_begin <  var_date_end then 
             insert into tmp_week (week_number, date_begin, date_end)         
             values (WEEKOFYEAR(var_date_begin), var_date_begin, DATE_ADD(var_date_begin, INTERVAL 6 DAY));
         end if;    
         
        set var_date_begin = DATE_ADD(var_date_begin, INTERVAL 7 DAY);

  END WHILE;

              select * from tmp_week;
              
              
drop table if exists tmp_week;              

END//
DELIMITER ;

-- Дамп структуры для процедура victoria.set_new_user
DROP PROCEDURE IF EXISTS `set_new_user`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `set_new_user`(
	IN `@nick` TINYTEXT,
	IN `@password` TINYTEXT,
	IN `@email` TINYTEXT





)
BEGIN
 
DECLARE id_user INT DEFAULT 0;  
SELECT IFNULL(MAX(id),0)+1 INTO id_user FROM tuser;
 
insert tuser (id, nick, password, email, surname, name, patronymic) values(id_user, `@nick`,  `@password`, `@email`, '', '', '');
 
SELECT * from tuser where id = id_user;
 
END//
DELIMITER ;

-- Дамп структуры для таблица victoria.shift
DROP TABLE IF EXISTS `shift`;
CREATE TABLE IF NOT EXISTS `shift` (
  `id` int(11) DEFAULT NULL,
  `id_user` int(11) DEFAULT NULL,
  `date_begin` datetime DEFAULT NULL,
  `date_end` datetime DEFAULT NULL,
  `id_branch` int(11) DEFAULT NULL,
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Дамп данных таблицы victoria.shift: ~33 rows (приблизительно)
/*!40000 ALTER TABLE `shift` DISABLE KEYS */;
INSERT INTO `shift` (`id`, `id_user`, `date_begin`, `date_end`, `id_branch`) VALUES
	(1, 1, '2020-01-15 09:09:00', '2020-01-15 19:02:00', 3),
	(2, 1, '2020-01-21 09:19:01', '2020-01-21 18:56:54', 3),
	(3, 1, '2020-01-22 09:00:25', '2020-01-22 18:07:25', 3),
	(4, 1, '2020-02-03 09:00:07', '2020-02-03 17:20:19', 3),
	(5, 1, '2020-02-14 15:20:43', '2020-02-14 21:56:35', 3),
	(6, 1, '2020-02-20 10:56:45', '2020-02-20 16:56:56', 3),
	(7, 1, '2020-02-27 09:29:00', '2020-02-27 18:00:40', 3),
	(8, 1, '2020-02-29 08:13:00', '2020-02-29 17:00:47', 3),
	(9, 1, '2020-03-02 08:17:00', '2020-03-02 19:02:06', 3),
	(10, 1, '2020-03-10 08:13:00', '2020-03-10 17:02:14', 3),
	(11, 1, '2020-03-15 10:13:38', '2020-03-15 22:57:59', 3),
	(12, 1, '2020-03-27 12:59:15', '2020-03-27 23:01:08', 3),
	(13, 1, '2020-04-01 09:02:15', '2020-04-01 23:02:27', 3),
	(14, 1, '2020-04-05 09:11:38', '2020-04-05 15:48:31', 3),
	(15, 1, '2020-04-10 09:00:50', '2020-04-10 18:35:45', 3),
	(16, 1, '2020-04-12 09:04:25', '2020-04-12 21:04:29', 3),
	(17, 1, '2020-04-17 09:06:52', '2020-04-17 15:39:00', 3),
	(18, 1, '2020-04-20 09:08:33', '2020-04-20 19:35:33', 3),
	(19, 1, '2020-04-25 09:36:26', '2020-04-25 22:16:51', 3),
	(21, 1, '2020-04-28 09:56:47', '2020-04-28 14:57:10', 3),
	(22, 1, '2020-04-30 09:33:40', '2020-04-30 17:33:48', 3),
	(23, 1, '2020-05-02 09:33:51', '2020-05-02 13:45:03', 3),
	(24, 1, '2020-05-04 09:58:04', '2020-05-04 21:19:10', 3),
	(25, 1, '2020-05-06 09:19:12', '2020-05-06 18:19:15', 3),
	(26, 1, '2020-05-07 09:54:22', '2020-05-07 21:01:34', 3),
	(27, 1, '2020-05-08 09:01:36', '2020-05-08 15:59:21', 3),
	(28, 1, '2020-05-14 08:47:40', '2020-05-14 20:00:28', 3),
	(29, 1, '2020-05-18 10:00:27', '2020-05-18 19:00:00', 3),
	(30, 1, '2020-05-22 08:48:32', '2020-05-22 20:00:34', 3),
	(31, 1, '2020-05-26 10:00:42', '2020-05-26 18:00:00', 3),
	(32, 1, '2020-05-13 15:23:38', '2020-05-15 15:45:37', 3),
	(33, 1, '2020-05-15 15:45:49', '2020-05-15 15:47:25', 3),
	(34, 1, '2020-05-15 15:47:27', NULL, 3);
/*!40000 ALTER TABLE `shift` ENABLE KEYS */;

-- Дамп структуры для таблица victoria.taddworkbranch
DROP TABLE IF EXISTS `taddworkbranch`;
CREATE TABLE IF NOT EXISTS `taddworkbranch` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_branch` int(11) DEFAULT NULL,
  `id_addwork` int(11) DEFAULT NULL,
  `price` int(11) NOT NULL DEFAULT 0,
  `flagdelete` bit(1) DEFAULT NULL,
  KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Дамп данных таблицы victoria.taddworkbranch: ~7 rows (приблизительно)
/*!40000 ALTER TABLE `taddworkbranch` DISABLE KEYS */;
INSERT INTO `taddworkbranch` (`id`, `id_branch`, `id_addwork`, `price`, `flagdelete`) VALUES
	(1, 3, 6, 13, b'0'),
	(2, 3, 1, 15, b'0'),
	(3, 3, 2, 20, b'0'),
	(4, 1, 1, 15, b'0'),
	(5, 1, 2, 20, b'0'),
	(6, 1, 6, 10, b'0'),
	(7, 1, 7, 15, b'0');
/*!40000 ALTER TABLE `taddworkbranch` ENABLE KEYS */;

-- Дамп структуры для таблица victoria.tbranch
DROP TABLE IF EXISTS `tbranch`;
CREATE TABLE IF NOT EXISTS `tbranch` (
  `id` int(11) DEFAULT NULL,
  `id_city` int(11) DEFAULT NULL,
  `name` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comment` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bitdelete` bit(1) DEFAULT NULL,
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='таблица с пользователями';

-- Дамп данных таблицы victoria.tbranch: ~3 rows (приблизительно)
/*!40000 ALTER TABLE `tbranch` DISABLE KEYS */;
INSERT INTO `tbranch` (`id`, `id_city`, `name`, `comment`, `bitdelete`) VALUES
	(1, 1, 'Прачечная', 'условный филиал', b'0'),
	(2, 1, 'Вторая прачечная', NULL, b'1'),
	(3, 1, 'Третий филиал', NULL, b'0');
/*!40000 ALTER TABLE `tbranch` ENABLE KEYS */;

-- Дамп структуры для процедура victoria.test_dowhile
DROP PROCEDURE IF EXISTS `test_dowhile`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `test_dowhile`()
BEGIN
  DECLARE v INT DEFAULT 0;
  WHILE v < 20 DO
/*  
    INSERT message(id_user_from, id_position_from, date_from, id_position_to, id_branch, situation, data_situation, summa) 
	                VALUES (1, 5, now(), 1, 3, 'внесенная ситуация',' внесенные данные', 200+v); 
*/	                
    INSERT shift(id_user_from, id_position_from, date_from, id_position_to, id_branch, situation, data_situation, summa) 
	                VALUES (1, 5, now(), 1, 3, 'внесенная ситуация',' внесенные данные', 200+v); 


    SET v = v + 1;
  END WHILE;
END//
DELIMITER ;

-- Дамп структуры для процедура victoria.test_proc
DROP PROCEDURE IF EXISTS `test_proc`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `test_proc`()
BEGIN
 drop table if exists rating_tmp;
 create temporary table rating_tmp (id int, dd datetime);
 insert rating_tmp (id, dd) values (1, now());
 select * from rating_tmp;

/* 
 // SELECT UNIX_TIMESTAMP(STR_TO_DATE('2020-05-01 00:00:00', '%Y-%m-%d %H:%i:%s'))
//ifnull(sum(ROUND(cast(TIMESTAMPDIFF(MINUTE, date_begin, ifnull(date_end, NOW()))/60 as decimal(10,2)), 2)),0)*price as virtual_basic
*/

END//
DELIMITER ;

-- Дамп структуры для таблица victoria.tposition
DROP TABLE IF EXISTS `tposition`;
CREATE TABLE IF NOT EXISTS `tposition` (
  `id` int(11) DEFAULT NULL,
  `name` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `flagdelete` bit(1) NOT NULL DEFAULT b'0',
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Дамп данных таблицы victoria.tposition: ~5 rows (приблизительно)
/*!40000 ALTER TABLE `tposition` DISABLE KEYS */;
INSERT INTO `tposition` (`id`, `name`, `flagdelete`) VALUES
	(1, 'прачка', b'0'),
	(2, 'начальник участка', b'0'),
	(3, 'ст. прачка', b'0'),
	(4, 'Сторож', b'1'),
	(5, 'Пробная', b'0');
/*!40000 ALTER TABLE `tposition` ENABLE KEYS */;

-- Дамп структуры для таблица victoria.tpositionbranch
DROP TABLE IF EXISTS `tpositionbranch`;
CREATE TABLE IF NOT EXISTS `tpositionbranch` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_position` int(11) DEFAULT NULL,
  `id_branch` int(11) DEFAULT NULL,
  `price` int(11) DEFAULT NULL,
  `flagdelete` bit(1) DEFAULT NULL,
  KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Дамп данных таблицы victoria.tpositionbranch: ~8 rows (приблизительно)
/*!40000 ALTER TABLE `tpositionbranch` DISABLE KEYS */;
INSERT INTO `tpositionbranch` (`id`, `id_position`, `id_branch`, `price`, `flagdelete`) VALUES
	(1, 1, 3, 10, b'0'),
	(2, 2, 3, 30, b'0'),
	(3, 3, 3, 20, b'0'),
	(4, 5, 3, 30, b'0'),
	(5, 1, 1, 100, b'0'),
	(6, 2, 1, 300, b'0'),
	(7, 3, 1, 200, b'0'),
	(8, 5, 1, 780, b'0');
/*!40000 ALTER TABLE `tpositionbranch` ENABLE KEYS */;

-- Дамп структуры для таблица victoria.tuser
DROP TABLE IF EXISTS `tuser`;
CREATE TABLE IF NOT EXISTS `tuser` (
  `id` int(11) DEFAULT NULL,
  `nick` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `surname` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `patronymic` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `datebirth` datetime DEFAULT NULL,
  `address` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone1` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone2` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_name` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bitdelete` bit(1) DEFAULT NULL,
  `gender` bit(1) DEFAULT NULL,
  `zip` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='список пользователей';

-- Дамп данных таблицы victoria.tuser: ~7 rows (приблизительно)
/*!40000 ALTER TABLE `tuser` DISABLE KEYS */;
INSERT INTO `tuser` (`id`, `nick`, `password`, `email`, `surname`, `name`, `patronymic`, `datebirth`, `address`, `phone1`, `phone2`, `avatar_name`, `comment`, `bitdelete`, `gender`, `zip`) VALUES
	(1, 'Администратор', '4b13a4b1b2059c8820abc38b375fa03de5eb54d7664993266731069459eae11f', 'klipach@mail.ru', 'Клипач', 'Виталий', 'Степанович', '1974-04-09 00:00:00', 'адрес какой то', 'т1', 'т2', '1_1588694991731.jpg', NULL, NULL, b'1', '123'),
	(2, 'Прачечная', '6b51d431df5d7f141cbececcf79edf3dd861c3b4069f0b11661a3eefacbba918', 'klipach1@mail.ru', 'Сергеев', 'Вячеслав', 'Иванович', NULL, 'Северный 21', '', '', NULL, NULL, NULL, b'1', ''),
	(3, 'Тренер', '4fc82b26aecb47d2868c4efbe3581732a3e7cbcc6c2efb32062c08170a05eeb8', 'Employee_1@mail.ru', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL, b'1', NULL, NULL),
	(4, 'Тест1_1', '4fc82b26aecb47d2868c4efbe3581732a3e7cbcc6c2efb32062c08170a05eeb8', 'k@mail.ru', '', 'Тест1_1', 'Тест1_1', NULL, '', '', '', NULL, NULL, NULL, b'1', ''),
	(5, 'Тест1_2', '4fc82b26aecb47d2868c4efbe3581732a3e7cbcc6c2efb32062c08170a05eeb8', 'l@mail.ru', 'Тест1_2', '', '', NULL, '', '', '', NULL, NULL, NULL, b'1', ''),
	(6, 'Тест3_1', '4fc82b26aecb47d2868c4efbe3581732a3e7cbcc6c2efb32062c08170a05eeb8', 'm@mail.ru', 'Тест3_1', '', '', NULL, '', '', '', NULL, NULL, NULL, b'1', ''),
	(7, 'Тест3_2', '4fc82b26aecb47d2868c4efbe3581732a3e7cbcc6c2efb32062c08170a05eeb8', 'n@mail.ru', 'Тест3_2', '', '', NULL, '', '', '', NULL, NULL, NULL, b'1', '');
/*!40000 ALTER TABLE `tuser` ENABLE KEYS */;

-- Дамп структуры для таблица victoria.tuserbranch
DROP TABLE IF EXISTS `tuserbranch`;
CREATE TABLE IF NOT EXISTS `tuserbranch` (
  `id_user` int(11) DEFAULT NULL,
  `id_branch` int(11) DEFAULT NULL,
  `ip` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `check_ip` bit(1) DEFAULT NULL,
  `id_position` int(11) DEFAULT NULL,
  `price` int(11) DEFAULT NULL,
  `flagdelete` bit(1) DEFAULT b'0',
  KEY `id_user_id_branch` (`id_user`,`id_branch`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='связь пользователя и филиала';

-- Дамп данных таблицы victoria.tuserbranch: ~7 rows (приблизительно)
/*!40000 ALTER TABLE `tuserbranch` DISABLE KEYS */;
INSERT INTO `tuserbranch` (`id_user`, `id_branch`, `ip`, `check_ip`, `id_position`, `price`, `flagdelete`) VALUES
	(1, 1, '', b'0', 0, NULL, b'0'),
	(2, 1, '', b'1', 1, NULL, b'0'),
	(1, 3, '', b'0', 2, NULL, b'0'),
	(4, 1, '', b'0', 1, NULL, b'0'),
	(5, 1, '', b'0', 3, NULL, b'0'),
	(6, 3, '', b'0', 1, NULL, b'0'),
	(7, 3, '', b'0', 3, NULL, b'0');
/*!40000 ALTER TABLE `tuserbranch` ENABLE KEYS */;

-- Дамп структуры для процедура victoria.update_link_user
DROP PROCEDURE IF EXISTS `update_link_user`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `update_link_user`(
	IN `var_id_user` INT,
	IN `var_id_branch` INT,
	IN `var_check_branch` BIT,
	IN `var_check_ip` BIT




,
	IN `var_ip` VARCHAR(50),
	IN `var_id_position` INT


)
BEGIN

DECLARE count_branch INT DEFAULT 0; 



select count(id_user) into count_branch from tuserbranch where id_branch = var_id_branch and id_user = var_id_user;

if (count_branch = 0) and (var_check_branch = 1)
then
insert tuserbranch(id_user, id_branch, ip, check_ip, id_position, flagdelete) values (var_id_user, var_id_branch, var_ip, var_check_ip, var_id_position, 0);
end if;

if (count_branch > 0)
then
		update tuserbranch 
		set ip = var_ip, check_ip = var_check_ip, id_position = var_id_position, flagdelete = not var_check_branch 
      where id_branch = var_id_branch and id_user = var_id_user;
end if;


END//
DELIMITER ;

-- Дамп структуры для представление victoria.v_laundry_nomenclature
DROP VIEW IF EXISTS `v_laundry_nomenclature`;
-- Создание временной таблицы для обработки ошибок зависимостей представлений
CREATE TABLE `v_laundry_nomenclature` (
	`id_nom` INT(11) NULL,
	`name` TINYTEXT NULL COLLATE 'utf8mb4_unicode_ci',
	`type` VARCHAR(50) NULL COLLATE 'utf8mb4_unicode_ci',
	`id_lbn` INT(11) NULL,
	`id_ltp` INT(11) NULL
) ENGINE=MyISAM;

-- Дамп структуры для таблица victoria.warehouse_laundry
DROP TABLE IF EXISTS `warehouse_laundry`;
CREATE TABLE IF NOT EXISTS `warehouse_laundry` (
  `id` int(11) NOT NULL,
  `id_shift` int(11) NOT NULL,
  `massa` int(11) NOT NULL,
  `date_oper` datetime NOT NULL,
  `id_address` int(11) DEFAULT NULL,
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Дамп данных таблицы victoria.warehouse_laundry: ~0 rows (приблизительно)
/*!40000 ALTER TABLE `warehouse_laundry` DISABLE KEYS */;
/*!40000 ALTER TABLE `warehouse_laundry` ENABLE KEYS */;

-- Дамп структуры для таблица victoria.warehouse_laundry_detail
DROP TABLE IF EXISTS `warehouse_laundry_detail`;
CREATE TABLE IF NOT EXISTS `warehouse_laundry_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_warehouse` int(11) NOT NULL DEFAULT 0,
  `id_nom` int(11) NOT NULL DEFAULT 0,
  `quant` int(11) NOT NULL,
  `bitadd` bit(1) NOT NULL DEFAULT b'0',
  KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=268 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Дамп данных таблицы victoria.warehouse_laundry_detail: ~0 rows (приблизительно)
/*!40000 ALTER TABLE `warehouse_laundry_detail` DISABLE KEYS */;
/*!40000 ALTER TABLE `warehouse_laundry_detail` ENABLE KEYS */;

-- Дамп структуры для таблица victoria.washing_laundry
DROP TABLE IF EXISTS `washing_laundry`;
CREATE TABLE IF NOT EXISTS `washing_laundry` (
  `id` int(11) NOT NULL,
  `id_shift` int(11) NOT NULL,
  `massa` int(11) NOT NULL,
  `date_oper` datetime NOT NULL,
  `id_address` int(11) NOT NULL,
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Дамп данных таблицы victoria.washing_laundry: ~0 rows (приблизительно)
/*!40000 ALTER TABLE `washing_laundry` DISABLE KEYS */;
/*!40000 ALTER TABLE `washing_laundry` ENABLE KEYS */;

-- Дамп структуры для таблица victoria.washing_laundry_detail
DROP TABLE IF EXISTS `washing_laundry_detail`;
CREATE TABLE IF NOT EXISTS `washing_laundry_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_washing` int(11) NOT NULL DEFAULT 0,
  `id_nom` int(11) NOT NULL DEFAULT 0,
  `quant` int(11) NOT NULL DEFAULT 0,
  KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=264 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Дамп данных таблицы victoria.washing_laundry_detail: ~0 rows (приблизительно)
/*!40000 ALTER TABLE `washing_laundry_detail` DISABLE KEYS */;
/*!40000 ALTER TABLE `washing_laundry_detail` ENABLE KEYS */;

-- Дамп структуры для процедура victoria.week_face
DROP PROCEDURE IF EXISTS `week_face`;
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `week_face`(
	IN `var_id_user` INT,
	IN `var_id_branch` INT





)
BEGIN

declare db date;
declare de date;
declare RoundedTime int;
declare ExactTime varchar(20);
declare productivity int;
declare virt_addwork int;
declare virtual_basic int;
declare virt_itogo int;

declare virtual_basic_last int; 
declare virt_addwork_last int;
declare rating int;
declare virt_minute int;
declare t_price int;

drop table if exists temp_shift_sp;


/*  подсчет времён */

set  db = (select  DATE(DATE_ADD(min(now()), INTERVAL -1*WEEKDAY(now()) DAY)) as date_begin);
set  de = (select  DATE(DATE_ADD(DATE_ADD(min(now()), INTERVAL -1*WEEKDAY(now()) DAY), INTERVAL 6 DAY)) as date_end);

create temporary table temp_shift_sp as (
select id from  shift 
where date(date_begin)>=db and date(date_begin)<=de and id_user=var_id_user and id_branch=var_id_branch); 


select ifnull( sum(TIMESTAMPDIFF(MINUTE, date_begin, ifnull(date_end, NOW()))), 0) into rating 
from  shift 
where date(date_begin)>=db and date(date_begin)<=de and id_user=var_id_user and id_branch=var_id_branch;


select
ifnull(sum(ROUND(cast(TIMESTAMPDIFF(MINUTE, date_begin, ifnull(date_end, NOW()))/60 as decimal(10,2)), 0)),0) ,
ifnull(SEC_TO_TIME(sum(TIMESTAMPDIFF(second, date_begin, ifnull(date_end, now())))),0) into RoundedTime, ExactTime
from shift where id in (select id from temp_shift_sp);


/*  подсчет масс */

select ifnull(sum(massa),0) into productivity  from (
select massa from repair_laundry where id_shift in (select id from temp_shift_sp)
union all
select massa from acceptance_laundry where id_shift in (select id from temp_shift_sp)
union all
select massa from washing_laundry where id_shift in (select id from temp_shift_sp)
union all
select massa from warehouse_laundry where id_shift in (select id from temp_shift_sp)
) as D;


/*  подсчет сумм */

/* получаем оплату в час для должности в отделении*/
set t_price = 
(select max(ifnull(p.price,0)) from tuserbranch u
left join tpositionbranch p on p.id_position=u.id_position and p.id_branch=u.id_branch
where u.id_user= var_id_user and u.id_branch = var_id_branch); 

/* дополнительная оплата и суммарные минуты за эти смены */ 
select ifnull(round(sum(adl.quant*ttt.price/60*t_price),0),0) , ifnull(sum(ttt.price),0) into virt_addwork, virt_minute 
from addwork_laundry_detail adl, laundry_add_work l, addwork_laundry a, shift s, taddworkbranch ttt  
where adl.id_addwork=l.id and a.id=adl.id_addwork_laundry and a.id_shift in (SELECT id FROM temp_shift_sp)
and s.id=a.id_shift and ttt.id_branch=s.id_branch and ttt.id_addwork=adl.id_addwork;


/* основные работы по часам */
select 
ifnull(sum(ROUND(cast(TIMESTAMPDIFF(MINUTE, date_begin, ifnull(date_end, NOW()))/60 as decimal(10,2)), 2)),0)*t_price into virtual_basic
from shift s, tUserBranch tub 
where tub.id_user=s.id_user and tub.id_branch=s.id_branch 
and s.id in (SELECT id FROM temp_shift_sp); 

/*  последнняя смена считаем отдельно */
select 
ifnull(sum(ROUND(cast(TIMESTAMPDIFF(MINUTE, date_begin, ifnull(date_end, NOW()))/60 as decimal(10,2)), 2)),0)*t_price into virtual_basic_last
from shift s, tUserBranch tub
where tub.id_user=s.id_user and tub.id_branch=s.id_branch
and s.id in (SELECT max(id) FROM temp_shift_sp); 


select ifnull(round(sum(adl.quant*ttt.price/60*t_price),0),0) into virt_addwork_last
from addwork_laundry_detail adl, laundry_add_work l, addwork_laundry a, shift s, taddworkbranch ttt  
where adl.id_addwork=l.id and a.id=adl.id_addwork_laundry and a.id_shift in (SELECT max(id) FROM temp_shift_sp)
and s.id=a.id_shift and ttt.id_branch=s.id_branch and ttt.id_addwork=adl.id_addwork;


set rating = rating + virt_minute;

select db,  de,  RoundedTime as rounded_time,  ExactTime as exact_time, productivity,  
       virt_addwork,  virtual_basic, virt_addwork + virtual_basic as virt_itogo,
		 virtual_basic_last+virt_addwork_last as last_shift_itogo, rating;

drop table if exists temp_shift_sp;
END//
DELIMITER ;

-- Дамп структуры для представление victoria.v_laundry_nomenclature
DROP VIEW IF EXISTS `v_laundry_nomenclature`;
-- Удаление временной таблицы и создание окончательной структуры представления
DROP TABLE IF EXISTS `v_laundry_nomenclature`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_laundry_nomenclature` AS select `ln`.`id_nom` AS `id_nom`,`lb`.`name` AS `name`,`lt`.`type` AS `type`,`lb`.`id_lbn` AS `id_lbn`,`lt`.`id_ltp` AS `id_ltp` from ((`laundry_nomenclature` `ln` left join `laundry_basenom` `lb` on(`lb`.`id_lbn` = `ln`.`id_lbn`)) left join `laundry_typenl` `lt` on(`lt`.`id_ltp` = `ln`.`id_ltp`)) ;

