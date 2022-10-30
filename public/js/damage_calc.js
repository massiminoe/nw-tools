// Data
let trueBaseDamages = {
    greataxe: 82,
    warhammer: 84,
    hatchet: 63,
    sword: 64,
    spear: 70,
    bow: 64,
    musket: 82,
    rapier: 61,
    firestaff: 57,
    icegauntlet: 56,
    voidgauntlet: 54,
    lifestaff: 55,
    blunderbuss: 75,
    greatsword: 78,
};
let weaponAttributes = {
    greataxe: ['strength'],
    warhammer: ['strength'],
    hatchet: ['strength', 'dexterity'],
    sword: ['strength', 'dexterity'],
    spear: ['dexterity', 'strength'],
    bow: ['dexterity'],
    musket: ['dexterity', 'intelligence'],
    rapier: ['dexterity', 'intelligence'],
    firestaff: ['intelligence'],
    icegauntlet: ['intelligence'],
    voidgauntlet: ['intelligence', 'focus'],
    lifestaff: ['focus'],
    blunderbuss: ['strength', 'intelligence'],
    greatsword: ['strength', 'dexterity'],
}
let displayNames = {
    greataxe: "Great Axe",
    warhammer: "War Hammer",
    hatchet: "Hatchet",
    sword: "Sword",
    spear: "Spear",
    bow: "Bow",
    musket: "Musket",
    rapier: "Rapier",
    firestaff: "Fire Staff",
    icegauntlet: "Ice Gauntlet",
    voidgauntlet: "Void Gauntlet",
    lifestaff: "Life Staff",
    blunderbuss: "Blunderbuss",
    greatsword: "Greatsword",
}
let weaponDamageTypes = {
    greataxe: "Slash",
    warhammer: "Strike",
    hatchet: "Slash",
    sword: "Slash",
    spear: "Thrust",
    bow: "Thrust",
    musket: "Thrust",
    rapier: "Thrust",
    firestaff: "Fire",
    icegauntlet: "Ice",
    voidgauntlet: "Void",
    lifestaff: "Nature",
    blunderbuss: "Thrust",
    greatsword: "Slash",
}

