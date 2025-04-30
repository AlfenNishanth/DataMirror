from flask import Blueprint, request, jsonify
from app.services.comparison import main_comparison
from app.services.connectors import (
    connect_to_hana, 
    connect_to_snowflake,
    connect_to_snowflake_sso
)

api_bp = Blueprint('api', __name__)

@api_bp.route('/compare', methods=['POST'])
def compare_tables():
    try:
        data = request.get_json()
        
        print(str(data))

        source1 = data.get('source1')
        source1_conn_data = data.get('source1_connection')

        source2 = data.get('source2')
        source2_conn_data = data.get('source2_connection')

        table_info = data.get('table_info')
        
        if source1.upper() == 'HANA':
            conn1 = connect_to_hana(
                source1_conn_data.get('address'),
                source1_conn_data.get('port'),
                source1_conn_data.get('user'),
                source1_conn_data.get('password')
            )
        elif source1.upper() == 'SNOWFLAKE':
            if source1_conn_data.get('sso', False):
                conn1 = connect_to_snowflake_sso(
                    source1_conn_data.get('user'),
                    source1_conn_data.get('password'),
                    source1_conn_data.get('account'),
                    source1_conn_data.get('warehouse'),
                    source1_conn_data.get('database'),
                    # source1_conn_data.get('schema'),
                    source1_conn_data.get('role'),
                    # source1_conn_data.get('url')
                )
            else:
                conn1 = connect_to_snowflake(
                    source1_conn_data.get('user'),
                    source1_conn_data.get('password'),
                    source1_conn_data.get('account'),
                    source1_conn_data.get('warehouse'),
                    source1_conn_data.get('database'),
                    # source1_conn_data.get('schema'),
                    source1_conn_data.get('role')
                )
        
        if source2.upper() == 'HANA':
            conn2 = connect_to_hana(
                source2_conn_data.get('address'),
                source2_conn_data.get('port'),
                source2_conn_data.get('user'),
                source2_conn_data.get('password')
            )
        elif source2.upper() == 'SNOWFLAKE':
            if source2_conn_data.get('sso', False):
                conn2 = connect_to_snowflake_sso(
                    source2_conn_data.get('user'),
                    source2_conn_data.get('password'),
                    source2_conn_data.get('account'),
                    source2_conn_data.get('warehouse'),
                    source2_conn_data.get('database'),
                    # source2_conn_data.get('schema'),
                    source2_conn_data.get('role'),
                    # source2_conn_data.get('url')
                )
            else:
                conn2 = connect_to_snowflake(
                    source2_conn_data.get('user'),
                    source2_conn_data.get('password'),
                    source2_conn_data.get('account'),
                    source2_conn_data.get('warehouse'),
                    source2_conn_data.get('database'),
                    # source2_conn_data.get('schema'),
                    source2_conn_data.get('role')
                )
        
        result = main_comparison(
            source1, 
            source2, 
            conn1, 
            conn2,
            table_info.get('table_name1'), 
            table_info.get('table_name2'),
            table_info.get('schema_name1'), 
            table_info.get('schema_name2'),
            table_info.get('id_field1'), 
            table_info.get('id_field2'),
            table_info.get('column_level_comparison', False)
        )
        
        if hasattr(conn1, 'close'):
            conn1.close()
        if hasattr(conn2, 'close'):
            conn2.close()
            
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})