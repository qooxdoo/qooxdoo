const fs = require("fs");
const path = require("upath");

qx.Class.define("qx.tool.compiler.MetaDatabase", {
  extend: qx.core.Object,

  construct() {
    super();
    this.__metaByClassname = {};
    this.__metaByFilename = {};
    this.__cachedMeta = {};
    this.__dirtyClasses = {};
    this.__database = {};
  },

  properties: {
    /** Where the meta files for individual classes are stored */
    rootDir: {
      init: "compiled/meta",
      check: "String"
    }
  },

  members: {
    /** @type{Map<String,qx.tool.compiler.MetaExtraction>} list of meta indexed by classname */
    __metaByClassname: null,

    /** @type{Map<String,Boolean} list of classes which need to have their second pass */
    __dirtyClasses: null,

    /** The database */
    __database: null,

    /**
     * Saves the database
     */
    async save() {
      await qx.tool.utils.Utils.makeDirs(this.getRootDir());
      this.__database.classnames = Object.keys(this.__metaByClassname);
      await qx.tool.utils.Json.saveJsonAsync(
        this.getRootDir() + "/db.json",
        this.__database
      );
    },

    getDatabase() {
      return this.__database;
    },

    /**
     * Loads the database and all of the meta data
     */
    async load() {
      let filename = this.getRootDir() + "/db.json";
      if (!fs.existsSync(filename)) {
        return;
      }
      this.__metaByClassname = {};
      this.__dirtyClasses = {};
      let data = await qx.tool.utils.Json.loadJsonAsync(filename);
      this.__database = data;

      for (let classname of data.classnames) {
        let filename =
          this.getRootDir() + "/" + classname.replace(/\./g, "/") + ".json";
        if (fs.existsSync(filename)) {
          await qx.tool.utils.Utils.makeParentDir(filename);
          let meta = new qx.tool.compiler.MetaExtraction(this.getRootDir());
          await meta.loadMeta(filename);
          this.__metaByClassname[classname] = meta;
          let classFilename = meta.getMetaData().classFilename;
          classFilename = path.resolve(
            path.join(this.getRootDir(), classFilename)
          );

          this.__metaByFilename[classFilename] = meta;
        }
      }
    },

    /**
     * Implementation of `qx.tool.compiler.jsdoc.ITypeResolver`
     *
     * @param {*} currentClassMeta
     * @param {String} type
     * @returns {String}
     */
    resolveType(currentClassMeta, type) {
      if (!type) {
        return type;
      }

      let pos = currentClassMeta.className.lastIndexOf(".");
      let packageName =
        pos > -1 ? currentClassMeta.className.substring(0, pos) : null;

      if (packageName) {
        pos = type.indexOf(".");
        if (pos < 0 && this.__metaByClassname[packageName + "." + type]) {
          return packageName + "." + type;
        }
      }

      return type;
    },

    /**
     * Adds a file to the database
     *
     * @param {String} filename
     * @param {Boolean} force
     */
    async addFile(filename, force) {
      filename = await qx.tool.utils.files.Utils.correctCase(filename);
      filename = path.resolve(filename);
      let meta = this.__metaByFilename[filename];
      if (meta && !force && !(await meta.isOutOfDate())) {
        return;
      }
      meta = new qx.tool.compiler.MetaExtraction(this.getRootDir());
      let metaData = await meta.parse(filename);
      if (metaData.className === undefined) {
        return;
      }
      this.__metaByClassname[metaData.className] = meta;
      this.__metaByFilename[filename] = meta;
      this.__dirtyClasses[metaData.className] = true;
    },

    /**
     * Returns a list of all class names
     *
     * @return {String[]}
     */
    getClassnames() {
      return Object.keys(this.__metaByClassname);
    },

    /**
     * Returns the meta data for a class
     *
     * @param {String} className
     * @returns
     */
    getMetaData(className) {
      return this.__metaByClassname[className]?.getMetaData() || null;
    },

    /**
     * Once all meta data has been loaded, this method traverses the database
     * to add information that can only be added once all classes are known,
     * eg which methods override other methods and where they were overridden from
     */
    async reparseAll() {
      let classnames = Object.keys(this.__dirtyClasses);
      this.__dirtyClasses = {};
      for (let className of classnames) {
        let meta = this.__metaByClassname[className];
        let metaData = meta.getMetaData();

        const typeResolver = {
          resolveType: this.resolveType.bind(this, metaData)
        };

        meta.fixupJsDoc(typeResolver);

        this.__fixupMembers(metaData);
        this.__fixupEntries(metaData, "members");

        // this.__fixupStatics(metaData);
        this.__fixupEntries(metaData, "statics");

        // this.__fixupProperties(metaData);
        this.__fixupEntries(metaData, "properties");

        let filename =
          this.getRootDir() + "/" + className.replace(/\./g, "/") + ".json";
        await meta.saveMeta(filename);
      }
    },

    /**
     * Finds info about a method
     *
     * @param {*} metaData starting point
     * @param {String} methodName name of the method
     * @param {Boolean} firstPass
     * @returns {*} meta data values to add to the method
     */
    __findSuperMethod(metaData, methodName, firstPass) {
      if (!firstPass) {
        let method = metaData.members?.[methodName];
        if (method) {
          return {
            overriddenFrom: metaData.className
          };
        }
      }
      if (metaData.mixins) {
        for (let mixinName of metaData.mixins) {
          let mixinMeta = this.__metaByClassname[mixinName];
          if (mixinMeta) {
            let mixinMetaData = mixinMeta.getMetaData();
            let method = mixinMetaData.members?.[methodName];
            if (method) {
              return {
                mixin: mixinName
              };
            }
          }
        }
      }
      if (!metaData.superClass) {
        return null;
      }
      let superMeta = this.__metaByClassname[metaData.superClass];
      if (superMeta) {
        return this.__findSuperMethod(
          superMeta.getMetaData(),
          methodName,
          false
        );
      }
      return null;
    },

    /**
     * @param {*} metaData class metadata
     * @param {string} entryKind name of the entry type
     * @param {string} entryName name of the entry
     * @returns {string[]} list of classes where the entry appears
     */
    __findAppearances(metaData, entryKind, entryName) {
      const getSuperLikes = meta => [
        ...(meta.mixins ?? []),
        ...(meta.superClass ? [meta.superClass] : []),
        ...(meta.interfaces ?? [])
      ];

      const resolve = meta => {
        if (meta[entryKind]?.[entryName]) {
          appearances.push(meta.className);
        }
      };

      const appearances = [];
      const toResolve = getSuperLikes(metaData);
      while (toResolve.length) {
        const currentMeta = this.__metaByClassname[toResolve.shift()];
        if (currentMeta) {
          resolve(currentMeta.getMetaData());
          toResolve.push(...getSuperLikes(currentMeta.getMetaData()));
        }
      }

      return appearances;
    },

    /**
     * Discovers data about the members in the hierarchy, eg whether overridden etc
     *
     * @param {*} metaData
     */
    __fixupMembers(metaData) {
      if (!metaData.members) {
        return;
      }
      if (metaData.abstract) {
        for (const itf of metaData.interfaces ?? []) {
          const itfMembers = this.__metaByClassname[itf]?.getMetaData().members;
          for (const memberName in itfMembers ?? {}) {
            const member = itfMembers[memberName];
            if (!metaData.members[memberName]) {
              metaData.members[memberName] = {
                ...member,
                abstract: true,
                fromInterface: itf
              };
            }
          }
        }
      }
      for (const methodName in metaData.members) {
        const methodMeta = metaData.members[methodName];
        const superMethod = this.__findSuperMethod(metaData, methodName, true);
        if (superMethod) {
          for (const key in superMethod) {
            methodMeta[key] = superMethod[key];
          }
        }
      }
    },

    // /**
    //  * Discovers data about the statics in the hierarchy
    //  *
    //  * @param {*} metaData
    //  */
    // __fixupStatics(metaData) {},

    // /**
    //  * Discovers data about the properties in the hierarchy
    //  *
    //  * @param {*} metaData
    //  */
    // __fixupProperties(metaData) {},

    /**
     * Detects the superlike (class/mixin/interface) appearances and includes the
     * mixin entries into the class metadata
     * @param {*} metaData
     * @param {string} kind
     */
    __fixupEntries(metaData, kind) {
      metaData[kind] ??= {};
      for (const mixin of metaData.mixins ?? []) {
        const mixinMeta = this.__metaByClassname[mixin]?.getMetaData();
        for (const name in mixinMeta?.[kind] ?? {}) {
          const appearsIn = this.__findAppearances(metaData, kind, name);
          const meta = qx.lang.Object.clone(mixinMeta[kind][name]);
          meta.mixin = mixin;
          meta.appearsIn = appearsIn;
          metaData[kind][name] = meta;
        }
      }
      for (const name in metaData[kind] ?? {}) {
        const meta = metaData[kind][name];
        meta.appearsIn = this.__findAppearances(metaData, kind, name);
      }
    },

    /**
     * Gets a flattened type hierarchy for a class
     * @param {string|object} metaOrClassName - the classname or the meta data of the class to get the hierarchy for
     * @returns the type hierarchy
     *
     */
    getHierarchyFlat(metaOrClassName) {
      const meta =
        typeof metaOrClassName === "string"
          ? this.getMetaData(metaOrClassName)
          : metaOrClassName;

      const data = {
        className: meta.className,
        superClasses: {},
        mixins: {},
        interfaces: {}
      };

      let toResolve = [meta];

      while (toResolve.length) {
        const currentMeta = toResolve.shift();

        if (currentMeta.superClass) {
          const superClassMeta = this.getMetaData(currentMeta.superClass);
          if (superClassMeta) {
            data.superClasses[superClassMeta.className] = superClassMeta;
            toResolve.push(superClassMeta);
          }
        }
        if (currentMeta.mixins) {
          for (const mixin of currentMeta.mixins) {
            const mixinMeta = this.getMetaData(mixin);
            if (mixinMeta) {
              data.mixins[mixinMeta.className] = mixinMeta;
              toResolve.push(mixinMeta);
            }
          }
        }
        if (currentMeta.interfaces) {
          for (const iface of currentMeta.interfaces) {
            const ifaceMeta = this.getMetaData(iface);
            if (ifaceMeta) {
              data.interfaces[ifaceMeta.className] = ifaceMeta;
              toResolve.push(ifaceMeta);
            }
          }
        }
      }

      return data;
    }
  }
});
