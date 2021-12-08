from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Database
class damage_calculation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, nullable=False)
    # Attributes
    strength = db.Column(db.Integer, nullable=False)
    dexterity = db.Column(db.Integer, nullable=False)
    intelligence = db.Column(db.Integer, nullable=False)
    focus = db.Column(db.Integer, nullable=False)
    constitution = db.Column(db.Integer, nullable=False)
    level = db.Column(db.Integer, nullable=False)
    # Weapon 1
    w1_type = db.Column(db.String, nullable=False)
    w1_gs = db.Column(db.Integer, nullable=False)
    w1_gem = db.Column(db.String, nullable=False)
    w1_damage = db.Column(db.Integer, nullable=False)
    # Weapon 2
    w2_type = db.Column(db.String, nullable=False)
    w2_gs = db.Column(db.Integer, nullable=False)
    w2_gem = db.Column(db.String, nullable=False)
    w2_damage = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return "<[%s] (Char: %s, %s, %s, %s, %s, LVL: %s) (Weapon1: %s, %s, %s, %s) (Weapon2: %s, %s, %s, %s)>" % (self.timestamp, self.strength, self.dexterity, self.intelligence, self.focus, self.constitution, self.level, self.w1_type, self.w1_gs, self.w1_gem, self.w1_damage, self.w2_type, self.w2_gs, self.w2_gem, self.w2_damage)
