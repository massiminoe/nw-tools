from flask import Flask, redirect, url_for, render_template, request, session, flash
import damage_calc
#from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.secret_key = "dev"
#app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.sqlite3'
#app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
#app.permanent_session_lifetime = timedelta(minutes=30)

#db = SQLAlchemy(app)

app.register_blueprint(damage_calc.bp)

if __name__ == "__main__":
    #db.create_all()

    app.run(debug=True)


