/*jslint browser: true, sloppy: true */
/*global console, data, me */

var attr,
    inventory,
    parents,
    monthyIncomeGalleons = {'wealthy': 100, 'middle class': 50, 'average': 20, 'struggling': 6, 'poor': 2},
    bloodClassMod = {'muggle': 0.05, 'muggle-born': 0.1, 'half-blood': 0, 'pure-blood': -0.05};

Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)];
};

function attVal() {
    return Math.ceil(Math.random() * 15) + Math.ceil(Math.random() * 15) + Math.ceil(Math.random() * 14) + Math.ceil(Math.random() * 15) + 4;
}

function boost(mf, amt) {
    if (localStorage.getItem('gender') === mf) {
        return amt;
    }
    return 0;
}

function zodiac(birthDayOfYear) {
    var adjustedBDay = birthDayOfYear - 80;
    if (adjustedBDay < 0) {
        adjustedBDay = 365 + adjustedBDay;
    }
    return Math.floor(adjustedBDay / 30.42);
}

function generateAttributes() {
    var my = characterData();
    attr = {};
    data.story.atts.forEach(function (att) {
        attr[att] = attVal();
    });

    // Boys are a little bigger and stronger
    attr.PS = attr.PS + boost('M', 5) + boost('F', -5);
    attr.PA = attr.PA + boost('M', 5);
    // Girls are more sympathetic. Or not, but it's only fair if boys get a physical boost
    attr.WS = attr.WS + boost('F', 5);

    // Magic folk are actually affected by the zodiac
    attr[my.zodiac] = attr[my.zodiac] + 3;

    return attr;
}

function siblings() {
    var sibs = 0;
    while (sibs < 6) {
        sibs = Math.ceil(Math.random() * 6) + Math.ceil(Math.random() * 6);
    }
    return sibs - 6;
}

function birthOrder() {
    var numberOfSiblings = siblings();
    localStorage.setItem('numberOfSiblings', numberOfSiblings);
    localStorage.setItem('orderInSiblings', Math.ceil(Math.random() * (numberOfSiblings + 1)));
}

function generateCareer(jobClass, inheritance, MotherOrFather, spouseClass, spouseInheritance) {
    // TODO: shop owners and clerks, what kind of shop? Candy, joke, cauldron, wizarding equipment, tavern, pub, restaurant, ice cream, book, broom, robe, wand, apothecary, tea, pet, museum, quidditch, magical instrument sales and repair, broomstick, music, travel, stationary, second hand items, funeral parlour, wand...
    // security job: bodyguard, security guard, magical law enforcement
    // tour guide, astronomer, potion ingredient hunter,
    // would hobbies be good? Certainly if your spouse makes all the money
    var careers = {
        'wealthy': ['high-level ministry official', 'importer of exotic magical items', 'star quidditch player', 'popular musician', 'treasure hunter', 'popular actor', 'popular author'],
        'middle class': ['mid-level ministry official', 'shop owner', 'successful author', 'robe designer', 'healer', 'emergency healer', 'arithmancer', 'curse breaker', 'mediwizard', 'potioneer', 'metal charmer', 'desk job at Gringotts'],
        'average': ['low-level ministry official', 'quill maker', 'caldron maker', 'book binder', 'broom maker', 'chef', 'herbologist', 'photographer', 'reporter', 'dragon keeper', 'Knight bus driver', 'Knight bus conductor', 'librarian', 'dragonologist', 'owlet trainer', 'owl post office employee', 'magizoologist', 'auror', 'quidditch referee', 'quidditch player'],
        'struggling': ['amatuer actor', 'cook', 'waiter', 'clerk', 'groundskeeper', 'amatuer photographer', 'amatuer musician', 'bartender', 'amatuer author', 'amatuer quidditch player', 'amatuer herbologist', 'amatuer dragonologist', 'amatuer magizoologist'],
        'poor': ['unemployed wizard', 'petty criminal', 'disabled wizard', 'street vendor', 'junk collector', 'street cleaner']
    },
        femaleVersions = {'waiter': 'waitress', 'clerk': 'cashier', 'groundskeeper': 'maid', 'unemployed wizard': 'housewitch', 'disabled wizard': 'disabled witch', 'popular actor': 'popular actress', 'amatuer actor': 'amatuer actress', 'mediwizard': 'mediwitch', 'bartender': 'bar maid', 'petty criminal': 'housewitch'},
        job = careers[jobClass][Math.floor(Math.random() * careers[jobClass].length)],
        rand = Math.random(),
        my = characterData();

    // Add state "unknown"
    // Mothers can't be unknown unless its both parents (baby in a basket)
    if (MotherOrFather === 'Father') {
        if (rand < 0.01) {
            my.father.state = 'currently in Azkaban';
            return '';
        }
        if (rand < 0.03) {
            // TODO: cause of death. Esp important for grandparents
            // Disease, murder, spell gone wrong, bad potion, cursed artifact or trap, died in prison, magical animal attack
            // Grandparents could die uneventfully
            my.father.state = 'deceased';
            return '';
        }
        if (rand < 0.05) {
            my.father.state = 'whereabouts unknown';
            return '';
        }
        if (rand < 0.06) {
            // Bad spell, cursed artifact, trap, bad potion
            my.father.state = 'in St. Mungo\'s long-term care';
            return '';
        }
    } else {
        if (rand < 0.02) {
            my.mother.state = 'deceased';
            return '';
        }
        if (rand < 0.03) {
            my.mother.state = 'whereabouts unknown';
            return '';
        }
        if (rand < 0.04) {
            my.father.state = 'St. Mungo\'s long-term care';
            return '';
        }
        if (femaleVersions[job]) {
            job = femaleVersions[job];
        }
    }

    return job;
}

