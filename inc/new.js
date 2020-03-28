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

function socialClass(monthlyIncome) {
    // Should probably take into account family sizesa as well
    if (monthlyIncome >= 100) {
        return 'wealthy';
    }
    if (monthlyIncome >= 60) {
        return 'middle class';
    }
    if (monthlyIncome >= 30) {
        return 'average';
    }
    if (monthlyIncome >= 12) {
        return 'struggling';
    }
    return 'poor';
}

function boxMuller() {
    var x = 0, y = 0, rds, c;

    do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        rds = x * x + y * y;
    }
    while (rds == 0 || rds > 1);

    c = Math.sqrt(-2 * Math.log(rds) / rds);
    return [x * c, y * c];
}

function attVal() {
    // return Math.ceil(Math.random() * 15) + Math.ceil(Math.random() * 15) + Math.ceil(Math.random() * 14) + Math.ceil(Math.random() * 15) + 4;
    return Math.round(boxMuller()[0] * 6.5 + 35.5);
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

function generateAttributes(zodiac) {
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
    attr[data.story.atts[zodiac]] = attr[data.story.atts[zodiac]] + 3;

    return attr;
}

function numberOfSiblings() {
    // https://fivethirtyeight.com/features/how-long-most-parents-wait-between-children/
    var sibs = Math.floor(boxMuller()[0] * 2 + 3);
    if (sibs < 0) {
        sibs = 0;
    }
    return sibs;
}

function createSibling(gender, givenName, daysDifferent) {
    return {
        "gender": gender,
        "givenName": givenName,
        //"age": age,
        //"birthDayOfYear": birthDayOfYear
        "daysDiff": daysDifferent
    };
}

function createSiblings(birthDate, mothersEth) {
    var numberOfSibs = numberOfSiblings();
    var siblings = [];
    var ii;

    localStorage.setItem('numberOfSiblings', numberOfSibs);
    var birthOrder = Math.ceil(Math.random() * numberOfSibs);
    localStorage.setItem('orderInSiblings', birthOrder);
    var youngerSiblings = numberOfSibs - birthOrder + 1;
    var olderSiblings = numberOfSibs - youngerSiblings;
    if (youngerSiblings < 1) {
        youngerSiblings = 0;
    }
    var gender, age, givenName, daysDifferent;
    // Wait what about twins? about 3% maybe?

    for (ii = 0; ii < youngerSiblings; ii += 1) {
        gender = ['male', 'female'].random();
        givenName = getName(gender, mothersEth);
        siblings.push(createSibling(gender, givenName, -1));
    }

    for (ii = 0; ii < olderSiblings; ii += 1) {
        gender = ['male', 'female'].random();
        givenName = getName(gender, mothersEth);
        siblings.push(createSibling(gender, givenName, 1));
    }

    return siblings;
}

function findState(MotherOrFather) {
    var rand = Math.random();

    // Add state "unknown"
    // Mothers can't be unknown unless its both parents (baby in a basket)
    if (MotherOrFather === 'Mother') {
        if (rand < 0.02) {
            return 'deceased';
        }
        if (rand < 0.03) {
            return 'whereabouts unknown';
        }
        if (rand < 0.04) {
            return 'St. Mungo\'s long-term care';
        }
    } else {
        if (rand < 0.01) {
            return 'currently in Azkaban';
        }
        if (rand < 0.03) {
            // TODO: cause of death. Esp important for grandparents
            // Disease, murder, spell gone wrong, bad potion, cursed artifact or trap, died in prison, magical animal attack
            // Grandparents could die uneventfully
            return 'deceased';
        }
        if (rand < 0.05) {
            return 'whereabouts unknown';
        }
        if (rand < 0.06) {
            // Bad spell, cursed artifact, trap, bad potion
            return 'in St. Mungo\'s long-term care';
        }
    }
    return "";
}

function generateCareer(jobClass, inheritance, MotherOrFather, spouseClass, spouseInheritance) {
    /*
    Jobs in the wizarding world are typically either public sector or shops - running them and making the things that they sell.
    */
    var job = data.careers[jobClass].random();

    if (MotherOrFather === 'Mother') {
        if (data.careers.feminized[job]) {
            job = data.careers.feminized[job];
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
    // What about muggle (0.02) and squib (0.01) parents?
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
    // Is this necessary?
    // if (rnd < 0.1475) {
    //     lineage.self = "half-blood";
    //     lineage.father = "muggle-born";
    //     lineage.mother = "muggle-born";
    //     lineage.paternalGrandfather = "muggle";
    //     lineage.paternalGrandmother = "muggle";
    //     lineage.maternalGrandfather = "muggle";
    //     lineage.maternalGrandmother = "muggle";
    //     return lineage;
    // }
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
    // This is weird too
    // if (rnd < 0.3465) {
    //     lineage.father = "half-blood";
    //     lineage.mother = "half-blood";
    //     if (Math.random() > 0.50) {
    //         lineage.paternalGrandfather = "muggle-born";
    //     } else {
    //         lineage.paternalGrandmother = "muggle-born";
    //     }
    //     if (Math.random() > 0.50) {
    //         lineage.maternalGrandfather = "muggle-born";
    //     } else {
    //         lineage.maternalGrandmother = "muggle-born";
    //     }
    // }
    return lineage;
}

function getName(nameType, culture) {
    var len = data.names[culture][nameType].length,
        rnd = Math.floor(Math.random() * len);

    return data.names[culture][nameType][rnd];
}

function mixedFamily(my, ethnicity) {
    var rnd = Math.random();
    if (rnd < 3) {
        my.father.father.ethnicity = ethnicity;
    } else if (rnd < 6) {
        my.father.mother.ethnicity = ethnicity;
    } else if (rnd < 9) {
        my.mother.father.ethnicity = ethnicity;
    } else if (rnd < 12) {
        my.mother.mother.ethnicity = ethnicity;
    } else if (rnd < 22) {
        my.father.ethnicity = ethnicity;
        my.father.father.ethnicity = ethnicity;
        my.father.mother.ethnicity = ethnicity;
    } else if (rnd < 32) {
        my.mother.ethnicity = ethnicity;
        my.mother.father.ethnicity = ethnicity;
        my.mother.mother.ethnicity = ethnicity;
    } else {
        my.ethnicity = ethnicity;
        my.father.ethnicity = ethnicity;
        my.mother.ethnicity = ethnicity;
        my.father.father.ethnicity = ethnicity;
        my.father.mother.ethnicity = ethnicity;
        my.mother.father.ethnicity = ethnicity;
        my.mother.mother.ethnicity = ethnicity;
    }
}

function generateEthnicity(my) {
    var rnd = Math.random();

    my.ethnicity = "magic";
    my.father.ethnicity = "magic";
    my.mother.ethnicity = "magic";
    my.father.father.ethnicity = "magic";
    my.father.mother.ethnicity = "magic";
    my.mother.father.ethnicity = "magic";
    my.mother.mother.ethnicity = "magic";

    if (my.blood === 'muggle-born') {
        my.ethnicity = "english";
        my.father.ethnicity = "english";
        my.mother.ethnicity = "english";
        my.father.father.ethnicity = "english";
        my.father.mother.ethnicity = "english";
        my.mother.father.ethnicity = "english";
        my.mother.mother.ethnicity = "english";

        if (rnd > 0.90) {
            mixedFamily(my, 'irish');
        }
        return;
    }

    if (my.blood === 'half-blood') {
        if (my.father.blood === 'muggle' || my.father.blood === 'muggle-born') {
            my.father.ethnicity = 'english';
            my.father.father.ethnicity = 'english';
            my.father.mother.ethnicity = 'english';

            if (rnd > 0.90) {
                my.father.ethnicity = 'irish';
                my.father.father.ethnicity = 'irish';
                my.father.mother.ethnicity = 'irish';
            }
        }
        if (my.mother.blood === 'muggle' || my.mother.blood === 'muggle-born') {
            my.mother.ethnicity = 'english';
            my.mother.father.ethnicity = 'english';
            my.mother.mother.ethnicity = 'english';

            if (rnd > 0.80) {
                my.mother.ethnicity = 'irish';
                my.mother.father.ethnicity = 'irish';
                my.mother.mother.ethnicity = 'irish';
            }
        }
        return;
    }
    if (my.father.blood === 'half-blood') {
        rnd = Math.random();
        if (my.father.father.blood === 'muggle' || my.father.father.blood === 'muggle-born') {
            my.father.father.ethnicity = 'english';
            if (rnd > 0.90) {
                my.father.father.ethnicity = 'irish';
            }
        }
        if (my.father.mother.blood === 'muggle' || my.father.mother.blood === 'muggle-born') {
            my.father.mother.ethnicity = 'english';
            if (rnd > 0.90) {
                my.father.mother.ethnicity = 'irish';
            }
        }
        return;
    }
    if (my.mother.blood === 'half-blood') {
        rnd = Math.random();
        if (my.mother.father.blood === 'muggle' || my.mother.father.blood === 'muggle-born') {
            my.mother.father.ethnicity = 'english';
            if (rnd > 0.90) {
                my.mother.father.ethnicity = 'irish';
            }
        }
        if (my.mother.mother.blood === 'muggle' || my.mother.mother.blood === 'muggle-born') {
            my.mother.mother.ethnicity = 'english';
            if (rnd > 0.90) {
                my.mother.mother.ethnicity = 'irish';
            }
        }
        return;
    }

    // Magic is the default
    my.ethnicity = "magic";
    my.father.ethnicity = "magic";
    my.mother.ethnicity = "magic";
    my.father.father.ethnicity = "magic";
    my.father.mother.ethnicity = "magic";
    my.mother.father.ethnicity = "magic";
    my.mother.mother.ethnicity = "magic";

    if (rnd < 0.02) {
        mixedFamily(my, 'french');
    } else if (rnd < 0.04) {
        mixedFamily(my, 'chinese');
    } else if (rnd < 0.06) {
        mixedFamily(my, 'indian');
    } else if (rnd < 0.08) {
        mixedFamily(my, 'russian');
    }
}

function generateNames(my) {
    my.father.father.givenName = getName('male', my.father.father.ethnicity);
    my.father.father.surname = getName('sur', my.father.father.ethnicity);

    my.father.mother.givenName = getName('female', my.father.mother.ethnicity);
    my.father.mother.surname = getName('sur', my.father.mother.ethnicity);

    my.mother.father.givenName = getName('male', my.mother.father.ethnicity);
    my.mother.father.surname = getName('sur', my.mother.father.ethnicity);

    my.mother.mother.givenName = getName('female', my.mother.mother.ethnicity);
    my.mother.mother.surname = getName('sur', my.mother.mother.ethnicity);

    my.father.givenName = getName('male', my.father.mother.ethnicity);
    my.father.surname = my.father.father.surname;

    my.mother.givenName = getName('female', my.mother.mother.ethnicity);
    my.mother.surname = my.mother.father.surname;

    my.givenName = getName(my.gender.adjective, my.mother.ethnicity);
    my.surname = my.father.surname;
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
    // var my = characterData();
    // if (localStorage.getItem('bloodStatus') !== 'muggle-born') {
    //     my.father.social_class = getClass(my.father.blood);
    //     my.mother.social_class = getClass(my.mother.blood);
    //     my.father.inheritance = generateInheritance(my.father.blood);
    //     my.mother.inheritance = generateInheritance(my.mother.blood);
    //     my.father.career = generateCareer(my.father.social_class, my.father.inheritance, 'Father', my.mother.social_class, my.mother.inheritance);
    //     my.mother.career = generateCareer(my.mother.social_class, my.mother.inheritance, 'Mother', my.father.social_class, my.father.inheritance);
    // } else {
    //     my.father.social_class = getClass('muggle');
    //     my.mother.social_class = getClass('muggle');
    // }
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

function calculateFamilyWealth(character) {
    var familyWealth = 0;

    if (character.father.career && !character.father.state) {
        familyWealth = monthyIncomeGalleons[character.father.socialClass];
    }
    if (character.mother.career && !character.mother.state) {
        familyWealth = familyWealth + monthyIncomeGalleons[character.mother.socialClass];
    }
    if (character.blood === 'muggle-born') {
        familyWealth = (monthyIncomeGalleons[character.father.socialClass] + monthyIncomeGalleons[character.mother.socialClass]) / 2;
    }
    return familyWealth + parseInt(character.father.inheritance, 10) + parseInt(character.mother.inheritance, 10);
}

function characterData() {
    var localData = localStorage.getItem("character");
    if (!localData) {
        return false;
    }
    return JSON.parse(localData);
}

function createCharacter() {
    var character = {}, gender = ["male", "female"].random(), blood, names, bDate, cityData, rand;
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
    if (character.birthDayOfYear > 235) { // Whenish you get your letter (mid July)
        character.age = 10;
    }

    character.attr = generateAttributes(character.zodiac);
    generateEthnicity(character);
    generateNames(character);

    character.siblings = createSiblings(character.birthDayOfYear, character.mother.ethnicity);

    // generateParentInfo();
    if (character.blood !== 'muggle-born') {
        character.father.socialClass = getClass(character.father.blood);
        character.mother.socialClass = getClass(character.mother.blood);
        character.father.inheritance = generateInheritance(character.father.blood);
        character.mother.inheritance = generateInheritance(character.mother.blood);
        character.father.state = findState('Father');
        if (!character.father.state) {
            character.father.career = generateCareer(character.father.socialClass, character.father.inheritance, 'Father', character.mother.socialClass, character.mother.inheritance);
        }
        if (!character.father.state) {
            character.mother.state = findState('Mother');
        }
        if (!character.mother.state) {
            character.mother.career = generateCareer(character.mother.socialClass, character.mother.inheritance, 'Mother', character.father.socialClass, character.father.inheritance);
        }
    } else {
        character.father.socialClass = getClass('muggle');
        character.mother.socialClass = getClass('muggle');
    }

    // after we are done:
    character.householdIncome = calculateFamilyWealth(character);
    character.socialClass = socialClass(character.householdIncome);

    character.home = {};
    rand = Math.random();
    if (character.ethnicity === "english") {
        cityData = data.cities.english.random();
    } else if (character.ethnicity === "irish") {
        cityData = data.cities.irish.random();
    } else {
        if (rand > 0.60) {
            cityData = data.cities.wizard.random();
        } else if (rand > 0.55) {
            cityData = data.cities.irish.random();
        } else {
            cityData = data.cities.english.random();
        }
    }
    character.home.city = Object.keys(cityData)[0];
    character.home.incity = cityData[Object.keys(cityData)[0]].areas.random();

    localStorage.setItem("character", JSON.stringify(character));
    // calculateFamilyWealth();
    // removeUnneededJob();
    // localStorage.setItem('parents', JSON.stringify(parents));

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
