from sqlalchemy import create_engine

engine = create_engine('sqlite:///site.db')
print(engine.table_names())

i = 0
with engine.connect() as conn:
    print(len(conn.execute("SELECT * FROM DAMAGE_CALCULATION").all()))