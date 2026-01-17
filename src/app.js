import Player from "./lib/Player";
import GameWorker from "./lib/GameWorker";



// 2dk entry point
// A 2dk game is a pure static web bundle
// The Player can just load "game.json" to get started
class App {
    constructor () {
        window.onload = () => {
            this.player = new Player( 60, true );
            this.gameworker = new GameWorker( this.player );
            this.player.load().then(() => {
                this.gameworker.register();
            });
        };
    }
}


const app = new App();



window.app2dk = app;



export default app;
