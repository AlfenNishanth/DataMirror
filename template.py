import snowflake.connector
from hdbcli import dbapi
import hashlib
import unicodedata
import random
import sys
import time
import math
import logging
from typing import List, Dict, Tuple, Set, Any, Optional
import json

# logging.basicConfig(
#     level=logging.INFO,
#     format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
# )
# logger = logging.getLogger(__name__)



def connect_to_hana(address: str, port: int, user: str, password: str):
    try:
        conn = dbapi.connect(
            address=address,
            port=port,
            user=user,
            password=password
        )
        print("Successfully connected to HANA" + time.strftime('%H:%M:%S', time.localtime(time.time())))
        return conn
    except Exception as e:
        print(f"Failed to connect to HANA - at {time.strftime('%H:%M:%S', time.localtime(time.time()))}: {str(e)}")
        raise

def connect_to_snowflake(user: str, password: str, account: str, 
                        warehouse: str, database: str, 
                        schema: str, role: str):
    try:
        conn_params = {
            "user": user,
            "password": password,
            "account": account,
            "warehouse": warehouse,
            "database": database,
            "schema": schema,
            "role": role
        }
                    
        conn = snowflake.connector.connect(**conn_params)
        print("Successfully connected to Snowflake"+time.strftime('%H:%M:%S', time.localtime(time.time())))
        return conn
    except Exception as e:
        print(f"Failed to connect to Snowflake - {time.strftime('%H:%M:%S', time.localtime(time.time()))}: {str(e)}")
        raise

def connect_to_snowflake_sso(user: str, password: str, account: str, 
                        warehouse: str, database: str, 
                        schema: str, role: str, url:str):
    try:
        conn_params = {
            "user": user,
            "password": password,
            "account": account,
            "warehouse": warehouse,
            "database": database,
            "schema": schema,
            "role": role,
            "authenticator":"externalbrowser",  # This specifies SSO authentication
            "client_session_keep_alive":False,
            "authenticator_sso_url": url
        }
                    
        conn = snowflake.connector.connect(**conn_params)
        print("Successfully connected to Snowflake"+time.strftime('%H:%M:%S', time.localtime(time.time())))
        return conn
    except Exception as e:
        print(f"Failed to connect to Snowflake - {time.strftime('%H:%M:%S', time.localtime(time.time()))}: {str(e)}")
        raise



def get_columns_for_source(conn, schema_name, table_name, id_column, source):
    if source.lower() == "hana":
        query = f"""
            SELECT COLUMN_NAME
            FROM SYS.TABLE_COLUMNS
            WHERE SCHEMA_NAME = '{schema_name}'
              AND TABLE_NAME = '{table_name}'
              AND (COLUMN_NAME NOT LIKE '%META%' AND COLUMN_NAME <> '{id_column}')
        """
        
        # with open("COL_query.txt", "w") as f:
        #     f.write(query)
    
    elif source.lower() == "sf":
        query = f"""
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = '{schema_name}'
              AND TABLE_NAME = '{table_name}'
              AND (COLUMN_NAME NOT LIKE '%META%' AND COLUMN_NAME <> '{id_column}')
        """
    else:
        raise ValueError(f"Unsupported source type: {source}. Supported types are 'hana' and 'snowflake'.")
    
    cursor = conn.cursor()
    try:
        cursor.execute(query)
        column_names = [row[0] for row in cursor.fetchall()]
        print(f"Number of Columns for {schema_name}.{table_name} = {len(column_names) + 1}")  # adding 1 for id
        return column_names
    finally:
        cursor.close()


def get_common_columns(columns1, columns2):
    
    source1_map = {col.lower(): col for col in columns1}
    source2_map = {col.lower(): col for col in columns2}
    
    common_col_keys = sorted(set(source1_map.keys()) & set(source2_map.keys()))
    
    common_cols_source1 = [source1_map[key] for key in common_col_keys]
    common_cols_source2 = [source2_map[key] for key in common_col_keys]
    
    column_str1 = ', '.join('"' + val + '"' for val in common_cols_source1)
    column_str2 = ', '.join('"' + val + '"' for val in common_cols_source2)
    
    print(f"Number of common columns: {len(common_cols_source1)+1}")
    return common_cols_source1, common_cols_source2, column_str1, column_str2


