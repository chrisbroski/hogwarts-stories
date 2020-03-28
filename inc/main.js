/*jslint browser: true, sloppy: true, regexp: true */
/*global console, data, createCharacter, characterData */

var activeThing,
    chapterData;

function countHash(txt, symb) {
    var len = txt.length, trim = 6;
    if (!txt) {
        return -1;
    }
    if (len < trim) {
        trim = len;
    }
    txt = txt.slice(0, trim);
    return (txt.match(new RegExp(symb, "g")) || []).length;
}

function aArticle(words) {
    if (!words) {
        return "";
    }
    if (['a', 'e', 'i', 'o', 'u', 'h'].indexOf(words.slice(0, 1)) > -1) {
        return `an ${words}`;
    }
    return `a ${words}`;
}

function blockArray(mdText) {
    var aMd;
    mdText = mdText.replace(/\r\n/g, "\n"); // DOS to Unix
    mdText = mdText.replace(/\r/g, "\n"); // Mac to Unix
    //mdText = mdText.replace(/<!--[\s\S]*?-->/g, ""); // remove HTML comments
    mdText = mdText.replace(/<[\s\S]*?>/g, ""); // remove HTML
    aMd = mdText.split("\n\n");
    return aMd;
}
function cfdToData(md) {
    var aMd = blockArray(md),
        hCount = 0,
        data = {section: {}},
        section;

    aMd.forEach(function (block) {
        // h1 - h6
        if (block.slice(0, 1) === '#') {
            hCount = countHash(block, '#');
            if (hCount === 1) {
                // this can be better
                data.title = block.slice(hCount + 1);
            } else if (hCount === 2) {
                data.subtitle = block.slice(hCount + 1);
            } else {
                section = block.slice(hCount + 1);
                data.section[section] = [];
            }
        } else {
            if (!data.section[section]) {
                data.section[section] = [];
            }
            data.section[section].push(block);
        }
    });
    return data;
}
function chaoticFix(filePath) {
    var xhr = new XMLHttpRequest();
    // get file with ajax
    xhr.open("GET", "chapter/" + filePath + "?" + Math.random(), true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                chapterData = cfdToData(xhr.responseText);
                displayCf(-1);
            } else if (xhr.status === 404) {
                console.log('Not found: ' + xhr.responseURL);
            } else {
                console.log('Error status: ' + xhr.status);
            }
        }
    };
    xhr.send('');
}

function clearPage() {
    document.querySelector("article section header").innerHTML = "";
    document.querySelector("main").innerHTML = "";
}

/* https://stackoverflow.com/a/45322101/468111 */
function resolve(path, data) {
    var value;
    path = path.replace(/[\[\]]/g, "");
    value = path.split('.').reduce(function (prev, curr) {
        return prev ? prev[curr] : null;
    }, data);
    if (!value) {
        return "";
    }
    return value;
}

function cfReplace(template, me) {
    var pattern = /\[\[.+?\]\]/g;
    return template.replace(pattern, function (capture) {
        return resolve(capture, me);
    });
}

function titles() {
    var h4 = document.createElement("h4"),
        h1 = document.createElement("h1"),
        header = document.querySelector("section header");

    // do text substitution on titles too (also on side links)
    h4.textContent = chapterData.title;
    h1.textContent = chapterData.subtitle;

    header.appendChild(h4);
    header.appendChild(h1);
}

function getChapter() {
    var currentChapter = localStorage.getItem("current-chapter"),
        kindIndex = currentChapter.split("|");

    return parseInt(currentChapter, 10);
}

function setAppendix() {
    var appIndex = parseInt(this.getAttribute("data-appendix-index"), 10);
    loadAppendix(appIndex);
}

