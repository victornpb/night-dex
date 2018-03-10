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
    out += unifont(`🎲RANDOM🎲 `, 'boldscript');
    let p = dex.getRandom();
    out += printPokemon(p, MAXLEN - PREFIX.length - out.length);
    out = limit(PREFIX + out, MAXLEN);

    res.set({
        'content-type': 'text/plain; charset=utf-8'
    });
    res.send(out);
});

app.get('/dex/help', function (req, res) {
    let out = '';
    out += ` ${unifont('HELP', 'squared')}❓`;
    out += ` ➤ "${unifont(CMD, 'sansbold')}" to get a random Pokemon.`;
    out += ` ➤ "${unifont(CMD + ' gengar', 'sansbold')}" or "${unifont(CMD + ' 94', 'sansbold')}" to see the Pokedex info about Gengar.`;
    out += ` ➤ "${unifont(CMD + ' ability overgrow', 'sansbold')}" to search pokemons with that ability.`;
    out += ` ➤ "${unifont(CMD + ' type electric', 'sansbold')}" to search pokemons with that type.`;
    out += ` ➤ "${unifont(CMD + ' about', 'sansbold')}" to see about this command.`;
    out = limit(PREFIX + out, MAXLEN);

    res.set({
        'content-type': 'text/plain; charset=utf-8'
    });
    res.send(out);
});

