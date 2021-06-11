global.require = require;
global.loadSass = new Function (
`
  // trick out sass
  process.versions.electron = "0.0.0";
  let remove = false;
  if (typeof window === "undefined")
    return;
  if (!window.document.currentScript) {
    window.document.currentScript = {src: ""};
    remove = true;
  }
  const sass = global.require("sass");
  delete process.versions.electron;
  if (remove) {
    delete window.document.currentScript;
  }
  return sass;
`);


