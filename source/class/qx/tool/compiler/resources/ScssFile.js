/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo-compiler
 *
 *    Copyright:
 *      2011-2019 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      MIT: https://opensource.org/licenses/MIT
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com, @johnspackman)
 *
 * *********************************************************************** */

/**
 * @ignore(require)
 */

/* eslint-disable @qooxdoo/qx/no-illegal-private-usage */

const fs = qx.tool.utils.Promisify.fs;
const path = require("upath");
const nodeSass = require("node-sass");

/**
 * @ignore(process)
 */
qx.Class.define("qx.tool.compiler.resources.ScssFile", {
  extend: qx.core.Object,
  
  construct: function(target, library, filename) {
    this.base(arguments);
    this.__library = library;
    this.__filename = filename;
    this.__target = target;
    this.__sourceFiles = {};
    this.__importAs = {};
  },
  
  properties: {
    file: {
      nullable: false,
      check: "String",
      event: "changeFile"
    },
    
    themeFile: {
      init: false,
      check: "Boolean"
    }
  },
  
  members: {
    __library: null,
    __filename: null,
    __outputDir: null,
    __absLocations: null,
    __sourceFiles: null,
    __importAs: null,
    
    /**
     * Compiles the SCSS, returns a list of files that were imported)
     * 
     * @param outputFilename {String} output
     * @return {String[]} dependent files
     */
    async compile(outputFilename) {
      this.__outputDir = path.dirname(outputFilename);
      this.__absLocations = {};
      
      let inputFileData = await this.loadSource(this.__filename, this.__library);
      
      await new qx.Promise((resolve, reject) => {
        nodeSass.render({
          // Always have file so that the source map knows the name of the original
          file: this.__filename,
          
          // data provides the contents, `file` is only used for the sourcemap filename
          data: inputFileData,
          
          outputStyle: "compressed",
          sourceMap: true,
          outFile: path.basename(outputFilename),
          
          /*
           * Importer
           */
          importer: (url, prev, done) => {
            let contents = this.__sourceFiles[url];
            if (!contents) {
              let tmp = this.__importAs[url];
              if (tmp) {
                contents = this.__sourceFiles[tmp];
              }
            }
            return contents ? { contents } : null;
          },
          
          functions: {
            "qooxdooUrl($filename, $url)": ($filename, $url, done) =>
              this.__qooxdooUrlImpl($filename, $url, done)
          }
        }, 
        (error, result) => {
          if (error) {
            this.error("Error status " + error.status + " in " + this.__filename + "[" + error.line + "," + error.column + "]: " + error.message);
            resolve(error); // NOT reject
            return;
          }

          fs.writeFileAsync(outputFilename, result.css.toString(), "utf8")
            .then(() => fs.writeFileAsync(outputFilename + ".map", result.map.toString(), "utf8"))
            .then(() => resolve(null))
            .catch(reject);
        });
      });
      
      return Object.keys(this.__sourceFiles);
    },
    
    _analyseFilename(url, currentFilename) {
      var m = url.match(/^([a-z0-9_.]+):(\/?[^\/].*)/);
      if (m) {
        return {
          namespace: m[1],
          filename: m[2],
          externalUrl: null
        };
      }
      
      // It's a real URL like http://abc.com/..
      if (url.match(/^[a-z0-9_]+:\/\//)) {
        return { 
          externalUrl: url 
        };
      }
      
      // It's either absolute to the website (i.e. begins with a slash) or it's
      //  relative to the current file
      if (url[0] == "/") {
        return {
          namespace: null,
          filename: url
        };
      }
      
      // Must be relative to current file
      let dir = path.dirname(currentFilename);
      let filename = path.resolve(dir, url);
      let library = this.__target.getAnalyser().getLibraries().find(library => filename.startsWith(path.resolve(library.getRootDir())));
      if (!library) {
        this.error("Cannot find library for " + url + " in " + currentFilename);
        return null;
      }
      
      let libResourceDir = path.join(library.getRootDir(), this.isThemeFile() ? library.getThemePath() : library.getResourcePath());
      return {
        namespace: library.getNamespace(),
        filename: path.relative(libResourceDir, filename),
        externalUrl: null
      };
    },
    
    reloadSource(filename) {
      filename = path.resolve(filename);
      delete this.__sourceFiles[filename];
      return this.loadSource(filename);
    },
    
    async loadSource(filename, library) {
      filename = path.relative(process.cwd(), path.resolve(this.isThemeFile() ? library.getThemeFilename(filename) : library.getResourceFilename(filename)));
      let absFilename = filename;
      if (path.extname(absFilename) == "") {
        absFilename += ".scss";
      }
      
      let exists = fs.existsSync(absFilename);
      if (!exists) {
        let name = path.basename(absFilename);
        if (name[0] != "_") {
          let tmp = path.join(path.dirname(absFilename), "_" + name);
          exists = fs.existsSync(tmp);
          if (exists) {
            absFilename = tmp;
          }
        }
      }
      if (!exists) {
        this.__sourceFiles[absFilename] = null;
        return null;
      }
      
      if (this.__sourceFiles[absFilename] !== undefined) {
        return qx.Promise.resolve(this.__sourceFiles[absFilename]);
      }
      
      let contents = await fs.readFileAsync(absFilename, "utf8");
      let promises = [];
      contents = contents.replace(/@import\s+["']([^;]+)["']/ig, (match, p1, offset) => {
        let pathInfo = this._analyseFilename(p1, absFilename);
        if (pathInfo.externalUrl) {
          return "@import \"" + pathInfo.externalUrl + "\"";
        }
        let newLibrary = this.__target.getAnalyser().findLibrary(pathInfo.namespace);
        if (!newLibrary) {
          this.error("Cannot find file to import, url=" + p1 + " in file " + absFilename);
          return null;
        }
        promises.push(this.loadSource(pathInfo.filename, newLibrary));
        return "@import \"" + path.relative(process.cwd(), newLibrary.getResourceFilename(pathInfo.filename)) + "\"";
      });
      
      contents = contents.replace(/\burl\s*\(\s*([^\)]+)*\)/ig, (match, url) => {
        let c = url[0];
        if (c === "\'" || c === "\"") {
          url = url.substring(1);
        }
        c = url[url.length - 1];
        if (c === "\'" || c === "\"") {
          url = url.substring(0, url.length - 1);
        }
        //return `qooxdooUrl("${filename}", "${url}")`;
        let pathInfo = this._analyseFilename(url, filename);
        
        if (pathInfo) {
          if (pathInfo.externalUrl) {
            return `url("${pathInfo.externalUrl}")`;
          }
          
          if (pathInfo.namespace) {
            let targetFile = path.relative(process.cwd(), path.join(this.__target.getOutputDir(), "resource", pathInfo.filename));
            let relative = path.relative(this.__outputDir, targetFile);
            return `url("${relative}")`;
          }
        }
        
        return `url("${url}")`;
      });

      this.__sourceFiles[absFilename] = contents;
      this.__importAs[filename] = absFilename;
      
      await qx.Promise.all(promises);
      return contents;
    },
    
    getSourceFilenames() {
      return Object.keys(this.__sourceFiles);
    },
    
    __qooxdooUrlImpl($filename, $url, done) {
      let currentFilename = $filename.getValue();
      let url = $url.getValue();
      
      let pathInfo = this._analyseFilename(url, currentFilename);
      
      if (pathInfo) {
        if (pathInfo.externalUrl) {
          return nodeSass.types.String("url(" + pathInfo.externalUrl + ")");
        }
        
        if (pathInfo.namespace) {
          let targetFile = path.relative(process.cwd(), path.join(this.__target.getOutputDir(), "resource", pathInfo.filename));
          let relative = path.relative(this.__outputDir, targetFile);
          return nodeSass.types.String("url(" + relative + ")");
        }
      }
      
      return nodeSass.types.String("url(" + url + ")");
    }    
  }
});