/*
function removeUnneededJob() {
    // this has serious issues - skip for now
    var totalInheritance = parents.father.inheritance + parents.mother.inheritance,
        fatherIncome = 0,
        motherIncome = 0;
    // make sure they are both alive first
    if (parents.father.state || parents.mother.state) {
        return;
    }

    if (parents.father.career) {
        fatherIncome = monthyIncomeGalleons[parents.father.class];
    }
    if (parents.mother.career) {
        motherIncome = monthyIncomeGalleons[parents.mother.class];
    }
    if (fatherIncome < (motherIncome + totalInheritance) / 10) {
        parents.father.career = '';
    }
    if (motherIncome < (fatherIncome + totalInheritance) / 4) {
        parents.mother.career = '';
    }
}*/

function getClass(blood) {
    var rand = Math.random();
    rand = rand + bloodClassMod[blood];

    if (rand < 0.10) {
        return 'wealthy';
    }
    if (rand < 0.35) {
        return 'middle class';
    }
    if (rand < 0.80) {
        return 'average';
    }
    if (rand < 0.90) {
        return 'struggling';
    }
    return 'poor';
}

function determineBlood() {
    var rnd = Math.random(),
        lineage = {
            self: "pure-blood",
            father: "pure-blood",
            mother: "pure-blood",
            paternalGrandfather: "pure-blood",
            paternalGrandmother: "pure-blood",
            maternalGrandfather: "pure-blood",
            maternalGrandmother: "pure-blood"
        };

    if (rnd < 0.05) {
        lineage.self = "muggle-born";
        lineage.father = "muggle";
        lineage.mother = "muggle";
        lineage.paternalGrandfather = "muggle";
        lineage.paternalGrandmother = "muggle";
        lineage.maternalGrandfather = "muggle";
        lineage.maternalGrandmother = "muggle";
        return lineage;
    }
    if (rnd < 0.0975) {
        lineage.self = "half-blood";
        if (Math.random() > 0.80) {
            lineage.father = "muggle";
        } else {
            lineage.father = "muggle-born";
        }
        lineage.paternalGrandfather = "muggle";
        lineage.paternalGrandmother = "muggle";
        return lineage;
    }
    if (rnd < 0.145) {
        lineage.self = "half-blood";
        if (Math.random() > 0.80) {
            lineage.mother = "muggle";
        } else {
            lineage.mother = "muggle-born";
        }
        lineage.maternalGrandfather = "muggle";
        lineage.maternalGrandmother = "muggle";
        return lineage;
    }
    if (rnd < 0.1475) {
        lineage.self = "half-blood";
        lineage.father = "muggle-born";
        lineage.mother = "muggle-born";
        lineage.paternalGrandfather = "muggle";
        lineage.paternalGrandmother = "muggle";
        lineage.maternalGrandfather = "muggle";
        lineage.maternalGrandmother = "muggle";
        return lineage;
    }
    if (rnd < 0.2425) {
        lineage.father = "half-blood";
        if (Math.random() > 0.50) {
            lineage.paternalGrandfather = "muggle-born";
        } else {
            lineage.paternalGrandmother = "muggle-born";
        }
        return lineage;
    }
    if (rnd < 0.3375) {
        lineage.mother = "half-blood";
        if (Math.random() > 0.50) {
            lineage.maternalGrandfather = "muggle-born";
        } else {
            lineage.maternalGrandmother = "muggle-born";
        }
        return lineage;
    }
    if (rnd < 0.3465) {
        lineage.father = "half-blood";
        lineage.mother = "half-blood";
        if (Math.random() > 0.50) {
            lineage.paternalGrandfather = "muggle-born";
        } else {
            lineage.paternalGrandmother = "muggle-born";
        }
        if (Math.random() > 0.50) {
            lineage.maternalGrandfather = "muggle-born";
        } else {
            lineage.maternalGrandmother = "muggle-born";
        }
    }
    return lineage;
}

