if (typeof global !== "undefined") {
  global.require = require;
  global.__filename__ = __filename;
  /* global loadSass */
  global.loadSass = new Function(
    `
  // trick out sass
  process.versions.electron = "0.0.0";
  if (typeof window === "undefined")
    return;
  const sass = global.require("sass");
  delete process.versions.electron;
  return sass;
`
  );
}
