const path = require('path');
const fs = require('fs');

class Dex {
    constructor() {
        this.db = {
            pokemons: []
        };
        this.load();
    }
    load() {
        console.log('Loading database to memory');
        const dexdir = path.join(__dirname, 'node_modules/oakdex-pokedex/data/pokemon');

        var files = fs.readdirSync(dexdir);
        console.log(`found ${files.length} files`);
        files.forEach((fileName) => {
            let content = fs.readFileSync(path.join(dexdir, fileName));
            let obj = JSON.parse(content);
            obj.name = fileName;
            this.db.pokemons.push(obj);
        });
        console.log('Loading complete!');
    }

    find(query) {
        query = String(query).trim();

        const FINDBYID = /^\d+$/.test(query);
        if (FINDBYID) {
            query = parseInt(query);
        }
        else {
            query = query.toLowerCase();
        }

        let results = this.db.pokemons.filter((pokemon) => {
            if (FINDBYID) {
                return pokemon.national_id === query;
            }
            else {
                let pokemonName = pokemon.names.en.toLowerCase();
                return pokemon.name === query || pokemonName === query;
            }
        });

        return results;
    }

    findOne(filter) {
        return this.db.pokemons.find(filter);
    }

    findByType(type) {
        return this.db.pokemons.filter(p => {
            return p.types.join(' ').toLowerCase().indexOf(type) > -1;
        });
    }
    findByAbility(type) {
        console.log(type);
        return this.db.pokemons.filter(p => {
            return p.abilities.map(a=>a.name).join(' ').toLowerCase().match(new RegExp(type, 'i'));
        });
    }

    suggestions(query) {
        query = String(query).toLowerCase().trim();
        const re = new RegExp(query);

        return this.db.pokemons.filter(p => {
            const name = p.names.en.toLowerCase();
            const s = calcSimilarity(name, query);
            return (s >= 0.5) || name.match(re);
        });
    }

    getRandom() {
        return this.db.pokemons.random();
    }

}


function calcSimilarity(l, m) {
    var g = l,
        h = m,
        k = g.length,
        f = h.length;
    if (k < f) {
        var d = g;
        g = h;
        h = d;
        var b = k;
        k = f;
        f = b;
    }
    b = [
        []
    ];
    for (d = 0; d < f + 1; ++d) {
        b[0][d] = d;
    }
    for (var c = 1; c < k + 1; ++c) {
        b[c] = [];
        b[c][0] = c;
        for (var e = 1; e < f + 1; ++e) {
            d = g.charAt(c - 1) === h.charAt(e - 1) ? 0 : 1, b[c][e] = Math.min(b[c - 1][e] + 1, b[c][e - 1] + 1, b[c - 1][e - 1] + d);
        }
    }
    return 1 - b[b.length - 1][b[b.length - 1].length - 1] / Math.max(l.length, l.length);
}


module.exports = Dex;