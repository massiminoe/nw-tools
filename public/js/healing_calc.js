window.onload = function () {
    let slider1 = document.getElementById("weapon_gs_slider"), gs1 = document.getElementById("weapon_gs");
    let slider2 = document.getElementById("ring_gs_slider"), gs2 = document.getElementById("ring_gs");
    let blessed_check = document.getElementById("blessed_check"), blessed_text=document.getElementById("blessed_text"), blessed_icon=document.getElementById("blessed_icon");
    let sacred_check = document.getElementById("sacred_check"), sacred_text=document.getElementById("sacred_text"), sacred_icon=document.getElementById("sacred_icon");
    let divine_blessing = document.getElementById("divine_blessing"), sacred_protection = document.getElementById('sacred_protection'), mending_protection = document.getElementById('mending_protection');
    let divine = document.getElementById('divine'), in_sg = document.getElementById('in_sg'), disease = document.getElementById('disease');
    let intensify_stacks = document.getElementById("intensify_stacks"), divine_gs = document.getElementById('divine_gs'), disease_value = document.getElementById('disease_value');
    let intensify = document.getElementById("intensify"), bend_light = document.getElementById("bend_light"), protectors_strength = document.getElementById("protectors_strength");
    let sg_blessed_check = document.getElementById("sg_blessed_check"), lights_embrace_buffs = document.getElementById("lights_embrace_buffs");
    let divine_embrace_outgoing = document.getElementById("divine_embrace_outgoing"), sacred_ground_outgoing = document.getElementById("sacred_ground_outgoing"), splash_of_light_outgoing = document.getElementById("splash_of_light_outgoing");
    let orb_of_protection_outgoing = document.getElementById("orb_of_protection_outgoing"), lights_embrace_outgoing = document.getElementById("lights_embrace_outgoing"), beacon_outgoing = document.getElementById("beacon_outgoing");
    let recovery_outgoing = document.getElementById("recovery_outgoing"), light_attack_outgoing = document.getElementById("light_attack_outgoing");
    let char_level = document.getElementById("level"), focus_input = document.getElementById("focus"), equip_load = document.getElementById("equip_load");
    let lifestaff_gem = document.getElementById("lifestaff_gem");

    // Constants
    var true_base_damage = 52;
    // Variables
    var sacred = 0.085, blessed = 0.2, focus=5, level=60, life_staff_gs = 600, armor_bonus = 0, gem_bonus = 0, target_buffs = 0, divine_val = 0.096;
    focus = focus_input.value;
    level = char_level.value;
    life_staff_gs = gs1.value;
    update_armor_bonus();
    update_gem_bonus();
    target_buffs = lights_embrace_buffs.value;
    update_blessed(life_staff_gs);
    update_sacred(gs2.value);
    calc_outgoing();

    function calc_outgoing() {
        var gs_damage = base_scaling(life_staff_gs) * true_base_damage;
        var focus_damage = focus_mod(focus) * gs_damage;
        var level_damage = (1 + (level - 1) * 0.025) * gs_damage;
        var healing_power = level_damage + focus_damage;

        var outgoing_mod = 1;
        var incoming_mod = 1;

        // Outgoing
        outgoing_mod += armor_bonus;
        outgoing_mod += gem_bonus;
        if (blessed_check.checked) {
            outgoing_mod += blessed;
        }
        if (sacred_check.checked) {
            outgoing_mod += sacred;
        }
        if (intensify.checked) {
            outgoing_mod += 0.1 * intensify_stacks.value;
        }
        if (bend_light.checked) {
            outgoing_mod += 0.2;
        }
        if (protectors_strength.checked) {
            //outgoing_mod += 0.1;  // Intended value
            outgoing_mod += 0.2;  // Bugged value, in-game. Last tested 1/5/22
        }
        if (divine_blessing.checked) {
            outgoing_mod += 0.3;
        }
        if (focus >= 150) {
            outgoing_mod += 0.2;
        }
        if (mending_protection.checked) {
            outgoing_mod += 0.23  // 600 GS
        }
        
        // Incoming - capped at 2x
        if (sacred_protection.checked) {
            incoming_mod += 0.05;
        }
        if (divine.checked) {
            incoming_mod += perk_val(0.05, 0.096, divine_gs.value);
        }
        if (in_sg.checked) {
            incoming_mod += 0.5;
        }
        if (disease.checked) {  // Caps at 0.7
            incoming_mod = Math.max(incoming_mod - disease_value.value / 100, 0.7);
        }

        final_healing = healing_power * outgoing_mod * incoming_mod;

        light_attack_outgoing.innerHTML = Math.round(final_healing * 0.16);
        divine_embrace_outgoing.innerHTML = Math.round(final_healing * 1.2);
        if (sg_blessed_check.checked && !in_sg.checked) {
            sacred_ground_outgoing.innerHTML = Math.round(final_healing * 0.16 / incoming_mod * (incoming_mod + 0.5));
        } else {
            sacred_ground_outgoing.innerHTML = Math.round(final_healing * 0.16);
        }
        splash_of_light_outgoing.innerHTML = Math.round(final_healing * 0.6);
        orb_of_protection_outgoing.innerHTML = Math.round(final_healing * 0.08);
        recovery_outgoing.innerHTML = Math.round(final_healing * 0.06);
        lights_embrace_outgoing.innerHTML = Math.round((final_healing + healing_power * 0.3 * target_buffs) * 0.8);
        beacon_outgoing.innerHTML = Math.round(final_healing * 0.16);
    }

    // Life Staff
    function update_gem_bonus() {
        var gem = lifestaff_gem.value;
        if (gem === "none_gem") {
            gem_bonus = 0;
        } else if (gem === "diamond_t2") {
            gem_bonus = 0.06;
        } else if (gem === "diamond_t3") {
            gem_bonus = 0.09;
        } else if (gem === "diamond_t4") {
            gem_bonus = 0.12;
        } else if (gem === "diamond_t5") {
            gem_bonus = 0.15;
        }
    }

    lifestaff_gem.addEventListener('change', function () {
        update_gem_bonus();
        calc_outgoing();
    }, false);

    blessed_check.addEventListener('change', function() {
        if (this.checked) {
            blessed_text.style.color = "#f8f9fa";
            blessed_icon.style.opacity = 1;
        } else {
            blessed_text.style.color = "gray";
            blessed_icon.style.opacity = 0.5;
        }
        calc_outgoing();
    });

    sg_blessed_check.addEventListener('change', function() {
        calc_outgoing();
    });

    slider1.addEventListener('input', function () {
        gs1.value = slider1.value;
        life_staff_gs  = slider1.value;
        update_blessed(slider1.value);
        calc_outgoing();
    }, false);

    lights_embrace_buffs.addEventListener('input', function () {
        target_buffs = lights_embrace_buffs.value;
        calc_outgoing();
    }, false);

    gs1.addEventListener('change', function () {
        if (isNaN(gs1.value)) {
            gs1.value = 500;
        }
        if (gs1.value > 625) {
        gs1.value = 625;
        } else if (gs1.value < 100) {
        gs1.value = 100;
        }
        life_staff_gs = gs1.value;
        update_blessed(gs1.value);
        calc_outgoing();
    }, false);

    function update_blessed(gs) {
        var value = Math.round(perk_val(5, 20, gs));
        blessed = value / 100;
        blessed_text.innerHTML = "Blessed: ".concat(value.toString(), "%");
    }

    // Sacred
    sacred_check.addEventListener('change', function() {
        if (this.checked) {
            sacred_text.style.color = "#f8f9fa";
            sacred_icon.style.opacity = 1;
        } else {
            sacred_text.style.color = "gray";
            sacred_icon.style.opacity = 0.5;
        }
        calc_outgoing();
    });

    slider2.addEventListener('input', function () {
        gs2.value = slider2.value;

        update_sacred(slider2.value);
        calc_outgoing();
    }, false);

    gs2.addEventListener('change', function () {
        if (isNaN(gs2.value)) {
            gs2.value = 500;
        }
        if (gs2.value > 625) {
        gs2.value = 625;
        } else if (gs2.value < 100) {
        gs2.value = 100;
        }

        update_sacred(gs2.value);
        calc_outgoing();
    }, false);

    function update_sacred(gs) {
        var value = Math.round(perk_val(3, 8.5, gs) * 10) / 10;
        sacred = value / 100;
        sacred_text.innerHTML = "Sacred: ".concat(value.toString(), "%");
    }

    function update_armor_bonus() {
        if (equip_load.value === "Heavy") {
            armor_bonus = 0;
        } else if (equip_load.value === "Medium") {
            armor_bonus = 0.15;
        } else if (equip_load.value === "Light") {
            armor_bonus = 0.3;
        }
    }

    // Passives
    bend_light.addEventListener('change', function () {
        calc_outgoing();
    });
    protectors_strength.addEventListener('change', function () {
        calc_outgoing();
    });
    divine_blessing.addEventListener('change', function () {
        calc_outgoing();
    });
    sacred_protection.addEventListener('change', function () {
        calc_outgoing();
    });
    mending_protection.addEventListener('change', function () {
        calc_outgoing();
    });
    divine.addEventListener('change', function () {
        calc_outgoing();
    });
    in_sg.addEventListener('change', function () {
        calc_outgoing();
    });
    disease.addEventListener('change', function () {
        calc_outgoing();
    });
    divine_gs.addEventListener('change', function () {
        calc_outgoing();
    });
    disease_value.addEventListener('change', function () {
        calc_outgoing();
    });
    // Intensify
    intensify_stacks.addEventListener('input', function () {
        if (isNaN(intensify_stacks.value)) {
            intensify_stacks.value = 3;
        }
        if (intensify_stacks.value > 3) {
            intensify_stacks.value = 3;
        }
        if (intensify_stacks.value <= 0) {
            intensify_stacks.value = 0;
        }
        calc_outgoing();
    });
    intensify.addEventListener('change', function () {
        calc_outgoing();
    });

    // Character Info
    char_level.addEventListener('change', function () {
        if (isNaN(char_level.value)) {
            char_level.value = 60;
        }
        if (char_level.value > 60) {
        char_level.value = 60;
        } else if (char_level.value < 1) {
        char_level.value = 1;
        }
        level = char_level.value;
        calc_outgoing();
    })
    focus_input.addEventListener('change', function () {
        if (isNaN(focus_input.value)) {
            focus_input.value = 5;
        }
        if (focus_input.value > 600) {
        focus_input.value = 600;
        } else if (focus_input.value < 5) {
        focus_input.value = 5;
        }
        focus = focus_input.value;
        calc_outgoing();
    })
    equip_load.addEventListener('change', function() {
        update_armor_bonus();
        calc_outgoing();
    });

    // Tippy
    tippy('#sacred_icon', {
        content: "<i>+3-8.5% Outgoing Healing.</i>",
        allowHTML: true,
    });
    tippy('#blessed_icon', {
        content: "<i>+5-20% Healing Bonus.</i>",
        allowHTML: true,
    });
    tippy('#intensify_label', {
        content: "<h4><strong>Intensify</strong></h4>When you hit with a heavy attack, gain a stacking 10% bonus to healing effectiveness for 10s. (Max 3 stacks.)",
        allowHTML: true,
        hideOnClick: false,
    });
    tippy('#protectors_strength_label', {
        content: "<h4><strong>Protector's Strength</strong></h4>If you have a buff heal for 10% more.<p></p><p><i class='bi bi-exclamation-triangle'></i> Protector's Strength is currently bugged and grants a 20% bonus instead. This is reflected in the calculations.</p>",
        allowHTML: true,
        hideOnClick: false,
    });
    tippy('#bend_light_label', {
        content: "<h4><strong>Bend Light</strong></h4>After a dodge, your heals are 20% more effective for 5s.",
        allowHTML: true,
        hideOnClick: false,
    });
    tippy('#sacred_protection_label', {
        content: "<h4><strong>Sacred Protection</strong></h4>While holding a Life Staff, increase the amount of incoming healing to all friendlies in your group by 5%",
        allowHTML: true,
        hideOnClick: false,
    });
    tippy('#mending_protection_label', {
        content: "<h4><strong>Mending Protection</strong></h4>Increase healing power by 23% (600 GS) for 3 seconds if Orb of Protection heals an ally with less than 50% health.",
        allowHTML: true,
        hideOnClick: false,
    });
    tippy('#divine_label', {
        content: "<h4><strong>Divine</strong></h4>You gain 5-9.8% more health from all incoming healing effects.",
        allowHTML: true,
        hideOnClick: false,
    });
    tippy('#in_sg_label', {
        content: "<h4><strong>Anointed</strong></h4><p>While allies are in Sacred Ground, they are healed for 50% more from all healing.</p>",
        allowHTML: true,
        hideOnClick: false,
    });
    tippy('#disease_label', {
        
        content: "<h4><strong>Disease</strong></h4>Reduces incoming healing. Net effect is capped at 30%.",
        allowHTML: true,
        hideOnClick: false,
    });
    tippy('#light_attack', {
        content: "<h4><strong>Blissful Touch</strong></h4><p>Light attacks now heal for 16% weapon damage when passing through an ally.</p>",
        allowHTML: true,
        hideOnClick: false,
    });
    tippy('#divine_embrace', {
        content: "<h4><strong>Divine Embrace</strong></h4><p>Heal target for 120% weapon damage.</p>Costs 25 Mana.<br>Cooldown: 6s",
        allowHTML: true,
        hideOnClick: false,
    });
    tippy('#sacred_ground', {
        content: "<h4><strong>Sacred Ground</strong></h4><p>Create an area on the ground with a 3m radius that lasts for 12s. Allies in the area are healed for 16% weapon damage every second.</p>Costs 15 Mana.<br>Cooldown: 20s",
        allowHTML: true,
        hideOnClick: false,
    });
    tippy('#splash_of_light', {
        content: "<h4><strong>Splash of Light</strong></h4><p>You and all group members within 100m are healed for 60% weapon damage.</p>Costs 15 Mana.<br>Cooldown: 15s",
        allowHTML: true,
        hideOnClick: false,
    });
    tippy('#orb_of_protection', {
        content: "<h4><strong>Orb of Protection</strong></h4><p>Shoot out a light projectile that grants 10% fortify for 20s, heals an ally for 8% of weapon damage, and deals 146% weapon damage when it hits an enemy. (Fortify reduces incoming damages.)</p>Costs 16 Mana.<br>Cooldown: 10s",
        allowHTML: true,
        hideOnClick: false,
    });
    tippy('#lights_embrace', {
        content: "<h4><strong>Light's Embrace</strong></h4><p>Heal target for 80% weapon damage +30% more for each buff on that target.</p>Costs 18 Mana.<br>Cooldown: 4s",
        allowHTML: true,
        hideOnClick: false,
    });
    tippy('#beacon', {
        content: "<h4><strong>Beacon</strong></h4><p>Shoot out a projectile that deals 146% weapon damage to enemies, attaches to its target and heals all nearby allies for 16% weapon damage each second for 10s.</p>Costs 16 Mana.<br>Cooldown: 35s",
        allowHTML: true,
        hideOnClick: false,
    });
    tippy('#sg_blessed', {
        content: "<h4><strong>Anointed</strong></h4><p>While allies are in Sacred Ground, they are healed for 50% more from all healing.</p>",
        allowHTML: true,
    });
    tippy('#gem_type_tooltip', {
        content: "<h4><strong>Diamond (Rally): </strong></h4><p><i>+X% damage and outgoing healing while at full health.</i></p>T2: +6%<br>T3: +9%<br>T4: +12%<br>T5: +15%",
        allowHTML: true,
    });
    tippy('#equip_load_tooltip', {
        content: "<h4><strong>Healing Bonus:</strong></h4>Heavy: None<br>Medium: 15%<br>Light: 30%",
        allowHTML: true,
    });
    tippy('#divine_blessing_label', {
        content: "<h4><strong>Divine Blessing</strong></h4>When you heal an ally below 50% health, they are healed for 30% more.",
        allowHTML: true,
    });
    tippy('#intensify_stacks', {
        content: "Intensify stacks",
        allowHTML: true,
    });
    tippy('#outgoing_tooltip', {
        content: "<strong><i>Outgoing healing</i></strong> is the amount you heal for before considering any buffs/debuffs that the recipient may have (e.g. Divine)",
        allowHTML: true,
    });
}

