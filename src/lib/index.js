import TopView from "./plugins/TopView";
import FX from "./sprites/FX";
import NPC from "./sprites/NPC";
import Hero from "./sprites/Hero";
import Sprite from "./sprites/Sprite";
import Companion from "./sprites/Companion";
import CellAuto from "./vendor/CellAuto";
import Config from "./Config";
import Dialogue from "./Dialogue";
import GameAudio from "./GameAudio";
import GameBox, { Camera } from "./GameBox";
import GamePad from "./GamePad";
import Loader from "./Loader";
import Map, { MapLayer, ActiveTiles } from "./Map";
import Player from "./Player";
import Utils from "./Utils";



const lib = {
    // plugins
    TopView,

    // sprites
    FX,
    NPC,
    Hero,
    Sprite,
    Companion,

    // vendor
    CellAuto,

    // ...rest
    Config,
    Dialogue,
    GameAudio,
    GameBox, Camera,
    GamePad,
    Loader,
    Map, MapLayer, ActiveTiles,
    Player,
    Utils,
};



if (window !== undefined) {
    window.lib2dk = lib;
}



export default lib;
