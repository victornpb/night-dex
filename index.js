
const _ = require('underscore');
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

// const oakdexPokedex = require('oakdex-pokedex');



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
  res.send('You should type a pokemon name!');
});

app.get('/dex/:q', function (req, res) {
  var n = String(req.params.q).trim().toLowerCase();
  console.log('find', n)

  var pokemon = findPokemon(n);
  if (pokemon) {
    // res.send(JSON.stringify(pokemon));
    console.log(pokemon);
    let p = pokemon;
    res.send(`POKEDEX #${p.id} ${p.ename} | Type: ${p.type} | Base: ${listProps(p.base)}`);
  }
  else { 
    res.send('Not found sorry');
  }
 
});

function findPokemon(name) {
  name = String(name).toLowerCase();
  for (let i = 0; i < db.pokemons.length; i++) {
    let item = db.pokemons[i];
    if (String(item.ename).toLowerCase() === name || String(item.jname).toLowerCase() === name || String(item.cname).toLowerCase() === name) {
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
  return _.map(obj, (v,k) => `${k}: ${v}`).join('\n')
}