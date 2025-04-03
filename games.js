import fs from "fs";
import shell from "shelljs";

// Source games data copied to `dist`
const shellCmd = "find ./dist/games -type f";
const shellOpts = { silent: true };

// Shell out to `find` for quick recurse
const files = shell
  .exec(shellCmd, shellOpts)
  .stdout.split("\n")
  .filter((f) => /\.(json)$/.test(f));

// Minify JSON for each game
files.forEach((file) => {
  const json = JSON.parse(fs.readFileSync(file));
  const minified = JSON.stringify(json);
  fs.writeFileSync(file, minified);
});
