/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo-compiler
 *
 *    Copyright:
 *      2011-2017 Zenesis Limited, http://www.zenesis.com
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


var fs = require("fs");

const {promisify} = require("util");
const readFile = promisify(fs.readFile);

var log = qx.tool.utils.LogManager.createLog("translation");

/**
 * Reads and writes .po files for translation
 */
qx.Class.define("qx.tool.compiler.app.Translation", {
  extend: qx.core.Object,

  /**
   * Constructor
   * @param library {Library}
   * @param locale {String}
   */
  construct: function(library, locale) {
    this.base(arguments);
    this.setLibrary(library);
    if (locale) {
      this.setLocale(locale);
    }
    this.__translations = {};
    this.__headers = {};
  },

  properties: {
    /** The library that this translation is for */
    library: {
      nullable: false,
      check: "qx.tool.compiler.app.Library"
    },

    /** The locale */
    locale: {
      init: "en",
      nullable: false,
      check :"String"
    },
    
    /** Whether to write line numbers to .po files */
    writeLineNumbers: {
      init: false,
      check: "Boolean"
    }
  },

  members: {
    __translations: null,
    __headers: null,
    __mtime: 0,
    __onRead: null,
    
    /**
     * Filename for the .po file
     * @returns {string}
     */
    getPoFilename: function() {
      var library = this.getLibrary();
      return library.getRootDir() + "/" + library.getTranslationPath() + "/" + this.getLocale() + ".po";
    },

    /**
     * Reads the .po file, but only if it has not been loaded or has changed
     *
     * @returns {Promise}|
     */
    checkRead: async function() {
      if (!this.__mtime) {
        return this.read();
      }
      var poFile = this.getPoFilename();
      let stat = await qx.tool.utils.files.Utils.safeStat(poFile);
      if (stat && this.__mtime == stat.mtime) {
        return undefined;
      }
      return this.read();
    },

    /**
     * Reads the .po file
     */
    read: function() {
      var t = this;
      if (t.__onRead) {
        return t.__onRead;
      }

      return t.__onRead = new Promise((resolve, reject) => {
        t.__translations = {};
        t.__headers = {};
        var poFile = this.getPoFilename();

        fs.stat(poFile, function(err, stat) {
          if (err) {
            if (err.code == "ENOENT") {
              resolve();
              return undefined;
            }
            reject(err);
            return undefined;
          }
          t.__mtime = stat.mtime;
          return readFile(poFile, { encoding: "utf8" })
            .then(data => {
              var entry = null;
              var lastKey = null;

              function saveEntry() {
                if (entry) {
                  var key;
                  if (entry.msgctxt) {
                    key = entry.msgctxt + ":" + entry.msgid;
                  } else {
                    key = entry.msgid;
                  }
                  t.__translations[key] = entry;
                }
                entry = null;
                lastKey = null;
              }

              function set(key, value, append) {
                var index = null;
                var m = key.match(/^([^[]+)\[([0-9]+)\]$/);
                value = value.replace(/\\t/g, "\t").replace(/\\r/g, "\r")
                  .replace(/\\n/g, "\n")
                  .replace(/\\"/g, "\"");
                if (m) {
                  key = m[1];
                  index = parseInt(m[2]);
                  if (entry[key] === undefined) {
                    entry[key] = [];
                  }
                  if (!append || typeof entry[key][index] !== "string") {
                    entry[key][index] = value;
                  } else {
                    entry[key][index] += value;
                  }
                } else if (!append || typeof entry[key] !== "string") {
                  entry[key] = value;
                } else {
                  entry[key] += value;
                }
              }

              data.split("\n").forEach(function(line, lineNo) {
                line = line.trim();
                if (!line) {
                  saveEntry();
                  return;
                }

                if (!entry) {
                  entry = {};
                }

                // Comment?
                var m = line.match(/^#([^ ]?) (.*)$/);
                if (m) {
                  var type = m[1];
                  var comment = m[2];
                  var key;
                  if (!entry.comments) {
                    entry.comments = {};
                  }
                  switch (type) {
                    case "":
                      entry.comments.translator = comment;
                      break;

                    case ".":
                      entry.comments.extracted = comment;
                      break;

                    case ":":
                      if (!entry.comments.reference) {
                        entry.comments.reference = {};
                      }
                      {
                        const ref = entry.comments.reference;
                        (comment && comment.match(/[\w/\.]+:\d+/g) || []).forEach(entry => {
                          const split = entry.split(":");
                          const classname = split[0];
                          const lineNo = parseInt(split[1], 10);
                          if (!ref[classname]) {
                            ref[classname] = [lineNo];
                          } else if (!ref[classname].includes(lineNo)) {
                            ref[classname].push(lineNo);
                          }
                        });
                      }
                      break;

                    case ",":
                      entry.comments.flags = comment.split(",");
                      break;

                    case "|":
                      m = comment.match(/^([^\s]+)\s+(.*)$/);
                      if (m) {
                        if (!entry.previous) {
                          entry.previous = {};
                        }
                        var tmp = m[1];
                        if (tmp == "msgctxt" || tmp == "msgid") {
                          entry[tmp] = m[2];
                        } else {
                          log.warn("Cannot interpret line " + (lineNo + 1));
                        }
                      } else {
                        log.warn("Cannot interpret line " + (lineNo + 1));
                      }
                      break;
                  }
                  return;
                }

                if (line[0] == "\"" && line[line.length - 1] == "\"") {
                  line = line.substring(1, line.length - 1);
                  if (!lastKey.match(/^.*\[\d+\]$/) && (lastKey === null || entry[lastKey] === undefined)) {
                    log.error("Cannot interpret line because there is no key to append to, line " + (lineNo+1));
                  } else {
                    set(lastKey, line, true);
                  }
                  return;
                }

                // Part of the translation
                if (line == "#") {
                  return;
                }
                m = line.match(/^([^\s]+)\s+(.*)$/);
                if (!m) {
                  log.warn("Cannot interpret line " + (lineNo + 1));
                  return;
                }

                key = lastKey = m[1];
                var value = m[2];
                if (value.length >= 2 && value[0] == "\"" && value[value.length - 1] == "\"") {
                  value = value.substring(1, value.length - 1);
                  set(key, value);
                }
              });

              if (entry) {
                saveEntry();
              }

              resolve();
            });
        });
      });
    },

    /**
     * Writes the .po file
     */
    write: async function() {
      this.writeTo(this.getPoFilename());
    },

    /**
     * Writes the .po file to a specific filename
     * @param filename {String}
     */
    writeTo: function(filename, cb) {
      var t = this;
      var lines = [];

      function write(key, value) {
        if (value === undefined || value === null) {
          return;
        }
        value = value.replace(/\t/g, "\\t").replace(/\r/g, "\\r")
          .replace(/\n/g, "\\n")
          .replace(/"/g, "\\\"");
        lines.push(key + " \"" + value + "\"");
      }

      for (var msgid in t.__translations) {
        var entry = t.__translations[msgid];
        if (entry.comments) {
          if (entry.comments.translator) {
            lines.push("# " + entry.comments.translator);
          }
          if (entry.comments.extracted) {
            lines.push("#. " + entry.comments.extracted);
          }
          if (entry.comments.reference) {
            let refStr = "#:";
            const ref = entry.comments.reference;
            for (let classname in ref) {
              if (ref[classname]) {
                if (this.isWriteLineNumbers()) {
                  for (let lineNo of ref[classname]) {
                    const addStr = " " + classname + ":" + lineNo;
                    if (refStr.length + addStr.length > 78) { // 78 is default length in python po library
                      // line break
                      lines.push(refStr);
                      refStr = "#:" + addStr;
                    } else {
                      refStr += addStr;
                    }
                  }
                } else {
                  const addStr = " " + classname;
                  if (refStr.length + addStr.length > 78) { // 78 is default length in python po library
                    // line break
                    lines.push(refStr);
                    refStr = "#:" + addStr;
                  } else {
                    refStr += addStr;
                  }
                }
              }
            }
            if (refStr.length > 3) { // write remaining refStr
              lines.push(refStr);
            }
          }
          if (entry.comments.flags) {
            lines.push("#, " + entry.comments.flags.join(","));
          }
        } else {
          lines.push("#");
        }
        if (entry.msgctxt) {
          lines.push("msgctxt \"" + entry.msgctxt + "\"");
        }
        write("msgid", entry.msgid);
        write("msgid_plural", entry.msgid_plural);
        if (qx.lang.Type.isArray(entry.msgstr)) {
          entry.msgstr.forEach(function(value, index) {
            write("msgstr[" + index + "]", value);
          });
        } else if (entry.msgid_plural) {
          write("msgstr[0]", "");
          write("msgstr[1]", "");
        } else {
          write("msgstr", entry.msgstr || "");
        }
        lines.push("");
      }
      var data = lines.join("\n");
      return qx.tool.utils.Promisify.fs.writeFileAsync(filename, data, { encoding: "utf8" });
    },
    
    /**
     * Tests whether an entry exists and has translation values
     * 
     * @param id {String} msgid
     * @return {Boolean}
     */
    hasEntryValue(id) {
      let entry = this.getEntry(id);
      if (!entry) {
        return false;
      }
      if (qx.lang.Type.isArray(entry.msgstr)) {
        return entry.msgstr.every(value => Boolean(value));
      }
      return Boolean(entry.msgstr);
    },

    /**
     * Returns the entry with the given msgid, null if it does not exist
     * @param id
     * @returns {*|null}
     */
    getEntry: function(id) {
      return this.__translations[id]||null;
    },

    /**
     * Deletes the entry with the given msgid; return the deleted value, or null if it does not exist
     * @param id
     * @returns {*|null}
     */
    deleteEntry: function(id) {
      let entry = this.__translations[id]||null;
      delete this.__translations[id];
      return entry;
    },

    /**
     * Returns the entry with the given msgid, creating it if it does not exist
     * @param id
     * @returns {*|null}
     */
    getOrCreateEntry: function(id) {
      var t = this;
      var entry = t.__translations[id];
      if (!entry) {
        entry = t.__translations[id] = {
          msgid: id
        };
      }
      return entry;
    },

    /**
     * Returns all entries
     * @returns {null}
     */
    getEntries: function() {
      return this.__translations;
    },

    /**
     * Returns the translation headers
     * @returns {null}
     */
    getHeaders: function() {
      return this.__headers;
    }

  }
});
