import time
from app.services.utils import (
    get_column_types,
    generate_hash_query,
    get_hash_values,
    get_detailed_comparison,
    analyze_data_differences,
    get_columns_for_source,
    get_common_columns,
    compare_hash_values  
)   
from config import chunk_size, batch_size, col_level_compare, file_sample_size

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
    
    file_name = f"result - {table_name1} - {time.strftime('%Y-%m-%d_%H-%M-%S', time.localtime(time.time()))}.json"

    with open(file_name, 'w', encoding='utf-8') as f:
        # f.write(str(results).replace('\'','"'))
        f.write(json.dumps(results, default=str))
    print("\n\n------------------ \nfile written to - " + file_name)

    return results
        
    # except Exception as e:
    #     print(f"Error during comparison of {table_name1}: {str(e)}")
    #     return {
    #         "error": str(e),
    #         "table_name": table_name1,
    #         "total_differences": -1
    #     }


def perform_comparison(source1, source2, conn1, conn2, table_name1,
                     table_name2, schema_name1, schema_name2, 
                     id_field1, id_field2, column_level_compare=False):
    # Get columns for both sources
    columns1 = get_columns_for_source(conn1, schema_name1, table_name1, id_field1, source1)
    columns2 = get_columns_for_source(conn2, schema_name2, table_name2, id_field2, source2)
    
    # Find common columns
    common_cols = get_common_columns(columns1, columns2)
    
    # Map to original column case if needed (depends on your original implementation)
    common_cols_1 = [col for col in columns1 if col.upper() in [c.upper() for c in common_cols]]
    common_cols_2 = [col for col in columns2 if col.upper() in [c.upper() for c in common_cols]]
    
    # Prepare column strings for queries
    column_str_1 = ','.join(common_cols_1)
    column_str_2 = ','.join(common_cols_2)
    
    # Generate hash queries
    hash_query1 = generate_hash_query(source1, id_field1, common_cols_1, table_name1, schema_name1)
    hash_query2 = generate_hash_query(source2, id_field2, common_cols_2, table_name2, schema_name2)
    
    # Get hash values
    hash_values1 = get_hash_values(source1, conn1, hash_query1, False)
    hash_values2 = get_hash_values(source2, conn2, hash_query2, False)
    
    # Identify differences
    ids1 = set(hash_values1.keys())
    ids2 = set(hash_values2.keys())
    
    # Find missing and mismatched IDs
    missing_in_source2 = ids1 - ids2
    missing_in_source1 = ids2 - ids1
    common_ids = ids1.intersection(ids2)
    
    mismatched_ids = []
    for id_val in common_ids:
        if hash_values1[id_val] != hash_values2[id_val]:
            mismatched_ids.append(id_val)
    
    # Perform detailed comparison if needed
    detailed_results = {}
    if column_level_compare and mismatched_ids:
        detailed_results = analyze_data_differences(
            source1, source2, conn1, conn2, 
            table_name1, table_name2,
            schema_name1, schema_name2, 
            id_field1, id_field2,
            mismatched_ids, common_cols_1, common_cols_2,
            column_str_1, column_str_2
        )
    
    # Return results
    result = {
        'summary': {
            'total_rows_source1': len(ids1),
            'total_rows_source2': len(ids2),
            'missing_in_source2': list(missing_in_source2),
            'missing_in_source1': list(missing_in_source1),
            'mismatched_rows': len(mismatched_ids),
            'mismatched_ids': mismatched_ids[:100] if len(mismatched_ids) > 100 else mismatched_ids,
            'match_percentage': (len(common_ids) - len(mismatched_ids)) / max(len(ids1), len(ids2)) * 100 if max(len(ids1), len(ids2)) > 0 else 100
        }
    }
    
    if detailed_results:
        result['detailed_comparison'] = detailed_results
    
    return result

