const utils = require("./utils.js");

// Loads all maps from the maps directory for a given game
const loadMaps = async (root) => {
    const files = await utils.readDir(`${root}/maps`);
    const maps = await Promise.all(files.map(async (file) => {
        return await utils.readJson(`${root}/maps/${file}`);
    }));
    return maps;
};

// Gets the BOUNDARY events for a given map
const getBoundaryEvents = (map) => {
    return map.events.reduce((acc, event) => {
        if (event.type === "boundary" && !acc.some((e) => e.map === event.map)) {
            acc.push(event);
        }
        return acc;
    }, []);
};

// Gets the events for a given map by direction
const getEvents = (map) => {
    const mapEvents = getBoundaryEvents(map);
    
    const mapLeft = mapEvents.find((event) => event.dir === "left");
    const mapRight = mapEvents.find((event) => event.dir === "right");
    const mapUp = mapEvents.find((event) => event.dir === "up");
    const mapDown = mapEvents.find((event) => event.dir === "down");

    return {
        mapUp,
        mapDown,
        mapLeft,
        mapRight,
    };
};

const buildWorldMap = async (root) => {
    const visited = new Set();
    const worldMap = [[]];
    const offset = [0, 0];
    
    const processMap = (map, y, x) => {
        if (visited.has(map.id)) {
            return;
        }
        
        visited.add(map.id);
        
        // Check if we need to shift the entire map to accommodate negative positions
        if (y + offset[0] < 0) {
            const shift = Math.abs(y + offset[0]);
            offset[0] += shift;
            // Add new rows at the beginning
            for (let i = 0; i < shift; i++) {
                worldMap.unshift(new Array(Math.max(1, worldMap[0].length)).fill(null));
            }
        }
        
        if (x + offset[1] < 0) {
            const shift = Math.abs(x + offset[1]);
            offset[1] += shift;
            // Add new columns at the beginning of each row
            for (let row of worldMap) {
                row.unshift(...new Array(shift).fill(null));
            }
        }
        
        // Adjust position based on offset
        const adjustedY = y + offset[0];
        const adjustedX = x + offset[1];
        
        // Ensure array dimensions exist
        while (worldMap.length <= adjustedY) {
            worldMap.push(new Array(Math.max(1, worldMap[0].length)).fill(null));
        }
        while (worldMap[0].length <= adjustedX) {
            for (let row of worldMap) {
                row.push(null);
            }
        }
        
        // Place the current map
        worldMap[adjustedY][adjustedX] = map.id;
        
        const events = getEvents(map);
        
        // Process vertical connections first
        if (events.mapUp) {
            const upMap = maps.find(m => events.mapUp.map.includes(m.id));
            if (upMap) {
                processMap(upMap, y - 1, x);
            }
        }
        
        if (events.mapDown) {
            const downMap = maps.find(m => events.mapDown.map.includes(m.id));
            if (downMap) {
                processMap(downMap, y + 1, x);
            }
        }
        
        // Then process horizontal connections
        if (events.mapRight) {
            const rightMap = maps.find(m => events.mapRight.map.includes(m.id));
            if (rightMap) {
                processMap(rightMap, y, x + 1);
            }
        }
        
        if (events.mapLeft) {
            const leftMap = maps.find(m => events.mapLeft.map.includes(m.id));
            if (leftMap) {
                processMap(leftMap, y, x - 1);
            }
        }
    };

    // Load the game data and maps
    const game = await utils.readJson(`${root}/game.json`);
    const maps = await loadMaps(root);
    const spawnMap = maps.find(map => game.hero.map.includes(map.id));
    
    // Start with the current map at position [0, 0]
    processMap(spawnMap, 0, 0);
    
    // After all connections are processed, ensure the map is properly centered
    // by removing any empty rows at the beginning and end
    while (worldMap.length > 0 && worldMap[0].every(cell => cell === null)) {
        worldMap.shift();
    }
    while (worldMap.length > 0 && worldMap[worldMap.length - 1].every(cell => cell === null)) {
        worldMap.pop();
    }
    
    // Remove any empty columns at the beginning and end
    if (worldMap.length > 0) {
        while (worldMap[0].length > 0 && worldMap.every(row => row[0] === null)) {
            for (let row of worldMap) {
                row.shift();
            }
        }
        while (worldMap[0].length > 0 && worldMap.every(row => row[row.length - 1] === null)) {
            for (let row of worldMap) {
                row.pop();
            }
        }
    }
    
    // Ensure all rows have the same length
    const maxLength = Math.max(...worldMap.map(row => row.length));
    for (let row of worldMap) {
        while (row.length < maxLength) {
            row.push(null);
        }
    }
    
    return worldMap;
};

module.exports = {
    buildWorldMap,
};