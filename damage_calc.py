from flask import Blueprint, Flask, redirect, url_for, render_template, request, session, flash
from extensions import db, damage_calculation
from datetime import datetime
import math

bp = Blueprint('damage_calc', __name__)

# Constants
game_version = "1.3"
# Readable names
weapon_name_dict = {
    "greataxe": "Great Axe",
    "warhammer": "War Hammer",
    "hatchet": "Hatchet",
    "sword": "Sword",
    "spear": "Spear",
    "bow": "Bow",
    "musket": "Musket",
    "rapier": "Rapier",
    "firestaff": "Fire Staff",
    "icegauntlet": "Ice Gauntlet",
    "voidgauntlet": "Void Gauntlet",
    "lifestaff": "Life Staff",
    "blunderbuss": "Blunderbuss"
}
# List of attributes (by index). If dual attribute, first is 90%, second is 65%
weapon_attributes = {
    "greataxe": ['strength'],
    "warhammer": ['strength'],
    "hatchet": ['strength', 'dexterity'],
    "sword": ['strength', 'dexterity'],
    "spear": ['dexterity', 'strength'],
    "bow": ['dexterity'],
    "musket": ['dexterity', 'intelligence'],
    "rapier": ['dexterity', 'intelligence'],
    "firestaff": ['intelligence'],
    "icegauntlet": ['intelligence'],
    "voidgauntlet": ['intelligence', 'focus'],
    "lifestaff": ['focus'],
    "blunderbuss": ['strength', 'intelligence']
}
true_base_damages = {
    "greataxe": 82,
    "warhammer": 84,
    "hatchet": 63,
    "sword": 64,
    "spear": 70,
    "bow": 64,
    "musket": 82,
    "rapier": 61,
    "firestaff": 57,
    "icegauntlet": 56,
    "voidgauntlet": 54,
    "lifestaff": 55,
    "blunderbuss": 75
}
weapon_damage_types = {
    "greataxe": "Slash",
    "warhammer": "Strike",
    "hatchet": "Slash",
    "sword": "Slash",
    "spear": "Thrust",
    "bow": "Thrust",
    "musket": "Thrust",
    "rapier": "Thrust",
    "firestaff": "Fire",
    "icegauntlet": "Ice",
    "voidgauntlet": "Void",
    "lifestaff": "Nature",
    "blunderbuss": "Thrust"
}


def gs_to_bd(gear_score):
    """Calculated true base damage multiplier given a weapon's gear score"""\
    
    stepped_gs = math.floor(gear_score / 5) * 5
    if stepped_gs <= 500:
      return (1 + 0.0112) ** ((stepped_gs - 100) / 5)
    else:
      return 2.43761 * ((1 + 0.66667*0.0112) ** ((stepped_gs - 500) / 5))


def calc_con(attribute_val):
    
    base_hp = 6000
    to_subtract = 125  # From 5 permanent points in CON

    if attribute_val < 101:
        return base_hp + 25 * attribute_val - to_subtract
    elif attribute_val < 201:
        return base_hp + 2500 + (attribute_val - 100) * 24 - to_subtract
    elif attribute_val < 301:
        return base_hp + 2500 + (attribute_val - 100) * 24 - to_subtract
    elif attribute_val < 401:
        return base_hp + 2500 + (attribute_val - 100) * 24 - to_subtract
    else:
        return base_hp + 2500 + (attribute_val - 100) * 24 - to_subtract
    

def gem_damage(weapon, char_info):

    # Parse gem_type string
    if weapon['gem_type'][3] == "F":
        gem_type = "FOC"
    else:
        gem_type = "INT"
    gem_tier = int(weapon['gem_type'][1])

    attribute_damage = weapon_damage(weapon, char_info)
    base_damage = attribute_damage * (1 - gem_tier / 10)
    char_level = char_info['level']
    level_damage = ((char_level - 1) * 0.025 + 1) * weapon['base_damage']
    
    if gem_type == "FOC":

        # Life staff cannot use focus gems
        if weapon['id'] == "lifestaff":
            weapon['gem_type'] = "None"
            return attribute_damage, 0

        gem_damage = damageGain(char_info['focus']) * weapon['base_damage']

        if gem_tier == 2:
            scale = 1.6
        elif gem_tier == 3:
            scale = 1.0668
        elif gem_tier == 4:
            scale = 0.8
        elif gem_tier == 5:
            scale = 0.64
    elif gem_type == "INT":

        gem_damage = damageGain(char_info['intelligence']) * weapon['base_damage']

        if gem_tier == 2:
            scale = 2
        elif gem_tier == 3:
            scale = 1.3333
        elif gem_tier == 4:
            scale = 1
        elif gem_tier == 5:
            scale = 0.8
    
    scale_damage = gem_damage * scale + level_damage

    if (scale_damage > attribute_damage):
        end_gem_damage = (gem_tier / 10) * scale_damage
    else:
        end_gem_damage = (gem_tier / 10) * attribute_damage
    
    return base_damage, end_gem_damage


