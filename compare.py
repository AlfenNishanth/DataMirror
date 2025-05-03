import snowflake.connector
from hdbcli import dbapi
import hashlib
import unicodedata
import random
import sys
import time
import math

conn1 = dbapi.connect(
    address="analyticsdev.illumina.com",
    port=30041, 
    user="ANISHANTH",
    password="Ibm@032025"
)


conn2 = snowflake_conn = snowflake.connector.connect(
    user= 'anishanth@illumina.com',
    password='IBM@032025',
    account='illumina',
    warehouse='WH_ENTERPRISE_DL_DEV',
    database= 'DB_ENTERPRISE_DL_DEV',       
    schema='ILMN_SFDC',
    role =  'ENT_DL_ADMIN_DEV',
    authenticator="externalbrowser", 
    client_session_keep_alive=False,
    authenticator_sso_url="https://illumina.okta.com/sso"
)


schema_name = "REP_ILMN_INFC_SFDC"
schema_name2 = "ILMN_SFDC"
table_name =    "APTTUS_PROPOSAL__PROPOSAL__C"
table_name2 = "APTTUS_PROPOSAL__PROPOSAL__C"
id_column1 = "ID"
id_column2 = "ID"


filter_field = "SYSTEMMODSTAMP"
from_dt = "2023-09-15"



if(len(sys.argv) >=2):
    param = sys.argv[1]
else: 
    param = 'N'
    
#######
print(f"connected {table_name}: ", time.strftime("%H:%M:%S", time.localtime(time.time())))

cursor1 = conn1.cursor()
cursor2 = conn2.cursor()

query1 = f'''SELECT "{id_column1}" FROM {schema_name}."{table_name}" '''
query2 = f'''SELECT "{id_column2}" FROM {schema_name2}."{table_name2}" '''


cursor1.execute(query1)
ids_system1 = [row[0] for row in cursor1.fetchall()]    
cursor2.execute(query2)
ids_system2 = [row[0] for row in cursor2.fetchall()]

print("count table 1: ", len(ids_system1))
print("count table 2: ", len(ids_system2))

missing_ids_system1 = set(ids_system2) - set(ids_system1)
missing_ids_system2 = set(ids_system1) - set(ids_system2)


print("missing in HANA: ", len(missing_ids_system1))
print("missing in SF: ", len(missing_ids_system2))


########
print("writing missing ids sys 1 ", time.strftime("%H:%M:%S", time.localtime(time.time())))
if(len(missing_ids_system1) > 0):
    with open(f"missing_ids_HANA_{table_name}.txt", "w") as f1:
        f1.write("count: " + str(len(missing_ids_system1)) + "\n")
        for missing_id in missing_ids_system1:
            f1.write(str(missing_id) + "\n")
########
print("done")

########
print("writing missing ids system 2 ", time.strftime("%H:%M:%S", time.localtime(time.time())))
if(len(missing_ids_system2) > 0):
    with open(f"missing_ids_SF_{table_name}.txt", "w") as f2:
        f2.write("count: " + str(len(missing_ids_system2)) + "\n")
        for missing_id in missing_ids_system2:
            f2.write(str(missing_id) + "\n")
########
print("done")            
        
    
query_columns = f"""
    SELECT COLUMN_NAME
    FROM SYS.TABLE_COLUMNS
    WHERE SCHEMA_NAME = '{schema_name}'
      AND TABLE_NAME = '{table_name}'
      AND (COLUMN_NAME NOT LIKE '%META%' AND COLUMN_NAME <> '{id_column1}')
"""

with open("COL_query.txt", "w") as f:
   f.write(query_columns)

cursor1 = conn1.cursor()
cursor1.execute(query_columns)
queried_column_names = [row[0] for row in cursor1.fetchall()]
queried_column_names.sort()
column_names = [id_column1] + queried_column_names

#print("line 135" + column_names + "\n" + queried_column_names)

print("Number of Columns = ", len(column_names))