function getName(nameType, culture) {
    var len = data.names[culture][nameType].length,
        rnd = Math.floor(Math.random() * len);

    return data.names[culture][nameType][rnd];
}

function generateNames(my) {
    var rnd, eth = "english", names = {
        self: [],
        father: [],
        mother: [],
        paternalGrandfather: [],
        paternalGrandmother: [],
        maternalGrandfather: [],
        maternalGrandmother: []
    };
    if (Math.random() < 0.1) {
        eth = "irish";
    }

    if (my.blood  === 'muggle-born') {
        names.self = [getName(my.gender.adjective, eth), getName('sur', eth), eth];
        names.father = [getName('male', eth), names.self[1], eth];
        names.mother = [getName('female', eth), getName('sur', eth), eth];
        names.paternalGrandfather = [getName('male', eth), names.self[1], eth];
        names.paternalGrandmother = [getName('female', eth), getName('sur', eth), eth];
        names.maternalGrandfather = [getName('male', eth), names.mother[1], eth];
        names.maternalGrandmother = [getName('female', eth), getName('sur', eth), eth];
        return names;
    }

    rnd = Math.random();
    names.self = [getName(my.gender.adjective, "magic"), getName('sur', "magic"), "magic"];
    names.father = [getName('male', "magic"), names.self[1], "magic"];
    names.mother = [getName('female', "magic"), getName('sur', "magic"), "magic"];
    names.paternalGrandfather = [getName('male', "magic"), names.father[1], "magic"];
    names.paternalGrandmother = [getName('female', "magic"), getName('sur', "magic"), "magic"];
    names.maternalGrandfather = [getName('male', "magic"), names.mother[1], "magic"];
    names.maternalGrandmother = [getName('female', "magic"), getName('sur', "magic"), "magic"];

    if (my.father.blood === 'pure-blood' && my.mother.blood === 'pure-blood') {
        // Immigrant
        if (rnd < 0.08) {
            eth = "french";
            if (rnd < 0.02) {
                eth = "chinese";
            }
            if (rnd >= 0.04 && rnd < 0.02) {
                eth = "indian";
            }
            if (rnd >= 0.06 && rnd < 0.04) {
                eth = "russian";
            }

            rnd = Math.random();
            if (rnd < 0.50) {
                // both parents are immigrants
                names.father = [getName('male', eth), getName('sur', eth), eth];
                names.mother = [getName('female', eth), getName('sur', eth), eth];
                names.self = [getName(my.gender.adjective, eth), names.father[1], eth];
                names.paternalGrandfather = [getName('male', eth), names.father[1], eth];
                names.paternalGrandmother = [getName('female', eth), getName('sur', eth), eth];
                names.maternalGrandfather = [getName('male', eth), names.mother[1], eth];
                names.maternalGrandmother = [getName('female', eth), getName('sur', eth), eth];
            }
            if (rnd >= 0.50 && rnd < 0.75) {
                // father only
                names.father = [getName('male', eth), getName('sur', eth), eth];
                names.self[1] = names.father[1];
                names.self[2] = eth;
                names.paternalGrandfather = [getName('male', eth), names.father[1], eth];
                names.paternalGrandmother = [getName('female', eth), getName('sur', eth), eth];
            }
            if (rnd >= 0.75) {
                // mother only
                names.mother = [getName('female', eth), getName('sur', eth), eth];
                names.self[0] = getName(my.gender.adjective, eth);
                names.self[2] = eth;
                names.maternalGrandfather = [getName('male', eth), names.mother[1], eth];
                names.maternalGrandmother = [getName('female', eth), getName('sur', eth), eth];
            }
        }
        return names;
    }

    if (my.father.blood === 'muggle-born' || my.father.blood === 'muggle') {
        names.father = [getName('male', eth), getName('sur', eth), eth];
        names.paternalGrandfather = [getName('male', eth), names.father[1], eth];
        names.paternalGrandmother = [getName('female', eth), getName('sur', eth), eth];
    }

    if (my.father.blood === 'half-blood') {
        if (Math.random() > 0.5) {
            names.father = [getName('male', "magic"), getName('sur', eth), "magic"];
            names.paternalGrandfather = [getName('male', eth), names.father[1], eth];
        } else {
            names.father = [getName('male', eth), getName('sur', "magic"), "magic"];
            names.paternalGrandmother = [getName('female', eth), getName('sur', eth), eth];
        }
    }
    if (my.mother.blood === 'muggle-born' || my.mother.blood === 'muggle') {
        names.mother = [getName('female', eth), getName('sur', eth), eth];
        names.maternalGrandfather = [getName('male', eth), names.mother[1], eth];
        names.maternalGrandmother = [getName('female', eth), getName('sur', eth), eth];
    }

    if (my.mother.blood === 'half-blood') {
        if (Math.random() > 0.5) {
            names.mother = [getName('female', "magic"), getName('sur', eth), "magic"];
            names.maternalGrandfather = [getName('male', eth), names.father[1], eth];
        } else {
            names.mother = [getName('female', eth), getName('sur', "magic"), "magic"];
            names.maternalGrandmother = [getName('female', eth), getName('sur', eth), eth];
        }
    }

    return names;
}

