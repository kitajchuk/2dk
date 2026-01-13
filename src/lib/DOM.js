export const html = String.raw;



export const renderButtonSprite = ( item, btn ) => {
    return html`
        <style>
            #${item.id} {
                width: ${item.width}px;
                height: ${item.height}px;
                background-image: url(${item.image});
                background-position: -${item.offsetX}px -${item.offsetY}px;
            }
        </style>
        <span class="_2dk__gamepad__sprite" id="${item.id}"></span>
        <span>${btn}</span>
    `;
};


export const renderMenu = ( hero ) => {
    return html`
        <div>Hero: ${hero.data.name}</div>
        <div>Health: ${hero.getStat( "health" )}</div>
        <div>Power: ${hero.getStat( "power" )}</div>
        <div>Strength: ${hero.getStat( "strength" )}</div>
        <div>${hero.data.currency}: ${hero.currency}</div>
        <div>Weapon: ${hero.data.equipped.weapon ? "Equipped" : "Not Equipped"}</div>
        <div>Shield: ${hero.data.equipped.shield ? "Equipped" : "Not Equipped"}</div>
    `;
}


export const renderSplash = ( data, display ) => {
    return html`
        <div>${data.name}: Save #${data.save}, Release v${data.release}</div>
        <div>${display}</div>
    `;
};


export const renderSplashInfo = ( installed ) => {
    return html`
        <div>Rotate to Landscape.</div>
        <div>${installed ? "Webapp Installed" : "Install Webapp"}</div>
    `;
};