export const html = String.raw;


export const renderSplash = ( display ) => {
    return html`
        <div>${display}</div>
    `;
};


export const renderGameInfo = ( data ) => {
    return html`
        <div>${data.name}: Save #${data.save}, Release ${data.release}</div>
    `;
}


export const renderSplashInfo = ( installed ) => {
    return html`
        <div>Rotate to Landscape.</div>
        <div>${installed ? "Webapp Installed" : "Install Webapp"}</div>
    `;
};


export const renderDialogueText = ( text ) => {
    return html`
        <div class="_2dk__dialogue__text">${text}</div>
    `;
};


export const renderDialoguePrompt = ( text, data ) => {
    return html`
        <div>${text}</div>
        <span class="a">A: ${data.yes.label}</span>
        <span>,&nbsp;</span>
        <span class="b">B: ${data.no.label}</span>
    `;
};


export const renderButtonSprite = ( item, btn, rotate = 30 ) => {
    return html`
        <style>
            #${item.id} {
                width: ${item.width}px;
                height: ${item.height}px;
                background-image: url(${item.image});
                background-position: -${item.offsetX}px -${item.offsetY}px;
                transform: scale( 0.65 ) rotate( ${rotate}deg );
                transform-origin: center center;
            }
        </style>
        <span class="_2dk__gamepad__sprite" id="${item.id}"></span>
        <span>${btn}</span>
    `;
};


export const renderMenu = ( player ) => {
    const hero = player.gamebox.hero;

    return html`
        <div>Hero: ${hero.data.name}</div>
        <div>Health: ${hero.health}</div>
        <div>Power: ${hero.getStat( "power" )}</div>
        <div>Strength: ${hero.getStat( "strength" )}</div>
        <div>${player.data.currency}: ${hero.currency}</div>
        <div>Weapon: ${hero.data.equipped.weapon ? "Equipped" : "Unequipped"}</div>
        <div>Shield: ${hero.data.equipped.shield ? "Equipped" : "Unequipped"}</div>
        <div>Enemies Killed: ${hero.enemiesKilled}</div>
    `;
};