function generateInheritance(blood) {
    var rawInheritance = 0, rnd = Math.random();
    if (blood === 'pure-blood') {// && Math.random() < 0.25) {
        rawInheritance = rnd * 80 - 60;
    }
    if (blood === 'Sacred 28' && Math.random() < 0.5) {
        rawInheritance = rnd * 160 - 80;
    }
    if (rawInheritance >= 0.1) {
        return rawInheritance.toFixed();
    }
    return 0;
}

function generateParentInfo() {
    /*var my = characterData();
    if (localStorage.getItem('bloodStatus') !== 'muggle-born') {
        my.father.social_class = getClass(my.father.blood);
        my.mother.social_class = getClass(my.mother.blood);
        my.father.inheritance = generateInheritance(my.father.blood);
        my.mother.inheritance = generateInheritance(my.mother.blood);
        my.father.career = generateCareer(my.father.social_class, my.father.inheritance, 'Father', my.mother.social_class, my.mother.inheritance);
        my.mother.career = generateCareer(my.mother.social_class, my.mother.inheritance, 'Mother', my.father.social_class, my.father.inheritance);
    } else {
        my.father.social_class = getClass('muggle');
        my.mother.social_class = getClass('muggle');
    }*/
}

function allowance(familyWealth) {
    var expenses = 20.0 + familyWealth / 4,
        discretionary = familyWealth - expenses,
        monthlyAllowance = 0,
        numberOfSiblings = +localStorage.getItem('numberOfSiblings'),
        purse = 0;

    if (discretionary < 0.004) {
        discretionary = 1.9;
    }
    monthlyAllowance = Math.ceil(discretionary * 20 / (0.23 * numberOfSiblings + 1));

    if (familyWealth >= 50) {
        purse = 35293 + monthlyAllowance;
    }
    if (familyWealth < 50 && familyWealth > 20) {
        purse = 23374 + monthlyAllowance + (familyWealth - 20) * 397;
    }
    if (familyWealth <= 20) {
        purse = 23374 + monthlyAllowance;
    }
    localStorage.setItem('purse', purse);
    localStorage.setItem('monthlyAllowance', monthlyAllowance);
}

