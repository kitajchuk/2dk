const path = require("path");
const { buildWorldMap } = require("./buildWorldMap.js");

const rootGames = path.join(__dirname, "..", "..", "test");

describe( "buildWorldMap", () => {
    it("should build the world_map_no_empty_cells matrix", async () => {
        const root = path.join(rootGames, "world_map_no_empty_cells");
        const worldMap = await buildWorldMap(root);
        expect(worldMap).toEqual([
            [ "map-0-0", "map-1-0", "map-2-0", "map-3-0", "map-4-0" ],
            [ "map-0-1", "map-1-1", "map-2-1", "map-3-1", "map-4-1" ],
            [ "map-0-2", "map-1-2", "map-2-2", "map-3-2", "map-4-2" ]
        ]);
    });

    it("should build the world_map_with_empty_cells matrix", async () => {
        const root = path.join(rootGames, "world_map_with_empty_cells");
        const worldMap = await buildWorldMap(root);
        expect(worldMap).toEqual([
            [ null,      "map-1-0", "map-2-0", "map-3-0", null ],
            [ "map-0-1", null,      "map-2-1", "map-3-1", "map-4-1" ],
            [ "map-0-2", "map-1-2", "map-2-2", "map-3-2", null ]
        ]);
    });
});