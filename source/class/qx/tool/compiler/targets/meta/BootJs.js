
const fs = qx.tool.utils.Promisify.fs;
const path = require("upath");

/**
 * Represents a "index.js" that is generated as part of a compile 
 */
qx.Class.define("qx.tool.compiler.targets.meta.BootJs", {
  extend: qx.tool.compiler.targets.meta.AbstractJavascriptMeta,
  
  construct(appMeta) {
    this.base(arguments, appMeta, `${appMeta.getApplicationRoot()}index.js`);
    this.__embeddedJs = [];
    this.__embeddedJsLookup = {};
  },
  
  properties: {
    needsWriteToDisk: {
      init: true,
      refine: true
    }
  },
  
  members: {
    __embeddedJs: null,
    __sourceMapOffsets: null,

    /**
     * Adds Javascript which is to be added to the end of the index.js, just before the app
     * is finalised
     * 
     * @param jsMeta {AbstractJavascriptMeta} the jaavscript to add
     */
    addEmbeddedJs(jsMeta) {
      if (!this.__embeddedJsLookup[jsMeta.toHashCode()]) {
        this.__embeddedJs.push(jsMeta);
        this.__embeddedJsLookup[jsMeta.toHashCode()] = jsMeta;
      }
    },
    
    /*
     * @Override
     */
    async writeSourceCodeToStream(ws) {
      let appMeta = this._appMeta;
      let application = appMeta.getApplication();
      let target = appMeta.getTarget();
      let appRootDir = appMeta.getApplicationRoot();
      let urisBefore = [];
      if (!target.isInlineExternalScripts()) {
        urisBefore = appMeta.getPreloads().urisBefore;
      } else {
        let inlines = [];
        urisBefore = appMeta.getPreloads().urisBefore.filter(uri => {
          // This is a http url, we cannot inline it
          if (uri.startsWith("__external__:")) {
            return true;
          }
          
          inlines.push(uri);
          return false;
        });
        for (let i = 0; i < inlines.length; i++) {
          let uri = inlines[i];
          
          let filename = path.join(target.getOutputDir(), "resources", uri);
          try {
            var data = await fs.readFileAsync(filename, { encoding: "utf-8" });
            ws.write(data);
            ws.write("\n");
          } catch (ex) {
            if (ex.code != "ENOENT") {
              throw ex; 
            }
          }
        }
      }
      
      var MAP = {
        EnvSettings: appMeta.getEnvironment(),
        Libraries: appMeta.getLibraries().map(library => library.getNamespace()),
        SourceUri: appMeta.getSourceUri(),
        ResourceUri: appMeta.getResourceUri(),
        Resources: appMeta.getResources(),
        Translations: {"C": null},
        Locales: {"C": null},
        Parts: {},
        Packages: {},
        UrisBefore: urisBefore,
        CssBefore: appMeta.getPreloads().cssBefore,
        Boot: "boot",
        ClosureParts: {},
        BootIsInline: false,
        NoCacheParam: false,
        DecodeUrisPlug: undefined,
        BootPart: undefined,
        TranspiledPath: undefined,
        PreBootCode: appMeta.getPreBootCode()
      };
      appMeta.getParts().forEach(part => part.serializeInto(MAP.Parts));
      appMeta.getPackages().forEach(pkg => pkg.serializeInto(MAP.Packages));

      if (application.getType() !== "browser") {
        MAP.TranspiledPath = path.relative(appRootDir, path.join(target.getOutputDir(), "transpiled"));
      }

      appMeta.getTarget().getLocales().forEach(localeId => {
        MAP.Translations[localeId] = null;
        MAP.Locales[localeId] = null;
      });
      this.__sourceMapOffsets = [];

      data = await fs.readFileAsync(application.getLoaderTemplate(), { encoding: "utf-8" });
      var lines = data.split("\n");
      for (let i = 0; i < lines.length; i++) {
        var line = lines[i];
        var match;
        while ((match = line.match(/\%\{([^}]+)\}/))) {
          var keyword = match[1];
          var replace = "";
          
          if (keyword == "BootPart") {
            for (let j = 0; j < this.__embeddedJs.length; j++) {
              this.__sourceMapOffsets.push(ws.getLineNumber());
              await this.__embeddedJs[j].unwrap().writeSourceCodeToStream(ws);
              ws.write("\n");
            }
          } else if (MAP[keyword] !== undefined) {
            if (keyword == "PreBootCode") {
              replace = MAP[keyword];
            } else {
              replace = JSON.stringify(MAP[keyword], null, 2);
            }
          }
          
          var newLine = line.substring(0, match.index) + replace + line.substring(match.index + keyword.length + 3);
          line = newLine;
        }
        if (line.match(/^\s*delayDefer:\s*false\b/)) {
          line = line.replace(/false/, "true");
        }
        ws.write(line + "\n");
      }
    },
    
    /*
     * @Override
     */
    async getSourceMap() {
      if (this.__sourceMapOffsets === null) {
        throw new Error(`Cannot get the source map for ${this} until the stream has been written`); 
      }
      let res = await this._copySourceMap(this.__embeddedJs, this.__sourceMapOffsets);
      let target = this._appMeta.getTarget();
      for (let i = 0; i < res.sources.length; i++) {
        res.sources[i] = path.relative("", res.sources[i]);
        let mapTo = target.getPathMapping(res.sources[i]);
        res.sources[i] = mapTo ? mapTo : res.sources[i];
      }
      return res;
    }
  }
});