def get_column_types(conn, schema_name, table_name, columns, source):
    """
    Fetches data types for columns in a table.
    
    Args:
        conn: Database connection
        schema_name: Schema name
        table_name: Table name
        columns: List of column names
        source: Source type ('HANA' or 'SF')
        
    Returns:
        Dictionary mapping column names (lowercase) to data types
    """
    if source.lower() == "hana":
        query = f"""
            SELECT COLUMN_NAME, DATA_TYPE_NAME
            FROM SYS.TABLE_COLUMNS
            WHERE SCHEMA_NAME = '{schema_name}'
              AND TABLE_NAME = '{table_name}'
              AND COLUMN_NAME IN ({', '.join([f"'{col}'" for col in columns])})
        """
    elif source.lower() == "sf":
        query = f"""
            SELECT COLUMN_NAME, DATA_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = '{schema_name}'
              AND TABLE_NAME = '{table_name}'
              AND COLUMN_NAME IN ({', '.join([f"'{col}'" for col in columns])})
        """
    else:
        raise ValueError(f"Unsupported source type: {source}")
    
    cursor = conn.cursor()
    try:
        cursor.execute(query)
        column_types = {row[0].lower(): row[1] for row in cursor.fetchall()}
        return column_types
    finally:
        cursor.close()

def generate_hash_query(source, id_field, column_names, table_name, schema_name):
    """Generate hash query for the given source"""
    if source.lower() == "hana":
        concat_parts = []
        for col in column_names:
            concat_parts.append(f'TO_BINARY(COALESCE(CAST("{col}" AS VARCHAR), \'\'))')

        concat_expression = "||".join(concat_parts)

        query = f'SELECT "{id_field}", HASH_MD5({concat_expression}) as row_hash FROM {schema_name}."{table_name}"'
        
        # with open("hash_query_hana.txt", "w") as f:
        #      f.write(query)


        return query

    elif source.lower() == "sf":
        concat_parts = []
        for col in column_names:
            # concat_parts.append(f'COALESCE("{col}", \'\')')
            concat_parts.append(f'COALESCE(TO_VARCHAR("{col}"), \'\')')

        concat_expr = '||'.join(concat_parts)
        query = f'SELECT "{id_field}", UPPER(MD5({concat_expr})) as row_hash FROM {schema_name}."{table_name}"'
        
        with open("hash_query_sf.txt", "w") as f:
             f.write(query)

        return query

    else:
        raise ValueError("Invalid source specified. Use 'HANA' or 'SF'.")


def generate_hash_query_chunked(source, id_field, column_names, table_name, schema_name, chunk_size):
    # if len(column_names) <= chunk_size:
    #     return generate_hash_query(source, id_field, column_names, table_name, schema_name)
    
    num_chunks = math.ceil(len(column_names) / chunk_size)
    
    if source.lower() == "hana":
        hash_columns = []
        
        for i in range(num_chunks):
            chunk = column_names[i * chunk_size:(i + 1) * chunk_size]
            concat_parts = []
            
            for col in chunk:
                concat_parts.append(f'TO_BINARY(COALESCE(CAST("{col}" AS VARCHAR), \'\'))')
            
            concat_expression = "||".join(concat_parts)
            hash_columns.append(f'HASH_MD5({concat_expression}) as row_hash{i+1}')
        
        inner_query = f'SELECT "{id_field}", {", ".join(hash_columns)} FROM {schema_name}."{table_name}"'
        
        hash_concats = " || ".join([f'row_hash{i+1}' for i in range(num_chunks)])
        outer_query = f'SELECT "{id_field}", {hash_concats} as row_hash FROM ({inner_query})'
        
        with open('chunked_hash_query_HANA.txt', "w") as f:
            f.write(outer_query)
        
        return outer_query
        
    elif source.lower() == "sf":
        hash_columns = []
        
        for i in range(num_chunks):
            chunk = column_names[i * chunk_size:(i + 1) * chunk_size]
            concat_parts = []
            
            for col in chunk:
                concat_parts.append(f'COALESCE(TO_VARCHAR("{col}"), \'\')')
            
            concat_expr = '||'.join(concat_parts)
            hash_columns.append(f'UPPER(MD5({concat_expr})) as row_hash{i+1}')
        
        inner_query = f'SELECT "{id_field}", {", ".join(hash_columns)} FROM {schema_name}."{table_name}"'
        
        hash_concats = " || ".join([f'row_hash{i+1}' for i in range(num_chunks)])
        outer_query = f'SELECT "{id_field}", {hash_concats} as row_hash FROM ({inner_query})'
        
        with open('chunked_hash_query_SF.txt', "w") as f:
            f.write(outer_query)
        
        return outer_query
    
    else:
        raise ValueError("Invalid source specified. Use 'HANA' or 'SF'.")