query_columns = f"""
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = '{schema_name2}'
      AND TABLE_NAME = '{table_name2}'
      AND (COLUMN_NAME NOT LIKE '%META%' AND COLUMN_NAME <> '{id_column2}')
"""
cursor2 = conn2.cursor()
cursor2.execute(query_columns)
queried_column_names_SF = [row[0] for row in cursor2.fetchall()]
queried_column_names_SF.sort()
column_names_SF = [id_column2] + queried_column_names_SF
#print(column_names)
print("Number of Columns SF = ", len(column_names_SF))


column_str = ', '.join('"' + val + '"' for val in queried_column_names)
column_str2 = ', '.join(queried_column_names_SF)

#######
print("querying data from tables ", time.strftime("%H:%M:%S", time.localtime(time.time())))
query_system1 = f'''SELECT "{id_column1}", {column_str} FROM {schema_name}."{table_name}" '''
query_system2 = f'''SELECT "{id_column2}", {column_str2} FROM {schema_name2}."{table_name2}" '''

with open("query.txt", "w") as f:
   f.write(query_system1  + "\n" + query_system2)


cursor1 = conn1.cursor()
cursor1.execute(query_system1)
#######
print("executed HANA ", time.strftime("%H:%M:%S", time.localtime(time.time())))


cursor2 = conn2 .cursor()
cursor2.execute(query_system2)
#######
print("executed SF ", time.strftime("%H:%M:%S", time.localtime(time.time())))


# count1 = len(ids_system1)
# count2 = len(ids_system2)
# cursor_batch = 10000
# curr_cursor = 0


result_system1 = cursor1.fetchall()
result_system2 = cursor2.fetchall()

#######
print("hashing system 1 ", time.strftime("%H:%M:%S", time.localtime(time.time())))
hashes_system1 = [hashlib.md5("||".join(unicodedata.normalize('NFC', str(item).replace("\r","") if item is not None else "") for item in row).encode("utf-8")) for row in result_system1]
#######
print("hashing system 2 ", time.strftime("%H:%M:%S", time.localtime(time.time())))
hashes_system2 = [hashlib.md5("||".join(unicodedata.normalize('NFC', str(item).replace("\r","") if item is not None else "") for item in row).encode("utf-8")) for row in result_system2]

#######
print("string hashes ", time.strftime("%H:%M:%S", time.localtime(time.time())))
hash_strings_system1 = [hash_obj.hexdigest() for hash_obj in hashes_system1]
hash_strings_system2 = [hash_obj.hexdigest() for hash_obj in hashes_system2]

#######
print("finding mismatched hashes ", time.strftime("%H:%M:%S", time.localtime(time.time())))
mismatched_hashes = set(hash_strings_system1) - set(hash_strings_system2)

#######
print("finding differences_ids ", time.strftime("%H:%M:%S", time.localtime(time.time())))
differences_ids = [result_system1[i][0] for i, hash_val in enumerate(hash_strings_system1) if hash_val in mismatched_hashes]

print("differences " ,len(differences_ids))
#differences_ids = mismatched_ids - missing_ids_system1
mismatched_ids = list(set(differences_ids) - set(missing_ids_system2))

print("mismatches ", len(mismatched_ids))

#######
print("writing mismatched_ids ", time.strftime("%H:%M:%S", time.localtime(time.time())))
with open(f"mismatched_ids_{table_name}.txt", "w") as f2:
    f2.write(str(len(mismatched_ids)))
    for missing_id in mismatched_ids:
        f2.write(str(missing_id) + "\n")
        
      
      
if(len(mismatched_ids) >50):
    if param == 'N' or param == 'n':
        mismatched_ids = random.sample(mismatched_ids,50)
        #print(mismatched_ids)
       

final_columns = [id_column1] + column_names                   

