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
const PREFIX = unifont('📟 ', 'squaredneg');
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
    if (q.match(/^!\w+ /)) q = q.replace(/^!\w+ /, ''); // remove !dex prefix if present because streamelements includes it

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

    const name = `${p.names.en.toUpperCase()} #${p.national_id}`;
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
        if (typeof obj === "undefined" || obj === null) return;
        path = path.split(/[\.\[\]\"\']{1,2}/);
        for (var i = 0, l = path.length; i < l; i++) {
            if (path[i] === "") continue;
            obj = obj[path[i]];
            if (typeof obj === "undefined" || obj === null) return;
        }
        return obj;
    }

    var str = this;
    if (!arguments.length)
        return str;
    var args = typeof arguments[0],
        args = (("string" == args || "number" == args) ? arguments : arguments[0]);
    str = str.replace(/\{([^\}]+)\}/g, function (m, key) {
        return getDeepVal(args, key) || "";
    });
    return str;
}


var tiny = require('tiny-json-http')

app.get('/discord', function (req, res) {
    console.log('/discord ' + JSON.stringify(req.query));

    if (Object.keys(req.query).length === 0) {
        res.set({
            'content-type': 'text/html; charset=utf-8'
        });
        return res.send(`
<style>
    #cmd {
        border: 1px solid silver;
        padding: 1em;
        font: 12px monospace;
        word-wrap: break-word;
    }

    var {
        color: red;
    }
</style>
<p>
    <h4>Command:</h4>
    <div id="cmd">
        $(urlfetch http://victornightbot.herokuapp.com/discord?channel=$(channel)&count=$(count)&user=$(user)&level=$(userlevel)&msg=$(querystring)&webhook=<var>https://discordapp.com/api/webhooks/XXXXX/XXXXX</var>&output=<var>https://pastebin.com/raw/XXXXXXXX</var>)
    </div>
</p>

<p>
    <h4>Output example</h4>
    <pre>
{
    "msg_pattern": "^(?:FC:?)?\\s*([0-9]{4})\\s*[-_,. ]\\s*?([0-9]{4})\\s*[-_,. ]\\s*([0-9]{4})\\s+(?:IGN:?)?\\s*(\\w{3,25})\\s*$",

    "discord_user": "{user} ({level})",
    "discord_msg": "*Has signed up to battle Film!*\n\`\`\`FC: { match.1 } - { match.2 } - { match.3 }\tIGN: { match.4 }\`\`\`",
    
    "twitch_reply": "Be prepared @{user}! You're the trainer number {count} for today's battle Film. Check your turn on Discord by typing !dc",
    "twitch_reply_invalid_msg": "Hey {user}, looks like you typed something wrong. Use the following pattern !signup 0000-0000-0000 InGameName",
    "twitch_reply_empty_msg": "Hey {user}, to enter the battle queue type your FC and IGN like !signup 0000-0000-0000 InGameName"
}
  </pre>
</p>
        `);
    }


    function limit(str, max) {
        const ellipisis = '...';
        if (str.length > max) {
            return str.substring(0, max - ellipisis.length) + ellipisis;
        }
        return str;
    }

    const TWITCH_MAXLEN = 400;
    const IS_URL_RE = /^https?:\/\/.*/;

    res.set({
        'content-type': 'text/plain; charset=utf-8'
    });


    //validate ouput parameter
    if (!req.query.output) {
        return res.send(limit("Error! Please provide an 'output' parameter!", TWITCH_MAXLEN));
    }
    if (!String(req.query.output).match(IS_URL_RE)) {
        return res.send(limit(`Error! The value of the 'output' parameter is not valid URL! (${req.query.output})`, TWITCH_MAXLEN));
    }

    //validate webhook parameter
    if (!req.query.webhook) {
        return res.send(limit("Error! Please provide an 'webhook' parameter!", TWITCH_MAXLEN));
    }
    if (!String(req.query.webhook).match(IS_URL_RE)) {
        return res.send(limit(`Error! The value of the 'webhook' parameter is not a valid URL! (${req.query.webhook})`, TWITCH_MAXLEN));
    }


    //fetch options file
    tiny.get({
        url: req.query.output,
    }, (err, data) => {

        var options;

        if (err) {
            console.error(err, req.query);
            return res.send(limit("ERROR! Request to 'options' url failed! (" + err + ")", TWITCH_MAXLEN));
        } else {

            try {
                options = JSON.parse(data.body);
            } catch (err) {
                return res.send(limit("ERROR! 'options' url contain an invalid JSON! (" + err + ")", TWITCH_MAXLEN));
            }

            //empty message
            if (!req.query.msg || String(req.query.msg).trim() === '') {
                return res.send(limit(String(options.twitch_reply_empty_msg || 'Please provide `twitch_reply_empty_msg`').format(req.query), TWITCH_MAXLEN));
            }
            //if theres a pattern validate msg using it
            else if (!options.msg_pattern || new RegExp(options.msg_pattern).test(req.query.msg)) {

                //run pattern and save matches on the match property, so it can be used on the reply template
                if (options.msg_pattern) {
                    req.query.match = new RegExp(options.msg_pattern).exec(req.query.msg) || {};
                }

                //Send the message to discord webhook
                tiny.post({
                    url: req.query.webhook,
                    data: {
                        "username": limit(String(options.discord_user || 'User: {user}').format(req.query), 32),
                        "content": limit(String(options.discord_msg || 'Please provide a `discord_msg`').format(req.query), 2000),
                        "wait": true,
                        // "avatar_url": "https://orig00.deviantart.net/06cf/f/2016/191/e/8/ash_ketchum_render_by_tzblacktd-da9k0wb.png",
                    }
                }, (err, data) => {
                    if (err) {
                        console.error(err, req.query);
                        res.send(limit("Discord API returned an error! (" + err + ")", TWITCH_MAXLEN));
                    } else {
                        var twitchMsg = limit(String(options.twitch_reply || 'Please provide `twitch_reply`').format(req.query), TWITCH_MAXLEN);
                        res.send(twitchMsg);
                    }
                });

            }
            //message does not match pattern    
            else {
                return res.send(limit(String(options.twitch_reply_invalid_msg || 'Please provide `twitch_reply_invalid_msg`').format(req.query), TWITCH_MAXLEN));
            }

        }
    });
});




