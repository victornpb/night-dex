const path = require('path');
const fs = require('fs');

const regulars = JSON.parse(fs.readFileSync(path.join(__dirname, 'regulars.json')));


module.exports = function (q) {
    return testCredits(q) || testRegulars(q);
};

function testRegulars(str) {
    const q = String(str).toLowerCase();

    const person = Object.keys(regulars).find(k => {
        return k.toLowerCase() === q ? k : null;
    });

    if (person) return `【@${person}】${regulars[person].random()}`;
}



function testCredits(str) {
    const q = String(str).toLowerCase().trim();
    
    if (q.match(/victor(npb)?|about/)) {
        return [
            'Pokedex command is brought to you by @victornpb ',
        ].random();
    }
}