/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Back (aback)

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
      this.logFormatted(arguments, "");
    },


    /**
     * Outputs a debug message
     *
     * @type static
     * @param varargs {arguments} One or multiple messages
     * @return {void}
     */
    debug : function(varargs) {
      this.logFormatted(arguments, "debug");
    },


    /**
     * Outputs an info message
     *
     * @type static
     * @param varargs {arguments} One or multiple messages
     * @return {void}
     */
    info : function(varargs) {
      this.logFormatted(arguments, "info");
    },


    /**
     * Outputs a warning message
     *
     * @type static
     * @param varargs {arguments} One or multiple messages
     * @return {void}
     */
    warn : function(varargs) {
      this.logFormatted(arguments, "warn");
    },


    /**
     * Outputs an error message
     *
     * @type static
     * @param varargs {arguments} One or multiple messages
     * @return {void}
     */
    error : function(varargs) {
      this.logFormatted(arguments, "error");
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

        this.logFormatted(args.length ? args : [ "Assertion Failure" ], "error");
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

        html.push('<tr>', '<td class="propertyNameCell"><span class="propertyName">', this.escapeHTML(name), '</span></td>', '<td><span class="propertyValue">');
        this.appendObject(value, html);
        html.push('</span></td></tr>');
      }

      html.push('</table>');

      this.logRow(html, "dir");
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

      this.appendNode(node, html);
      this.logRow(html, "dirxml");
    },


    /**
     * Start named timer
     *
     * @type static
     * @param name {String} name of the timer
     * @return {void}
     */
    time : function(name) {
      this.timeMap[name] = (new Date()).getTime();
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
      if (name in this.timeMap)
      {
        var delta = (new Date()).getTime() - this.timeMap[name];
        this.logFormatted([ name + ":", delta + "ms" ]);
        delete timeMap[name];
      }
    },


    /**
     * Clears the console
     *
     * @type static
     * @return {void}
     */
    clear : function() {
      this.consoleLog.innerHTML = "";
    },





    /*
    ---------------------------------------------------------------------------
      INTERNAL DATA
    ---------------------------------------------------------------------------
    */

    /** div element in which the console messages get rendered */
    consoleLog : null,

    /** input element which gets used as commandline */
    commandLine : null,

    /** Flag whether the frame is visible or not */
    frameVisible : false,

    /** Queue with all messages to display */
    messageQueue : [],

    /** Hash which holds the several named timer */
    timeMap : {},

    /** Command-line prefix */
    clPrefix : ">>> ",

    /** Console shortcuts so the user can type in debug() instead of console.debug() */
    consoleShortcuts :
    {
      log      : "console.log",
      info     : "console.info",
      debug    : "console.debug",
      warn     : "console.warn",
      error    : "console.error",
      assert   : "console.assert",
      dir      : "console.dir",
      dirxml   : "console.dirxml",
      time     : "console.time",
      timeEnd  : "console.timeEnd",
      clear    : "console.clear"
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
    focusCommandLine : function()
    {
      if (this.commandLine) {
        this.commandLine.focus();
      }
    },


    /**
     * Creates the iframe element which represents the console
     *
     * @type static
     * @return {void}
     */
    initializeWindow : function()
    {
      if (this.consoleWindow) {
        return;
      }
      
      var file = qx.io.Alias.getInstance().resolve("static/log/log.html");
      var win = this.consoleWindow = window.open(file, "win", "width=400,height=200,dependent=yes,resizable=yes,status=no,location=no,menubar=no,toolbar=no,scrollbars=no");
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
    onLogReady : function(win)
    {
      var doc = win.document;
      
      this.consoleWindow = win;
      this.consoleDocument = doc;
      this.consoleLog = doc.getElementById("log");
      this.commandLine = doc.getElementById("commandLine");
      
      this.onResizeWrapped = qx.lang.Function.bind(this.onResize, this);
      this.onCommandLineKeyDownWrapped = qx.lang.Function.bind(this.onCommandLineKeyDown, this);

      this.addEvent(win, "resize", this.onResizeWrapped);
      this.addEvent(this.commandLine, "keydown", this.onCommandLineKeyDownWrapped);

      this.syncLayout();
      this.flush();
    },
    
    
    syncLayout : function()
    {
      this.consoleLog.style.height = (qx.bom.Viewport.getHeight(this.consoleWindow) - 42) + "px"; 
    },


    /**
     * Evals the value typed in the commandline
     *
     * @type static
     * @return {void}
     */
    evalCommandLine : function()
    {
      var text = this.commandLine.value;
      this.commandLine.value = "";

      this.logRow([ this.clPrefix, text ], "command");

      // get the command
      var search = /^([a-z]+)\(/;
      var result = search.exec(text);

      if (result != null)
      {
        if (this.consoleShortcuts[result[1]]) {
          text = this.consoleShortcuts[result[1]] + text.substring(result[1].length);
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
    logRow : function(message, className)
    {
      if (this.consoleLog) 
      {
        this.writeMessage(message, className);
      }
      else
      {
        this.messageQueue.push([ message, className ]);
        this.initializeWindow();
      }
    },


    /**
     * Flushes the message queue and writes the content to the console
     *
     * @type static
     * @return {void}
     */
    flush : function()
    {
      var queue = this.messageQueue;
      this.messageQueue = [];

      for (var i=0; i<queue.length; ++i) {
        this.writeMessage(queue[i][0], queue[i][1], queue[i][2]);
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
    writeMessage : function(message, className)
    {
      var isScrolledToBottom = this.consoleLog.scrollTop + this.consoleLog.offsetHeight >= this.consoleLog.scrollHeight;

      this.writeRow(message, className);

      if (isScrolledToBottom) {
        this.consoleLog.scrollTop = this.consoleLog.scrollHeight - this.consoleLog.offsetHeight;
      }
    },


    /**
     * Appends a row. Either to a (existing) group or directly to the console
     *
     * @type static
     * @param row {Node} Complete row element
     * @return {void}
     */
    appendRow : function(row) {
      this.consoleLog.appendChild(row);
    },


    /**
     * Writes a single row using {@link #appendRow}
     *
     * @type static
     * @param message {Array} Array of message parts
     * @param className {String} Controls the format of the message
     * @return {void}
     */
    writeRow : function(message, className)
    {
      var row = this.consoleLog.ownerDocument.createElement("div");
      row.className = "logRow" + (className ? " logRow-" + className : "");
      row.innerHTML = message.join("");
      this.appendRow(row);
    },


    /**
     * Formats a log message
     *
     * @type static
     * @param objects {Array} Log objects
     * @param className {String} Controls the format of the message
     * @return {void}
     */
    logFormatted : function(objects, className)
    {
      var html = [];

      var format = objects[0];
      var objIndex = 0;

      if (typeof (format) != "string")
      {
        format = "";
        objIndex = -1;
      }

      var parts = this.parseFormat(format);

      for (var i=0; i<parts.length; ++i)
      {
        var part = parts[i];

        if (part && typeof (part) == "object")
        {
          var object = objects[++objIndex];
          part.appender(object, html);
        }
        else this.appendText(part, html);
      }

      for (var i=objIndex+1; i<objects.length; ++i)
      {
        this.appendText(" ", html);

        var object = objects[i];

        if (typeof (object) == "string") this.appendText(object, html);
        else this.appendObject(object, html);
      }

      this.logRow(html, className);
    },


    /**
     * Parses the output format
     *
     * @type static
     * @param format {String} format to parse
     * @return {Array} format parts
     */
    parseFormat : function(format)
    {
      var parts = [];

      var reg = /((^%|[^\\]%)(\d+)?(\.)([a-zA-Z]))|((^%|[^\\]%)([a-zA-Z]))/;

      var appenderMap =
      {
        s : this.appendText,
        d : this.appendInteger,
        i : this.appendInteger,
        f : this.appendFloat
      };

      for (var m=reg.exec(format); m; m=reg.exec(format))
      {
        var type = m[8] ? m[8] : m[5];
        var appender = type in appenderMap ? appenderMap[type] : appendObject;
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
    escapeHTML : function(value)
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
    objectToString : function(object)
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
    appendText : function(object, html) {
      html.push(this.escapeHTML(this.objectToString(object)));
    },


    /**
     * Outputs the given object in "null" datatype style.
     *
     * @type static
     * @param object {Object} given object
     * @param html {String} output
     * @return {void}
     */
    appendNull : function(object, html) {
      html.push('<span class="objectBox-null">', this.escapeHTML(this.objectToString(object)), '</span>');
    },


    /**
     * Outputs the given object in "String" datatype style.
     *
     * @type static
     * @param object {Object} given object
     * @param html {String} output
     * @return {void}
     */
    appendString : function(object, html) {
      html.push('<span class="objectBox-string">&quot;', this.escapeHTML(this.objectToString(object)), '&quot;</span>');
    },


    /**
     * Outputs the given object in "Integer" datatype style.
     *
     * @type static
     * @param object {Object} given object
     * @param html {String} output
     * @return {void}
     */
    appendInteger : function(object, html) {
      html.push('<span class="objectBox-number">', this.escapeHTML(this.objectToString(object)), '</span>');
    },


    /**
     * Outputs the given object in "Float" datatype style.
     *
     * @type static
     * @param object {Object} given object
     * @param html {String} output
     * @return {void}
     */
    appendFloat : function(object, html) {
      html.push('<span class="objectBox-number">', this.escapeHTML(this.objectToString(object)), '</span>');
    },


    /**
     * Outputs the given object in "Function" datatype style.
     *
     * @type static
     * @param object {Object} given object
     * @param html {String} output
     * @return {void}
     */
    appendFunction : function(object, html)
    {
      var reName = /function ?(.*?)\(/;
      var m = reName.exec(this.objectToString(object));
      var name = m ? m[1] : "function";
      html.push('<span class="objectBox-function">', this.escapeHTML(name), '()</span>');
    },


    /**
     * Outputs the given object in "Object" datatype style.
     *
     * @type static
     * @param object {Object} given object
     * @param html {String} output
     * @return {void}
     */
    appendObject : function(object, html)
    {
      try
      {
        if (object == undefined) this.appendNull("undefined", html); else if (object == null) this.appendNull("null", html); else if (typeof object == "string") this.appendString(object, html); else if (typeof object == "number") this.appendInteger(object, html); else if (typeof object == "function") this.appendFunction(object, html); else if (object.nodeType == 1) this.appendSelector(object, html); else if (typeof object == "object") this.appendObjectFormatted(object, html);
        else this.appendText(object, html);
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
    appendObjectFormatted : function(object, html)
    {
      var text = this.objectToString(object);
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
    appendSelector : function(object, html)
    {
      html.push('<span class="objectBox-selector">');

      html.push('<span class="selectorTag">', this.escapeHTML(object.nodeName.toLowerCase()), '</span>');
      if (object.id) html.push('<span class="selectorId">#', this.escapeHTML(object.id), '</span>');
      if (object.className) html.push('<span class="selectorClass">.', this.escapeHTML(object.className), '</span>');

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
    appendNode : function(node, html)
    {
      if (node.nodeType == 1)
      {
        html.push('<div class="objectBox-element">', '&lt;<span class="nodeTag">', node.nodeName.toLowerCase(), '</span>');

        for (var i=0; i<node.attributes.length; ++i)
        {
          var attr = node.attributes[i];
          if (!attr.specified) continue;

          html.push('&nbsp;<span class="nodeName">', attr.nodeName.toLowerCase(), '</span>=&quot;<span class="nodeValue">', this.escapeHTML(attr.nodeValue), '</span>&quot;');
        }

        if (node.firstChild)
        {
          html.push('&gt;</div><div class="nodeChildren">');

          for (var child=node.firstChild; child; child=child.nextSibling) this.appendNode(child, html);

          html.push('</div><div class="objectBox-element">&lt;/<span class="nodeTag">', node.nodeName.toLowerCase(), '&gt;</span></div>');
        }
        else html.push('/&gt;</div>');
      }
      else if (node.nodeType == 3)
      {
        html.push('<div class="nodeText">', this.escapeHTML(node.nodeValue), '</div>');
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
    addEvent : function(object, name, handler)
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
    removeEvent : function(object, name, handler)
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
    cancelEvent : function(event)
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
     * @param event {Object} Event object
     * @return {void}
     */
    onCommandLineKeyDown : function(event)
    {
      if (event.keyCode == 13) this.evalCommandLine(); 
      else if (event.keyCode == 27) this.commandLine.value = "";
    },
    
    
    /**
     * Event handler method for the resize event 
     *
     * @type static
     * @param event {Object} Event object
     * @return {void}
     */    
    onResize : function(event) {
      this.syncLayout();
    }
  }
});