function displayCf(section) {
    var my = characterData(),
        sections = Object.keys(chapterData.section),
        len = sections.length,
        interactive = document.querySelector("article section fieldset"),
        button = document.createElement("button"),
        theEnd,
        chapterInfo = getChapter();

    interactive.innerHTML = "";
    if (section === -1) {
        clearPage();
        titles();
        section = 0;
    }

    chapterData.section[sections[section]].forEach(function (pText) {
        var p = document.createElement("p");
        p.textContent = cfReplace(pText, {my: my});
        document.querySelector("main").append(p);
    });

    // if final section, button to next chapter
    if (section + 1 >= sections.length) {
        if (chapterInfo + 1 === data.story.chapters.length) {
            theEnd = document.createElement("h2");
            theEnd.textContent = "The End";
            interactive.appendChild(theEnd);
        } else {
            button.textContent = "Next Chapter";
            button.onclick = function () {
                loadChapter(parseInt(localStorage.getItem("current-chapter"), 10) + 1);
            };
            interactive.appendChild(button);
        }
    } else {
        button.textContent = sections[section + 1];
        button.setAttribute("data-section-index", (section + 1).toString(10));
        button.onclick = function () {
            displayCf(this.getAttribute("data-section-index"));
        };
        interactive.appendChild(button);
    }

    document.querySelector("article section fieldset").scrollIntoView();
}

function ordinal(num) {
    var suffixes = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"];
    return num.toString(10) + suffixes[num % 10];
}

function capitalize(text) {
    if (!text) {
        return "";
    }
    return text.slice(0, 1).toUpperCase() + text.slice(1);
}

function displayAttr(atr, val) {
    var attVal = document.getElementById('at' + atr);
    attVal.style.fontWeight = (val > 39) ? "bold" : "normal";
    document.getElementById('attr' + atr).textContent = val;
}

function displayAtt() {
    var my = characterData();

    document.getElementById('attrI').innerHTML = my.attr.IL + my.attr.IS + my.attr.IQ;
    document.getElementById('attrP').innerHTML = my.attr.PS + my.attr.PA + my.attr.PC;
    document.getElementById('attrM').innerHTML = my.attr.ME + my.attr.MR + my.attr.MP;
    document.getElementById('attrW').innerHTML = my.attr.WD + my.attr.WA + my.attr.WS;

    data.story.atts.forEach(function (atr) {
        displayAttr(atr, my.attr[atr]);
    });
}

function loadChapter(newIndex) {
    var chapterIndex = localStorage.getItem("current-chapter"),
        index = parseInt(chapterIndex, 10);

    if (!index || index < 0) {
        chapterIndex = 0;
    }
    if (newIndex) {
        chapterIndex = newIndex;
    }
    localStorage.setItem("current-chapter", chapterIndex);
    chaoticFix(data.story.chapters[chapterIndex].file);
}

function loadAppendix(newIndex) {
    chaoticFix(data.story.appendices[newIndex].file);
}

function events() {
    document.querySelector("header > div").onclick = function () {
        document.querySelector("body > section").style.display = "block";
    };
    document.querySelector("#close-mobile-menu").onclick = function () {
        document.querySelector("body > section").style.display = "none";
    };
    document.querySelector("#new-character").onclick = function () {
        document.querySelector("main").innerHTML = "";
        createCharacter();
        aside();
        loadChapter();
    };
}

function setChapter() {
    localStorage.setItem("current-chapter", this.getAttribute("data-chapter-index"));
    loadChapter();
}

function aside() {
    var ch = document.getElementById("asideChapters");
    // inventory
    // attributes
    displayAtt();
    // chapters
    ch.innerHTML = "";
    data.story.chapters.forEach(function (chapter, index) {
        var p = document.createElement("p");
        p.textContent = chapter.title;
        p.className = "pseudoLink";
        p.setAttribute("data-file", chapter.file);
        p.setAttribute("data-chapter-index", index);
        p.onclick = setChapter;
        ch.appendChild(p);
    });
    data.story.appendices.forEach(function (chapter, index) {
        var p = document.createElement("p");
        p.textContent = chapter.title;
        p.className = "pseudoLink";
        p.setAttribute("data-file", chapter.file);
        p.setAttribute("data-appendix-index", index);
        p.onclick = setAppendix;
        ch.appendChild(p);
    });
}

function init(callback) {
    var xhr = new XMLHttpRequest(),
        menu = document.querySelector("aside");

    xhr.open("GET", "inc/menu.pht?" + Math.random().toFixed(8));
    xhr.onload = function () {
        menu.innerHTML = xhr.response;
        events();
        aside();
        if (!callback) {
            loadChapter();
        } else {
            callback();
        }
    };
    xhr.send();
}
