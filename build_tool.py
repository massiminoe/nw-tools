from flask import Blueprint, Flask, redirect, url_for, render_template, request, session, flash

bp = Blueprint('build_tool', __name__)

@bp.route("/build-tool", methods=["POST", "GET"])
def build_tool():
    return render_template("build_tool.html")