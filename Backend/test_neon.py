import psycopg2

conn_str = "postgresql://neondb_owner:npg_jrDd35qmytGI@ep-red-frost-axc54v0j-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"

try:
    conn = psycopg2.connect(conn_str)
    cur = conn.cursor()
    cur.execute("SELECT current_database(), version();")
    row = cur.fetchone()
    print("SUCCESS: Connected to Neon PostgreSQL!")
    print("Database:", row[0])
    print("Version:", row[1][:60])
    
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
    tables = cur.fetchall()
    print("Current tables in Neon:", [t[0] for t in tables])
    conn.close()
except Exception as e:
    print("Connection error:", type(e), e)
