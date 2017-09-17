CREATE OR ALTER TRIGGER %TRIGGER_NAME% FOR %TABLE_NAME%
ACTIVE AFTER INSERT OR UPDATE OR DELETE POSITION 0
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
declare variable primary_key_sync varchar(5000);
declare variable unique_key_sync varchar(5000);
declare variable user_login varchar(50);
declare variable replicating_node varchar(50);
declare variable primary_key_values varchar(500);
declare variable primary_key_fields varchar(500);
declare variable operation_type char(1);
begin
  if (rdb$get_context('USER_TRANSACTION', 'CC$NO_REPLICATION') = 'TRUE') then exit;
  replicating_node = rdb$get_context('USER_SESSION', 'REPLICATING_NODE');
  if (deleting) then
    dbkey = old.rdb$db_key;
  else
    dbkey = new.rdb$db_key;
  select max(change_number) from cc$tmp_changes into :change_number;
  if (not deleting) then begin
  counter = 0;
  for select trim(rf.rdb$field_name), coalesce(f.rdb$character_length, f.rdb$field_length), case f.rdb$field_type
    when 7 then 6 when 8 then 7 when 9 then 0
    when 10 then 11 when 27 then 11 when 12 then 13
    when 13 then 14
    when 35 then 12
    when 14 then 2 
    when 37 then 1
    when 40 then 1
    when 261 then iif(rdb$field_sub_type = 0, 4, 3)
    when 16 then iif(rdb$field_sub_type = 0, 8, 10)
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
            update or insert into cc$tmp_values(field_name,field_type,new_value,new_blob, new_blob_null, change_number) values (trim(:field_name), :field_type, :val, :val_blob, iif(:val_blob is null, 'Y', 'N'), :change_number);
        end
        stmt = null;
        counter = 0;
      end
     counter = counter + 1;
  end
  if (stmt is not null) then begin
    for execute statement (stmt) %EXEC_STMT_PARAM% into :field_name, :val, :val_blob, :field_type do  begin
      if (val is not null or val_blob is not null) then
        update or insert into cc$tmp_values(field_name,field_type,new_value,new_blob, new_blob_null, change_number) values (trim(:field_name), :field_type, :val, :val_blob, iif(:val_blob is null, 'Y', 'N'), :change_number);
    end
  end
  end
  select list((select quoted_str from cc$QUOTE_STR(val)), ';') || ';', list((select quoted_str from cc$QUOTE_STR(field_name)), ';') || ';'
  from (select coalesce(r.old_value, r.new_value) as val, r.field_name
  from rdb$relation_constraints rel
  join rdb$index_segments i on rel.rdb$index_name = i.rdb$index_name
  join cc$tmp_values r on r.field_name = i.rdb$field_name and r.change_number = :change_number
  where rel.rdb$constraint_type = 'PRIMARY KEY'
  and rel.rdb$relation_name = '%TABLE_NAME%'
  order by i.rdb$field_position) into :primary_key_values, :primary_key_fields;
  if (primary_key_values is null) then
    select list(coalesce((select quoted_str from cc$QUOTE_STR(val)), '"'), ';') || ';', list((select quoted_str from cc$QUOTE_STR(field_name)), ';') || ';'
      from (select coalesce(r.old_value, r.new_value) as val, r.field_name
        from rdb$index_segments ins
        join cc$tmp_values r on r.field_name = ins.rdb$field_name and r.change_number = :change_number
        where ins.rdb$index_name = (select first 1 i.rdb$index_name as index_name
          from rdb$indices i
          where i.rdb$relation_name = '%TABLE_NAME%'
          and i.rdb$unique_flag = 1)
        order by ins.rdb$field_position
    ) into :primary_key_values, :primary_key_fields;
  if (primary_key_values is null) then
    select list(coalesce((select quoted_str from cc$QUOTE_STR(val)), '"'), ';') || ';', list((select quoted_str from cc$QUOTE_STR(field_name)), ';') || ';'
      from (select coalesce(r.old_value, r.new_value) as val, r.field_name
          from rdb$relation_fields rf
          join rdb$fields f on f.rdb$field_name = rf.rdb$field_source
          join cc$tmp_values r on r.field_name = rf.rdb$field_name and r.change_number = :change_number
          where rf.rdb$relation_name = '%TABLE_NAME%'

          and f.rdb$field_type <> 261 and f.rdb$field_length < 50
          order by rf.rdb$field_name
    ) into :primary_key_values, :primary_key_fields;
  if (inserting) then operation_type = 'I';
  else if (updating) then operation_type = 'U';
  else operation_type = 'D';
  if (exists(select field_name from cc$tmp_values where change_number = :change_number and (old_value is distinct from new_value or old_blob is distinct from new_blob)) or (rdb$get_context('USER_TRANSACTION', 'FORCE_REPLICATION') = 'TRUE')) then begin
    for select u.login
    from cc$users u
    where (u.login <> :replicating_node or :replicating_node is null)
    and (u.config_name is null or u.config_name = '%CONFIG_NAME%')
    into :user_login do
    begin
      insert into cc$log (code, change_number, login, operation_date, table_name, sent_from,
        primary_key_values, primary_key_fields, operation_type, transaction_number)
      values (gen_id(gen_cc$log, 1), :change_number, :user_login, current_timestamp, '%TABLE_NAME%', :replicating_node,
        :primary_key_values, :primary_key_fields, :operation_type, current_transaction);
      insert into cc$log_values (CHANGE_NUMBER, NODE_NAME, OLD_VALUE, OLD_VALUE_BLOB,new_VALUE, new_VALUE_BLOB,FIELD_NAME,FIELD_TYPE, OLD_BLOB_NULL, NEW_BLOB_NULL)
        select :change_number, :user_login, v.old_value, v.old_blob, v.new_value, v.new_blob, v.field_name, v.field_type, v.OLD_BLOB_NULL, v.NEW_BLOB_NULL
          from cc$tmp_values v
          where v.change_number = :change_number and ((v.old_value is distinct from v.new_value or v.old_blob is distinct from v.new_blob) or (rdb$get_context('USER_TRANSACTION', 'FORCE_REPLICATION') = 'TRUE'));
    end
  end
  delete from cc$tmp_values where change_number = :change_number;
  delete from cc$tmp_changes where change_number = :change_number;
end