window.onload = function () {

    const strength = document.getElementById("strength"), dexterity = document.getElementById("dexterity"), intelligence = document.getElementById("intelligence");
    const focus = document.getElementById("focus"), constitution = document.getElementById("constitution"), level = document.getElementById("level"), health = document.getElementById('health');
    const slider1 = document.getElementById("weapon1_gs_slider"), gs1 = document.getElementById("weapon1_gs"), slider2 = document.getElementById("weapon2_gs_slider"), gs2 = document.getElementById("weapon2_gs");
    const weapon1_damage = document.getElementById('weapon1_damage'), weapon2_damage = document.getElementById('weapon2_damage');
    const weapon1_normal_damage = document.getElementById('weapon1_normal_damage'), weapon2_normal_damage = document.getElementById('weapon2_normal_damage');
    const weapon1_elemental_damage = document.getElementById('weapon1_elemental_damage'), weapon2_elemental_damage = document.getElementById('weapon2_elemental_damage');
    const weapon1_weapon_damage = document.getElementById("weapon1_weapon_damage"), weapon2_weapon_damage = document.getElementById("weapon2_weapon_damage");
    const weapon1_name = document.getElementById('weapon1_name'), weapon2_name = document.getElementById('weapon2_name');
    const weapon1_img = document.getElementById('weapon1_img'), weapon2_img = document.getElementById('weapon2_img');
    const weapon1_damage_type_img = document.getElementById('weapon1_damage_type_img'), weapon2_damage_type_img = document.getElementById('weapon2_damage_type_img');
    const weapon1_damage_type_text = document.getElementById('weapon1_damage_type_text'), weapon2_damage_type_text = document.getElementById('weapon2_damage_type_text')
    const weapon1_display_name = document.getElementById('weapon1_display_name'), weapon2_display_name = document.getElementById('weapon2_display_name');
    const weapon1_elemental_container = document.getElementById('weapon1_elemental_container'), weapon2_elemental_container = document.getElementById('weapon2_elemental_container');
    const reset_button = document.getElementById('reset_button'), weapon1_gem = document.getElementById('weapon1_gem'), weapon2_gem = document.getElementById('weapon2_gem');

    $(document).ready(function(){
        $('[data-toggle="tooltip"]').tooltip({html:true});
    });

    let charStats = {
        strength: 5,
        dexterity: 5,
        intelligence: 5,
        focus: 5,
        constitution: 5,
        level: 60,
        health: 6789
    };
    let weapon1 = {
        type: "greataxe",
        gs: 600,
        gem: "none",
        baseDamage: 231,
        weaponDamage: 574,
        damageType: "Slash",
        normalDamage: 574,
        elementalDamage: 0
    };
    let weapon2 = {
        type: "greatsword",
        gs: 600,
        gem: "none",
        baseDamage: 228,
        weaponDamage: 566,
        damageType: "Slash",
        normalDamage: 566,
        elementalDamage: 0
    };

    updateCharStats();
    updateWeapons();

    function updateWeapons() {
        weapon1.type = weapon1_name.value;
        weapon2.type = weapon2_name.value;
        weapon1.gs = gs1.value;
        weapon2.gs = gs2.value;
        weapon1.gem = weapon1_gem.value;
        weapon2.gem = weapon2_gem.value;
        weapon1.damageType = weaponDamageTypes[weapon1.type];
        weapon2.damageType = weaponDamageTypes[weapon2.type];

        weapon1.baseDamage = calcBaseDamage(weapon1.type, weapon1.gs);
        weapon2.baseDamage = calcBaseDamage(weapon2.type, weapon2.gs);

        if (weapon1.gem === "None") {
            weapon1.weaponDamage = calcWeaponDamage(charStats, weapon1.type, weapon1.baseDamage);
            weapon1.normalDamage = Math.floor(weapon1.weaponDamage);
            weapon1.elementalDamage = 0;

            // Remove elemental display
            if (!weapon1_elemental_container.classList.contains("hidden")) {
                weapon1_elemental_container.classList.add("hidden");
            };
        } else {
            let gemResults = calcGemDamage(weapon1, charStats);
            weapon1.normalDamage = Math.floor(gemResults[0]);
            weapon1.elementalDamage = Math.floor(gemResults[1]);
            weapon1.weaponDamage = weapon1.normalDamage + weapon1.elementalDamage;

            // Add elemental display
            if (weapon1_elemental_container.classList.contains("hidden")) {
                weapon1_elemental_container.classList.remove("hidden");
            };
        };
        if (weapon2.gem === "None") {
            weapon2.weaponDamage = calcWeaponDamage(charStats, weapon2.type, weapon2.baseDamage)
            weapon2.normalDamage = Math.floor(weapon2.weaponDamage);
            weapon2.elementalDamage = 0;

            // Remove elemental display
            if (!weapon2_elemental_container.classList.contains("hidden")) {
                weapon2_elemental_container.classList.add("hidden");
            };
        } else {
            let gemResults = calcGemDamage(weapon2, charStats);
            weapon2.normalDamage = Math.floor(gemResults[0]);
            weapon2.elementalDamage = Math.floor(gemResults[1]);
            weapon2.weaponDamage = weapon2.normalDamage + weapon2.elementalDamage;

            // Add elemental display
            if (weapon2_elemental_container.classList.contains("hidden")) {
                weapon2_elemental_container.classList.remove("hidden");
            };
        };

        updatePage();
    };

    function updateCharStats() {
        charStats.strength = strength.value;
        charStats.dexterity = dexterity.value;
        charStats.intelligence = intelligence.value;
        charStats.focus = focus.value;
        charStats.constitution = constitution.value;
        charStats.level = level.value;
        charStats.health = calcCon(charStats.constitution)

        health.value = charStats.health
    };

    function updatePage() {
        weapon1_damage.value = Math.floor(weapon1.baseDamage);
        weapon2_damage.value = Math.floor(weapon2.baseDamage);

        weapon1_normal_damage.value = weapon1.normalDamage;
        weapon2_normal_damage.value = weapon2.normalDamage;
        weapon1_elemental_damage.value = weapon1.elementalDamage;
        weapon2_elemental_damage.value = weapon2.elementalDamage;

        weapon1_weapon_damage.value = Math.floor(weapon1.weaponDamage);
        weapon2_weapon_damage.value = Math.floor(weapon2.weaponDamage);
    };

    // GS sliders
    slider1.addEventListener('input', function () {
        gs1.value = slider1.value;
        updateWeapons();
    }, false);
    slider2.addEventListener('input', function () {
        gs2.value = slider2.value;
        updateWeapons();
    }, false);
    gs1.addEventListener('change', function () {
        if (isNaN(gs1.value)) {
                gs1.value = 500;
            };
        if (gs1.value > 625) {
            gs1.value = 625;
        } else if (gs1.value < 100) {
            gs1.value = 100;
        };
        slider1.value = gs1.value;
        updateWeapons();
    }, false);
    gs2.addEventListener('change', function () {
        if (gs2.value > 625) {
            gs2.value = 625;
        } else if (gs2.value < 100) {
            gs2.value = 100;
        };
        slider2.value = gs2.value;
        updateWeapons();
    }, false);

    // Weapon Name
    weapon1_name.addEventListener('input', function () {
        updateWeapons();
        weapon1_display_name.innerHTML = displayNames[weapon1_name.value]
        weapon1_img.src = "/images/" + weapon1.type + ".png"
        weapon1_damage_type_text.innerHTML = weapon1.damageType + " Damage:"
        weapon1_damage_type_img.src = "/images/" + weapon1.damageType.toLowerCase() + ".webp"
    });
    weapon2_name.addEventListener('input', function () {
        updateWeapons();
        weapon2_display_name.innerHTML = displayNames[weapon2_name.value]
        weapon2_img.src = "/images/" + weapon2.type + ".png"
        weapon2_damage_type_text.innerHTML = weapon2.damageType + " Damage:"
        weapon2_damage_type_img.src = "/images/" + weapon2.damageType.toLowerCase() + ".webp"
    });

    // Gem
    weapon1_gem.addEventListener('input', function () {
        updateWeapons();
    });
    weapon2_gem.addEventListener('input', function () {
        updateWeapons();
    });

    // Attributes
    strength.addEventListener('change', function () {
        updateCharStats();
        updateWeapons();
    });
    dexterity.addEventListener('change', function () {
        updateCharStats();
        updateWeapons();
    });
    intelligence.addEventListener('change', function () {
        updateCharStats();
        updateWeapons();
    });
    focus.addEventListener('change', function () {
        updateCharStats();
        updateWeapons();
    });
    constitution.addEventListener('change', function () {
        updateCharStats();
        updateWeapons();
    });
    level.addEventListener('change', function () {
        updateCharStats();
        updateWeapons();
    });

    // Reset Button
    reset_button.addEventListener('click', function () {
        reset_forms();
    });
    
    function reset_forms() {
        strength.value = 5;
        dexterity.value = 5;
        intelligence.value = 5;
        focus.value = 5;
        constitution.value = 5;
        level.value = 60;
        gs1.value = 600;
        gs2.value = 600;
        slider1.value = 600;
        slider2.value = 600;
        weapon1_gem.value = "None";
        weapon2_gem.value = "None";
    };
};

