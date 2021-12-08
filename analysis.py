from sqlalchemy import create_engine

engine = create_engine('sqlite:///site.db')
print(engine.table_names())

with engine.connect() as conn:
    print(conn.execute("SELECT * FROM DAMAGE_CALCULATION").all())