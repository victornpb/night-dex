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
        return db.pokemons.find(filter);
    }

}

module.exports = Dex;