// Independent Functions
function base_scaling(gear_score) {
    var stepped_gs = Math.floor(gear_score / 5) * 5
    if (stepped_gs <= 500) {
        return Math.pow(1 + 0.0112, (stepped_gs - 100) / 5)
    } else {
        return 2.43761 * Math.pow(1 + 0.66667*0.0112, (stepped_gs - 500) / 5)
    };
};

function damageGain(attribute_val){
    // Calculate a weapon's damage gained from a scaling attribute, as a percentage.
    to_subtract = 5 * 1.625  // Subtract this to account for permanent 5 attribute points

    if (attribute_val < 101){
        return (1.625 * attribute_val - to_subtract) / 100;
    }
    else if (attribute_val < 151){
        return (162.5 + 1.3 * (attribute_val - 100) - to_subtract) / 100;
    }
    else if (attribute_val < 201){
        return (227.5 + 1.17 * (attribute_val - 150) - to_subtract) / 100;
    }
    else if (attribute_val < 251){
        return (286 + 1.04 * (attribute_val - 200) - to_subtract) / 100;
    }
    else if (attribute_val < 301){
        return (338 + 0.91 * (attribute_val - 250) - to_subtract) / 100;
    }
    else {  //>300
        return (383.5 + 0.78 * (attribute_val - 300) - to_subtract) / 100;
    };
};

