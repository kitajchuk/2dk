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
        this.renderFPS();
        this.renderButtons();
        this.renderHealth();
        this.renderCurrency();
        this.renderKeys();
        this.renderItems();
    }


    reset () {
        this.gamepad.renderButtonText( "a" );
        this.gamepad.renderButtonText( "b" );
        this.buttons.a = null;
        this.buttons.b = null;
    }


    renderFPS () {
        const fps = this.player.currentFPS;
        const fpsString = `FPS: ${fps}`;
        const x = 220, y = 20;

        this.gamebox.mapLayer.context.save();
        
        this.gamebox.mapLayer.context.font = "16px Calamity-Bold";
        this.gamebox.mapLayer.context.fillStyle = Config.colors.white;
        this.gamebox.mapLayer.context.textAlign = "left";
        this.gamebox.mapLayer.context.textBaseline = "top";
        this.gamebox.mapLayer.context.fillText(
            fpsString,
            x,
            y
        );

        this.gamebox.mapLayer.context.restore();
    }


    renderButtons () {
        if ( this.gamebox.hero.interact ) {
            if ( this.buttons.a !== this.gamebox.hero.interact ) {
                switch ( this.gamebox.hero.interact ) {
                    case Config.hero.interact.READ:
                        const readItem = this.player.data.hud.interact?.read;
                        if ( readItem ) {
                            touchControls.a.elem.innerHTML = renderButtonSprite( readItem, "A", 0 );
                        } else {
                            this.gamepad.renderButtonText( "a" );
                        }
                        break;
                    case Config.hero.interact.GRAB:
                        const grabItem = this.hero.items.find( ( item ) => item.stat && item.stat.key === "strength" );
                        if ( grabItem ) {
                            touchControls.a.elem.innerHTML = renderButtonSprite( grabItem, "A" );
                        } else {
                            this.gamepad.renderButtonText( "a" );
                        }
                        break;
                }
                this.buttons.a = this.gamebox.hero.interact;
            }

        } else if ( this.buttons.a !== Config.verbs.JUMP ) {
            const jumpItem = this.hero.items.find( ( item ) => item.verb === Config.verbs.JUMP );

            if ( jumpItem ) {
                touchControls.a.elem.innerHTML = renderButtonSprite( jumpItem, "A" );
            } else {
                this.gamepad.renderButtonText( "a" );
            }
            this.buttons.a = Config.verbs.JUMP;
        }

        if ( this.gamebox.hero.mode !== this.buttons.b ) {
            switch ( this.gamebox.hero.mode ) {
                case Config.hero.modes.WEAPON:
                    const weaponItem = this.hero.items.find( ( item ) => item.equip === "weapon" );
                    if ( weaponItem ) {
                        touchControls.b.elem.innerHTML = renderButtonSprite( weaponItem, "B" );
                        this.buttons.b = Config.hero.modes.WEAPON;
                    }
                    break;
                case Config.hero.modes.PROJECTILE:
                    const projectileItem = this.hero.items.find( ( item ) => item.projectile );
                    if ( projectileItem ) {
                        touchControls.b.elem.innerHTML = renderButtonSprite( projectileItem, "B" );
                        this.buttons.b = Config.hero.modes.PROJECTILE;
                    }
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
        // TODO: roundRect throws error in Firefox...
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
        const shield = this.hero.items.find( ( item ) => item.equip === "shield" );

        if ( shield ) {
            this.gamebox.mapLayer.context.drawImage(
                Loader.cash( shield.image ),
                shield.offsetX,
                shield.offsetY,
                shield.width,
                shield.height,
                20,
                50,
                shield.width,
                shield.height
            );
        }
    }
}