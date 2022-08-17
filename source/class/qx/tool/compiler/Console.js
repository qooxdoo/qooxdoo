/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo
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

/**
 * The Console handles output of compiler messages for the end user (i.e. not debugging output).
 * The output is based around message IDs, which relate to translatable strings, plus arguments.
 */
qx.Class.define("qx.tool.compiler.Console", {
  extend: qx.core.Object,

  properties: {
    /** Whether verbose logging is enabled */
    verbose: {
      init: false,
      check: "Boolean"
    },

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
    },

    /** Colour prefix for console output */
    colorOn: {
      init: "",
      nullable: false,
      check: "String"
    }
  },

  members: {
    /**
     * Prints the message
     *
     * @param msgId {String} translatable message ID
     * @param args {Object...} arguments
     */
    print(msgId, ...args) {
      for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        if (
          typeof arg !== "string" &&
          typeof arg !== "number" &&
          arg !== null
        ) {
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
          this.log(str);
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
    decode(msgId, ...args) {
      var msg = qx.tool.compiler.Console.MESSAGE_IDS[msgId];
      if (msg) {
        let str = qx.lang.String.format(msg.message, args || []);
        return str;
      }
      let str = msgId + JSON.stringify(args);
      return str;
    },

    /**
     * Returns the type of the message, eg error, warning, etc
     *
     * @param msgId {String} the message ID to lookup
     * @return {String} the type of message, can be one of "message" (default) or "error", "warning"
     */
    getMessageType(msgId) {
      let msg = qx.tool.compiler.Console.MESSAGE_IDS[msgId];
      return msg ? msg.type : null;
    },

    /**
     * console.log equivalent, with colorization
     */
    log(...args) {
      console.log(this.getColorOn() + args.join(" "));
    },

    /**
     * console.debug equivalent, with colorization
     */
    debug(...args) {
      console.debug(this.getColorOn() + args.join(" "));
    },

    /**
     * console.info equivalent, with colorization
     */
    info(...args) {
      console.info(this.getColorOn() + args.join(" "));
    },

    /**
     * console.warn equivalent, with colorization, only operates if `verbose` is true
     */
    trace(...args) {
      if (this.isVerbose()) {
        console.warn(this.getColorOn() + args.join(" "));
      }
    },

    /**
     * console.warn equivalent, with colorization
     */
    warn(...args) {
      console.warn(this.getColorOn() + args.join(" "));
    },

    /**
     * console.error equivalent, with colorization
     */
    error(...args) {
      console.error(this.getColorOn() + args.join(" "));
    }
  },

  defer(statics) {
    /*
     * Errors
     */
    statics.addMessageIds(
      {
        // Compiler errors (@see {ClassFile})
        "qx.tool.compiler.class.invalidProperties":
          "Invalid 'properties' key in class definition",
        "qx.tool.compiler.compiler.missingClassDef":
          "FATAL Missing class definition - no call to qx.Class.define (or qx.Mixin.define etc)",
        "qx.tool.compiler.compiler.syntaxError": "FATAL Syntax error: %1",
        "qx.tool.compiler.compiler.invalidExtendClause":
          "FATAL Invalid `extend` clause - expected to find a class name (without quotes or `new`)",
        "qx.tool.compiler.compiler.invalidClassDefinitionEntry":
          "Unexpected property %2 in %1 definition",
        "qx.tool.compiler.compiler.wrongClassName":
          "Wrong class name or filename - expected to find at least %1 but only found [%2]",

        // Application errors (@see {Application})
        "qx.tool.compiler.application.partRecursive":
          "Part %1 has recursive dependencies on other parts",
        "qx.tool.compiler.application.duplicatePartNames":
          "Duplicate parts named '%1'",
        "qx.tool.compiler.application.noBootPart": "Cannot find a boot part",
        "qx.tool.compiler.application.conflictingExactPart":
          "Conflicting exact match for %1, could be %2 or %3",
        "qx.tool.compiler.application.conflictingBestPart":
          "Conflicting best match for %1, could be %2 or %3",
        "qx.tool.compiler.application.missingRequiredLibrary":
          "Cannot find required library %1",
        "qx.tool.compiler.application.missingScriptResource":
          "Cannot find script resource: %1",
        "qx.tool.compiler.application.missingCssResource":
          "Cannot find CSS resource: %1",

        // Target errors (@see {Target})
        "qx.tool.compiler.target.missingAppLibrary":
          "Cannot find library required to create application for %1",

        // Library errors (@see {Library})
        "qx.tool.compiler.library.emptyManifest":
          "Empty Manifest.json in library at %1",
        "qx.tool.compiler.library.cannotCorrectCase":
          "Unable to correct case for library in %1 because it uses source/resource directories which are outside the library",
        "qx.tool.compiler.library.cannotFindPath":
          "Cannot find path %2 required by library %1",

        // Targets
        "qx.tool.compiler.build.uglifyParseError":
          "Parse error in output file %4, line %1 column %2: %3",

        // Fonts
        "qx.tool.compiler.webfonts.error":
          "Error compiling webfont %1, error=%2",

        // Progress
        "qx.tool.compiler.maker.appFatalError":
          "Cannot write application '%1' because it has fatal errors"
      },

      "error"
    );

    /*
     * Warnings
     */
    statics.addMessageIds(
      {
        "qx.tool.compiler.class.blockedMangle":
          "The mangling of private variable '%1' has been blocked because it is referenced as a string before it is declared",
        "qx.tool.compiler.translate.invalidMessageId":
          "Cannot interpret message ID %1",
        "qx.tool.compiler.translate.invalidMessageIds":
          "Cannot interpret message ID %1, %2",
        "qx.tool.compiler.translate.invalidMessageIds3":
          "Cannot interpret message ID %1, %2, %3",

        "qx.tool.compiler.testForUnresolved":
          "Unexpected termination when testing for unresolved symbols, node type %1",
        "qx.tool.compiler.testForFunctionParameterType":
          "Unexpected type of function parameter, node type %1",
        "qx.tool.compiler.defer.unsafe":
          "Unsafe use of 'defer' method to access external class: %1",
        "qx.tool.compiler.symbol.unresolved": "Unresolved use of symbol %1",
        "qx.tool.compiler.environment.unreachable":
          "Environment check '%1' may be indeterminable, add to Manifest/provides/environment or use class name prefix",
        "qx.tool.compiler.compiler.requireLiteralArguments":
          "Wrong class name or filename - expected to find at least %1 but only found [%2]",

        "qx.tool.compiler.target.missingAppLibrary":
          "Cannot find the application library for %1",
        "qx.tool.compiler.webfonts.noResources":
          "Assets required for webfont %1 are not available in application %2, consider using @asset to include %3",
        "qx.tool.compiler.target.missingBootJs":
          "There is no reference to index.js script in the index.html copied from %1 (see https://git.io/fh7NI)",
        /* eslint-disable no-template-curly-in-string */
        "qx.tool.compiler.target.missingPreBootJs":
          "There is no reference to ${preBootJs} in the index.html copied from %1 (see https://git.io/fh7NI)",
        /* eslint-enable no-template-curly-in-string */

        "qx.tool.compiler.maker.appNotHeadless":
          "Compiling application '%1' but the target supports non-headless output, you may find unwanted dependencies are loaded during startup"
      },

      "warning"
    );
  },

  statics: {
    __INSTANCE: null,

    /**
     * Returns the singleton instance
     */
    getInstance() {
      if (!this.__INSTANCE) {
        this.__INSTANCE = new qx.tool.compiler.Console();
      }
      return this.__INSTANCE;
    },

    /**
     * Prints the message
     *
     * @param args {Object...} arguments
     */
    print(...args) {
      return this.getInstance().print(...args);
    },

    /**
     * Decodes the message ID and arguments into a string to be presented in the output
     *
     * @param args {Object...} arguments
     * @return {String} complete message
     */
    decode(...args) {
      return this.getInstance().decode(...args);
    },

    /**
     * console.log equivalent, with colorization
     */
    log(...args) {
      return this.getInstance().log(...args);
    },

    /**
     * console.debug equivalent, with colorization
     */
    debug(...args) {
      return this.getInstance().debug(...args);
    },

    /**
     * console.info equivalent, with colorization
     */
    info(...args) {
      return this.getInstance().info(...args);
    },

    /**
     * console.warn equivalent, with colorization
     */
    warn(...args) {
      return this.getInstance().warn(...args);
    },

    /**
     * console.warn equivalent, with colorization, only operates if `verbose` is true
     */
    trace(...args) {
      return this.getInstance().trace(...args);
    },

    /**
     * console.error equivalent, with colorization
     */
    error(...args) {
      return this.getInstance().error(...args);
    },

    /**
     * Message strings for markers, ie errors and warnings.  The strings are stored as statics
     * here, but that's because the CLI is currently assembled by hand and therefore does not
     * support translations.  When the CLI is itself compiled by `qx compile`, these strings
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
    addMessageIds(obj, type) {
      for (var id in obj) {
        this.MESSAGE_IDS[id] = {
          id: id,
          message: obj[id],
          type: type || "message"
        };
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
    decodeMarker(marker, showPosition) {
      var msg =
        qx.tool.compiler.Console.MESSAGE_IDS[marker.msgId] || marker.msgId;
      var type = msg.type ? msg.type + ": " : "";
      var str = "";
      var pos = marker.pos;
      if (showPosition !== false && pos && pos.start && pos.start.line) {
        str += "[" + pos.start.line;
        if (pos.start.column) {
          str += "," + pos.start.column;
        }
        if (
          pos.end &&
          pos.end.line &&
          pos.end.line !== pos.start.line &&
          pos.end.column !== pos.start.column
        ) {
          str += " to " + pos.end.line;
          if (pos.end.column) {
            str += "," + pos.end.column;
          }
        }
        str += "] ";
      }
      try {
        str += type + qx.lang.String.format(msg.message, marker.args || []);
      } catch (e) {
        throw new Error(`Unknown message id ${marker.msgId}.`);
      }
      return str;
    }
  }
});
