const path = require("upath");
const fs = require("fs");
const chokidar = require("chokidar");

/**
 * Discovery is used to discover files in a project by watching specified paths for changes.
 *
 * @typedef {Object} FileDiscoveryInfo
 * @property {String} filename - The filename of the discovered file
 * @property {String} rootDir - The root directory where the file is located
 */
qx.Class.define("qx.tool.compiler.meta.Discovery", {
  extend: qx.core.Object,

  construct() {
    super();
    this.__discoveredFiles = {};
    this.__watchedPaths = {};
  },

  events: {
    /** Fired when a class is added to the discovery, data is {FileDiscoveryInfo} */
    fileAdded: "qx.event.type.Data",

    /** Fired when a class is removed from the discovery, data is {FileDiscoveryInfo} */
    fileRemoved: "qx.event.type.Data",

    /** Fired when a class file changes, data is {FileDiscoveryInfo} */
    fileChanged: "qx.event.type.Data",

    /** Fired when the discovery process is starting */
    starting: "qx.event.type.Event",

    /** Fired when the discover process has completed it initial scan and is watching for changes */
    started: "qx.event.type.Event"
  },

  properties: {
    watch: {
      init: false,
      check: "Boolean"
    }
  },

  members: {
    __started: false,

    /**
     * @typedef {Object} FileMeta
     * @property {String} classname - The name of the class
     *
     * @type {Object<String, FileMeta>} list of discovered files
     */
    __discoveredFiles: null,

    /**
     * @typedef WatchedPath
     * @property {String} path - The path to watch
     * @property {chokidar.FSWatcher} watcher - The chokidar watcher instance
     *
     * @type {Object<String, WatchedPath?>} list of WatchedPath objects.
     * The object values are initially null, but after the discovery starts they are changed for WatchedPath objects.
     */
    __watchedPaths: null,

    /**
     * Adds a path to the discovery process. The path can be a directory or a file.
     *
     * @param {String} filename
     */
    addPath(filename, context) {
      if (qx.core.Environment.get("qx.debug")) {
        if (this.__started) {
          throw new Error("Cannot add paths after discovery has started.");
        }
      }
      this.__watchedPaths[filename] = { context: context };
    },

    /**
     * Starts the discovery process by watching the specified paths for changes
     */
    async start() {
      if (this.__started) {
        throw new Error("Discovery has already been started.");
      }
      this.fireEvent("starting");
      this.__started = true;
      if (this.getWatch()) {
        for (let filename in this.__watchedPaths) {
          filename = path.resolve(filename);
          let stat = await qx.tool.utils.files.Utils.safeStat(filename);
          if (!stat) {
            this.warn(`Directory ${filename} does not exist.`);
            continue;
          }
          let watcher = chokidar.watch(filename, {
            // Existing files are enumerated by scanWatchedPath() below; without this,
            // chokidar re-emits an "add" for each of them, producing duplicate fileAdded
            // events (and on Windows with a different path separator, see path.resolve below).
            ignoreInitial: true
            //ignored: /(^|[\/\\])\../
          });
          let watchedPath = this.__watchedPaths[filename];
          watchedPath.path = filename;
          watchedPath.watcher = watcher;
          watchedPath.ready = false;

          let rootDir = filename;
          // path.resolve() (upath) normalises chokidar's OS-native paths to absolute
          // forward-slash form, matching scanWatchedPath() so downstream lookups keyed by
          // filename dedupe correctly on Windows (where chokidar yields backslashes).
          watcher.on("change", filename =>
            this.fireDataEvent("fileChanged", { filename: path.resolve(filename), rootDir, context: watchedPath.context })
          );
          watcher.on("add", filename =>
            this.fireDataEvent("fileAdded", { filename: path.resolve(filename), rootDir, context: watchedPath.context })
          );
          watcher.on("unlink", filename =>
            this.fireDataEvent("fileRemoved", { filename: path.resolve(filename), rootDir, context: watchedPath.context })
          );
          watcher.on("ready", () => {
            qx.tool.compiler.Console.logVerbose(`Start watching ${rootDir}...`);
            watchedPath.ready = true;
          });
          watcher.on("error", err => {
            qx.tool.compiler.Console.print(err.code == "ENOSPC" ? "qx.tool.cli.watch.enospcError" : "qx.tool.cli.watch.watchError", err);
          });
        }
      }

      const scanWatchedPath = async (directoryName, context) => {
        // Scans a directory recursively to find all .js files
        const scanImpl = async (directoryName, rootDir) => {
          let filenames = await fs.promises.readdir(directoryName);
          for (let i = 0; i < filenames.length; i++) {
            let filename = filenames[i];
            if (filename.match(/__init__/i)) {
              continue;
            }
            let fullFilename = path.join(directoryName, filename);
            let stat = await fs.promises.stat(fullFilename);
            if (stat.isDirectory()) {
              if (filename[0] != ".") {
                await scanImpl(fullFilename, rootDir);
              }
            } else if (stat.isFile()) {
              this.fireDataEvent("fileAdded", { filename: fullFilename, rootDir, context: context });
            }
          }
        };

        await scanImpl(directoryName, directoryName);
      };

      for (let directoryName in this.__watchedPaths) {
        await scanWatchedPath(directoryName, this.__watchedPaths[directoryName].context);
      }
      this.fireEvent("started");
    },

    async stop() {
      let watchedPaths = Object.values(this.__watchedPaths);
      this.__watchedPaths = {};
      for (let watchedPath of watchedPaths) {
        if (watchedPath?.watcher) {
          await watchedPath.watcher.close();
        }
      }
      this.fireEvent("stopped");
    }
  }
});
