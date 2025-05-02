from config import chunk_size, batch_size, file_sample_size


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
    
    elif source.lower() == "snowflake":
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
    if source.lower() == "hana":
        query = f"""
            SELECT COLUMN_NAME, DATA_TYPE_NAME
            FROM SYS.TABLE_COLUMNS
            WHERE SCHEMA_NAME = '{schema_name}'
              AND TABLE_NAME = '{table_name}'
              AND COLUMN_NAME IN ({', '.join([f"'{col}'" for col in columns])})
        """
    elif source.lower() == "snowflake":
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
    if source.lower() == "hana":
        concat_parts = []
        for col in column_names:
            concat_parts.append(f'TO_BINARY(COALESCE(CAST("{col}" AS VARCHAR), \'\'))')

        concat_expression = "||".join(concat_parts)

        query = f'SELECT "{id_field}", HASH_MD5({concat_expression}) as row_hash FROM {schema_name}."{table_name}"'
        
        # with open("hash_query_hana.txt", "w") as f:
        #      f.write(query)


        return query

    elif source.lower() == "snowflake":
        concat_parts = []
        for col in column_names:
            # concat_parts.append(f'COALESCE("{col}", \'\')')
            concat_parts.append(f'COALESCE(TO_VARCHAR("{col}"), \'\')')

        concat_expr = '||'.join(concat_parts)
        query = f'SELECT "{id_field}", UPPER(MD5({concat_expr})) as row_hash FROM {schema_name}."{table_name}"'
        
        # with open("hash_query_sf.txt", "w") as f:
        #      f.write(query)

        return query

    else:
        raise ValueError("Invalid source specified. Use 'HANA' or 'SNOWFLAKE'.")

def generate_hash_query_chunked(source, id_field, column_names, table_name, schema_name, chunk_size=10000):
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
        
    elif source.lower() == "snowflake":
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
        raise ValueError("Invalid source specified. Use 'HANA' or 'SNOWFLAKE'.")


def get_hash_values(source, conn, query, is_string):
    cursor = conn.cursor()
    cursor.execute(query)
    result = cursor.fetchall()
    cursor.close()
    
    if is_string:
        return {row[0]: row[1] for row in result}
    else:
        if source.lower() == 'hana':
            return {row[0]: row[1].hex().upper() if row[1] else None for row in result}

        elif source.lower() == 'snowflake':
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
                            schema_name1, schema_name2, id_field1, id_field2, 
                            mismatched_ids, common_cols_1, common_cols_2,
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
                        
                        # Convert to strings for comparison
                        # val1_str = str(val1).strip()
                        # val2_str = str(val2).strip()
                        
                        # if val1_str != val2_str:
                        if val1 != val2:
                            different_fields.append(col1)
                    elif (val1 is None and val2 is not None) or (val1 is not None and val2 is None):
                        different_fields.append(col1)
                
                # Add to results if there are differences
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
    pass

def analyze_data_differences(source1, source2, conn1, conn2, table_name1, table_name2,
                           schema_name1, schema_name2, id_field1, id_field2,
                           mismatched_ids, common_cols_1, common_cols_2, 
                           col_str_1, col_str_2,
                           column_types=None, sample_size=5000):
    pass