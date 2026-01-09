import Config from "./Config";



export default class HUD {
    constructor ( gamebox ) {
        this.gamebox = gamebox;
        this.player = this.gamebox.player;
    }


    blit ( elapsed ) {
        // TODO: Implement HUD blit
    }


    render () {
        this.gamebox.mapLayer.context.save();
        this.renderHealth();
        this.gamebox.mapLayer.context.restore();
    }


    renderHealth () {
        const step = 32;
        const health = this.gamebox.hero.getStat( "health" );
        const maxHealth = this.gamebox.hero.maxHealth;

        this.gamebox.mapLayer.context.globalAlpha = 0.5;
        this.gamebox.mapLayer.context.fillStyle = Config.colors.yellow;
        this.gamebox.mapLayer.context.beginPath();
        this.gamebox.mapLayer.context.roundRect(
            20,
            20,
            step * maxHealth,
            step / 2,
            2
        );
        this.gamebox.mapLayer.context.fill();
        this.gamebox.mapLayer.context.closePath();
        this.gamebox.mapLayer.context.globalAlpha = 1;

        this.gamebox.mapLayer.context.fillStyle = Config.colors.red;
        this.gamebox.mapLayer.context.beginPath();
        this.gamebox.mapLayer.context.roundRect(
            20,
            20,
            step * health,
            step / 2,
            2
        );
        this.gamebox.mapLayer.context.fill();
        this.gamebox.mapLayer.context.closePath();

        this.gamebox.mapLayer.context.fillStyle = "transparent";
        this.gamebox.mapLayer.context.strokeStyle = Config.colors.white;
        this.gamebox.mapLayer.context.lineWidth = 2;
        this.gamebox.mapLayer.context.beginPath();
        this.gamebox.mapLayer.context.roundRect(
            20,
            20,
            step * maxHealth,
            step / 2,
            2
        );
        this.gamebox.mapLayer.context.stroke();
        this.gamebox.mapLayer.context.closePath();
    }
}