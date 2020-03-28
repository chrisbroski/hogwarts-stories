/* jshint esversion: 6 */

const yaml = require('js-yaml');
const fs = require('fs');

var data = {};

data.story = yaml.safeLoad(fs.readFileSync('data/story.yml', 'utf8'));
data.careers = yaml.safeLoad(fs.readFileSync('data/careers.yml', 'utf8')).careers;
data.cities = yaml.safeLoad(fs.readFileSync('data/cities.yml', 'utf8')).cities;
console.log(data.careers.wealthy.length  + " wealthy careers");
console.log(data.careers["middle class"].length  + " middle class careers");
console.log(data.careers.average.length  + " average careers");
console.log(data.careers.struggling.length  + " struggling careers");
console.log(data.careers.poor.length  + " poor careers");
console.log(data.cities.wizard.length  + " magic cities");
console.log(data.cities.english.length  + " British cities");
console.log(data.cities.irish.length  + " Irish cities");

data.flavors = yaml.safeLoad(fs.readFileSync('data/flavors.yml', 'utf8')).flavors;
console.log(data.flavors.length  + " flavors");

data.names = yaml.safeLoad(fs.readFileSync('data/names.yml', 'utf8')).names;
console.log(data.names.magic.sur.length  + " magic surnames");
console.log(data.names.magic.male.length  + " magic male names");
console.log(data.names.magic.female.length  + " magic female names");
console.log(data.names.english.sur.length  + " english surnames");
console.log(data.names.english.male.length  + " english male names");
console.log(data.names.english.female.length  + " english female names");
console.log(data.names.irish.sur.length  + " irish surnames");
console.log(data.names.irish.male.length  + " irish male names");
console.log(data.names.irish.female.length  + " irish female names");
console.log(data.names.french.sur.length  + " french surnames");
console.log(data.names.french.male.length  + " french male names");
console.log(data.names.french.female.length  + " french female names");
console.log(data.names.chinese.sur.length  + " chinese surnames");
console.log(data.names.chinese.male.length  + " chinese male names");
console.log(data.names.chinese.female.length  + " chinese female names");
console.log(data.names.indian.sur.length  + " indian surnames");
console.log(data.names.indian.male.length  + " indian male names");
console.log(data.names.indian.female.length  + " indian female names");
console.log(data.names.russian.sur.length  + " russian surnames");
console.log(data.names.russian.male.length  + " russian male names");
console.log(data.names.russian.female.length  + " russian female names");

fs.writeFile('data/data.json', JSON.stringify(data, null, "  "), function (err) {
    if (err) {
        return console.log(err);
    }
});