def get_hash_values(source, conn, query,is_string):
    cursor = conn.cursor()
    cursor.execute(query)
    result = cursor.fetchall()
    cursor.close()
    
    if is_string:
        return {row[0]: row[1] for row in result}
    else:
        if source.lower() == 'hana':
            return {row[0]: row[1].hex().upper() if row[1] else None for row in result}

        elif source.lower() == 'sf':
            return {row[0]: row[1] for row in result}

    # return hash_map

def compare_hash_values(hash_map_1, hash_map_2):

    ids_in_1 = set(hash_map_1.keys())
    ids_in_2 = set(hash_map_2.keys())
    
    ids_in_both = ids_in_1 & ids_in_2
    missing_in_2 = ids_in_1 - ids_in_2
    missing_in_1 = ids_in_2 - ids_in_1

    
    
    mismatched_ids = [id for id in ids_in_both if hash_map_1[id] != hash_map_2[id]]

### todo: sampled 1000 for comparison
    
    mismatched_ids_sample = random.sample(mismatched_ids, min(len(mismatched_ids), file_sample_size)) if mismatched_ids else []
    missing_in_1_sample = random.sample(list(missing_in_1), min(len(missing_in_1), file_sample_size)) if missing_in_1 else []
    missing_in_2_sample = random.sample(list(missing_in_2), min(len(missing_in_2), file_sample_size)) if missing_in_2 else []
    
    comparison_results = {
        "total_in_system1": len(ids_in_1),
        "total_in_system2": len(ids_in_2),
        "common_ids": len(ids_in_both),
        "no_missing_in_system_1" : len(missing_in_1),
        "no_missing_in_system_2" : len(missing_in_2),
        "no_mismatched_records" : len(mismatched_ids),
        "missing_in_system1": missing_in_1_sample, #list(missing_in_1),
        "missing_in_system2": missing_in_2_sample, #list(missing_in_2),
        "mismatched_ids": mismatched_ids_sample,
        "total_differences": len(mismatched_ids) + len(missing_in_2) + len(missing_in_1)
    }
    
    return comparison_results

