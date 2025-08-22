import TopView from "./plugins/TopView";
import FX from "./sprites/FX";
import NPC from "./sprites/NPC";
import Hero from "./sprites/Hero";
import Sprite from "./sprites/Sprite";
import Companion from "./sprites/Companion";
import Config from "./Config";
import Controller from "./Controller";
import Dialogue from "./Dialogue";
import GameAudio from "./GameAudio";
import GameBox, { Camera } from "./GameBox";
import GamePad from "./GamePad";
import Loader from "./Loader";
import Map from "./maps/Map";
import MapLayer from "./maps/MapLayer";
import ActiveTiles from "./maps/ActiveTiles";
import Player from "./Player";
import Spring from "./Spring";
import Tween, { Easing } from "./Tween";
import Utils from "./Utils";
import CellAuto from "./vendor/CellAuto";
import CellAutoMap from "./maps/CellAutoMap";



const lib = {
    // plugins
    TopView,

    // sprites
    FX,
    NPC,
    Hero,
    Sprite,
    Companion,

    // ...rest
    Config,
    Controller,
    Dialogue,
    GameAudio,
    GameBox, Camera,
    GamePad,
    Loader,
    Map, MapLayer, ActiveTiles,
    CellAutoMap,
    Player,
    Spring,
    Tween, Easing,
    Utils,

    // vendor
    CellAuto,

};



window.lib2dk = lib;



export default lib;
