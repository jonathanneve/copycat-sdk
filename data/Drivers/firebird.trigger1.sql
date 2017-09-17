CREATE OR ALTER TRIGGER %TRIGGER_NAME% FOR %TABLE_NAME%
ACTIVE BEFORE INSERT OR UPDATE OR DELETE POSITION 0
as
declare variable field_name varchar(50);
declare variable field_length integer;
declare variable field_type integer;
declare variable stmt varchar(5000);
declare variable current_stmt varchar(500);
declare variable val_blob blob;
declare variable val varchar(250);
declare variable counter integer;
declare variable dbkey char(8) character set octets;
declare variable change_number integer;
begin
  if (rdb$get_context('USER_TRANSACTION', 'RPL$NO_REPLICATION') = 'TRUE') then exit;
  change_number = gen_id(gen_rpl$log_change_number, 1);
  insert into rpl$tmp_changes(change_number) values (:change_number);
  if (inserting) then exit;
  if (deleting) then
    dbkey = old.rdb$db_key;
  else
    dbkey = new.rdb$db_key;
  counter = 0;
  for select trim(rf.rdb$field_name), coalesce(f.rdb$character_length, f.rdb$field_length), case f.rdb$field_type
    when 7 then 3 when 8 then 3 when 9 then 3
    when 10 then 6 when 27 then 6 when 12 then 9
    when 13 then 10
    when 35 then 11
    when 14 then iif(rdb$character_set_id = 4, 38, 23)
    when 37 then iif(rdb$character_set_id = 4, 24, 1)
    when 40 then iif(rdb$character_set_id = 4, 24, 1)
    when 261 then iif(rdb$field_sub_type = 0, 15, iif(rdb$character_set_id = 4, 39, 16))
    when 16 then 8
    when 23 then 5
  end
  from rdb$relation_fields rf
  join rdb$fields f on f.rdb$field_name = rf.rdb$field_source
  where f.rdb$computed_blr is null and rf.rdb$relation_name = '%TABLE_NAME%'
  and %INCLUDED_FIELDS%
  and %EXCLUDED_FIELDS%
  into :field_name, :field_length, :field_type do
  begin
      if (field_length <= 250 and field_type not in (15, 16, 39)) then
        current_stmt = 'select '''|| :field_name || ''',cast(' || :field_name || ' as varchar(250)), cast(null as blob),' || :field_type || ' from %TABLE_NAME% where %DBKEY%';
      else
        current_stmt = 'select '''|| :field_name || ''',cast(null as varchar(250)),cast(' || :field_name || ' as blob),' || :field_type || ' from %TABLE_NAME% where %DBKEY%';

      if (stmt is null) then
        stmt = current_stmt;
      else
        stmt = stmt || ' union all ' || current_stmt;

      if (character_length(stmt) >= 4000 or octet_length(stmt) >= 10000 or counter >= 100) then begin
        for execute statement (stmt) %EXEC_STMT_PARAM% into :field_name, :val, :val_blob, :field_type do  begin
          if (val is not null or val_blob is not null) then
            update or insert into rpl$tmp_values(field_name,field_type,old_value,old_blob, old_blob_null, change_number) values (trim(:field_name), :field_type, :val, :val_blob, iif(:val_blob is null, 'Y', 'N'), :change_number);
        end
        stmt = null;
        counter = 0;
      end
     counter = counter + 1;
  end
  if (stmt is not null) then begin
    for execute statement (stmt) %EXEC_STMT_PARAM% into :field_name, :val, :val_blob, :field_type do  begin
      if (val is not null or val_blob is not null) then
        update or insert into rpl$tmp_values(field_name,field_type,old_value,old_blob, old_blob_null, change_number) values (trim(:field_name), :field_type, :val, :val_blob, iif(:val_blob is null, 'Y', 'N'), :change_number);
    end
  end
end