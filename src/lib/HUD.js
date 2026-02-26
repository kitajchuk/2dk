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
        this.gap = 8;
    }


    reset () {
        this.gamepad.renderButtonText( "a" );
        this.gamepad.renderButtonText( "b" );
        this.buttons.a = null;
        this.buttons.b = null;
    }


    render () {
        this.offsets = {
            topLeft: {
                x: 20,
                y: 20,
            },
        };

        this.renderHealth();
        this.renderMagic();
        this.renderItems();
        this.renderStatus();
        this.renderButtons();
        this.renderCurrency();
        this.renderKeys();
        this.renderFPS();
    }


    renderHealth () {
        const { x, y } = this.offsets.topLeft;
        const step = this.player.data.tilesize;
        const height = step / 4;
        const width = step * this.hero.health;
        const fullWidth = step * this.hero.maxHealth;

        this._renderFillBar({
            x,
            y,
            width,
            height,
            fullWidth,
            bgColor: Config.colors.yellow,
            fillColor: Config.colors.red,
            borderColor: Config.colors.white,
        });

        // Update offsets for subsequent HUD elements...
        this.offsets.topLeft.y += height + this.gap;
    }


    renderMagic () {
        if ( !this.hero.hasMagic() ) {
            return;
        }

        const { x, y } = this.offsets.topLeft;
        const step = this.player.data.tilesize / 8;
        const height = this.player.data.tilesize / 4;
        const width = step * this.hero.magic;
        const fullWidth = step * this.hero.maxMagic;

        this._renderFillBar({
            x,
            y,
            width,
            height,
            fullWidth,
            bgColor: Config.colors.teal,
            fillColor: Config.colors.blue,
            borderColor: Config.colors.white,
        });

        // Update offsets for subsequent HUD elements...
        this.offsets.topLeft.y += height + this.gap;
    }

    renderFPS () {
        if ( !this.player.query.fps ) {
            return;
        }

        const fps = this.player.currentFPS;
        const color = fps >= 55 ? Config.colors.green : Config.colors.red;
        const fpsString = `FPS: ${fps}`;
        const x = 230, y = 20;

        this.player.renderLayer.context.save();
        
        this.player.renderLayer.context.font = "16px Calamity-Bold";
        this.player.renderLayer.context.fillStyle = color;
        this.player.renderLayer.context.textAlign = "left";
        this.player.renderLayer.context.textBaseline = "top";
        this.player.renderLayer.context.fillText(
            fpsString,
            x,
            y
        );

        this.player.renderLayer.context.restore();
    }


    renderItems () {
        const shield = this.hero.items.find( ( item ) => item.equip === "shield" );
        const { x, y } = this.offsets.topLeft;

        if ( shield ) {
            this.player.renderLayer.context.drawImage(
                Loader.cash( shield.image ),
                shield.offsetX,
                shield.offsetY,
                shield.width,
                shield.height,
                x,
                y,
                shield.width,
                shield.height
            );
        }
    }


    renderStatus () {
        const shield = this.hero.items.find( ( item ) => item.equip === "shield" );
        const statusItem = this.player.data.hud.status?.[this.hero.status];
        const x = shield ? 60 : 20;
        const { y } = this.offsets.topLeft;

        if ( statusItem ) {
            this.player.renderLayer.context.drawImage(
                Loader.cash( statusItem.image ),
                statusItem.offsetX,
                statusItem.offsetY,
                statusItem.width,
                statusItem.height,
                x,
                y,
                statusItem.width,
                statusItem.height
            );
        }
    }


    renderCurrency () {
        const x = 20, y = 20;
        const currency = this.hero.currency;
        const currString = `x${currency}`;

        this.player.renderLayer.context.save();

        if ( this.player.data.hud.currency ) {
            const width = this.player.data.hud.currency.width;
            const height = this.player.data.hud.currency.height;
            const diff = ( height - 16 ) / 2;
            const offsetX = x + width + currString.length * 16;
            const offsetY = y - diff / 2;

            this.player.renderLayer.context.drawImage(
                Loader.cash( this.player.data.hud.currency.image ),
                this.player.data.hud.currency.offsetX,
                this.player.data.hud.currency.offsetY,
                width,
                height,
                this.player.renderLayer.data.width - offsetX,
                offsetY,
                width,
                height
            );

            this._renderText({
                x,
                y,
                text: currString,
                size: 24,
            });
        }

        this.player.renderLayer.context.restore();
    }


    renderKeys () {
        const x = 20, y = 60;
        const item = this.hero.items.find( ( item ) => item.id === "key" );
        const collected = item ? item.collected : 0;
        const collectString = `x${collected}`;

        this.player.renderLayer.context.save();

        if ( this.player.data.hud.keys ) {
            const width = this.player.data.hud.keys.width;
            const height = this.player.data.hud.keys.height;
            const diff = ( height - 16 ) / 2;
            const offsetX = x + width + collectString.length * 16;
            const offsetY = y - diff / 2;

            this.player.renderLayer.context.drawImage(
                Loader.cash( this.player.data.hud.keys.image ),
                this.player.data.hud.keys.offsetX,
                this.player.data.hud.keys.offsetY,
                width,
                height,
                this.player.renderLayer.data.width - offsetX,
                offsetY,
                width,
                height
            );

            this._renderText({
                x,
                y,
                text: collectString,
                size: 24,
            });
        }

        this.player.renderLayer.context.restore();
    }


    renderButtons () {
        if ( this.gamebox.hero.interact.mode ) {
            if ( this.buttons.a !== this.gamebox.hero.interact.mode ) {
                switch ( this.gamebox.hero.interact.mode ) {
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
                    case Config.hero.interact.OPEN:
                        const openItem = this.hero.items.find( ( item ) => item.id === "key" );
                        if ( openItem ) {
                            touchControls.a.elem.innerHTML = renderButtonSprite( openItem, "A" );
                        } else {
                            this.gamepad.renderButtonText( "a" );
                        }
                        break;
                }
                this.buttons.a = this.gamebox.hero.interact.mode;
            }

        } else if ( this.gamebox.swimming ) {
            if ( this.buttons.a !== Config.verbs.SWIM ) {
                const swimItem = this.hero.items.find( ( item ) => item.verb === Config.verbs.SWIM );
                if ( swimItem ) {
                    touchControls.a.elem.innerHTML = renderButtonSprite( swimItem, "A" );
                } else {
                    this.gamepad.renderButtonText( "a" );
                }
                this.buttons.a = Config.verbs.SWIM;
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

        if ( this.gamebox.swimming ) {
            if ( this.buttons.b !== Config.verbs.DIVE ) {
                this.gamepad.renderButtonText( "b" );
                this.buttons.b = Config.verbs.DIVE;
            }

        } else if ( this.gamebox.hero.mode !== this.buttons.b ) {
            switch ( this.gamebox.hero.mode ) {
                case Config.hero.modes.WEAPON:
                    const weaponItem = this.hero.items.find( ( item ) => item.equip === "weapon" );
                    if ( weaponItem ) {
                        touchControls.b.elem.innerHTML = renderButtonSprite( weaponItem, "B" );
                        this.buttons.b = Config.hero.modes.WEAPON;
                    }
                    break;
                case Config.hero.modes.PROJECTILE:
                    if ( this.hero.projectileItem ) {
                        touchControls.b.elem.innerHTML = renderButtonSprite( this.hero.projectileItem, "B" );
                        this.buttons.b = Config.hero.modes.PROJECTILE;
                    }
                    break;
            }
        }
    }


    _renderFillBar ({ x, y, width, height, fullWidth, bgColor, fillColor, borderColor }) {
        this.player.renderLayer.context.save();
        this.player.renderLayer.context.globalAlpha = 0.5;
        this.player.renderLayer.context.fillStyle = bgColor;
        this.player.renderLayer.context.beginPath();
        this.player.renderLayer.context.roundRect(
            x,
            y,
            fullWidth,
            height,
            2
        );
        this.player.renderLayer.context.fill();
        this.player.renderLayer.context.closePath();
        this.player.renderLayer.context.globalAlpha = 1;

        this.player.renderLayer.context.fillStyle = fillColor;
        this.player.renderLayer.context.beginPath();
        this.player.renderLayer.context.roundRect(
            x,
            y,
            width,
            height,
            2
        );
        this.player.renderLayer.context.fill();
        this.player.renderLayer.context.closePath();

        this.player.renderLayer.context.fillStyle = "transparent";
        this.player.renderLayer.context.strokeStyle = borderColor;
        this.player.renderLayer.context.lineWidth = 2;
        this.player.renderLayer.context.beginPath();
        this.player.renderLayer.context.roundRect(
            x,
            y,
            fullWidth,
            height,
            2
        );
        this.player.renderLayer.context.stroke();
        this.player.renderLayer.context.closePath();
        this.player.renderLayer.context.restore();
    }


    _renderText ({ x, y, text, size, align = "right" }) {
        this.player.renderLayer.context.font = `${size}px Calamity-Bold`;
        this.player.renderLayer.context.fillStyle = Config.colors.white;
        this.player.renderLayer.context.textAlign = align;
        this.player.renderLayer.context.textBaseline = "top";
        this.player.renderLayer.context.fillText(
            text,
            this.player.renderLayer.data.width - x,
            y
        );
    }
}