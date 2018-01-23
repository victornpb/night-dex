const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

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
  res.send(`⚡💢 @${req.param.user} found a wild Bulbasaur❗️\n🔴 https://pokemondb.net/pokedex/bulbasaur`);
})


app.get('/dex', function (req, res) {
  res.send(JSON.stringify(req.query));
})