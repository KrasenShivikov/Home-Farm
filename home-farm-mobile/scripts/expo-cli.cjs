const path = require("node:path");
const Module = require("node:module");

process.env.NODE_PATH = [
  path.resolve(__dirname, "../node_modules"),
  process.env.NODE_PATH,
]
  .filter(Boolean)
  .join(path.delimiter);

Module._initPaths();

require("expo/bin/cli");
