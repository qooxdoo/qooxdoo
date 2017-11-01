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
    /** Whether to output all messages as machine readable data structures */
    machineReadable: {
      init: false,
      check: "Boolean"
    },
    
    /** 
     * Function that is used to output console messages; called with:
     *   str {String} complete message to output
     *   msgId {String} original message ID
     *   ...args {Object...} original arguments to message  
     */
    writer: {
      init: null,
      nullable: true,
      check: "Function"
    }
  },

  members: {
    /**
     * Prints the message
     * 
     * @param msgId {String} translatable message ID
     * @param args {Object...} arguments
     */
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
        var writer = this.getWriter();
        var str = this.decode(msgId, ...args);
        if (writer)
          writer(str, msgId, ...args);
        else
          console.log(str);
      }
    },
    
    /**
     * Decodes the message ID and arguments into a string to be presented in the output
     * 
     * @param msgId {String} translatable message ID
     * @param args {Object...} arguments
     * @return {String} complete message
     */
    decode: function(msgId, ...args) {
      var msg = qxcompiler.Console.MESSAGE_IDS[msgId]||msgId;
      var str = qx.lang.String.format(msg.message, args||[]);
      return str;
    }
  },
  
  defer: function(statics) {
    statics.addMessageIds({
      // Compiler errors & warnings (@see {ClassFile})
      "qxcompiler.symbol.unresolved": "Unresolved use of symbol %1",
      "qxcompiler.defer.unsafe": "Unsafe use of 'defer' method to access external class: %1",
      "qxcompiler.class.invalidProperties": "Invalid 'properties' key in class definition",
      "qxcompiler.compiler.syntaxError": "Syntax error: %1\n%2",
      "qxcompiler.compiler.missingClassDef": "Missing class definition - no call to qx.Class.define (or qx.Mixin.define etc)",
      
      // Application errors & warnings (@see {Application})
      "qxcompiler.application.partRecursive": "Part %1 has recursive dependencies on other parts",
      "qxcompiler.application.duplicatePartNames": "Duplicate parts named '%1'",
      "qxcompiler.application.noBootPart": "Cannot find a boot part",
      "qxcompiler.application.conflictingExactPart": "Conflicting exact match for %1, could be %2 or %3",
      "qxcompiler.application.conflictingBestPart": "Conflicting best match for %1, could be %2 or %3",
      
      // Fonts
      "qxcompiler.webfonts.error": "Error compiling webfont %1, error=%2",
      
      // Progress
      "qxcompiler.maker.appFatalError": "Cannot write application '%1' because it has fatal errors"
    }, "error");
    statics.addMessageIds({
      "qxcompiler.translate.invalidMessageId": "Cannot interpret message ID %1",
      "qxcompiler.translate.invalidMessageIds": "Cannot interpret message ID %1, %2",
      "qxcompiler.translate.invalidMessageIds3": "Cannot interpret message ID %1, %2, %3"
    }, "warning");
  },
  
  statics: {
    __INSTANCE: null,

    /**
     * Returns the singleton instance 
     */
    getInstance: function() {
      if (!this.__INSTANCE)
        this.__INSTANCE = new qxcompiler.Console();
      return this.__INSTANCE;
    },
    
    /**
     * Prints the message
     * 
     * @param msgId {String} translatable message ID
     * @param args {Object...} arguments
     */
    print: function(...args) {
      return this.getInstance().print(...args);
    },
    
    /**
     * Decodes the message ID and arguments into a string to be presented in the output
     * 
     * @param msgId {String} translatable message ID
     * @param args {Object...} arguments
     * @return {String} complete message
     */
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
     * 
     * @param obj {Object} map of id strings to message text
     * @param type {String?} the type of message, can be one of "message" (default) or "error", "warning"
     */
    addMessageIds: function(obj, type) {
      for (var id in obj)
        this.MESSAGE_IDS[id] = { id: id, message: obj[id], type: type||"message" };
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
      str += qx.lang.String.format(msg.message, marker.args||[]);
      return str;
    },
    
  }
});
