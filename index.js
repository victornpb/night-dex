
const _ = require('underscore');
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

// const oakdexPokedex = require('oakdex-pokedex');

Array.prototype.random = function () {
  return this[Math.floor((Math.random() * this.length))];
}

const app = express();
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => res.render('pages/index'))
app.listen(PORT, () => console.log(`Listening on ${PORT}`))


app.get('/nightbot-pokemon/:channel/:user/:userLevel/:count/:query', function (req, res) {
  res.send(" Hello World " + JSON.stringify(req.params));
})

app.get('/nightbot-pokemon/:channel/:user/:userLevel/:count', function (req, res) {
  res.send(`⚡💢 @${req.params.user} found a wild Bulbasaur❗️\n🔴 https://pokemondb.net/pokedex/bulbasaur`);
})


// app.get('/dex', function (req, res) {
//   res.send(JSON.stringify(req.query));



// })


const db = {
  pokemons: require('./db/pokedb'),
  items: require('./db/items'),
  skills: require('./db/skills'),
  types: require('./db/types'),
}


app.get('/dex', function (req, res) {
  res.send('📟 POKEDEX: You should type a pokemon name!');
});

app.get('/dex/:q', function (req, res) {
  var n = String(req.params.q).trim().toLowerCase();
  console.log('find', n)

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
      'Filmov is not on pokedex database, is it?'
    ];
    res.send('📟 POKEDEX: ' + rnd.random());
    return;
  }

  if (n.match(/victor(npb)?/)) {
    var rnd = [
      '📟 POKEDEX: Pokedex command is brought to you by @victornpb ', 
    ];
    res.send('📟 POKEDEX: ' + rnd.random());
    return;
  }

  var pokemon = findPokemon(n);
  if (pokemon) {
    // res.send(JSON.stringify(pokemon));
    console.log(pokemon);
    let p = pokemon;
    res.send(`📟 POKEDEX: #${p.id} ${p.ename} ✅ TYPE: ${p.type} | ${listProps(p.base)}`);
  }
  else { 
    res.send(`📟 POKEDEX: ${n} is not a pokemon on the database!`);
  }
 
});

function findPokemon(name) {
  name = String(name).toLowerCase();
  for (let i = 0; i < db.pokemons.length; i++) {
    let item = db.pokemons[i];
    if (Number(item.id) == name || String(item.ename).toLowerCase() === name || String(item.jname).toLowerCase() === name || String(item.cname).toLowerCase() === name) {
      item.type = item.type.map(findType);
      return item;
    }
  }
}

function findType(t) {
  for (let i = 0; i < db.types.length; i++) {
    let item = db.types[i];
    if (item.ename === t || item.cname === t || item.jname === t) return item.ename; 
  }
  return "?";
}

function findSkill(id) {
  for (let i = 0; i < db.skills.length; i++) {
    let item = db.skills[i];
    if (item.cname === id || item.ename === id || item.jname === id) return item;
  }
}

function listProps(obj) {
  return _.map(obj, (v,k) => `${k} ${v}`).join(' ')
}


// var regulars = [
//   'mrglowtm': [
//     'This is a kind of pokemon whos only form of food is HotPockets'
//   ]
// ];