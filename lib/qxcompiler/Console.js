/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qxcompiler
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
 * ************************************************************************/

var fs = require("fs");
var async = require("async");
var path = require("path");
var qx = require("qooxdoo");
var util = require("../util");

var log = util.createLog("console");

/**
 * The Console handles output of compiler messages for the end user (i.e. not debugging output).
 * The output is based around message IDs, which relate to translatable strings, plus arguments.
 */
qx.Class.define("qxcompiler.Console", {
  extend: qx.core.Object,
  
  properties: {
    machineReadable: {
      init: false,
      check: "Boolean"
    }
  },

  members: {
    print: function(msgId, ...args) {
      for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        if (typeof arg !== "string" && typeof arg !== "number" && arg !== null)
          args[i] = "" + arg;
      }
      if (this.isMachineReadable()) {
        var str = "##" + msgId + ":" + JSON.stringify(args);
        console.log(str);
      } else {
        var str = this.decode(msgId, ...args);
        console.log(str);
      }
    },
    
    decode: function(msgId, ...args) {
      var msg = qxcompiler.Console.MESSAGE_IDS[msgId]||msgId;
      var str = qx.lang.String.format(msg, args||[]);
      return str;
    }
  },
  
  defer: function(statics) {
    statics.addMessageIds({
      // Compiler errors & warnings (@see {ClassFile})
      "qxcompiler.symbol.unresolved": "Unresolved use of symbol %1",
      "qxcompiler.defer.unsafe": "Unsafe use of 'defer' method to access external class: %1",
      "qxcompiler.class.invalidProperties": "Invalid 'properties' key in class definition",
      "qxcompiler.translate.invalidMessageId": "Cannot interpret message ID %1",
      "qxcompiler.translate.invalidMessageIds": "Cannot interpret message ID %1, %2",
      "qxcompiler.translate.invalidMessageIds3": "Cannot interpret message ID %1, %2, %3",
      "qxcompiler.compiler.syntaxError": "Syntax error: %1\n%2",
      
      // Application errors & warnings (@see {Application})
      "qxcompiler.application.partRecursive": "Part %1 has recursive dependencies on other parts",
      "qxcompiler.application.duplicatePartNames": "Duplicate parts named '%1'",
      "qxcompiler.application.noBootPart": "Cannot find a boot part",
      "qxcompiler.application.conflictingExactPart": "Conflicting exact match for %1, could be %2 or %3",
      "qxcompiler.application.conflictingBestPart": "Conflicting best match for %1, could be %2 or %3",
      
      // Fonts
      "qxcompiler.webfonts.error": "Error compiling webfont %1, error=%2",
      
      // Progress
      "qxcompiler.maker.writingApplication": "Writing application '%2' to %1",
      "qxcompiler.maker.appFatalError": "Cannot write application '%1' because it has fatal errors"
    });
  },
  
  statics: {
    __INSTANCE: null,
    
    getInstance: function() {
      if (!this.__INSTANCE)
        this.__INSTANCE = new qxcompiler.Console();
      return this.__INSTANCE;
    },
    
    print: function(...args) {
      return this.getInstance().print(...args);
    },
    
    decode: function(...args) {
      return this.getInstance().decode(...args);
    },
    
    /**
     * Message strings for markers, ie errors and warnings.  The strings are stored as statics 
     * here, but that's because qxcompile is currently assembled by hand and therefore does not 
     * support translations.  When qxcompiler is itself compiled by qxcompiler, these strings 
     * will move into translation files.
     */
    MESSAGE_IDS: {},
    
    /**
     * Adds message IDs; this is a method because it allows other components (eg qxoodoo-cli) to
     * use it
     */
    addMessageIds: function(obj) {
      for (var name in obj)
        this.MESSAGE_IDS[name] = obj[name];
    },

    /**
     * Decodes a marker into a String description
     * @param marker {Map} containing:
     *    msgId {String}
     *    start {Map} containing:
     *        line {Integer}
     *        column? {Integer}
     *    end? {Map} containing:
     *        line {Integer}
     *        column? {Integer}
     *    args? {Object[]}
     * @param showPosition {Boolean?} whether to include line/column info (default is true)
     * @return {String}
     */
    decodeMarker: function(marker, showPosition) {
      var msg = qxcompiler.Console.MESSAGE_IDS[marker.msgId]||marker.msgId;
      var str = "";
      var pos = marker.pos;
      if (showPosition !== false && pos && pos.start && pos.start.line) {
        str += "[" + pos.start.line;
        if (pos.start.column)
          str += "," + pos.start.column;
        if (pos.end && pos.end.line && pos.end.line !== pos.start.line && pos.end.column !== pos.end.column) {
          str += " to " + pos.end.line;
          if (pos.end.column)
            str += "," + pos.end.column;
        }
        str += "] ";
      }
      str += qx.lang.String.format(msg, marker.args||[]);
      return str;
    },
    
  }
});
