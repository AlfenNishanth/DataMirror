def generate_hash_query(source, id_field, column_names, table_name, schema_name):
    """Generate hash query for the given source"""
    if source.lower() == "hana":
        concat_parts = []
        for col in column_names:
            concat_parts.append(f'TO_BINARY(COALESCE("{col}", \'\'))')

        concat_expression = "||".join(concat_parts)

        return f'SELECT "{id_field}", HASH_MD5({concat_expression}) as row_hash FROM {schema_name}."{table_name}"'
        

    elif source.lower() == "sf":
        concat_parts = []
        for col in column_names:
            concat_parts.append(f'COALESCE("{col}", \'\')')

        concat_expr = '||'.join(concat_parts)
        return f'SELECT "{id_field}", UPPER(MD5({concat_expr})) as row_hash FROM {schema_name}."{table_name}"'
    else:
        raise ValueError("Invalid source specified. Use 'HANA' or 'SF'.")
    

# Example usage
if __name__ == "__main__":
    source = "hana"
    id_field = "ID"
    column_names = ["col1", "col2", "col3"]
    table_name = "my_table"
    schema_name = "my_schema"

    query = generate_hash_query(source, id_field, column_names, table_name, schema_name)
    print(query)

    source = "sf"
    query = generate_hash_query(source, id_field, column_names, table_name, schema_name)
    print(query)