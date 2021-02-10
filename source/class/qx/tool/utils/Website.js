/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011-2019 The authors

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)
     * Christian Boulanger (info@bibliograph.org, @cboulanger)

************************************************************************ */

const fs = qx.tool.utils.Promisify.fs;
const process = require("process");
const path = require("upath");

const rimraf = require("rimraf");
const dot = require("dot");
require("jstransformer-dot");
const metalsmith = require("metalsmith");
const layouts = require("metalsmith-layouts");
const markdown = require("metalsmith-markdown");
//const filenames = require("metalsmith-filenames");
//var permalinks = require("metalsmith-permalinks");
const sass = require("node-sass");
const chokidar = require("chokidar");

// config
dot.templateSettings.strip = false;

qx.Class.define("qx.tool.utils.Website", {
  extend: qx.core.Object,

  statics: {
    APP_NAMESPACE: "apps"
  },

  construct: function(options={}) {
    qx.core.Object.apply(this, arguments);
    const self = qx.tool.utils.Website;
    let p = qx.util.ResourceManager.getInstance().toUri("qx/tool/website/.gitignore");
    p = path.dirname(p);
    this.initSourceDir(p);
    this.initTargetDir(path.join(p, "build"));
    this.initAppsNamespace(self.APP_NAMESPACE);

    for (let key of Object.getOwnPropertyNames(options)) {
      this.set(key, options[key]);
    }
  },

  properties: {
    appsNamespace: {
      check: "String",
      deferredInit: true
    },

    sourceDir: {
      check: "String",
      deferredInit: true
    },

    targetDir: {
      check: "String",
      deferredInit: true
    }
  },

  members: {
    /** @type {chokidar} watcher */
    __watcher: null,
    
    /** @type {Boolean} whether the watcher is ready yet */
    __watcherReady: false,
    
    /** @type {Integer} setTimeout timer ID for debouncing builds */
    __rebuildTimer: null,
    
    /** @type {Boolean} Whether the build is currently taking place */
    __rebuilding: false,
    
    /** @type {Boolean} Whether a rebuild is needed ASAP */
    __needsRebuild: false,
    
    /**
     * Starts the watcher for files in the source directory and compiles as needed
     */
    async startWatcher() {
      await this.stopWatcher();
      let sourceDir = await qx.tool.utils.files.Utils.correctCase(this.getSourceDir());
      this._watcher = chokidar.watch([ sourceDir ], {});
      this._watcher.on("change", filename => this.__onFileChange("change", filename));
      this._watcher.on("add", filename => this.__onFileChange("add", filename));
      this._watcher.on("unlink", filename => this.__onFileChange("unlink", filename));
      this._watcher.on("ready", async () => {
        await this.triggerRebuild(true);
        this.__watcherReady = true;
      });
      this._watcher.on("error", err => {
        qx.tool.compiler.Console.print(err.code == "ENOSPC" ? "qx.tool.cli.watch.enospcError" : "qx.tool.cli.watch.watchError", err);
      });
    },

    /**
     * Stops the watcher, if its running
     */
    async stopWatcher() {
      if (this._watcher) {
        await this._watcher.stop();
        this._watcher = null;
        this.__watcherReady = false;
      }
    },
    
    /**
     * Whether the watcher is running
     * 
     * @return {Boolean} true if its running
     */
    isWatching() {
      return Boolean(this._watcher);
    },

    /**
     * Waits for the rebuild process to complete, if it is running
     */
    async waitForRebuildComplete() {
      if (this.__rebuildPromise) {
        await this.__rebuildPromise;
      }
    },
    
    /**
     * Rebuilds everything needed for the website
     */
    async rebuildAll() {
      await this.generateSite();
      await this.compileScss();
    },

    /**
     * Event handler for changes to the source files
     * 
     * @param type {String} type of change, one of "change", "add", "unlink"
     * @param filename {String} the file that changed
     */
    __onFileChange(type, filename) {
      if (this.__watcherReady) {
        if (!filename.toLowerCase().startsWith(this.getTargetDir().toLowerCase())) {
          this.triggerRebuild(false);
        }
      }
    },
    
    /**
     * Triggers a rebuild of the website, asynchronously.  Unless immediate is true,
     * the rebuild will only happen after a short delay; but each time this is called,
     * the delay is restarted.  This is to allow multiple files to be changed without
     * swamping the processor with compilations.
     * 
     * @param immediate {Boolean?} if true, rebuild starts ASAP
     */
    triggerRebuild(immediate) {
      if (this.__rebuilding) {
        this.__needsRebuild = true;
        return;
      }
      
      let rebuilderImpl = async () => {
        await this.rebuildAll();
        
        if (this.__needsRebuild) {
          this.__needsRebuild = false;
          await rebuilderImpl();
        }
      };
      
      let rebuilder = async () => {
        this.__rebuilding = true;
        try {
          this.__rebuildPromise = rebuilderImpl();
          await this.__rebuildPromise;
          this.__rebuildPromise = null;
        } finally {
          this.__rebuilding = false;
        }
      };
      
      if (this.__rebuildTimer) {
        clearTimeout(this.__rebuildTimer);
        this.__rebuildTimer = null;
      }
      this.__rebuildTimer = setTimeout(rebuilder, immediate ? 1 : 250);
    },
    
    /**
     * Metalsmith Plugin that collates a list of pages that are to be included in the site navigation
     * into the metadata, along with their URLs.
     *
     * If the metadata has a `sites.pages`, then it is expected to be an array of URLs which indicates
     * the ordering to be applied; `sites.pages` is replaced with an array of objects, one per page,
     * that contains `url` and `title` properties.
     *
     */
    async getPages(files, metalsmith) {
      var metadata = metalsmith.metadata();

      var pages = [];
      var order = {};
      if (metadata.site.pages) {
        metadata.site.pages.forEach((url, index) => typeof url == "string" ? order[url] = index : null);
      }
      var unorderedPages = [];

      function addPage(url, title) {
        var page = {
          url: url,
          title: title
        };
        var index = order[url];
        if (index !== undefined) {
          pages[index] = page;
        } else {
          unorderedPages.push(page);
        }
      }

      for (let filename of Object.getOwnPropertyNames(files)) {
        let file = files[filename];
        if (filename === "index.html") {
          addPage("/", file.title || "Home Page");
        } else if (file.permalink || file.navigation) {
          addPage(file.permalink || filename, file.title || "Home Page");
        }
      }

      unorderedPages.forEach(page => pages.push(page));
      metadata.site.pages = pages;
    },

    /**
     * Metalsmith plugin that loads partials and adding them to the metadata.partials map.  Each file
     * is added with its filename, and if it is a .html filename is also added without the .html
     * extension.
     *
     */
    async loadPartials(files, metalsmith) {
      const metadata = metalsmith.metadata();
      const partialsDir = path.join(this.getSourceDir(), "partials");
      files = await fs.readdirAsync(partialsDir, "utf8");
      for (let filename of files) {
        let m = filename.match(/^(.+)\.([^.]+)$/);
        if (!m) {
          continue;
        }
        let [unused, name, ext] = m;
        if (unused) {
          // this is simply to avoid linting errors until https://github.com/qooxdoo/qooxdoo-compiler/issues/461 is fixed
        }
        let data = await fs.readFileAsync(path.join(partialsDir, filename), "utf8");
        let fn;
        try {
          fn = dot.template(data);
        } catch (err) {
          qx.tool.compiler.Console.log("Failed to load partial " + filename + ": " + err);
          continue;
        }
        fn.name = filename;
        metadata.partials[filename] = fn;
        if (ext === "html") {
          metadata.partials[name] = fn;
        }
      }
    },

    /**
     * Generates the site with Metalsmith
     * @returns {Promise}
     */
    async generateSite() {
      await new Promise((resolve, reject) => {
        metalsmith(this.getSourceDir())
          .metadata({
            site: {
              title: "Qooxdoo Application Server",
              description: "Mini website used by \"qx serve\"",
              email: "info@qooxdoo.org",
              twitter_username: "qooxdoo",
              github_username: "qooxdoo",
              pages: ["/", "/about/"]
            },
            baseurl: "",
            url: "",
            lang: "en",
            partials: {}
          })
          .source(path.join(this.getSourceDir(), "src"))
          .destination(this.getTargetDir())
          .clean(true)
          .use(this.loadPartials.bind(this))
          .use(markdown())
          .use(this.getPages.bind(this))
          .use(layouts({
            engine: "dot"
          }))
          .build(function (err) {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
      });
    },

    /**
     * Compiles SCSS into CSS
     *
     * @returns {Promise}
     */
    async compileScss() {
      let result = await new Promise((resolve, reject) => {
        sass.render({
          file: path.join(this.getSourceDir(), "sass", "qooxdoo.scss"),
          outFile: path.join(this.getTargetDir(), "qooxdoo.css")
        }, function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
      await fs.writeFileAsync(path.join(this.getTargetDir(), "qooxdoo.css"), result.css, "utf8");
    },

    /**
     * Build the development tool apps (APIViewer, Playground, Widgetbrowser, Demobrowser)
     * @return {Promise<void>}
     */
    async buildDevtools() {
      const namespace = this.getAppsNamespace();
      process.chdir(this.getTargetDir());
      let apps_path = path.join(this.getTargetDir(), namespace);
      if (await fs.existsAsync(apps_path)) {
        rimraf.sync(apps_path);
      }
      const opts = { noninteractive: true, namespace, theme: "indigo", icontheme: "Tango"};
      await (new qx.tool.cli.commands.Create(opts)).process();
      process.chdir(apps_path);
      for (let name of ["apiviewer", "widgetbrowser", "playground", "demobrowser"]) {
        await (new qx.tool.cli.commands.package.Install({})).install("qooxdoo/qxl." + name);
      }
    }
  }
});
