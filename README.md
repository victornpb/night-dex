# A Pokedéx command for Pokémon Twitch Streamers



Usage
------------

  ➤ `!dex help` to get instructions.  
  ➤ `!dex` to get a random Pokemon.  
  ➤ `!dex gengar` or `!dex 94` to see the Pokedex info about    Gengar.  
  ➤ `!dex ability overgrow` to search pokemons with that ability.  
  ➤ `!dex type electric` to search pokemons with t  hat type.  
  ➤ `!dex about` to see about this command.


Adding the command to your stream
------------

It works with [Nightbot](https://nightbot.tv/) or [StreamElements](https://streamelements.com/) bot.


### Nightbot

> 1. Type this in your chat:
>  ```
>  !commands add !dex $(urlfetch https://victornightbot.herokuapp.com/dex/$(querystring)?ch=$(channel)&user=$(user)&userlevel=$(userlevel)&bot=nightbot)
>  ```

-- or --

> 1. Go to NightBot [Custom commands](https://nightbot.tv/commands/custom)
> 2. Create a `!dex` command:
>   ```
>   $(urlfetch https://victornightbot.herokuapp.com/dex/$(querystring)?ch=$(channel)&user=$(user)&userlevel=$(userlevel)&bot=nightbot)
>  ```


### StreamElements bot:

> 1. Go to StreamElements [Custom commands](https://streamelements.com/dashboard/bot/commands/custom)
> 2. Create a `!dex` command:
>   ```
>   ${urlfetch https://victornightbot.herokuapp.com/dex/${pathescape ${0:}}?ch=${channel}&user=${user}&userlevel=${user.level}&bot=streamelements}
>   ```