function calculateFamilyWealth() {
    var familyWealth = 0, my = characterData();

    if (my.father.career && !my.father.state) {
        familyWealth = monthyIncomeGalleons[my.father.socialClass];
    }
    if (my.mother.career && !my.mother.state) {
        familyWealth = familyWealth + monthyIncomeGalleons[my.mother.socialClass];
    }
    if (localStorage.getItem('bloodStatus') === 'muggle-born') {
        familyWealth = (monthyIncomeGalleons[my.father.socialClass] + monthyIncomeGalleons[my.mother.socialClass]) / 2;
    }
    familyWealth = familyWealth + +my.father.inheritance + +my.mother.inheritance;

    localStorage.setItem('familyWealth', familyWealth);
    allowance(familyWealth);
}

function characterData() {
    var localData = localStorage.getItem("character");
    if (!localData) {
        return false;
    }
    return JSON.parse(localData);
}

function createCharacter() {
    var character = {}, gender = ["male", "female"].random(), blood, names, bDate;//, sunSigns, monthNames;
    localStorage.clear();

    character.gender = {
        adjective: gender,
        noun: (gender === "male") ? "boy" : "girl",
        pronoun: {
            first: (gender === "male") ? "he" : "she",
            third: (gender === "male") ? "him" : "her",
            possessive: (gender === "male") ? "his" : "her"
        },
        magic: (gender === "male") ? "wizard" : "witch"
    };

    character.inventory = {
        holding: [],
        "pocket [capacity: 4]": [],
        "bag [capacity: 20]": [],
        "trunk [capacity: 100]": []
    };

    character.father = {
        blood: "pure-blood",
        ethnicity: "",
        givenName: "",
        surname: "",
        career: "",
        inheritance: 0,
        socialClass: "",
        state: "",
        father: {
            blood: "pure-blood",
            ethnicity: "",
            givenName: "",
            surname: "",
            career: "",
            inheritance: 0,
            socialClass: "",
            state: ""
        },
        mother: {
            blood: "pure-blood",
            ethnicity: "",
            givenName: "",
            surname: "",
            career: "",
            inheritance: 0,
            socialClass: "",
            state: ""
        }
    };
    character.mother = {
        blood: "pure-blood",
        ethnicity: "",
        givenName: "",
        surname: "",
        career: "",
        inheritance: 0,
        socialClass: "",
        state: "",
        father: {
            blood: "pure-blood",
            ethnicity: "",
            givenName: "",
            surname: "",
            career: "",
            inheritance: 0,
            socialClass: "",
            state: ""
        },
        mother: {
            blood: "pure-blood",
            ethnicity: "",
            givenName: "",
            surname: "",
            career: "",
            inheritance: 0,
            socialClass: "",
            state: ""
        }
    };

    blood = determineBlood();
    character.blood = blood.self;
    character.father.blood = blood.father;
    character.mother.blood = blood.mother;
    character.father.father.blood = blood.paternalGrandfather;
    character.father.mother.blood = blood.paternalGrandmother;
    character.mother.father.blood = blood.maternalGrandfather;
    character.mother.mother.blood = blood.maternalGrandmother;

    character.birthDayOfYear = Math.floor(Math.random() * 365);
    bDate = new Date(character.birthDayOfYear * 24 * 60 * 60 * 1000);
    character.birthDate = bDate.getDate();
    character.birthMonth = data.story.monthNames[bDate.getMonth()];
    character.zodiac = zodiac(character.birthDayOfYear);
    character.sunSign = data.story.sunSigns[character.zodiac];
    character.age = 11;

    birthOrder();
    character.attr = generateAttributes();
    names = generateNames(character);
    character.givenName = names.self[0];
    character.surname = names.self[1];
    character.ethnicity = names.self[2];

    character.father.givenName = names.father[0];
    character.father.surname = names.father[1];
    character.father.ethnicity = names.father[2];
    character.mother.givenName = names.mother[0];
    character.mother.surname = names.mother[1];
    character.mother.ethnicity = names.mother[2];

    character.father.father.givenName = names.paternalGrandfather[0];
    character.father.father.surname = names.paternalGrandfather[1];
    character.father.father.ethnicity = names.paternalGrandfather[2];
    character.father.mother.givenName = names.paternalGrandmother[0];
    character.father.mother.surname = names.paternalGrandmother[1];
    character.father.mother.ethnicity = names.paternalGrandmother[2];

    character.mother.father.givenName = names.maternalGrandfather[0];
    character.mother.father.surname = names.maternalGrandfather[1];
    character.mother.father.ethnicity = names.maternalGrandfather[2];
    character.mother.mother.givenName = names.maternalGrandmother[0];
    character.mother.mother.surname = names.maternalGrandmother[1];
    character.mother.mother.ethnicity = names.maternalGrandmother[2];

    // after we are done:
    localStorage.setItem("character", JSON.stringify(character));

    generateParentInfo();
    calculateFamilyWealth();
    // removeUnneededJob();
    localStorage.setItem('parents', JSON.stringify(parents));

    /*displayPersonal();
    displayAtt(attr);
    //displayAttrs();
    displayAttrDetail();

    getExceptional('strengths');
    getExceptional('weaknesses');
    if (exceptions.strengths.length) {
        text$('strengths', exceptions.strengths.join(', '));
    } else {
        document.getElementById('sectionStrengths').style.display = 'none';
    }
    if (exceptions.weaknesses.length) {
        text$('weaknesses', exceptions.weaknesses.join(', '));
    } else {
        document.getElementById('sectionWeaknesses').style.display = 'none';
    }

    displayParentInfo();*/
}

/*
if both parents have negative state, change 'family' to 'orphan'
Shouldn't a negative parental status have a negative effect on the number of siblings?
Allow one parent to be a muggle
Fix career removal in disparate wealth marriages - removeUnneededJob() (Maybe add ex- to their career?)
If a character is terrible (0 strengths or > 3 weaknesses maybe) re-roll
*/

/*
Logic!

1. Gender 50% female, 50% male
2. Blood (5% muggle-born, ~10% parent muggle-born, ~20% grandparent muggle-born
3. Birth day
4. # of siblings and birth order
5. Physical/Magical attributes
6. Player and parent names
7. Parent income and inheritance
8. Determine negative parent status
9. Calculate total family wealth
10. If there is an income disparity between parents, the less significant wage earner can quit
*/

/*
Middle names
- Usually 1, somethimes 0 or 2
Grandparents names and blood status
- Make the likelihood of a first or middle name being the same as a first or middle name as a grandparent
Rules for middle names will vary on ethnicity
*/
