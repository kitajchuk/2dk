2dk
===

> Nostalgia for 2D gaming wrapped up in a JavaScript SDK.


[![Netlify Status](https://api.netlify.com/api/v1/badges/b6bd6820-200c-492b-86e1-5d9c42456b87/deploy-status)](https://app.netlify.com/sites/2dk/deploys)



## Getting started
This source code is using the [Clutch SDK](), another repository I manage. To get started with the 2dk source, clone this repo and then:

```shell
# Bootstrap the Clutch environment
npm run bootstrap

# Run the dev server and watch scripts
npm start

# Run the netlify dev server for Lambda
netlify dev
```



## Studio software
The studio software is an [Electron](https://www.electronjs.org/) application. Currently there are no package scripts for the software distribution as the project is still in what I would consider pre-beta development. For source execution:

```shell
# Install the software dependencies
cd studio && npm i

# Runs the Electron application
npm run studio
```

**It's important to note I take no credit for the Nintendo IPs used for testing nor for the artwork and designs. All I've done is increased the resolution of sprites and tilesets I've compiled from the internet.**

Currently you can create and paint maps quite well for the background, foreground and collision layers. It's basically Photoshop for 2D map painting.

I've been using the game [Link's Awakening](https://www.zeldadungeon.net/wiki/The_Legend_of_Zelda:_Link%27s_Awakening) as a model for the game engine and mechanics of the `TopView` plugin for the `Player`. If you run the Studio you'll find it's there, named [LA](https://2dk.kitajchuk.com/games/la/?buster=260).

A 2dk game is a static webapp that contains all it's own resources and JSON files. The Player, or engine, has a mobile first philosophy behind it and is designed to be played as a standalone webapp on your phone. I spent a fair amount of time making the touch controls, specifically the 8-point dpad, work very well.

I've found the [Mozilla Gaming](https://developer.mozilla.org/en-US/docs/Games) docs to be quite helpful. I used these to implement the [Gamepad](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API) API so I can play with my USB NES controller when developing in Firefox. There are some other debug mode features available when running a 2dk game in a desktop browser.

#### Mobile Player:
![image](./static/img/screens/mobile1.png)

#### Fullscreen mode:
![image](./static/img/screens/mobile2.png)


#### Painting maps
![image](./static/img/screens/mabevillage.png)

![image](./static/img/screens/mysteriousforest.png)

![image](./static/img/screens/ukukuprairie.png)



## Open source
I've been trying to keep track of where I've found resources online. Stuff like sprites, tiles and audio.

#### Assets
* Sounds for Link's Awakening DX from [khinsider](https://downloads.khinsider.com/game-soundtracks/album/link-s-awakening-dx)
* Sprites and Tiles from [The Sprites Resource](https://www.spriters-resource.com/game_boy_gbc/thelegendofzeldalinksawakeningdx)

#### Inspiration
* I'm an OG fan of [kesiev's](https://github.com/kesiev) original [Akihabara](https://www.kesiev.com/akihabara) work
* [Gotta Code Them All](https://www.slideshare.net/Berttimmermans/gotta-code-them-all-a-pokmon-and-html5-lovestory) got me thinking back in the day as well
