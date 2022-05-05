2dk dev roadmap...
==================

> The hobbyist dream implementations.



#### Studio Software
* Game configure starting data hero (spawn, map, sounds, companion, sprite)
* Map Active Tiles (group, layer, coords, offsetX, offsetY, dur, stepsX, action, attack)
* Map Spawnpoints (x, y, dir)
* Map Objects, Sprites & NPCs (id, ai, spawn, payload)
* Map Events (coords, type, map, dir, spawn?)
* Map FX Maker
* Map NPC Maker
* Map Hero Maker (companion?)
* Quest status system
* Refactor dialogue(s) system for quest status
* Resolution rendering
* External storage
* Engine upgrades
* Software upgrades
* Distribution
* Software player (...debugger)
* Map collider should be dynamic (precision: 4)
* Uploads with progress, bulk uploads?
* History states for painting (undo/redo)

#### Game Engine
* HUD (health, item, status)
* Menus (inventory, worldmap, save, etc...)
* Quest (items, key items, weapons, story, cutscenes)
* Save State (local storage, persistence?)
* Audio (mobile has issues...)
* GameCycle manager for states (intro, title, credits, cutscenes etc...)
* Render foreground textures to background if BEHIND Hero?
* Hero weapon animations / collisions (sword...?)
* Tile interactions (fall, etc...)
* Hero sprite masking?
* Grass sprite cycle / sound
* Water sprite cycle / sound
* Sword sprite cycle / sound / collision
* Push / Pull
* Swimming
* Falling
* Attacking & Weapons
* Charged Hero + Release Attack
* Move resistance (pushing, tiles, etc...)
* Object interaction hints (A Open, A Check, etc...)

#### NPC AIs
* Butterflies / Bugs
* Perception box (aggro-ranges)
* Projectiles (with FX)
* Enemies (Baddies)

#### Multiplayer (MMO)
* Multiplayer online
    * Websocket player streaming (broadcast)
    * Websocket server deploys (AWS)
    * JWT token in-memory client storage (fully private?)
* Versioned game package tar balls (releases)
    * Requires a difference between saves / releases
    * Implement "Package Release" button to create tar ball