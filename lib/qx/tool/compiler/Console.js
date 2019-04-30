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

require("qooxdoo");

/**
 * The Console handles output of compiler messages for the end user (i.e. not debugging output).
 * The output is based around message IDs, which relate to translatable strings, plus arguments.
 */
qx.Class.define("qx.tool.compiler.Console", {
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
        if (typeof arg !== "string" && typeof arg !== "number" && arg !== null) {
          args[i] = String(arg); 
        }
      }
      if (this.isMachineReadable()) {
        let str = "##" + msgId + ":" + JSON.stringify(args);
        console.log(str);
      } else {
        var writer = this.getWriter();
        let str = this.decode(msgId, ...args);
        if (writer) {
          writer(str, msgId, ...args); 
        } else {
          console.log(str); 
        }
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
      var msg = qx.tool.compiler.Console.MESSAGE_IDS[msgId]||msgId;
      var str = qx.lang.String.format(msg.message, args||[]);
      return str;
    }
  },
  
  defer: function(statics) {
    statics.addMessageIds({
      // Compiler errors & warnings (@see {ClassFile})
      "qx.tool.compiler.class.invalidProperties": "Invalid 'properties' key in class definition",
      "qx.tool.compiler.compiler.missingClassDef": "Missing class definition - no call to qx.Class.define (or qx.Mixin.define etc)",
      "qx.tool.compiler.compiler.syntaxError": "Syntax error: %1\n%2",
      "qx.tool.compiler.compiler.invalidExtendClause": "Invalid `extend` clause - expected to find a class name (without quotes or `new`)",
      "qx.tool.compiler.compiler.wrongClassName": "Wrong class name or filename - expected to find at least %1 but only found [%2]",
      
      // Application errors & warnings (@see {Application})
      "qx.tool.compiler.application.partRecursive": "Part %1 has recursive dependencies on other parts",
      "qx.tool.compiler.application.duplicatePartNames": "Duplicate parts named '%1'",
      "qx.tool.compiler.application.noBootPart": "Cannot find a boot part",
      "qx.tool.compiler.application.conflictingExactPart": "Conflicting exact match for %1, could be %2 or %3",
      "qx.tool.compiler.application.conflictingBestPart": "Conflicting best match for %1, could be %2 or %3",
      "qx.tool.compiler.application.missingRequiredLibrary": "Cannot find required library %1",
      
      // Target errors (@see {Target})
      "qx.tool.compiler.target.missingAppLibrary": "Cannot find library required to create application for %1",
      
      // Library errors (@see {Library})
      "qx.tool.compiler.library.emptyManifest": "Empty Manifest.json in library at %1",
      "qx.tool.compiler.library.cannotCorrectCase": "Unable to correct case for library in %1 because it uses source/resource directories which are outside the library",
      
      // Targets
      "qx.tool.compiler.build.uglifyParseError": "Parse error in output file %4, line %1 column %2: %3",
      
      // Fonts
      "qx.tool.compiler.webfonts.error": "Error compiling webfont %1, error=%2",
      
      // Progress
      "qx.tool.compiler.maker.appFatalError": "Cannot write application '%1' because it has fatal errors"
    }, "error");
    
    statics.addMessageIds({
      "qx.tool.compiler.translate.invalidMessageId": "Cannot interpret message ID %1",
      "qx.tool.compiler.translate.invalidMessageIds": "Cannot interpret message ID %1, %2",
      "qx.tool.compiler.translate.invalidMessageIds3": "Cannot interpret message ID %1, %2, %3",
      
      "qx.tool.compiler.defer.unsafe": "Unsafe use of 'defer' method to access external class: %1",
      "qx.tool.compiler.symbol.unresolved": "Unresolved use of symbol %1",
      
      "qx.tool.compiler.target.missingBootJs": "There is no reference to boot.js script in the index.html copied from %1 (see https://git.io/fh7NI)", 
      "qx.tool.compiler.target.missingPreBootJs": "There is no reference to ${preBootJs} in the index.html copied from %1 (see https://git.io/fh7NI)", 
    }, "warning");
  },
  
  statics: {
    __INSTANCE: null,

    /**
     * Returns the singleton instance 
     */
    getInstance: function() {
      if (!this.__INSTANCE) {
        this.__INSTANCE = new qx.tool.compiler.Console(); 
      }
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
      for (var id in obj) {
        this.MESSAGE_IDS[id] = { id: id, message: obj[id], type: type||"message" };
      }
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
      var msg = qx.tool.compiler.Console.MESSAGE_IDS[marker.msgId]||marker.msgId;
      var str = "";
      var pos = marker.pos;
      if (showPosition !== false && pos && pos.start && pos.start.line) {
        str += "[" + pos.start.line;
        if (pos.start.column) {
          str += "," + pos.start.column;
        }
        if (pos.end && pos.end.line && 
            pos.end.line !== pos.start.line && 
            pos.end.column !== pos.start.column) {
          str += " to " + pos.end.line;
          if (pos.end.column) {
            str += "," + pos.end.column;
          }
        }
        str += "] ";
      }
      str += qx.lang.String.format(msg.message, marker.args||[]);
      return str;
    }
    
  }
});
