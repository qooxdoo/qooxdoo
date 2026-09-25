/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo
 *
 *    Copyright:
 *      2011-2025 Zenesis Limited, http://www.zenesis.com
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

const fs = require("fs");
const path = require("upath");

/**
 * ClassMeta is used to load and save the metadata for a class.
 *
 * @ignore(TextEncoder)
 * @ignore(SharedArrayBuffer)
 */
qx.Class.define("qx.tool.compiler.meta.ClassMeta", {
  extend: qx.core.Object,

  /**
   *
   * @param {string} metaRootDir Root directory of meta database
   * @param {string} libraryPath Path of the source files of the library that this file is found in
   */
  construct(metaRootDir, libraryPath) {
    super();
    this.setMetaRootDir(metaRootDir || null);
    this.__libraryPath = libraryPath || null;
  },

  properties: {
    /** Root directory for meta data; if provided then paths are stored relative, not absolute, which helps make
     * meta directories relocatable
     */
    metaRootDir: {
      init: null,
      nullable: true,
      check: "String"
    }
  },

  members: {
    /** @type {qx.tool.compiler.meta.StdClassParser.MetaData} the parsed data */
    __metaData: null,

    /** @type{SharedArrayBuffer?} the serialized form of the meta data */
    __sharedBufferMetaData: null,

    /** @type{Boolean} True if this object was created from a native object and is read-only */
    __readOnly: false,

    /** @type {String} path of the library where the class file is located */
    __libraryPath: null,

    /**
     * Loads the meta from disk
     *
     * @param {String} filename
     */
    async loadMeta(filename) {
      let metaData = await qx.tool.utils.Json.loadJsonAsync(filename);
      this.__sharedBufferMetaData = null;
      if (metaData?.version === qx.tool.compiler.meta.StdClassParser.VERSION) {
        this.__metaData = metaData;
      } else {
        this.__metaData = null;
      }
    },

    /**
     * Saves the meta to disk
     *
     * @param {String} filename
     */
    async saveMeta(filename) {
      await qx.tool.utils.Utils.makeParentDir(filename);
      await qx.tool.utils.Json.saveJsonAsync(filename, this.__metaData);
    },

    setMetaData(metaData) {
      if (this.__readOnly) {
        throw new Error("Cannot set meta data on a read-only ClassMeta");
      }
      this.__metaData = metaData;
      this.__sharedBufferMetaData = null;
    },

    /**
     * Returns the actual meta data
     *
     * @returns {qx.tool.compiler.meta.StdClassParser.MetaData}
     */
    getMetaData() {
      return this.__metaData;
    },

    /**
     * Returns the meta data as a SharedArrayBuffer, which can be shared with worker threads without copying; returns null if there is no meta data
     *
     * @returns {SharedArrayBuffer?} the meta data as a SharedArrayBuffer
     */
    getSharedBufferMetaData() {
      if (this.__sharedBufferMetaData) {
        return this.__sharedBufferMetaData;
      }
      if (!this.__metaData) {
        return null;
      }
      let encoded = new TextEncoder().encode(JSON.stringify(this.__metaData));
      let sharedBufferMetaData = new SharedArrayBuffer(encoded.byteLength);
      new Uint8Array(sharedBufferMetaData).set(encoded);
      this.__sharedBufferMetaData = sharedBufferMetaData;
      return this.__sharedBufferMetaData;
    },

    /**
     * Checks whether the meta data is out of date compared to the last modified
     * timestamp of the classname
     *
     * @returns {Boolean}
     */
    async isOutOfDate() {
      let classFilename = this.__metaData.classFilename;
      if (this.getMetaRootDir()) {
        classFilename = path.join(this.getMetaRootDir(), classFilename);
      }
      if (!fs.existsSync(classFilename)) {
        return true;
      }
      let stat = await fs.promises.stat(classFilename);
      let lastModified = this.__metaData?.lastModified;
      if (lastModified && lastModified == stat.mtime.getTime()) {
        return false;
      }
      return true;
    },

    /**
     * Parses the file and returns the metadata
     *
     * @param {String} classFilename the .js file to parse
     * @return {qx.tool.compiler.meta.StdClassParser.MetaData}
     */
    async parse(classFilename) {
      classFilename = await qx.tool.utils.files.Utils.correctCase(classFilename);
      let parser = new qx.tool.compiler.meta.StdClassParser();
      this.__metaData = await parser.parse(this.getMetaRootDir() || ".", this.__libraryPath, classFilename);
      return this.__metaData;
    },

    /**
     * Fixes up the JSDoc entries in the metadata.
     *
     * This will parse the JSDoc comments and update the metadata to try and get a stable
     * set of types and parameters.  The typeResolver is used to resolve types, which cannot
     * be done until types are loaded, because the typeResolver may need to resolve types
     * based on the current class' package name etc
     *
     * @param {*} typeResolver
     */
    fixupJsDoc(typeResolver) {
      let metaData = this.__metaData;

      const fixupEntry = obj => {
        if (obj && obj.jsdoc) {
          qx.tool.compiler.jsdoc.Parser.parseJsDoc(obj.jsdoc, typeResolver);
          if (obj.jsdoc["@param"] && obj.params) {
            let paramsLookup = {};
            obj.params.forEach(param => {
              paramsLookup[param.name] = param;
            });
            obj.jsdoc["@param"].forEach(paramDoc => {
              let param = paramsLookup[paramDoc.paramName];
              if (param) {
                if (paramDoc.type) {
                  param.type = paramDoc.type;
                }
                if (paramDoc.optional !== undefined) {
                  param.optional = paramDoc.optional;
                }
                if (paramDoc.defaultValue !== undefined) {
                  param.defaultValue = paramDoc.defaultValue;
                }
              }
            });
          }
          let returnDoc = obj.jsdoc["@return"]?.[0];
          if (returnDoc) {
            obj.returnType = {
              type: returnDoc.type
            };

            if (returnDoc.optional !== undefined) {
              obj.returnType.optional = returnDoc.optional;
            }
            if (returnDoc.defaultValue !== undefined) {
              obj.returnType.defaultValue = returnDoc.defaultValue;
            }
          }
        }
      };

      const fixupSection = sectionName => {
        var section = metaData[sectionName];
        if (section) {
          for (var name in section) {
            fixupEntry(section[name]);
          }
        }
      };

      fixupSection("properties");
      fixupSection("events");
      fixupSection("members");
      fixupSection("statics");
      fixupEntry(metaData.clazz);
      fixupEntry(metaData.construct);
      fixupEntry(metaData.destruct);
      fixupEntry(metaData.defer);
    }
  },

  statics: {
    /**
     * @param {Object} obj
     * @returns {qx.tool.compiler.meta.ClassMeta}
     */
    fromNativeObject(obj) {
      let classMeta = new qx.tool.compiler.meta.ClassMeta();
      classMeta.__metaData = obj;
      classMeta.__readOnly = true;
      return classMeta;
    }
  }
});
