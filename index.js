const _ = require('underscore');
const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 5000;

// Pokedex imports
const Dex = require('./dex');
const unifont = require('./unifont');
const eastereggs = require('./eastereggs');


Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))];
};

const app = express();
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

// app.use(express.static(path.join(__dirname, 'public')))
// app.set('views', path.join(__dirname, 'views'))
// app.set('view engine', 'ejs')
// app.get('/', (req, res) => res.render('pages/index'))

const dex = new Dex(); //instance

const CMD = '!dex';
const PREFIX = unifont('📟 DEX ', 'squaredneg');
const MAXLEN = 400;

app.get('/dex', function (req, res) {
    let out = "";
    // out += `Instruction: ${unifont(CMD + ' help', 'sansbold')}. `;
    out += unifont(`🎲🎲 RANDOM 🎲🎲`, 'boldscript');
    let p = dex.getRandom();
    out += printPokemon(p);

    out = limit(PREFIX + out, MAXLEN);

    res.set({
        'content-type': 'text/plain; charset=utf-8'
    });
    res.send(out);
});

app.get('/dex/help', function (req, res) {
    let out = '';
    out += `${unifont('HELP', 'squared')}❓`;
    out += ` ➤ ${unifont(CMD, 'sansbold')} to get a random Pokemon.`;
    out += ` ➤ ${unifont(CMD + ' gengar', 'sansbold')} or ${unifont(CMD + ' 94', 'sansbold')} to see the Pokedex info about Gengar.`;
    out += ` ➤ ${unifont(CMD + ' about', 'sansbold')} to see about this command.`;

    out = lmit(PREFIX + out, MAXLEN);

    res.set({
        'content-type': 'text/plain; charset=utf-8'
    });
    res.send(out);
});

app.get('/dex/:q', function (req, res) {
    let out;
    var q = String(req.params.q).trim();

    let ee = eastereggs(q);
    if (ee) {
        out = ee;
    } else {

        let p = dex.find(q)[0];
        if (p) {
            out = printPokemon(p);
        } else { //not found
            out = unifont(`🕵 This Pokemon is not on the database!`, 'sansbold') + ` (${q})`;
            let suggestions = dex.suggestions(q);
            if (suggestions.length) {
                out += ` 🔮 But you can try ${suggestions.length > 1 ? 'one of these' : 'this one'}: `;
                out += suggestions.map(p => `🔹${CMD} ${p.names.en}`).join(' ');
            }
        }
    }

    if (out.indexOf('/me') === 0) {
        out = '/me ' + PREFIX + out.substring(3);
    }
    else {
        out = PREFIX + out;
    }
        
    out = limit(out, MAXLEN);

    res.set({
        'content-type': 'text/plain; charset=utf-8'
    });
    res.send(out);

});


function limit(str, max) {
    const ellipisis = '…'
    if (str.length > max) {
        return str.substring(0, max - ellipisis.length) + ellipisis;
    }
    return str;
}


function printPokemon(p) {

    const ABREV = {
        "hp": "HP",
        "atk": "ATK",
        "def": "DEF",
        "sp_atk": "spATK",
        "sp_def": "spDEF",
        "speed": "SPEED",
    };

    const name = `【#${p.national_id} ${p.names.en.toUpperCase()}】`;
    const type = unifont('🔷TYPE:', 'bold') + p.types.join(' ');
    const abilities = unifont('🎓ABILITIES:', 'bold') + p.abilities.map(a => a.name + (p.hidden ? '*' : '')).join(', ');
    const base_stats = unifont('📊 BASE:', 'bold') + Object.keys(p.base_stats).map(a => `${unifont(ABREV[a], 'normal')}${p.base_stats[a]}`).join('|');
    const ev_yield = unifont('🔸EVYIELD:', 'bold') + Object.keys(p.ev_yield).map(a => `${unifont(ABREV[a], 'normal')}${p.ev_yield[a]}`).join('|');
    const link = `pokemondb.net/pokedex/${p.names.en}`;
    const dexGen = Object.keys(p.pokedex_entries).random();
    const quote = unifont(`🗣‟${p.pokedex_entries[dexGen].en}„`, 'sansitalic');

    const out = [
        name,
        type,
        abilities,
        base_stats,
        // ev_yield,
        quote, // index: 4 (update the quoteIndex variable)
        link,
    ];

    //limit the quote length
    const quoteIndex = 4;
    var overflow = PREFIX.length + out.join(' ').length - MAXLEN;
    if (overflow > 0) out[quoteIndex] = limit(out[quoteIndex], out[quoteIndex].length - overflow);


    return out.join(' ');
}