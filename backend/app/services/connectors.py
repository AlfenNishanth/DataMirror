import time 
import snowflake.connector
from hdbcli import dbapi

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
            "authenticator":"externalbrowser", 
            "client_session_keep_alive":False,
            "authenticator_sso_url": url
        }
                    
        conn = snowflake.connector.connect(**conn_params)
        print("Successfully connected to Snowflake"+time.strftime('%H:%M:%S', time.localtime(time.time())))
        return conn
    except Exception as e:
        print(f"Failed to connect to Snowflake - {time.strftime('%H:%M:%S', time.localtime(time.time()))}: {str(e)}")
        raise