def get_detailed_comparison(source1, source2, conn1, conn2, table_name1, table_name2, 
                            schema_name1, schema_name2, id_field1, id_field2, mismatched_ids, common_cols_1, common_cols_2,
                            column_str_1, column_str_2):

    all_detailed_results = []
    
    for i in range(0, len(mismatched_ids), batch_size):
        batch_ids = mismatched_ids[i:i+batch_size]
        start_time = time.time()
        
        print(f"Processing batch {i//batch_size + 1}/{math.ceil(len(mismatched_ids)/batch_size)} ({len(batch_ids)} records)")
        
        id_list_str = ', '.join([f"'{id}'" for id in batch_ids])
        
        query1 = f'SELECT "{id_field1}", {column_str_1} FROM {schema_name1}."{table_name1}" WHERE "{id_field1}" IN ({id_list_str})'
        
        query2 = f'SELECT "{id_field2}", {column_str_2} FROM {schema_name2}."{table_name2}" WHERE "{id_field2}" IN ({id_list_str})'
        
        cursor1 = conn1.cursor()
        cursor2 = conn2.cursor()
        
        print("Executing query for source 1...")
        cursor1.execute(query1)
        records1 = cursor1.fetchall()
        
        print("Executing query for source 2...")
        cursor2.execute(query2)
        records2 = cursor2.fetchall()
        
        records1_dict = {}
        for row in records1:
            id_val = row[0]
            records1_dict[id_val] = {common_cols_1[i]: row[i+1] for i in range(len(common_cols_1))}
            
        records2_dict = {}
        for row in records2:
            id_val = row[0]
            records2_dict[id_val] = {common_cols_2[i]: row[i+1] for i in range(len(common_cols_2))}
        
        for id_val in batch_ids:
            if id_val in records1_dict and id_val in records2_dict:
                record1 = records1_dict[id_val]
                record2 = records2_dict[id_val]
                
                different_fields = []
                for i, col1 in enumerate(common_cols_1):
                    col2 = common_cols_2[i]
                    val1 = record1[col1]
                    val2 = record2[col2]
                    
                    if val1 is not None and val2 is not None:
                        # if hasattr(val1, 'hex'):
                        #     val1 = val1.hex().upper()
                        # if hasattr(val2, 'hex'):
                        #     val2 = val2.hex().upper()
                        
                        # casting to string for comparison
                        # val1_str = str(val1).strip()
                        # val2_str = str(val2).strip()
                        
                        # if val1_str != val2_str:
                        if val1 != val2:
                            different_fields.append(col1)
                    elif (val1 is None and val2 is not None) or (val1 is not None and val2 is None):
                        different_fields.append(col1)
                
                if different_fields:
                    all_detailed_results.append({
                        "id": id_val,
                        "different_fields": different_fields,
                        "source1_data": record1,
                        "source2_data": record2
                    })
        print(len(all_detailed_results), "records processed")
        print(f"Batch processed in {time.time() - start_time:.2f} seconds")
    
    return {
        "column_details": {
            "common_columns": common_cols_1
        },
        "mismatched_records": all_detailed_results
    }


def categorize_difference(val1, val2):

    if val1 is None and val2 is not None:
        return "null_vs_nonnull"
    elif val1 is not None and val2 is None:
        return "null_vs_nonnull"
    
    if val1 is None and val2 is None:
        return "no_difference"

    numeric_types = (int, float, complex)
    if isinstance(val1, numeric_types) and isinstance(val2, numeric_types):
        return "numeric_precision"

    try:
        from datetime import datetime, date
        if (isinstance(val1, (datetime, date)) and isinstance(val2, (datetime, date))):
            return "timestamp_difference"
    except Exception:
        pass
    
    str1 = str(val1).strip() if val1 is not None else ""
    str2 = str(val2).strip() if val2 is not None else ""
    
    if str1.lower() == str2.lower() and str1 != str2:
        return "case_difference"
    
    if str1.replace(" ", "") == str2.replace(" ", ""):
        return "whitespace"
    
    if str1.startswith(str2) or str2.startswith(str1):
        return "truncation"
    
    try:
        from datetime import datetime
        
        date_formats = [
            "%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y", "%Y/%m/%d", 
            "%Y-%m-%d %H:%M:%S", "%d-%m-%Y %H:%M:%S", 
            "%m/%d/%Y %H:%M:%S", "%Y/%m/%d %H:%M:%S"
        ]
        
        date_pattern = r'\d{1,4}[-/]\d{1,2}[-/]\d{1,4}'
        timestamp_pattern = r'\d{1,4}[-/]\d{1,2}[-/]\d{1,4}\s\d{1,2}:\d{1,2}(:\d{1,2})?'
        
        import re
        if (re.match(date_pattern, str1) and re.match(date_pattern, str2)) or \
           (re.match(timestamp_pattern, str1) and re.match(timestamp_pattern, str2)):
            return "timestamp_difference"
    except Exception:
        pass
    
    return "completely_different"

