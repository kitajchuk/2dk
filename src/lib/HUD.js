import Config from "./Config";
import Loader from "./Loader";
import { renderButtonSprite } from "./DOM";
import { touchControls } from "./GamePad";



export default class HUD {
    constructor ( gamebox ) {
        this.gamebox = gamebox;
        this.map = this.gamebox.map;
        this.player = this.gamebox.player;
        this.gamepad = this.player.gamepad;
        this.hero = this.gamebox.hero;

        this.buttons = {
            a: null,
            b: null,
        };
    }


    blit ( elapsed ) {
        // TODO: Implement HUD blit
    }


    render () {
        this.renderHealth();
        this.renderCurrency();
        this.renderKeys();
        // TODO: Figure out how we want to do this...
        // this.renderItems();
        this.renderButtons();
    }


    renderButtons () {
        if ( !this.buttons.a ) {
            const jumpItem = this.hero.items.find( ( item ) => item.verb === Config.verbs.JUMP );

            if ( jumpItem ) {
                touchControls.a.elem.innerHTML = renderButtonSprite( jumpItem, "A" );
                this.buttons.a = Config.verbs.JUMP;
            }
        }

        if ( this.gamebox.hero.mode !== this.buttons.b ) {
            switch ( this.gamebox.hero.mode ) {
                case Config.hero.modes.WEAPON:
                    touchControls.b.elem.innerHTML = renderButtonSprite(
                        this.hero.items.find( ( item ) => item.equip === "weapon" ),
                        "B"
                    );
                    this.buttons.b = Config.hero.modes.WEAPON;
                    break;
                case Config.hero.modes.PROJECTILE:
                    touchControls.b.elem.innerHTML = renderButtonSprite(
                        this.hero.items.find( ( item ) => item.projectile ),
                        "B"
                    );
                    this.buttons.b = Config.hero.modes.PROJECTILE;
                    break;
            }
        }
    }


    renderHealth () {
        const x = 20, y = 20;
        const step = this.map.data.tilesize;
        const health = this.hero.getStat( "health" );
        const maxHealth = this.hero.maxHealth;

        this.gamebox.mapLayer.context.save();
        this.gamebox.mapLayer.context.globalAlpha = 0.5;
        this.gamebox.mapLayer.context.fillStyle = Config.colors.yellow;
        this.gamebox.mapLayer.context.beginPath();
        this.gamebox.mapLayer.context.roundRect(
            x,
            y,
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
            x,
            y,
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
            x,
            y,
            step * maxHealth,
            step / 4,
            2
        );
        this.gamebox.mapLayer.context.stroke();
        this.gamebox.mapLayer.context.closePath();
        this.gamebox.mapLayer.context.restore();
    }


    renderCurrency () {
        const x = 20, y = 20;
        const currency = this.hero.currency;
        const currString = `x${currency}`;

        this.gamebox.mapLayer.context.save();

        if ( this.player.data.hud.currency ) {
            const width = this.player.data.hud.currency.width;
            const height = this.player.data.hud.currency.height;
            const diff = ( height - 16 ) / 2;
            const offsetX = x + width + currString.length * 16;
            const offsetY = y - diff / 2;

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

            this.gamebox.mapLayer.context.font = "24px Calamity-Bold";
            this.gamebox.mapLayer.context.fillStyle = Config.colors.white;
            this.gamebox.mapLayer.context.textAlign = "right";
            this.gamebox.mapLayer.context.textBaseline = "top";
            this.gamebox.mapLayer.context.fillText(
                currString,
                this.gamebox.mapLayer.data.width - x,
                y
            );
        }

        this.gamebox.mapLayer.context.restore();
    }


    renderKeys () {
        const x = 20, y = 60;
        const item = this.hero.items.find( ( item ) => item.id === "key" );
        const collected = item ? item.collected : 0;
        const collectString = `x${collected}`;

        this.gamebox.mapLayer.context.save();

        if ( this.player.data.hud.keys ) {
            const width = this.player.data.hud.keys.width;
            const height = this.player.data.hud.keys.height;
            const diff = ( height - 16 ) / 2;
            const offsetX = x + width + collectString.length * 16;
            const offsetY = y - diff / 2;

            this.gamebox.mapLayer.context.drawImage(
                Loader.cash( this.player.data.hud.keys.image ),
                this.player.data.hud.keys.offsetX,
                this.player.data.hud.keys.offsetY,
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
                this.gamebox.mapLayer.data.width - x,
                y
            );
        }

        this.gamebox.mapLayer.context.restore();
    }


    renderItems () {
        const y = 80;
        let x = 20;
        const gutter = 20;
        const scale = 2

        const height = this.hero.items.reduce( ( acc, item ) => acc > item.height ? acc : item.height, 0 );
        
        for ( let i = this.hero.items.length; i--; ) {
            const item = this.hero.items[ i ];
            const offsetY = y - item.height / scale - ( ( height / scale - item.height / scale ) / 2 );

            this.gamebox.mapLayer.context.drawImage(
                Loader.cash( item.image ),
                item.offsetX,
                item.offsetY,
                item.width,
                item.height,
                x,
                offsetY,
                item.width / scale,
                item.height / scale
            );

            x += item.width / scale + gutter;
        }
    }
}