def damageGain(attribute_val):
    """Calculate a weapon's damage gained from a scaling attribute, as a percentage."""
    to_subtract = 5 * 1.625  # Subtract this to account for permenanet 5 attribute points

    if attribute_val < 101:
        return (1.625 * attribute_val - to_subtract) / 100
    elif attribute_val < 151:
        return (162.5 + 1.3 * (attribute_val - 100) - to_subtract) / 100
    elif attribute_val < 201:
        return (227.5 + 1.17 * (attribute_val - 150) - to_subtract) / 100
    elif attribute_val < 251:
        return (286 + 1.04 * (attribute_val - 200) - to_subtract) / 100
    elif attribute_val < 301:
        return (338 + 0.91 * (attribute_val - 250) - to_subtract) / 100
    else:  # >300
        return (383.5 + 0.78 * (attribute_val - 300) - to_subtract) / 100

def weapon_damage(weapon, char_info):
    weapon_type = weapon['id']
    base_damage = weapon['base_damage']
    char_level = char_info['level']

    damage_types = weapon_attributes[weapon_type]
    attribute_damage = 0

    if len(damage_types) == 1:
        attribute_damage += damageGain(char_info[damage_types[0]]) * base_damage
    else:
        attribute_damage += damageGain(char_info[damage_types[0]]) * base_damage * 0.9
        attribute_damage += damageGain(char_info[damage_types[1]]) * base_damage * 0.65

    level_damage = ((char_level - 1) * 0.025 + 1) * base_damage

    return math.floor(attribute_damage + level_damage)


def validate_num(value, minval, maxval):

    if value.isnumeric():
        value = int(value)
        value = max(minval, value)
        value = min(maxval, value)
        return value
    else:
        return None


def get_char_info(form, char_info):
    '''Check if posted attributes and level values are valid. Must be numeric, >= 5, <= 1000. If valid, update the dictionary.'''

    attributes = ["strength", "dexterity", "intelligence", "focus", "constitution"]

    for attribute in attributes:
        attribute_val = validate_num(form[attribute], 5, 1000)

        # Only update if form was valid
        if attribute_val:
            char_info[attribute] = attribute_val

    char_level = form["level"]
    char_level = validate_num(char_level, 1, 60)

    if char_level:
        char_info['level'] = char_level

    if char_info['level'] == 60:
        char_info["health"] = calc_con(char_info["constitution"])
    else:
        char_info['health'] = "N/A"


def get_weapons(form, weapon1, weapon2):
    '''Get posted info from weapon forms.'''

    # Weapon id
    weapon1['id'] = form["weapon1_name"]
    weapon2['id'] = form["weapon2_name"]

    # Readable weapon name
    weapon1['name'] = weapon_name_dict[weapon1['id']]
    weapon2['name'] = weapon_name_dict[weapon2['id']]

    # Base damage
    weapon1['base_damage'] = validate_num(form["weapon1_damage"], 50, 250)
    if not weapon1['base_damage']:
        weapon1['base_damage'] = 200
    weapon2['base_damage'] = validate_num(form["weapon2_damage"], 50, 250)
    if not weapon2['base_damage']:
        weapon2['base_damage'] = 200

    # Gems
    weapon1['gem_type'] = form["weapon1_gem"]
    weapon2['gem_type'] = form["weapon2_gem"]

    # Gear score
    weapon1['gear_score'] = validate_num(form["weapon1_gs"], 100, 625)
    weapon2['gear_score'] = validate_num(form["weapon2_gs"], 100, 625)


