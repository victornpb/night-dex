const _ = require('underscore');
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

// 
const Dex = require('./dex');
const unifont = require('./unifont');
const eastereggs = require('./eastereggs');

const dex = new Dex(); //instance

Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))];
}

const app = express();
app.listen(PORT, () => console.log(`Listening on ${PORT}`));


// app.use(express.static(path.join(__dirname, 'public')))
// app.set('views', path.join(__dirname, 'views'))
// app.set('view engine', 'ejs')
// app.get('/', (req, res) => res.render('pages/index'))


const PREFIX = '📟 🄿🄾🄺🄴🄳🄴🅇 ';

app.get('/dex', function (req, res) {
    res.send(PREFIX+'You should type a pokemon name!');
});

app.get('/dex/:q', function (req, res) {
    var q = String(req.params.q);

    let p = dex.find(q)[0];
    if (p) {
        res.send(PREFIX+printPokemon(p));
    }
    else {
        res.send(PREFIX+'Not found: '+q);
    }

});


function printPokemon(p) {

    const ABREV = {
        "hp": "HP",
        "atk": "Attack",
        "def": "Defense",
        "sp_atk": "SpAtk",
        "sp_def": "SpDef",
        "speed": "Speed",
    };

    const id = `#${p.national_id}`;
    const name = `【${p.names.en.toUpperCase()}】`;
    const type = '➤ TYPE: ' + p.types.join(' ');
    const abilities = '⎜🗡 ABILITIES: ' + p.abilities.map(a => a.name + (p.hidden ? '*' : '')).join(' ');
    const base_stats = '⎜📊  BASE: ' + Object.keys(p.base_stats).map(a => `${unifont(ABREV[a], 'sans')}${p.base_stats[a]}`).join(' ');
    const ev_yield = '⎜🔸 EV-YIELD: ' + Object.keys(p.ev_yield).map(a => `${unifont(ABREV[a], 'sans')}${p.ev_yield[a]}`).join(' ');

    const dexGen = Object.keys(p.pokedex_entries).random();
    const quote = `⎜ 🗣 ❝${unifont(p.pokedex_entries[dexGen].en, 'italic')}❞`;

    const out = [
        id,
        name,
        type,
        abilities,
        base_stats,
        ev_yield,
        quote,
    ].join(' ');

    return out;
}