/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Back (aback)
     * Sebastian Werner (wpbasti)

   ======================================================================

   This class contains code based on the following work:

   * Firebug Lite
     http://getfirebug.com/lite.html
     Version 1.0-b1

     Copyright:
       (c) 2007, Parakey Inc.

     License:
       BSD: http://www.opensource.org/licenses/bsd-license.php

     Authors:
       * Joe Hewitt

************************************************************************ */

/* ************************************************************************

#module(core)
#optional(qx.dev.StackTrace)
#embed(qx.static/log/log.html)

************************************************************************ */

/**
 * This class contains the Firebug Lite "console" for browsers without the Firebug
 * extension. It is relatively lightweight and only implement the basic
 * features.
 */
qx.Class.define("qx.core.Log",
{
  statics :
  {
    /*
    ---------------------------------------------------------------------------
      USER INTERFACE
    ---------------------------------------------------------------------------
    */

    /**
     * Outputs a log message
     *
     * @type static
     * @param varargs {arguments} One or multiple messages
     * @return {void}
     */
    log : function(varargs) {
      this._logFormatted(arguments, "");
    },


    /**
     * Outputs a debug message
     *
     * @type static
     * @param varargs {arguments} One or multiple messages
     * @return {void}
     */
    debug : function(varargs) {
      this._logFormatted(arguments, "debug");
    },


    /**
     * Outputs an info message
     *
     * @type static
     * @param varargs {arguments} One or multiple messages
     * @return {void}
     */
    info : function(varargs) {
      this._logFormatted(arguments, "info");
    },


    /**
     * Outputs a warning message
     *
     * @type static
     * @param varargs {arguments} One or multiple messages
     * @return {void}
     */
    warn : function(varargs) {
      this._logFormatted(arguments, "warn");
    },


    /**
     * Outputs an error message
     *
     * @type static
     * @param varargs {arguments} One or multiple messages
     * @return {void}
     */
    error : function(varargs) {
      this._logFormatted(arguments, "error");
    },


    /**
     * Asserts the given truth and outputs the message if the given "truth" is false
     * Also accepts variable arguments where the first argument is the expression and
     * the following are the object which should be tested.
     *
     * @type static
     * @param truth {Boolean ? null} Boolean value or null
     * @param message {String} message to throw
     * @param varargs {arguments} Multiple arguments, the first one is the expression, the following the objects to test
     * @return {void}
     * @throws TODOC
     */
    assert : function(truth, message, varargs)
    {
      if (!truth)
      {
        var args = [];
        for (var i=1; i<arguments.length; ++i) args.push(arguments[i]);

        this._logFormatted(args.length ? args : [ "Assertion Failure" ], "error");
        throw message ? message : "Assertion Failure";
      }
    },


    /**
     * Complete list of the given object
     *
     * @type static
     * @param object {Object} Object to list
     * @return {void}
     */
    dir : function(object)
    {
      var html = [];

      var pairs = [];

      for (var name in object)
      {
        try {
          pairs.push([ name, object[name] ]);
        } catch(exc) {}
      }

      pairs.sort(function(a, b) {
        return a[0] < b[0] ? -1 : 1;
      });

      html.push('<table>');

      for (var i=0; i<pairs.length; ++i)
      {
        var name = pairs[i][0], value = pairs[i][1];

        html.push('<tr>', '<td class="propertyNameCell"><span class="propertyName">', this._escapeHTML(name), '</span></td>', '<td><span class="propertyValue">');
        this._appendObject(value, html);
        html.push('</span></td></tr>');
      }

      html.push('</table>');

      this._logRow(html, "dir");
    },


    /**
     * Complete list of the given node
     *
     * @type static
     * @param node {DOMNode} Node to list
     * @return {void}
     */
    dirxml : function(node)
    {
      var html = [];

      this._appendNode(node, html);
      this._logRow(html, "dirxml");
    },


    /**
     * Start named timer
     *
     * @type static
     * @param name {String} name of the timer
     * @return {void}
     */
    time : function(name) {
      this._timeMap[name] = (new Date()).getTime();
    },


    /**
     * End named timer
     *
     * @type static
     * @param name {String} name of the timer
     * @return {void}
     */
    timeEnd : function(name)
    {
      if (name in this._timeMap)
      {
        var delta = (new Date()).getTime() - this._timeMap[name];
        this._logFormatted([ name + ":", delta + "ms" ]);
        delete this._timeMap[name];
      }
    },


    /**
     * Clears the console
     *
     * @type static
     * @return {void}
     */
    clear : function() {
      this._consoleLog.innerHTML = "";
    },


    /**
     * Logs the current stack trace as a debug message.
     *
     * @type member
     * @return {void}
     */
    trace : function()
    {
      if (qx.dev && qx.dev.StackTrace)
      {
        var trace = qx.dev.StackTrace.getStackTrace();

        this.debug("Current stack trace: ");
        for (var i=1, l=trace.length; i<l; i++) {
          this.debug("  - " + trace[i]);
        }
      }
      else
      {
        this.warn("Stacktraces are not support by your build!");
      }
    },





    /*
    ---------------------------------------------------------------------------
      INTERNAL DATA
    ---------------------------------------------------------------------------
    */

    /** div element in which the console messages get rendered */
    _consoleLog : null,

    /** input element which gets used as commandline */
    _commandLine : null,

    /** Queue with all messages to display */
    _messageQueue : [],

    /** Hash which holds the several named timer */
    _timeMap : {},

    /** Command-line prefix */
    _clPrefix : ">>> ",

    /** Console shortcuts so the user can type in debug() instead of console.debug() */
    _consoleShortcuts :
    {
      log      : "qx.core.Log.log",
      info     : "qx.core.Log.info",
      debug    : "qx.core.Log.debug",
      warn     : "qx.core.Log.warn",
      error    : "qx.core.Log.error",
      assert   : "qx.core.Log.assert",
      dir      : "qx.core.Log.dir",
      dirxml   : "qx.core.Log.dirxml",
      time     : "qx.core.Log.time",
      timeEnd  : "qx.core.Log.timeEnd",
      clear    : "qx.core.Log.clear"
    },








    /*
    ---------------------------------------------------------------------------
      INTERNAL METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Focuses the command line
     *
     * @type static
     * @return {void}
     */
    _focusCommandLine : function()
    {
      if (this._commandLine) {
        this._commandLine.focus();
      }
    },


    /**
     * Creates the iframe element which represents the console
     *
     * @type static
     * @return {void}
     */
    _initializeWindow : function()
    {
      if (this._consoleWindow) {
        return;
      }

      // Test for 'Setting' class
      if (qx.core.Setting)
      {
        var file = qx.core.Setting.get("qx.resourceUri") + "/static/log/log.html";
        this._consoleWindow = window.open(file, "win", "width=500,height=250,dependent=yes,resizable=yes,status=no,location=no,menubar=no,toolbar=no,scrollbars=no");
      }
    },


    /**
     * Called when the document in the iframe is fully loadad.
     * Registers some events on the several console elements
     * and layouts the console
     *
     * @type static
     * @param win {Window} Window object
     * @return {void}
     */
    _onLogReady : function(win)
    {
      var doc = win.document;

      this._consoleWindow = win;
      this._consoleDocument = doc;
      this._consoleLog = doc.getElementById("log");
      this._commandLine = doc.getElementById("commandLine");

      this._onUnloadWrapped = qx.lang.Function.bind(this._onUnload, this);
      this._onResizeWrapped = qx.lang.Function.bind(this._onResize, this);
      this._onCommandLineKeyDownWrapped = qx.lang.Function.bind(this._onCommandLineKeyDown, this);

      this._addEvent(window, "unload", this._onUnloadWrapped);
      this._addEvent(win, "unload", this._onUnloadWrapped);
      this._addEvent(win, "resize", this._onResizeWrapped);
      this._addEvent(this._commandLine, "keydown", this._onCommandLineKeyDownWrapped);

      this._syncLayout();
      this._flush();
    },


    /**
     * Synchronizes the height of the log console to the inner height of the window
     *
     * @type static
     * @return {void}
     */
    _syncLayout : function() {
      this._consoleLog.style.height = (qx.bom.Viewport.getHeight(this._consoleWindow) - 42) + "px";
    },


    /**
     * Evals the value typed in the commandline
     *
     * @type static
     * @return {void}
     */
    _evalCommandLine : function()
    {
      var text = this._commandLine.value;
      this._commandLine.value = "";

      this._logRow([ this._clPrefix, text ], "command");

      // get the command
      var search = /^([a-z]+)\(/;
      var result = search.exec(text);

      if (result != null)
      {
        if (this._consoleShortcuts[result[1]]) {
          text = this._consoleShortcuts[result[1]] + text.substring(result[1].length);
        }
      }

      var value;

      try
      {
        value = eval(text);
      }
      catch(ex)
      {
        this.error(ex);
      }

      if (value !== undefined) {
        this.log(value);
      }
    },


    /**
     * Logs a row. Either writes directly to the console if it is ready or
     * queues the message.
     *
     * @type static
     * @param message {String} message to log
     * @param className {String} Controls the format of the message
     * @return {void}
     */
    _logRow : function(message, className)
    {
      if (this._consoleLog)
      {
        this._writeMessage(message, className);
      }
      else
      {
        this._messageQueue.push([ message, className ]);
        this._initializeWindow();
      }
    },


    /**
     * Flushes the message queue and writes the content to the console
     *
     * @type static
     * @return {void}
     */
    _flush : function()
    {
      var queue = this._messageQueue;
      this._messageQueue = [];

      for (var i=0; i<queue.length; ++i) {
        this._writeMessage(queue[i][0], queue[i][1]);
      }
    },


    /**
     * Writes a message to the console
     *
     * @type static
     * @param message {Array} Array of message parts
     * @param className {String} Controls the format of the message
     * @return {void}
     */
    _writeMessage : function(message, className)
    {
      var isScrolledToBottom = this._consoleLog.scrollTop + this._consoleLog.offsetHeight >= this._consoleLog.scrollHeight;

      this._writeRow(message, className);

      if (isScrolledToBottom) {
        this._consoleLog.scrollTop = this._consoleLog.scrollHeight - this._consoleLog.offsetHeight;
      }
    },


    /**
     * Appends a row. Either to a (existing) group or directly to the console
     *
     * @type static
     * @param row {Node} Complete row element
     * @return {void}
     */
    _appendRow : function(row) {
      this._consoleLog.appendChild(row);
    },


    /**
     * Writes a single row using {@link #_appendRow}
     *
     * @type static
     * @param message {Array} Array of message parts
     * @param className {String} Controls the format of the message
     * @return {void}
     */
    _writeRow : function(message, className)
    {
      var row = this._consoleLog.ownerDocument.createElement("div");
      row.className = "logRow" + (className ? " logRow-" + className : "");
      row.innerHTML = message.join("");
      this._appendRow(row);
    },


    /**
     * Formats a log message
     *
     * @type static
     * @param objects {Array} Log objects
     * @param className {String} Controls the format of the message
     * @return {void}
     */
    _logFormatted : function(objects, className)
    {
      if (window.__firebug__ && window.console) {
        return window.console[className].apply(window.console, objects);
      }

      var html = [];

      var format = objects[0];
      var objIndex = 0;

      if (typeof (format) != "string")
      {
        format = "";
        objIndex = -1;
      }

      var parts = this._parseFormat(format);

      for (var i=0; i<parts.length; ++i)
      {
        var part = parts[i];

        if (part && typeof (part) == "object")
        {
          var object = objects[++objIndex];
          part.appender(object, html);
        }
        else this._appendText(part, html);
      }

      for (var i=objIndex+1; i<objects.length; ++i)
      {
        this._appendText(" ", html);

        var object = objects[i];

        if (typeof (object) == "string") this._appendText(object, html);
        else this._appendObject(object, html);
      }

      this._logRow(html, className);
    },


    /**
     * Parses the output format
     *
     * @type static
     * @param format {String} format to parse
     * @return {Array} format parts
     */
    _parseFormat : function(format)
    {
      var parts = [];

      var reg = /((^%|[^\\]%)(\d+)?(\.)([a-zA-Z]))|((^%|[^\\]%)([a-zA-Z]))/;

      var appenderMap =
      {
        s : this._appendText,
        d : this._appendInteger,
        i : this._appendInteger,
        f : this._appendFloat
      };

      for (var m=reg.exec(format); m; m=reg.exec(format))
      {
        var type = m[8] ? m[8] : m[5];
        var appender = type in appenderMap ? appenderMap[type] : this._appendObject;
        var precision = m[3] ? parseInt(m[3]) : (m[4] == "." ? -1 : 0);

        parts.push(format.substr(0, m[0][0] == "%" ? m.index : m.index + 1));

        parts.push(
        {
          appender  : appender,
          precision : precision
        });

        format = format.substr(m.index + m[0].length);
      }

      parts.push(format);

      return parts;
    },


    /**
     * Escapes the HTML in the given value
     *
     * @type static
     * @param value {String} value to escape
     * @return {String} escaped value
     */
    _escapeHTML : function(value)
    {
      function replaceChars(ch)
      {
        switch(ch)
        {
          case "<":
            return "&lt;";

          case ">":
            return "&gt;";

          case "&":
            return "&amp;";

          case "'":
            return "&#39;";

          case '"':
            return "&quot;";
        }

        return "?";
      }

      return String(value).replace(/[<>&"']/g, replaceChars);
    },


    /**
     * Converts a given object to a string
     *
     * @type static
     * @param object {Object} given object
     * @return {String} Returns the converted string or null
     */
    _objectToString : function(object)
    {
      try {
        return object + "";
      } catch(exc) {
        return null;
      }
    },








    /*
    ---------------------------------------------------------------------------
      DATA APPENDERS
    ---------------------------------------------------------------------------
    */

    /**
     * Outputs the given object in "text" datatype style.
     *
     * @type static
     * @param object {Object} given object
     * @param html {String} output
     * @return {void}
     */
    _appendText : function(object, html) {
      html.push(this._escapeHTML(this._objectToString(object)));
    },


    /**
     * Outputs the given object in "null" datatype style.
     *
     * @type static
     * @param object {Object} given object
     * @param html {String} output
     * @return {void}
     */
    _appendNull : function(object, html) {
      html.push('<span class="objectBox-null">', this._escapeHTML(this._objectToString(object)), '</span>');
    },


    /**
     * Outputs the given object in "String" datatype style.
     *
     * @type static
     * @param object {Object} given object
     * @param html {String} output
     * @return {void}
     */
    _appendString : function(object, html) {
      html.push('<span class="objectBox-string">&quot;', this._escapeHTML(this._objectToString(object)), '&quot;</span>');
    },


    /**
     * Outputs the given object in "Integer" datatype style.
     *
     * @type static
     * @param object {Object} given object
     * @param html {String} output
     * @return {void}
     */
    _appendInteger : function(object, html) {
      html.push('<span class="objectBox-number">', this._escapeHTML(this._objectToString(object)), '</span>');
    },


    /**
     * Outputs the given object in "Float" datatype style.
     *
     * @type static
     * @param object {Object} given object
     * @param html {String} output
     * @return {void}
     */
    _appendFloat : function(object, html) {
      html.push('<span class="objectBox-number">', this._escapeHTML(this._objectToString(object)), '</span>');
    },


    /**
     * Outputs the given object in "Function" datatype style.
     *
     * @type static
     * @param object {Object} given object
     * @param html {String} output
     * @return {void}
     */
    _appendFunction : function(object, html)
    {
      var reName = /function ?(.*?)\(/;
      var m = reName.exec(this._objectToString(object));
      var name = m ? m[1] : "function";
      html.push('<span class="objectBox-function">', this._escapeHTML(name), '()</span>');
    },


    /**
     * Outputs the given object in "Object" datatype style.
     *
     * @type static
     * @param object {Object} given object
     * @param html {String} output
     * @return {void}
     */
    _appendObject : function(object, html)
    {
      try
      {
        if (object == undefined) this._appendNull("undefined", html);
        else if (object == null) this._appendNull("null", html);
        else if (typeof object == "string") this._appendString(object, html);
        else if (typeof object == "number") this._appendInteger(object, html);
        else if (object.toString) this._appendText(object.toString(), html);
        else if (typeof object == "function") this._appendFunction(object, html);
        else if (object.nodeType == 1) this._appendSelector(object, html);
        else if (typeof object == "object") this._appendObjectFormatted(object, html);
        else this._appendText(object, html);
      }
      catch(exc) {}
    },


    /**
     * Outputs the given object in "Object" datatype formatted style.
     *
     * @type static
     * @param object {Object} given object
     * @param html {String} output
     * @return {void}
     */
    _appendObjectFormatted : function(object, html)
    {
      var text = this._objectToString(object);
      var reObject = /\[object (.*?)\]/;

      var m = reObject.exec(text);
      html.push('<span class="objectBox-object">', m ? m[1] : text, '</span>');
    },


    /**
     * Outputs the given object in "Selector" style.
     *
     * @type static
     * @param object {Object} given object
     * @param html {String} output
     * @return {void}
     */
    _appendSelector : function(object, html)
    {
      html.push('<span class="objectBox-selector">');

      html.push('<span class="selectorTag">', this._escapeHTML(object.nodeName.toLowerCase()), '</span>');
      if (object.id) html.push('<span class="selectorId">#', this._escapeHTML(object.id), '</span>');
      if (object.className) html.push('<span class="selectorClass">.', this._escapeHTML(object.className), '</span>');

      html.push('</span>');
    },


    /**
     * Outputs the given node.
     *
     * @type static
     * @param node {Node} given node
     * @param html {String} output
     * @return {void}
     */
    _appendNode : function(node, html)
    {
      if (node.nodeType == 1)
      {
        html.push('<div class="objectBox-element">', '&lt;<span class="nodeTag">', node.nodeName.toLowerCase(), '</span>');

        for (var i=0; i<node.attributes.length; ++i)
        {
          var attr = node.attributes[i];
          if (!attr.specified) continue;

          html.push('&nbsp;<span class="nodeName">', attr.nodeName.toLowerCase(), '</span>=&quot;<span class="nodeValue">', this._escapeHTML(attr.nodeValue), '</span>&quot;');
        }

        if (node.firstChild)
        {
          html.push('&gt;</div><div class="nodeChildren">');

          for (var child=node.firstChild; child; child=child.nextSibling) this._appendNode(child, html);

          html.push('</div><div class="objectBox-element">&lt;/<span class="nodeTag">', node.nodeName.toLowerCase(), '&gt;</span></div>');
        }
        else html.push('/&gt;</div>');
      }
      else if (node.nodeType == 3)
      {
        html.push('<div class="nodeText">', this._escapeHTML(node.nodeValue), '</div>');
      }
    },






    /*
    ---------------------------------------------------------------------------
      EVENT UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Adds an event to the given object
     *
     * @type static
     * @param object {Object} Target of the event
     * @param name {String} Name of the event
     * @param handler {Function} Event handler method
     * @return {void}
     */
    _addEvent : function(object, name, handler)
    {
      if (document.all) object.attachEvent("on" + name, handler);
      else object.addEventListener(name, handler, false);
    },


    /**
     * Removes an event from the given object
     *
     * @type static
     * @param object {Object} Target of the event
     * @param name {String} Name of the event
     * @param handler {Function} Event handler method
     * @return {void}
     */
    _removeEvent : function(object, name, handler)
    {
      if (document.all) object.detachEvent("on" + name, handler);
      else object.removeEventListener(name, handler, false);
    },


    /**
     * Cancels the given event
     *
     * @type static
     * @param event {String} Event name
     * @return {void}
     */
    _cancelEvent : function(event)
    {
      if (document.all) event.cancelBubble = true;
      else event.stopPropagation();
    },







    /*
    ---------------------------------------------------------------------------
      NATIVE EVENT HANDLERS
    ---------------------------------------------------------------------------
    */

    /**
     * Event handler method for the keydown event at the command line
     *
     * @type static
     * @param event {Event} Event object
     * @return {void}
     */
    _onCommandLineKeyDown : function(event)
    {
      if (event.keyCode == 13) this._evalCommandLine();
      else if (event.keyCode == 27) this._commandLine.value = "";
    },


    /**
     * Event handler method for the resize event
     *
     * @type static
     * @param event {Event} Event object
     * @return {void}
     */
    _onResize : function(event) {
      this._syncLayout();
    },


    /**
     * Event handler for unload event
     *
     * @type static
     * @param event {Event} DOM Event
     * @return {void}
     */
    _onUnload : function(event)
    {
      var win = this._consoleWindow;
      var cmd = this._commandLine;

      this._consoleWindow = null;
      this._consoleDocument = null;
      this._consoleLog = null;
      this._commandLine = null;

      this._removeEvent(window, "unload", this._onUnloadWrapped);

      if (win)
      {
        try {
          win.close();
        } catch(ex) {};

        this._removeEvent(win, "unload", this._onUnloadWrapped);
        this._removeEvent(win, "resize", this._onResizeWrapped);
      }

      if (cmd) {
        this._removeEvent(cmd, "keydown", this._onCommandLineKeyDownWrapped);
      }
    }
  }
});
