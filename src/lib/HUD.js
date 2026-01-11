import Config from "./Config";
import Loader from "./Loader";



export default class HUD {
    constructor ( gamebox ) {
        this.gamebox = gamebox;
        this.map = this.gamebox.map;
        this.player = this.gamebox.player;
        this.hero = this.gamebox.hero;
    }


    blit ( elapsed ) {
        // TODO: Implement HUD blit
    }


    render () {
        this.renderHealth();
        this.renderCurrency();
        this.renderCollectibles();
    }


    renderHealth () {
        const step = this.map.data.tilesize;
        const health = this.hero.getStat( "health" );
        const maxHealth = this.hero.maxHealth;

        this.gamebox.mapLayer.context.save();
        this.gamebox.mapLayer.context.globalAlpha = 0.5;
        this.gamebox.mapLayer.context.fillStyle = Config.colors.yellow;
        this.gamebox.mapLayer.context.beginPath();
        this.gamebox.mapLayer.context.roundRect(
            20,
            20,
            step * maxHealth,
            step / 4,
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
            step / 4,
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
            step / 4,
            2
        );
        this.gamebox.mapLayer.context.stroke();
        this.gamebox.mapLayer.context.closePath();
        this.gamebox.mapLayer.context.restore();
    }


    renderCurrency () {
        const currency = this.hero.currency;
        const currString = `x${currency}`;

        this.gamebox.mapLayer.context.save();

        if ( this.player.data.hud.currency ) {
            const width = this.player.data.hud.currency.width * this.hero.scale;
            const height = this.player.data.hud.currency.height * this.hero.scale;
            const diff = ( height - 16 * this.hero.scale ) / 2;
            const offsetX = 20 + width + currString.length * 16;
            const offsetY = 20 - diff / 2;

            this.gamebox.mapLayer.context.drawImage(
                Loader.cash( this.player.data.hud.currency.image ),
                this.player.data.hud.currency.offsetX,
                this.player.data.hud.currency.offsetY,
                width,
                height,
                this.gamebox.mapLayer.data.width - offsetX,
                offsetY,
                width,
                height
            );
        }

        this.gamebox.mapLayer.context.font = "24px Calamity-Bold";
        this.gamebox.mapLayer.context.fillStyle = Config.colors.white;
        this.gamebox.mapLayer.context.textAlign = "right";
        this.gamebox.mapLayer.context.textBaseline = "top";
        this.gamebox.mapLayer.context.fillText(
            currString,
            this.gamebox.mapLayer.data.width - 20,
            20
        );

        this.gamebox.mapLayer.context.restore();
    }


    renderCollectibles () {
        this.gamebox.mapLayer.context.save();

        if ( this.player.data.hud.collectibles ) {
            for ( let i = this.player.data.hud.collectibles.length; i--; ) {
                const collectible = this.player.data.hud.collectibles[ i ];
                const item = this.hero.items.find( ( item ) => item.id === collectible.id );
                const collected = item ? item.collected : 0;
                const collectString = `x${collected}`;

                const width = collectible.width * this.hero.scale;
                const height = collectible.height * this.hero.scale;
                const diff = ( height - 16 * this.hero.scale ) / 2;
                const offsetX = 20 + width + collectString.length * 16;
                const offsetY = 60 - diff / 2;

                this.gamebox.mapLayer.context.drawImage(
                    Loader.cash( collectible.image ),
                    collectible.offsetX,
                    collectible.offsetY,
                    width,
                    height,
                    this.gamebox.mapLayer.data.width - offsetX,
                    offsetY,
                    width,
                    height
                );

                this.gamebox.mapLayer.context.font = "24px Calamity-Bold";
                this.gamebox.mapLayer.context.fillStyle = Config.colors.white;
                this.gamebox.mapLayer.context.textAlign = "right";
                this.gamebox.mapLayer.context.textBaseline = "top";
                this.gamebox.mapLayer.context.fillText(
                    collectString,
                    this.gamebox.mapLayer.data.width - 20,
                    60
                );
            }
        }

        this.gamebox.mapLayer.context.restore();
    }
}