def analyze_data_differences(source1, source2, conn1, conn2, table_name1, table_name2, 
                           schema_name1, schema_name2, id_field1, id_field2, 
                           mismatched_ids, common_cols_1, common_cols_2, col_str_1, col_str_2,
                           column_types=None, sample_size=5000):
    
    # mismatched_ids = comparison_results.get('mismatched_ids', [])
    
    if not mismatched_ids:
        return {"status": "No mismatched records to analyze"}
    
    sample_ids = random.sample(mismatched_ids, min(len(mismatched_ids), sample_size))
    
    if column_types is None:
        column_types = get_column_types(conn1, schema_name1, table_name1, common_cols_1, source1)
    
    chunk_size = 100
    id_chunks = [sample_ids[i:i + chunk_size] for i in range(0, len(sample_ids), chunk_size)]
    
    column_differences = {}
    for col in common_cols_1:
        column_differences[col.lower()] = {
            "column_name": col,
            "total_differences": 0,
            "null_vs_nonnull": 0,
            "truncation": 0,
            "case_difference": 0,
            "whitespace": 0,
            "numeric_precision": 0,
            "timestamp_difference": 0,
            "completely_different": 0,
            "examples": []
        }
    
    for id_chunk in id_chunks:
        id_list_str = ", ".join([f"'{id}'" for id in id_chunk])
        
        query1 = f'SELECT "{id_field1}", {col_str_1} FROM {schema_name1}."{table_name1}" WHERE "{id_field1}" IN ({id_list_str})'
        query2 = f'SELECT "{id_field2}", {col_str_2} FROM {schema_name2}."{table_name2}" WHERE "{id_field2}" IN ({id_list_str})'
        
        cursor1 = conn1.cursor()
        cursor2 = conn2.cursor()
        cursor1.execute(query1)
        cursor2.execute(query2)
        
        rows1 = cursor1.fetchall()
        rows2 = cursor2.fetchall()
        
        data1 = {row[0]: row[1:] for row in rows1}
        data2 = {row[0]: row[1:] for row in rows2}
        
        cursor1.close()
        cursor2.close()
        
        for id in id_chunk:
            if id in data1 and id in data2:
                for i, (col1, col2) in enumerate(zip(common_cols_1, common_cols_2)):
                    val1 = data1[id][i]
                    val2 = data2[id][i]
                    
                    if val1 == val2:
                        continue
                    
                    col_type = column_types.get(col1.lower(), "unknown")
                    
                    diff_type = None
                    if "numeric" in col_type.lower() or "int" in col_type.lower() or "float" in col_type.lower() or "double" in col_type.lower() or "decimal" in col_type.lower():
                        if val1 is not None and val2 is not None:
                            diff_type = "numeric_precision"
                    elif "date" in col_type.lower() or "time" in col_type.lower() or "timestamp" in col_type.lower():
                        if val1 is not None and val2 is not None:
                            diff_type = "timestamp_difference"
                    
                    if diff_type is None:
                        diff_type = categorize_difference(val1, val2)
                    
                    col_key = col1.lower()
                    column_differences[col_key]["total_differences"] += 1
                    column_differences[col_key][diff_type] += 1
                    
                    if len(column_differences[col_key]["examples"]) < 3:
                        column_differences[col_key]["examples"].append({
                            "id": id,
                            "system1_value": str(val1) if val1 is not None else "NULL",
                            "system2_value": str(val2) if val2 is not None else "NULL",
                            "difference_type": diff_type,
                            "column_type": col_type
                        })
    
    column_differences = {k: v for k, v in column_differences.items() if v["total_differences"] > 0}
    
    summary = {
        "columns_with_differences": len(column_differences),
        "difference_types": {
            "null_vs_nonnull": sum(col_data["null_vs_nonnull"] for col_data in column_differences.values()),
            "truncation": sum(col_data["truncation"] for col_data in column_differences.values()),
            "case_difference": sum(col_data["case_difference"] for col_data in column_differences.values()),
            "whitespace": sum(col_data["whitespace"] for col_data in column_differences.values()),
            "numeric_precision": sum(col_data["numeric_precision"] for col_data in column_differences.values()),
            "timestamp_difference": sum(col_data["timestamp_difference"] for col_data in column_differences.values()),
            "completely_different": sum(col_data["completely_different"] for col_data in column_differences.values())
        }
    }
    
    most_common_diffs = sorted(
        summary["difference_types"].items(), 
        key=lambda x: x[1], 
        reverse=True
    )
    
    summary["most_common_differences"] = [
        {"type": diff_type, "count": count} 
        for diff_type, count in most_common_diffs if count > 0
    ]
    
    return {
        "sample_size": len(sample_ids),
        "column_differences": column_differences,
        "summary": summary
    }