function calcBaseDamage(weaponType, gs) {
    const trueBaseDamage = trueBaseDamages[weaponType];
    return trueBaseDamage * base_scaling(gs);
}

function calcCon(attributeVal) {
    const baseHp = 6789;
    const toSubtract = 125;  // From 5 permanent points in CON

    if (attributeVal < 101){
        return baseHp + 25 * attributeVal - toSubtract;
    } else if (attributeVal < 201){
        return baseHp + 2500 + (attributeVal - 100) * 24 - toSubtract;
    } else if (attributeVal < 301){
        return baseHp + 2500 + (attributeVal - 100) * 24 - toSubtract;
    } else if (attributeVal < 401){
        return baseHp + 2500 + (attributeVal - 100) * 24 - toSubtract;
    } else {
        return baseHp + 2500 + (attributeVal - 100) * 24 - toSubtract;
    };
};

function calcWeaponDamage(charStats, weaponType, baseDamage) {
    let attributes = weaponAttributes[weaponType];
    let levelDamage = ((charStats.level - 1) * 0.025 + 1) * baseDamage
    if (attributes.length == 1) {
        return baseDamage * damageGain(charStats[attributes[0]]) + levelDamage;
    } else if (weaponType === "greatsword") {
        return 0.81 * (baseDamage * damageGain(charStats[attributes[0]])) + 0.8 * (baseDamage * damageGain(charStats[attributes[1]])) + levelDamage;
    } else if (attributes.length == 2) {
        return 0.9 * (baseDamage * damageGain(charStats[attributes[0]])) + 0.65 * (baseDamage * damageGain(charStats[attributes[1]])) + levelDamage;
    }
}

function calcGemDamage(weapon, charStats) {

    // Parse gemType string
    let gemType = "INT"
    if (weapon.gem[3] == "F"){
        gemType = "FOC"
    };

    let gemTier = Number(weapon.gem[1])

    let attributeDamage = calcWeaponDamage(charStats, weapon.type, weapon.baseDamage)
    let gemlessDamage = attributeDamage * (1 - gemTier / 10)
    let levelDamage = ((charStats.level - 1) * 0.025 + 1) * weapon.baseDamage
    let scale = 0;
    let gemDamage = 0;
    
    if (gemType === "FOC") {

        gemDamage = damageGain(charStats.focus) * weapon.baseDamage

        if (gemTier == 2) {
            scale = 1.6
        } else if (gemTier == 3) {
            scale = 1.0668
        } else if (gemTier == 4) {
            scale = 0.8
        } else if (gemTier == 5) {
            scale = 0.64
        };
    } else if (gemType == "INT") {

        gemDamage = damageGain(charStats.intelligence) * weapon.baseDamage

        if (gemTier == 2) {
            scale = 2
        } else if (gemTier == 3) {
            scale = 1.3333
        } else if (gemTier == 4) {
            scale = 1
        } else if (gemTier == 5) {
            scale = 0.8
        };
    };
    
    let scaleDamage = gemDamage * scale + levelDamage

    if (scaleDamage > attributeDamage) {
        gemDamage = (gemTier / 10) * scaleDamage
    } else {
        gemDamage = (gemTier / 10) * attributeDamage
    };

    return [gemlessDamage, gemDamage]
};
