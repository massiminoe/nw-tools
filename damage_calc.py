from flask import Blueprint, Flask, redirect, url_for, render_template, request, session, flash

bp = Blueprint('damage_calc', __name__)

# Constants
game_version = "1.1.1"
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
    "lifestaff": "Life Staff"
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
    "lifestaff": ['focus']
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
    "lifestaff": 55
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
    "lifestaff": "Nature"
}


def gs_to_bd(gear_score):
    """Calculated true base damage multiplier given a weapon's gear score"""
    
    adj_gear_score = gear_score - (gear_score % 5)
    if (adj_gear_score < 200):
      return 0.24 * ((adj_gear_score - 100) / 100) + 1
    elif (adj_gear_score < 300):
      return 0.31439 * ((adj_gear_score - 200) / 100) + 1.24
    elif (adj_gear_score < 400):
      return 0.38761 * ((adj_gear_score - 300) / 100) + 1.55439
    elif (adj_gear_score < 500):
      return 0.48675 * ((adj_gear_score - 400) / 100) + 1.942
    else:
      return 0.39365 * ((adj_gear_score - 500) / 100) + 2.42874


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

    return round(attribute_damage + level_damage)


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
    weapon1['gear_score'] = validate_num(form["weapon1_gs"], 100, 600)
    weapon2['gear_score'] = validate_num(form["weapon2_gs"], 100, 600)


def calc_weapons(weapon1, weapon2, char_info):
    """Calculate weapon damage, gem damage, etc."""

    # Damage type
    weapon1['damage_type'] = weapon_damage_types[weapon1['id']]
    weapon2['damage_type'] = weapon_damage_types[weapon2['id']]

    weapon1['true_base_damage'] = true_base_damages[weapon1['id']]
    weapon2['true_base_damage'] = true_base_damages[weapon2['id']]

    weapon1['base_damage'] = round(gs_to_bd(weapon1['gear_score']) * weapon1['true_base_damage'])
    weapon2['base_damage'] = round(gs_to_bd(weapon2['gear_score']) * weapon2['true_base_damage'])
    
    weapon1['weapon_damage'] = weapon_damage(weapon1, char_info)
    weapon2['weapon_damage'] = weapon_damage(weapon2, char_info)

    if weapon1['gem_type'] != "None":
        normal_damage, elemental_damage  = gem_damage(weapon1, char_info)
        weapon1['normal_damage'] = round(normal_damage)
        weapon1['elemental_damage'] = round(elemental_damage)
        weapon1['weapon_damage'] = round(normal_damage + elemental_damage)
    else:
        weapon1['normal_damage'] = weapon_damage(weapon1, char_info)
    if weapon2['gem_type'] != "None":
        normal_damage, elemental_damage  = gem_damage(weapon2, char_info)
        weapon2['normal_damage'] = round(normal_damage)
        weapon2['elemental_damage'] = round(elemental_damage)
        weapon2['weapon_damage'] = round(normal_damage + elemental_damage)
    else:
        weapon2['normal_damage'] = weapon_damage(weapon2, char_info)

    


@bp.route("/", methods=["POST", "GET"])
@bp.route("/damage-calc", methods=["POST", "GET"])
def damage_calc():

    char_info = {"strength": 5, "dexterity": 5, "intelligence": 5, "focus": 5, "constitution": 5, "level": 60, "health": 6000}
    weapon1 = {"id": "greataxe", "name": "Great Axe", "base_damage": 199, "weapon_damage": 493, "gem_type": "None", "true_base_damage": 82, "gear_score": 500, "damage_type": "Slash", "normal_damage": 0, "elemental_damage": 0}
    weapon2 = {"id": "warhammer", "name": "War Hammer", "base_damage": 204, "weapon_damage": 505, "gem_type": "None", "true_base_damage": 84, "gear_score": 500, "damage_type": "Strike", "normal_damage": 0, "elemental_damage": 0}
    
    if request.method == "POST":

        get_char_info(request.form, char_info)
        get_weapons(request.form, weapon1, weapon2)
        calc_weapons(weapon1, weapon2, char_info)

        return render_template("damage_calc.html", char_info=char_info, weapon1=weapon1, weapon2=weapon2, game_version=game_version)
    else:
        return render_template("damage_calc.html", char_info=char_info, weapon1=weapon1, weapon2=weapon2, game_version=game_version)

@bp.route("/hello")
def hello():
    return "Hello"