def main_comparison(source1, source2, conn1, conn2, table_name1,table_name2, schema_name1, schema_name2, id_field1, id_field2, col_level_compare=False):
   
    start_time = time.time()
    print(f"Starting comparison for table {schema_name1}.{table_name1} vs {schema_name2}.{table_name2}")
    
    # try:
    print("Retrieving columns from system 1...")
    columns1 = get_columns_for_source(conn1, schema_name1, table_name1, id_field1, source1)
    
    print("Retrieving columns from system 2...")
    columns2 = get_columns_for_source(conn2, schema_name2, table_name2, id_field2, source2)
    
    print("Finding common columns...")
    common_cols_1, common_cols_2, column_str_1, column_str_2 = get_common_columns(columns1, columns2)

    if not common_cols_1:
        print(f"No common columns found for table {table_name1}")
        return {
            "error": "No common columns found",
            "table_name": table_name1,
            "total_differences": 0
        }
    
    is_chunked = False

    if len(common_cols_1) > chunk_size:
        is_chunked = True
        print(f"Number of common columns exceeds {chunk_size}, splitting table {table_name1}")
        query1 = generate_hash_query_chunked(source1, id_field1, common_cols_1, table_name1, schema_name1,chunk_size)
        query2 = generate_hash_query_chunked(source2, id_field2, common_cols_2, table_name2, schema_name2,chunk_size)
    else:
        print("Generating hash queries...")
        query1 = generate_hash_query(source1, id_field1, common_cols_1, table_name1, schema_name1)
        query2 = generate_hash_query(source2, id_field2, common_cols_2, table_name2, schema_name2)
    
    print("Executing System 1 query...")
    sys1_start = time.time()
    sys1_hash_map = get_hash_values(source1, conn1, query1,is_chunked)
    sys1_time = time.time() - sys1_start
    print(f"System 1 query completed in {sys1_time:.2f} seconds, retrieved {len(sys1_hash_map)} records")
    
    print("Executing System 2 query...")
    sys2_start = time.time()
    sys2_hash_map = get_hash_values(source2, conn2, query2,is_chunked)
    sys2_time = time.time() - sys2_start
    print(f"System 2 query completed in {sys2_time:.2f} seconds, retrieved {len(sys2_hash_map)} records")
    
    # with open('hashes_main.txt', 'w') as file:
    #     file.write(str(sys1_hash_map) + "\n---------\n"+str(sys2_hash_map))


    print("Comparing hash values...")
    compare_start = time.time()
    results = compare_hash_values(sys1_hash_map, sys2_hash_map)
    compare_time = time.time() - compare_start


    results.update({
        "source_system_1" : source1,
        "source_system_2" : source2,
        "table_name1": table_name1,
        "table_name2": table_name2,
        "schema_name_1": schema_name1,
        "schema_name_2": schema_name2,
        "id_field1": id_field1,
        "id_field2": id_field2,
        "column_count": len(common_cols_1),
        "execution_time": {
            "system1_query": sys1_time,
            "system2_query": sys2_time,
            "comparison": compare_time,
            "total": time.time() - start_time
        }
    })
    
    if  col_level_compare and results["total_differences"] > 0:
        
        # print("Generating detailed comparison...")
        sample_size = min(1000, len(results["mismatched_ids"]))
        random_ids = random.sample(results["mismatched_ids"], sample_size)

        detailed_results = get_detailed_comparison(source1, source2, conn1, conn2, table_name1, table_name2, 
                                                   schema_name1, schema_name2, id_field1, id_field2, 
                                                #    results["mismatched_ids"], 
                                                   random_ids, common_cols_1, common_cols_2,
                                                   column_str_1, column_str_2)

        results["detailed_comparison"] = detailed_results
        
    #### full column compare with type of difference  
        '''print(f"Analyzing {min(500, len(results['mismatched_ids']))} mismatched records to categorize differences...")
        
        column_types = get_column_types(conn1, schema_name1, table_name1, common_cols_1, source1)
        
        difference_analysis = analyze_data_differences(
            source1, source2, conn1, conn2, 
            table_name1, table_name2, schema_name1, schema_name2, 
            id_field1, id_field2, results["mismatched_ids"], common_cols_1, common_cols_2,
            column_str_1, column_str_2,
            column_types=column_types
        )
        
        results["difference_analysis"] = difference_analysis
        
        print("\nDifference Analysis Summary:")
        print(f"Analyzed {difference_analysis['sample_size']} records with differences")
        print(f"Found {difference_analysis['summary']['columns_with_differences']} columns with differences")
        print("\nTypes of differences found:")
        for diff_type in difference_analysis['summary']['most_common_differences']:
            print(f"  {diff_type['type']}: {diff_type['count']} occurrences")
        '''


    print(f"Comparison summary for {table_name1}:")
    print(f"  Records in System 1: {results['total_in_system1']}")
    print(f"  Records in System 2: {results['total_in_system2']}")
    print(f"  Missing in System 1: {results['no_missing_in_system_1']}")
    print(f"  Missing in System 2: {results['no_missing_in_system_2']}")
    print(f"  Mismatched records: {results['no_mismatched_records']}")
    print(f"  Total differences: {results['total_differences']}")
    print(f"  Total time: {results['execution_time']['total']:.2f} seconds")
    
    return results
        
    # except Exception as e:
    #     print(f"Error during comparison of {table_name1}: {str(e)}")
    #     return {
    #         "error": str(e),
    #         "table_name": table_name1,
    #         "total_differences": -1
    #     }
    

