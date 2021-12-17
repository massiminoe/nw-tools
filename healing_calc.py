from flask import Blueprint, Flask, redirect, url_for, render_template, request, session, flash

bp = Blueprint('healing_calc', __name__)

@bp.route("/healing-calc", methods=["POST", "GET"])
def healing_calc():
    return render_template("healing_calc.html")