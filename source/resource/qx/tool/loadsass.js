global.require = require;
global.__filename__ = __filename;
global.loadSass = new Function (
`
  // trick out sass
  process.versions.electron = "0.0.0";
  if (typeof window === "undefined")
    return;
  if (!window.document.currentScript) {
    window.document.currentScript = {
      src: new (require('url').URL)('file:' + global.__filename__).href
    };
  }
  const sass = global.require("sass");
  delete process.versions.electron;
  return sass;
`);