if(len(mismatched_ids)<=50):
    print("if block")
    #######
    print("in if ", time.strftime("%H:%M:%S", time.localtime(time.time())))

    with open(f"SF_field_details_{table_name}.txt", "w") as fi:
        for id_value in mismatched_ids:
            try:    
                id_index1 = [row[0] for row in result_system1].index(id_value)
                id_index2 = [row[0] for row in result_system2].index(id_value)

                row_system1 = result_system1[id_index1]
                row_system2 = result_system2[id_index2]

                differences = []
                for column_name, value1, value2 in zip(final_columns, row_system1, row_system2):
                    if value1 != value2:
                        differences.append(column_name)
                        #fi.write(f"ID: {id_value} Mismatch in column '{column_name}' \n")
                        fi.write(f"ID: {id_value} Mismatch in column '{column_name}': \n HANA - '{value1}' \n SF   - '{value2}'\n------------------\n")

                fi.write("\n-------------------------------------------------\n\n")
            except  Exception as ex:
                print(ex)
                continue


else:
    print("in else block")
    #######
    print("in else ", time.strftime("%H:%M:%S", time.localtime(time.time())))
    batch_size = 10000
    num_batches = math.ceil(len(mismatched_ids) / batch_size)
    
    for batch_number in range(num_batches):
        start_time = time.time()       
        start_index = batch_number * batch_size
        end_index = (batch_number + 1) * batch_size
        print(f"index: {start_index}:{end_index}")
        
        current_batch_ids = mismatched_ids[start_index:end_index]

        formatted_batch_ids = ', '.join(f"'{id}'" for id in current_batch_ids)

        batch_query_system1 = f"SELECT {id_column1}, {column_str} FROM {schema_name}.{table_name} WHERE ID IN ({formatted_batch_ids})"
        cursor1.execute(batch_query_system1)
        batch_result_system1 = cursor1.fetchall()
        #with open("batch_query.txt", "w") as f:
        #   f.write(batch_query_system1)

        batch_query_system2 = f"SELECT {id_column2}, {column_str2} FROM {schema_name2}.{table_name2} WHERE ID IN ({formatted_batch_ids})"
        cursor2.execute(batch_query_system2)
        batch_result_system2 = cursor2.fetchall()
        
        file_name = f"SF_field_details_{table_name}_batch_{batch_number + 1}.txt"
        
        with open(file_name, "w", encoding="utf-8") as fi: #encoding="utf-8"
            #for i in range(batch_size):
            for id_value in current_batch_ids:
                try:    
                    id_index1 = [row[0] for row in batch_result_system1].index(id_value)
                    id_index2 = [row[0] for row in batch_result_system2].index(id_value)

                    row_system1 = batch_result_system1[id_index1]
                    row_system2 = batch_result_system2[id_index2]
                    #row_system1 = batch_result_system1[i]
                    #row_system2 = batch_result_system2[i]


                    differences = []
                    fi.write(f"ID: {id_value} - \n")
                    for column_name, value1, value2 in zip(final_columns, row_system1, row_system2):
                        if value1 != value2:
                            differences.append(column_name)
                            #fi.write(f"Mismatch in column '{column_name}' \n")
                            
                            #fi.write(f"ID: {id_value} Mismatch in column '{column_name}' \n")
                            
                            
                            #fi.write(f"ID: {current_batch_ids[i]} Mismatch in column '{column_name}' \n")
                            #fi.write(f"ID: {id_value} Mismatch in column '{column_name}': \n'{value1}' \n!=\n '{value2}'\n------------------\n")
                            fi.write(f"ID: {id_value} Mismatch in column '{column_name}': \n HANA - '{value1}' \n SF   - '{value2}'\n------------------\n")


                    #fi.write("\n-------------------------------------------------\n\n")
                except  Exception as ex:
                    print(ex)
                    continue        
            
                    
        end_time = time.time()
        elapsed_time = end_time - start_time
        print(f"Time taken for the loop: {elapsed_time} seconds")
     
        '''if batch_number < num_batches - 1:
            user_input = input("Continue to the next batch? (y/n): ").lower()
            if user_input != 'y':
                break '''

conn1.close()
conn2.close()