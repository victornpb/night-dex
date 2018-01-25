module.exports = {};

function testRegulars() {
    
    var regulars = {
        'mrglowtm': [
            'This is a kind of pokemon whos only form of food is HotPockets',
        ],
        'C00lFireSG': [
            '',
        ]
    };
}

function testFilmov() {
    
    if (n === 'filmov') {
        var rnd = [
            `Filmov is not a Pokemon, but you can catch him everyday at 6pm CST!`,
            'Filmov is not a Pokemon but he may turn into a Pokemon if you keep using this command',
            'Filmov evolves to...',
            'Filmov is a digimon',
            'Filmov is not a Pokemon but he lives in a pokeball',
            'Filmov is not a Pokemon but he\'s on Team Rocket',
            'Filmov is a rare kind of Pokemon usually found on http://twitch.com/filmov',
            'Filmov?! never heard of this Pokemon!',
            'Filmov is not on pokedex database, is it?',
        ];
        res.send('📟 POKEDEX: ' + rnd.random());
        return;
    }

}

function testCredits() {
    
    if (n.match(/victor(npb)?/)) {
        var rnd = [
            '📟 POKEDEX: Pokedex command is brought to you by @victornpb ',
        ];
        res.send('📟 POKEDEX: ' + rnd.random());
        return;
    }
}