def calc_weapons(weapon1, weapon2, char_info):
    """Calculate weapon damage, gem damage, etc."""

    # Damage type
    weapon1['damage_type'] = weapon_damage_types[weapon1['id']]
    weapon2['damage_type'] = weapon_damage_types[weapon2['id']]

    weapon1['true_base_damage'] = true_base_damages[weapon1['id']]
    weapon2['true_base_damage'] = true_base_damages[weapon2['id']]

    weapon1['base_damage'] = gs_to_bd(weapon1['gear_score']) * weapon1['true_base_damage']
    weapon2['base_damage'] = gs_to_bd(weapon2['gear_score']) * weapon2['true_base_damage']
    
    weapon1['weapon_damage'] = weapon_damage(weapon1, char_info)
    weapon2['weapon_damage'] = weapon_damage(weapon2, char_info)

    if weapon1['gem_type'] != "None":
        normal_damage, elemental_damage = gem_damage(weapon1, char_info)
        weapon1['normal_damage'] = math.floor(normal_damage)
        weapon1['elemental_damage'] = math.floor(elemental_damage)
        weapon1['weapon_damage'] = math.floor(normal_damage + elemental_damage)
    else:
        weapon1['normal_damage'] = weapon1['weapon_damage']
    if weapon2['gem_type'] != "None":
        normal_damage, elemental_damage = gem_damage(weapon2, char_info)
        weapon2['normal_damage'] = math.floor(normal_damage)
        weapon2['elemental_damage'] = math.floor(elemental_damage)
        weapon2['weapon_damage'] = math.floor(normal_damage + elemental_damage)
    else:
        weapon2['normal_damage'] = weapon2['weapon_damage']

    # Done calculating, make them clean
    weapon1['base_damage'] = math.floor(weapon1['base_damage'])
    weapon2['base_damage'] = math.floor(weapon2['base_damage'])


# Database
def save_data(char_info, weapon1, weapon2):
    """Save data from a submitted damage calculation to the database"""

    calc = damage_calculation(strength=char_info['strength'], timestamp=datetime.now(), dexterity=char_info['dexterity'], intelligence=char_info['intelligence'], focus=char_info['focus'], constitution=char_info['constitution'], level=char_info['level'],\
     w1_type=weapon1['id'], w1_gs=weapon1['gear_score'], w1_gem=weapon1['gem_type'], w1_damage=weapon1['weapon_damage'],\
     w2_type=weapon2['id'], w2_gs=weapon2['gear_score'], w2_gem=weapon2['gem_type'], w2_damage=weapon2['weapon_damage'])

    db.session.add(calc)
    db.session.commit()


@bp.route("/", methods=["POST", "GET"])
@bp.route("/damage-calc", methods=["POST", "GET"])
def damage_calc():

    char_info = {"strength": 5, "dexterity": 5, "intelligence": 5, "focus": 5, "constitution": 5, "level": 60, "health": 6000}
    weapon1 = {"id": "greataxe", "name": "Great Axe", "base_damage": 231, "weapon_damage": 574, "gem_type": "None", "true_base_damage": 82, "gear_score": 600, "damage_type": "Slash", "normal_damage": 574, "elemental_damage": 0}
    #weapon2 = {"id": "warhammer", "name": "War Hammer", "base_damage": 237, "weapon_damage": 588, "gem_type": "None", "true_base_damage": 84, "gear_score": 600, "damage_type": "Strike", "normal_damage": 588, "elemental_damage": 0}
    weapon2 = {"id": "blunderbuss", "name": "Blunderbuss", "base_damage": 212, "weapon_damage": 525, "gem_type": "None", "true_base_damage": 75, "gear_score": 600, "damage_type": "Thrust", "normal_damage": 525, "elemental_damage": 0}
    
    if request.method == "POST":

        get_char_info(request.form, char_info)
        get_weapons(request.form, weapon1, weapon2)
        calc_weapons(weapon1, weapon2, char_info)

        save_data(char_info, weapon1, weapon2)  # Save to db

        return render_template("damage_calc.html", char_info=char_info, weapon1=weapon1, weapon2=weapon2, game_version=game_version)
    else:
        return render_template("damage_calc.html", char_info=char_info, weapon1=weapon1, weapon2=weapon2, game_version=game_version)

@bp.route("/hello")
def hello():
    return "Hello"