def main():

    source1 = 'HANA' 
    source2 = 'SF' 

    table_name1 = 
    table_name2 = 
    schema_name1 = 
    schema_name2 = 
    id_field1 =  
    id_field2 = 

    hana_address = 
    port = 
    hana_user= 
    hana_password = 

    sf_user=
    authenticator="externalbrowser"
    account= 
    warehouse=
    database=
    schema=
    role=
    client_session_keep_alive=False,
    authenticator_sso_url=

    if source1.lower() == 'hana':
        conn1 = connect_to_hana(hana_address, port , hana_user, hana_password)
    elif source1.lower() == 'sf':
        conn1 = connect_to_snowflake_sso(sf_user, "password", account, 
                                      warehouse, database, 
                                      schema, role, authenticator_sso_url)


    if source2.lower() == 'hana':
        conn2 = connect_to_hana(hana_address, port , hana_user, hana_password)
    elif source2.lower() == 'sf':
        conn2 = connect_to_snowflake_sso(sf_user, "password", account, 
                                      warehouse, database, 
                                      schema, role, authenticator_sso_url)

    results = main_comparison(source1, source2, conn1, conn2, table_name1, table_name2, schema_name1, schema_name2, id_field1, id_field2, col_level_compare)
    
    # print(results)

    file_name = f"result - {table_name1} - {time.strftime('%Y-%m-%d_%H-%M-%S', time.localtime(time.time()))}.json"

    with open(file_name, 'w', encoding='utf-8') as f:
        # f.write(str(results).replace('\'','"'))
        f.write(json.dumps(results, default=str))
    print("\n\n------------------ \nfile written to - " + file_name)

chunk_size = 100
batch_size = 10000
col_level_compare = True
file_sample_size = 50

main()