function perk_val(min, max, gs) {
    return min + (max - min) * ((gs - 100) / 500);
}

function focus_mod(attribute_value) {
    var to_subtract = 5 * 3.25
      
    if (attribute_value < 101) {
    return (3.25 * attribute_value - to_subtract) / 100
    } else if (attribute_value < 151) { 
    return (325 + (attribute_value - 100) * 2.6 - to_subtract) / 100
    } else if (attribute_value < 201) {
    return (455 + (attribute_value - 150) * 2.34 - to_subtract) / 100
    } else if (attribute_value < 251) {
    return (572 + (attribute_value - 200) * 2.08 - to_subtract) / 100
    } else if (attribute_value < 301) {
    return (676 + (attribute_value - 250) * 1.82 - to_subtract) / 100
    } else {
    return (767 + (attribute_value - 300) * 1.56 - to_subtract) / 100
    }
}

function damageGain(attribute_value) {
    var to_subtract = 5 * 1.625
      
    if (attribute_value < 101) {
    return (1.625 * attribute_value - to_subtract) / 100
    } else if (attribute_value < 151) { 
    return (162.5 + (attribute_value - 100) * 1.3 - to_subtract) / 100
    } else if (attribute_value < 201) {
    return (227.5 + (attribute_value - 150) * 1.17 - to_subtract) / 100
    } else if (attribute_value < 251) {
    return (286 + (attribute_value - 200) * 1.04 - to_subtract) / 100
    } else if (attribute_value < 301) {
    return (338 + (attribute_value - 250) * 0.91 - to_subtract) / 100
    } else {
    return (383.5 + (attribute_value - 300) * 0.78 - to_subtract) / 100
    }
}

function base_scaling(gear_score) {
    var stepped_gs = Math.floor(gear_score / 5) * 5
    if (stepped_gs <= 500) {
      return Math.pow(1 + 0.0112, (stepped_gs - 100) / 5)
    } else {
      return 2.43761 * Math.pow(1 + 0.66667*0.0112, (stepped_gs - 500) / 5)
    }
}