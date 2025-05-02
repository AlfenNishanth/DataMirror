from app.services.utils import (
    get_common_columns,
    compare_hash_values,
    get_detailed_comparison
)
from config import chunk_size, batch_size, file_sample_size

import hashlib
import random
import time
import math
import logging
import json
import os
from typing import List, Dict, Tuple, Set, Any, Optional

def execute_query_and_fetch_data(conn, query, source):

    cursor = conn.cursor()
    try:
        cursor.execute(query)
        columns = [desc[0] for desc in cursor.description]
        result = cursor.fetchall()
        
        data = []
        for row in result:
            row_dict = {}
            for i, column in enumerate(columns):
                row_dict[column] = row[i]
            data.append(row_dict)
            
        return columns, data
    finally:
        cursor.close()


def generate_row_hashes(data, columns, id_column):
    hash_map = {}
    
    for row in data:
        id_value = row[id_column]
        
        concat_values = ""
        for col in columns:
            if col != id_column: 
                value = row.get(col, '')
                concat_values += str(value) if value is not None else ''

        row_hash = hashlib.md5(concat_values.encode('utf-8')).hexdigest().upper()
        hash_map[id_value] = row_hash
    
    return hash_map

def compare_query_results(source1, source2, conn1, conn2, query1, query2, id_field1, id_field2, col_level_compare=True):

    start_time = time.time()
    print(f"Starting comparison for query results")
    
    try:
        print("Executing query 1...")
        sys1_start = time.time()
        columns1, data1 = execute_query_and_fetch_data(conn1, query1, source1)
        sys1_time = time.time() - sys1_start
        print(f"Query 1 completed in {sys1_time:.2f} seconds, retrieved {len(data1)} records")
        
        print("Executing query 2...")
        sys2_start = time.time()
        columns2, data2 = execute_query_and_fetch_data(conn2, query2, source2)
        sys2_time = time.time() - sys2_start
        print(f"Query 2 completed in {sys2_time:.2f} seconds, retrieved {len(data2)} records")
 
        ''' 
        if not id_field1 or not id_field2:
            id_columns = identify_id_column(columns1, columns2)
            if not id_columns:
                raise ValueError("Could not identify suitable ID columns in both query results")
            id_field1, id_field2 = id_columns
            print(f"Using identified ID columns: {id_field1}, {id_field2}")
        
        '''

        columns1_no_id = [col for col in columns1 if col != id_field1]
        columns2_no_id = [col for col in columns2 if col != id_field2]
        common_cols_1, common_cols_2, column_str_1, column_str_2 = get_common_columns(columns1_no_id, columns2_no_id)
        
        if not common_cols_1:
            print("No common columns found for comparison")
            return {
                "error": "No common columns found",
                "total_differences": 0
            }
        
        print("Generating hash values for query 1 results...")
        sys1_hash_map = generate_row_hashes(data1, common_cols_1 + [id_field1], id_field1)
        
        print("Generating hash values for query 2 results...")
        sys2_hash_map = generate_row_hashes(data2, common_cols_2 + [id_field2], id_field2)
        
        print("Comparing hash values...")
        compare_start = time.time()
        results = compare_hash_values(sys1_hash_map, sys2_hash_map)
        compare_time = time.time() - compare_start
        
        results.update({
            "source_system_1": source1,
            "source_system_2": source2,
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
        
        if col_level_compare and results["total_differences"] > 0 and results["mismatched_ids"]:
            print("Performing detailed column-level comparison...")
            
            sample_size = min(file_sample_size, len(results["mismatched_ids"]))
            random_ids = random.sample(results["mismatched_ids"], sample_size)
            
            data1_dict = {row[id_field1]: row for row in data1}
            data2_dict = {row[id_field2]: row for row in data2}

            all_detailed_results = []
            for id_val in random_ids:
                if id_val in data1_dict and id_val in data2_dict:
                    record1 = data1_dict[id_val]
                    record2 = data2_dict[id_val]
                    
                    different_fields = []
                    for i, col1 in enumerate(common_cols_1):
                        col2 = common_cols_2[i]
                        val1 = record1.get(col1)
                        val2 = record2.get(col2)
                        
                        if val1 != val2:
                            different_fields.append(col1)
                    
                    if different_fields:
                        all_detailed_results.append({
                            "id": id_val,
                            "different_fields": different_fields,
                            "source1_data": {col: record1.get(col) for col in common_cols_1},
                            "source2_data": {col: record2.get(col) for col in common_cols_2}
                        })
            
            results["detailed_comparison"] = {
                "column_details": {
                    "common_columns": common_cols_1
                },
                "mismatched_records": all_detailed_results
            }
        
        print(f"Comparison summary:")
        print(f"  Records in System 1: {results['total_in_system1']}")
        print(f"  Records in System 2: {results['total_in_system2']}")
        print(f"  Missing in System 1: {results['no_missing_in_system_1']}")
        print(f"  Missing in System 2: {results['no_missing_in_system_2']}")
        print(f"  Mismatched records: {results['no_mismatched_records']}")
        print(f"  Total differences: {results['total_differences']}")
        print(f"  Total time: {results['execution_time']['total']:.2f} seconds")
        
        output_dir = os.path.join(os.getcwd(), 'static', 'comparison_results')
        os.makedirs(output_dir, exist_ok=True)
        
        timestamp = time.strftime('%Y-%m-%d_%H-%M-%S', time.localtime(time.time()))
        filename = f"query_comparison_{timestamp}.json"
        filepath = os.path.join(output_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(json.dumps(results, default=str))
        
        print(f"\n\n------------------ \nfile written to - {filepath}")
        
        return filename
        
    except Exception as e:
        print(f"Error during query comparison: {str(e)}")
        return {
            "error": str(e),
            "total_differences": -1
        }