app.get('/dex/:q', function (req, res) {
    let out = '';
    var q = String(req.params.q).trim();

    const QUERY_BY_TYPE = /^(types?) (.*)/;
    const QUERY_BY_ABILITY = /^(ability|abilities?) (.*)/;
    // const QUERY_EVOLUTION = /^(evolutions?) (.*)/;

    let ee = eastereggs(q);
    if (ee) {
        out = ee;
    }
    else if (QUERY_BY_TYPE.test(q)) {
        let t = QUERY_BY_TYPE.exec(q)[2];

        out += `Searching for pokemons with types that match "${t}": `;
        let results = dex.findByType(t);
        if (results.length)
            out += results.map(p => `#${p.national_id} ${p.names.en}`);
        else
            out += `No results!`;
    }
    else if (QUERY_BY_ABILITY.test(q)) {
        let t = QUERY_BY_ABILITY.exec(q)[2];

        out += `Searching for pokemons with abilities that match "${t}": `;
        let results = dex.findByAbility(t);
        if (results.length)
            out += results.map(p => `#${p.national_id} ${p.names.en}`);
        else
            out += `No results!`;
    }
    else {

        let p = dex.find(q)[0];
        if (p) {
            out = printPokemon(p, MAXLEN - PREFIX.length);
        } else { //not found
            out = unifont(`🕵 This Pokemon is not on the database!`, 'sansbold') + ` (${q})`;
            let suggestions = dex.suggestions(q);
            if (suggestions.length) {
                out += ` 🔮 But you can try ${suggestions.length > 1 ? 'one of these' : 'this one'}: `;
                out += suggestions.map(p => `🔹${CMD} ${p.names.en}`).join(' ');
            }
            else {
                out += ` Use "${CMD} help" to learn how to use this command!`;
            }
        }
    }

    //format me
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

function printPokemon(p, maxlen, options) {

    const ABREV = {
        "hp": "HP",
        "atk": "ATK",
        "def": "DEF",
        "sp_atk": "spATK",
        "sp_def": "spDEF",
        "speed": "SPEED",
    };

    const name = `#${p.national_id}【${p.names.en.toUpperCase()}】`;
    const type = unifont('TYPE:', 'sansbold') + p.types.join('/');
    const abilities = unifont('ABIL:', 'sansbold') + p.abilities.map(a => a.name + (a.hidden ? '*' : '')).join('/');
    const base_stats = unifont('BASE:', 'sansbold') + Object.keys(p.base_stats).map(a => `${unifont(ABREV[a], 'normal')} ${p.base_stats[a]}`).join('|');
    const ev_yield = unifont('EVYIELD:', 'sansbold') + Object.keys(p.ev_yield).map(a => `${unifont(ABREV[a], 'normal')} ${p.ev_yield[a]}`).join('|');
    // const link = `pokemondb.net/pokedex/${p.names.en.toLowerCase()}`;
    // const link = `pokemon.wikia.com/wiki/${p.names.en.toLowerCase()}`;
    const link = `bulbapedia.bulbagarden.net/wiki/${p.names.en.toLowerCase()}`;
    const dexGen = Object.keys(p.pokedex_entries).random();
    const quote = unifont(`🗣"${p.pokedex_entries[dexGen].en}"`, 'sansitalic');

    const evolutionsFrom = p.evolution_from ? `FROM:${p.evolution_from}` : '';
    const evolutionsTo = printEvolution(p);

    const out = [
        name,
        type,
        abilities,
        base_stats,
        evolutionsFrom,
        evolutionsTo,
        // ev_yield,
        quote, // index: 6 (update the quoteIndex variable)
        link,
    ];

    //limit the quote length
    if (maxlen) {
        const quoteIndex = 6;
        var overflow = out.join(' ').length - maxlen;
        if (overflow > 0) out[quoteIndex] = limit(out[quoteIndex], out[quoteIndex].length - overflow);
    }

    return out.join(' ');
}

function printEvolution(p) {
    if (p.evolutions.length) {
        return 'EVOLUTION:' + p.evolutions.map(e => {
            var s = [];
            if (e.to) s.push(`${e.to}`);
            if (e.level) s.push(`Lvl:${e.level}`);
            if (e.conditions) s.push(`Cond:${e.conditions}`);
            if (e.level_up) s.push(`LvlUp:${e.level_up}`);
            if (e.trade) s.push(`Trade:${e.trade}`);
            if (e.happiness) s.push(`Happiness:${e.happiness}`);
            if (e.hold_item) s.push(`HoldItem:${e.hold_item}`);
            if (e.move_learned) s.push(`MoveLearned:${e.move_learned}`);
            return s.join(' ');
        }).join(',');
    }
    return 'EVOLUTION: none';
}







/**
    * formats a string replacing tokens with an argument list, array, objects, and nested objects. 
    * @args Can be a list of arguments, array or object
    * 
    * Usage:
    * "hello {0} world {0}!".format("foo", "bar"); //"hello foo world bar"
    * "hello {0} world {0}!".format(["foo", "bar"]); //"hello foo world bar"
    * "hello {name} world {test}!".format({name: "foo", test: "bar"}); //"hello foo world bar"
    * "hello {obj.name} world {obj.test[0]}!".format({obj:{name: "foo", test: ["bar"]}}); //"hello foo world bar"
    * @author Victor B. https://gist.github.com/victornpb/5a9642b1d5f749695e14
    */
String.prototype.format = function () {
    /**
     * Access a deep value inside a object 
     * Works by passing a path like "foo.bar", also works with nested arrays like "foo[0][1].baz"
     * @author Victor B. https://gist.github.com/victornpb/4c7882c1b9d36292308e
     */
    function getDeepVal(obj, path) {
        var path = path.split(/[\.\[\]]/);
        for (var i = 0, l = path.length; i < l; i++) {
            if (path[i] === "") continue;
            obj = obj[path[i]];
        };
        return obj;
    }

    var str = this.toString();
    if (!arguments.length)
        return str;
    var args = typeof arguments[0],
        args = (("string" == args || "number" == args) ? arguments : arguments[0]);
    str = str.replace(/\{([^\}]+)\}/g, function (m, key) {
        return getDeepVal(args, key);
    });
    return str;
}


var tiny = require('tiny-json-http')

app.get('/hook', function (req, res) {
    console.log('/hook '+JSON.stringify(req.query));

    res.set({
        'content-type': 'text/plain; charset=utf-8'
    });

    if (!String(req.query.discord_webhook).match(/^https:\/\/.*/)) {
        return res.send("You need to specify a discord_webhook!");
    }

    tiny.post({
        url: req.query.discord_webhook,
        data: {
            "username": String(req.query.discord_user || 'Twitch user: {user}').format(req.query),
            "content": String(req.query.discord_msg || 'Please set `discord_msg` parameter!').format(req.query),
            "wait": true,
            // "avatar_url": "https://orig00.deviantart.net/06cf/f/2016/191/e/8/ash_ketchum_render_by_tzblacktd-da9k0wb.png",
        }
    }, (err, data) => {
        if (err) {
            console.error(err);
            res.send("Error sending message to discord! (" + err + ")");
        }
        else {
            var twitchMsg = String(req.query.twitch_reply || '@{user} I got your message!').format(req.query);
            res.send(twitchMsg);
        }
    });
});
