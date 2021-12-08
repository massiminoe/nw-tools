from flask import Flask, redirect, url_for, render_template, request, session, flash
import damage_calc
from extensions import db

app = Flask(__name__)

app.register_blueprint(damage_calc.bp)

# DB
app.secret_key = "6XDBTslHTzQIYj8oLTaaeVo93zatWu4Ky5dA"
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

if __name__ == "__main__":

    app.run(debug=True)


