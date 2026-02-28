import TopView from "./plugins/TopView";
import FX from "./sprites/FX";
import NPC from "./sprites/NPC";
import Hero, { ItemGet, HeroProjectile } from "./sprites/Hero";
import TileSprite, { LiftedTile, PushedTile } from "./sprites/Tile";
import Sprite, { QuestSprite } from "./sprites/Sprite";
import Enemy from "./sprites/Enemy";
import EnemyAggro from "./sprites/EnemyAggro";
import Companion from "./sprites/Companion";
import ItemDrop from "./sprites/ItemDrop";
import KeyItem, { KeyItemDrop } from "./sprites/KeyItem";
import Door from "./sprites/Door";
import Projectile from "./sprites/Projectile";
import Config from "./Config";
import Controller from "./Controller";
import Dialogue from "./Dialogue";
import GameAudio from "./GameAudio";
import GameBox, { Camera, RenderQueue } from "./GameBox";
import GamePad from "./GamePad";
import GameQuest from "./GameQuest";
import GameWorker from "./GameWorker";
import GameStorage from "./GameStorage";
import Loader from "./Loader";
import Map from "./maps/Map";
import MapFX from "./maps/MapFX";
import MapLayer from "./maps/MapLayer";
import MapEvent from "./maps/MapEvent";
import ActiveTiles from "./maps/ActiveTiles";
import Player, { PlayerMenu } from "./Player";
import Spring from "./Spring";
import Utils from "./Utils";
import CellAuto from "./vendor/CellAuto";
import CellAutoMap from "./maps/CellAutoMap";
import HUD from "./HUD";
import * as DOM from "./DOM";



const lib = {
    // plugins
    TopView,

    // sprites
    FX,
    NPC,
    Hero, ItemGet, HeroProjectile,
    TileSprite, LiftedTile, PushedTile,
    Door,
    Enemy, EnemyAggro,
    Sprite, QuestSprite,
    ItemDrop,
    Companion,
    Projectile,
    KeyItem, KeyItemDrop,

    // ...rest
    Config,
    Controller,
    Dialogue,
    GameAudio,
    GameBox, Camera, RenderQueue,
    GamePad,
    GameQuest,
    GameWorker,
    GameStorage,
    Loader,
    Map, MapFX, MapLayer, MapEvent, ActiveTiles,
    CellAutoMap,
    Player, PlayerMenu,
    Spring,
    Utils,
    HUD,
    DOM,

    // vendor
    CellAuto,

};



window.lib2dk = lib;



export default lib;
