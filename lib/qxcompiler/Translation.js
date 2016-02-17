/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/johnspackman/qxcompiler
 *
 *    Copyright:
 *      2011-2013 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      LGPL: http://www.gnu.org/licenses/lgpl.html
 *      EPL: http://www.eclipse.org/org/documents/epl-v10.php
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com)
 *
 * ************************************************************************/

var path = require("path");
var qx = require("qooxdoo");
var fs = require("fs");
var async = require("async");
var util = require("../util");

var log = util.createLog("translation");

/**
 * Reads and writes .po files for translation
 */
qx.Class.define("qxcompiler.Translation", {
  extend: qx.core.Object,

  /**
   * Constructor
   * @param library {Library}
   * @param locale {String}
   */
  construct: function(library, locale) {
    this.base(arguments);
    this.setLibrary(library);
    if (locale)
      this.setLocale(locale);
    this.__translations = {};
    this.__headers = {};
  },

  properties: {
    /** The library that this translation is for */
    library: {
      nullable: false,
      check: "qxcompiler.Library"
    },

    /** The locale */
    locale: {
      init: "en",
      nullable: false,
      check :"String"
    }
  },

  members: {
    __translations: null,
    __headers: null,
    __mtime: 0,

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
     * @param cb(err)
     * @returns {*}
     */
    checkRead: function(cb) {
      var t = this;
      if (!this.__mtime)
        return this.read(cb);
      var poFile = this.getPoFilename();
      fs.exists(poFile, function(exists) {
        if (!exists)
          return cb();
        fs.stat(poFile, function (err, stat) {
          if (err)
            return cb(err);
          if (t.__mtime == stat.mtime)
            return cb(null);
          return t.read(cb);
        });
      });
    },

    /**
     * Reads the .po file
     * @param cb
     */
    read: function(cb) {
      var t = this;
      t.__translations = {};
      t.__headers = {};
      var poFile = this.getPoFilename();
      fs.exists(poFile, function(exists) {
        if (!exists)
          return cb();
        fs.stat(poFile, function(err, stat) {
          if (err)
            return cb(err);
          t.__mtime = stat.mtime;
          fs.readFile(poFile, { encoding: "utf8" }, function(err, data) {
            function saveEntry() {
              if (entry && entry.msgid) {
                var key;
                if (entry.msgctxt)
                  key = entry.msgctxt + ":" + entry.msgid;
                else
                  key = entry.msgid;
                t.__translations[key] = entry;
              }
              entry = null;
            }

            var entry = null;
            data.split('\n').forEach(function (line, lineNo) {
              line = line.trim();
              if (!line)
                return saveEntry();

              if (!entry)
                entry = {};

              // Comment?
              var m = line.match(/^#([^ ]?) (.*)$/);
              if (m) {
                var type = m[1];
                var comment = m[2];
                var key;
                if (!entry.comments)
                  entry.comments = {};
                switch (type) {
                  case "":
                    entry.comments.translator = comment;
                    break;

                  case ".":
                    entry.comments.extracted = comment;
                    break;

                  case ":":
                    entry.comments.reference = comment;
                    break;

                  case ",":
                    entry.comments.flags = comment.split(',');
                    break;

                  case "|":
                    m = comment.match(/^([^\s]+)\s+(.*)$/);
                    if (m) {
                      if (!entry.previous)
                        entry.previous = {};
                      var tmp = m[1];
                      if (tmp == "msgctxt" || tmp == "msgid")
                        entry[tmp] = m[2];
                      else
                        log.warn("Cannot interpret line " + (lineNo + 1));
                    } else
                      log.warn("Cannot interpret line " + (lineNo + 1));
                    break;
                }
                return;
              }

              if (entry && entry.msgid === "") {
                if (line[0] == '"' && line[line.length - 1] == '"') {
                  line = line.substring(1, line.length - 1);
                  m = line.match(/^([^:]+):\s*(.*)$/);
                  if (m)
                    t.__headers[m[1]] = m[2];
                  return;
                }
              }

              // Part of the translation
              if (line == "#")
                return;
              m = line.match(/^([^\s]+)\s+(.*)$/);
              if (!m) {
                log.warn("Cannot interpret line " + (lineNo + 1));
                return;
              }

              var key = m[1];
              var value = m[2];
              if (value.length >= 2 && value[0] == '"' && value[value.length - 1] == '"') {
                value = value.substring(1, value.length - 1);

                var index = null;
                m = key.match(/^([^[]+)\[([0-9]+)\]$/);
                if (m) {
                  key = m[1];
                  index = parseInt(m[2]);
                  if (entry[key] === undefined)
                    entry[key] = [];
                  entry[key][index] = value;
                } else
                  entry[key] = value;
              }
            });
            cb();
          });
        });
      });
    },

    /**
     * Writes the .po file
     * @param cb
     */
    write: function(cb) {
      var t = this;
      var lines = [];
      lines.push("#");
      lines.push("msgid \"\"");
      lines.push("msgstr \"\"");
      for (key in t.__headers)
        lines.push("\"" + key + ": " + t.__headers[key] + "\"");
      lines.push("");
      for (var msgid in t.__translations) {
        var entry = t.__translations[msgid];
        if (entry.comments.translator)
          lines.push("#  " + entry.comments.translator);
        if (entry.comments.extracted)
          lines.push("#. " + entry.comments.extracted);
        if (entry.comments.reference)
          lines.push("#: " + entry.comments.reference);
        if (entry.comments.flags)
          lines.push("#, " + entry.comments.flags.join(','));
        if (entry.msgctxt)
          lines.push("msgctxt \"" + entry.msgctxt + "\"");
        lines.push("msgid \"" + entry.msgid + "\"");
        if (entry.msgid_plural)
          lines.push("msgid_plural \"" + entry.msgid_plural + "\"");
        if (qx.lang.Type.isArray(entry.msgstr)) {
          entry.msgstr.forEach(function (value, index) {
            lines.push("msgstr[" + index + "] \"" + value + "\"");
          });
        } else {
          lines.push("msgstr \"" + entry.msgstr + "\"");
        }
        lines.push("");
      }
      var data = lines.join("\n");
      fs.writeFile(t.getPoFilename(), data, { encoding: "utf8" }, cb);
    },

    /**
     * Returns the entry with the given msgid, null if it does not exist
     * @param id
     * @returns {*|null}
     */
    getEntry: function(id) {
      var t = this;
      return t.__translations[id]||null;
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
    }

  }
});
