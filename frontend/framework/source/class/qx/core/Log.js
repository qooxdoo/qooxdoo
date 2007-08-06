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
    // ***************************************************
    // CONSOLE OUTPUT OPTIONS/CONTROL
    // ***************************************************
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
      this.logFormatted(arguments, "warning");
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
     * Start grouping messages
     *
     * @type static
     * @param varargs {arguments} One or multiple messages
     * @return {void} 
     */
    group : function(varargs) {
      this.logRow(arguments, "group", this.pushGroup);
    },


    /**
     * End grouping messages
     *
     * @type static
     * @param varargs {arguments} One or multiple messages
     * @return {void} 
     */
    groupEnd : function(varargs) {
      this.logRow(arguments, "", this.popGroup);
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
     * Currently not supported
     *
     * @type static
     * @return {void} 
     */
    count : function() {
      this.warn([ "count() not supported." ]);
    },


    /**
     * Currently not supported
     *
     * @type static
     * @return {void} 
     */
    trace : function() {
      this.warn([ "trace() not supported." ]);
    },


    /**
     * Currently not supported
     *
     * @type static
     * @return {void} 
     */
    profile : function() {
      this.warn([ "profile() not supported." ]);
    },


    /**
     * Currently not supported
     *
     * @type static
     * @return {void} 
     */
    profileEnd : function() {},


    /**
     * Clears the console
     *
     * @type static
     * @return {void} 
     */
    clear : function() {
      this.consoleBody.innerHTML = "";
    },


    /**
     * Opens the console
     *
     * @type static
     * @return {void} 
     */
    open : function() {
      this.toggleConsole(true);
    },


    /**
     * Closes the console
     *
     * @type static
     * @return {void} 
     */
    close : function()
    {
      if (this.frameVisible) {
        this.toggleConsole();
      }
    },

    // ********************************************************************************************
    /** emulation flag */
    emu : true,

    /** Iframe element in which the console gets rendered */
    consoleFrame : null,

    /** div element in which the console messages get rendered */
    consoleBody : null,

    /** input element which gets used as commandline */
    commandLine : null,

    /** Flag whether the frame is visible or not */
    frameVisible : false,

    /** Queue with all messages to display */
    messageQueue : [],

    /** Array used to display grouped messages */
    groupStack : [],

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
      group    : "console.group",
      groupEnd : "console.groupEnd",
      time     : "console.time",
      timeEnd  : "console.timeEnd",
      clear    : "console.clear",
      close    : "console.close"
    },

    /** flag for load status */
    loaded : false,

    // ********************************************************************************************
    /**
     * Toogles the display of the console
     *
     * @type static
     * @param forceOpen {boolean} Flag to force the console to open/close
     * @return {void} 
     */
    toggleConsole : function(forceOpen)
    {
      this.frameVisible = forceOpen || !this.frameVisible;

      if (this.consoleFrame) {
        this.consoleFrame.style.visibility = this.frameVisible ? "visible" : "hidden";
      }
    },


    /**
     * Focuses the command line
     *
     * @type static
     * @return {void} 
     */
    focusCommandLine : function()
    {
      this.toggleConsole(true);

      if (this.commandLine) {
        this.commandLine.focus();
      }
    },


    /**
     * Listener method for "load" event of qx.core.Init
     *
     * @type static
     * @param e {Event} TODOC
     * @return {void} 
     */
    onload : function(e)
    {
      // set the flag and create frame if the current console is FireBug Lite
      this.loaded = true;

      if (console.emu) {
        this.createFrame();
      }
    },


    /**
     * Creates the iframe element which represents the console
     *
     * @type static
     * @return {void} 
     */
    createFrame : function()
    {
      if (qx.core.Log.consoleFrame) {
        return;
      }

      /* call the own "onLogReady" method in the context of "qx.core.Log" */

      window.onLogReady = function(doc) {
        qx.core.Log.onLogReady.call(qx.core.Log, doc);
      };

      var baseURL = qx.core.Log.getLogURL();
      var consoleFrame = qx.core.Log.consoleFrame;

      consoleFrame = document.createElement("iframe");
      consoleFrame.setAttribute("src", baseURL + "/log.html");
      consoleFrame.setAttribute("frameBorder", "0");
      consoleFrame.style.visibility = (this.frameVisible ? "visible" : "hidden");
      consoleFrame.style.zIndex = 1e6;
      consoleFrame.style.position = "fixed";
      consoleFrame.style.width = "100%";
      consoleFrame.style.left = "0px";
      consoleFrame.style.bottom = "0px";
      consoleFrame.style.height = "200px";
      
      if (qx.html2.client.Engine.MSHTML) 
      {
        consoleFrame.style.setExpression("top", "(qx.html2.Viewport.getHeight()+qx.html2.Viewport.getScrollTop()-200) + 'px'");
        consoleFrame.style.position = "absolute";
      }

      qx.core.Log.consoleFrame = consoleFrame;
      document.body.appendChild(consoleFrame);
    },


    /**
     * Called when the document in the iframe is fully loadad.
     * Registers some events on the several console elements 
     * and layouts the console
     *
     * @type static
     * @param doc {Node} Document node
     * @return {void} 
     */
    onLogReady : function(doc)
    {
      window.onLogReady = null;

      var toolbar = doc.getElementById("toolbar");

      toolbar.onmousedown = function(e) {
        qx.core.Log.onSplitterMouseDown.call(qx.core.Log, e);
      };

      this.commandLine = doc.getElementById("commandLine");
      this.addEvent(this.commandLine, "keydown", this.onCommandLineKeyDown);

      /* add the keydown events to the log document AND the parent document */

      this.addEvent(doc, qx.core.Client.isMshtml() || qx.core.Client.isWebkit() ? "keydown" : "keypress", qx.core.Log.onKeyDown);
      this.addEvent(parent.document, qx.core.Client.isMshtml() || qx.core.Client.isWebkit() ? "keydown" : "keypress", qx.core.Log.onKeyDown);

      this.consoleBody = doc.getElementById("log");
      this.layout();
      this.flush();
      this.toggleConsole(true);
    },


    /**
     * Returns the URL to the log files
     *
     * @type static
     * @return {String} URL to log files
     */
    getLogURL : function() {
      return qx.io.Alias.getInstance().resolve("static/log");
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

      try {
        value = eval(text);
      } catch(exc) {}

      window.console.log(value);
    },


    /**
     * layout the console
     *
     * @type static
     * @return {void} 
     */
    layout : function()
    {
      var toolbar = this.consoleBody.ownerDocument.getElementById("toolbar");
      var height = this.consoleFrame.offsetHeight - (toolbar.offsetHeight + this.commandLine.offsetHeight);

      this.consoleBody.style.top = toolbar.offsetHeight + "px";
      this.consoleBody.style.height = height <= 0 ? "1px" : height + "px";  // prevent consoleBody from completely disappearing

      this.commandLine.style.top = (this.consoleFrame.offsetHeight - this.commandLine.offsetHeight) + "px";
    },


    /**
     * Logs a row. Either writes directly to the console if it is ready or
     * queues the message.
     *
     * @type static
     * @param message {String} message to log
     * @param className {String} Controls the format of the message
     * @param handler {String} Name of the handler method
     * @return {void} 
     */
    logRow : function(message, className, handler)
    {
      if (this.consoleBody) this.writeMessage(message, className, handler);
      else
      {
        this.messageQueue.push([ message, className, handler ]);

        if (this.loaded == true) {
          this.createFrame();
        }
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
     * @param handler {String} Name of the handler method
     * @return {void} 
     */
    writeMessage : function(message, className, handler)
    {
      var isScrolledToBottom = this.consoleBody.scrollTop + this.consoleBody.offsetHeight >= this.consoleBody.scrollHeight;

      if (!handler) {
        handler = this.writeRow;
      }

      handler(message, className);

      if (isScrolledToBottom) {
        this.consoleBody.scrollTop = this.consoleBody.scrollHeight - this.consoleBody.offsetHeight;
      }
    },


    /**
     * Appends a row. Either to a (existing) group or directly to the console
     *
     * @type static
     * @param row {Node} Complete row element
     * @return {void} 
     */
    appendRow : function(row)
    {
      var container = this.groupStack.length ? this.groupStack[this.groupStack.length - 1] : this.consoleBody;
      container.appendChild(row);
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
      var row = qx.core.Log.consoleBody.ownerDocument.createElement("div");
      row.className = "logRow" + (className ? " logRow-" + className : "");
      row.innerHTML = message.join("");
      qx.core.Log.appendRow(row);
    },


    /**
     * Handler method for grouping messages
     *
     * @type static
     * @param message {Array} Array of message parts
     * @param className {String} Controls the format of the message
     * @return {void} 
     */
    pushGroup : function(message, className)
    {
      this.logFormatted(message, className);

      var groupRow = this.consoleBody.ownerDocument.createElement("div");
      groupRow.className = "logGroup";

      var groupRowBox = this.consoleBody.ownerDocument.createElement("div");
      groupRowBox.className = "logGroupBox";

      groupRow.appendChild(groupRowBox);
      this.appendRow(groupRowBox);
      this.groupStack.push(groupRowBox);
    },


    /**
     * Handler method for ungrouping messages
     *
     * @type static
     * @return {void} 
     */
    popGroup : function() {
      this.groupStack.pop();
    },

    // ********************************************************************************************
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
      // check for FireBug extension and delegate it to the extension
      if (!console.emu && console[className])
      {
        for (var i=0, j=objects.length; i<j; i++) {
          console[className].call(console, this.objectToString(objects[i]));
        }

        return;
      }

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

    // ********************************************************************************************
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

    // ********************************************************************************************
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


    /**
     * Outputs an error log message
     *
     * @type static
     * @param msg {String} Message to log
     * @param href {String} Link to the filename
     * @param lineNo {String} Line number
     * @return {void} 
     */
    onError : function(msg, href, lineNo)
    {
      var html = [];

      var lastSlash = href.lastIndexOf("/");
      var fileName = lastSlash == -1 ? href : href.substr(lastSlash + 1);

      html.push('<span class="errorMessage">', msg, '</span>', '<div class="objectBox-sourceLink">', fileName, ' (line ', lineNo, ')</div>');

      qx.core.Log.logRow(html, "error");
    },


    /**
     * Event handler method for the keydown event
     *
     * @type static
     * @param event {Object} Event object
     * @return {void} 
     */
    onKeyDown : function(event)
    {
      if (event.keyCode == 123)  // F12 key
      {
        qx.core.Log.toggleConsole();
      } else if ((event.keyCode == 108 || event.keyCode == 76) && event.shiftKey && (event.metaKey || event.ctrlKey)) {
        qx.core.Log.focusCommandLine();
      } else {
        return;
      }

      qx.core.Log.cancelEvent(event);
    },


    /**
     * Event handler method for the mousedown event at the splitter
     *
     * @type static
     * @param event {Object} Event object
     * @return {void} 
     */
    onSplitterMouseDown : function(event)
    {
      if (qx.core.Client.isWebkit() || qx.core.Client.isOpera()) return;

      this.addEvent(document, "mousemove", qx.core.Log.onSplitterMouseMove);
      this.addEvent(document, "mouseup", qx.core.Log.onSplitterMouseUp);

      for (var i=0; i<frames.length; ++i)
      {
        this.addEvent(frames[i].document, "mousemove", qx.core.Log.onSplitterMouseMove);
        this.addEvent(frames[i].document, "mouseup", qx.core.Log.onSplitterMouseUp);
      }
    },


    /**
     * Event handler method for the mousemove event at the splitter
     *
     * @type static
     * @param event {Object} Event object
     * @return {void} 
     */
    onSplitterMouseMove : function(event)
    {
      var win = document.all ? event.srcElement.ownerDocument.parentWindow : event.target.ownerDocument.defaultView;

      var clientY = event.clientY;
      if (win != win.parent) clientY += win.frameElement ? win.frameElement.offsetTop : 0;

      var height = qx.core.Log.consoleFrame.offsetTop + qx.core.Log.consoleFrame.clientHeight;
      var y = height - clientY;
      var minimumHeight = qx.core.Log.consoleBody.ownerDocument.getElementById("toolbar").offsetHeight + qx.core.Log.commandLine.offsetHeight;

      qx.core.Log.consoleFrame.style.height = y <= minimumHeight ? minimumHeight + "px" : y + "px";
      qx.core.Log.layout();
    },


    /**
     * Event handler method for the mouseup event at the splitter
     *
     * @type static
     * @param event {Object} Event object
     * @return {void} 
     */
    onSplitterMouseUp : function(event)
    {
      qx.core.Log.removeEvent(document, "mousemove", qx.core.Log.onSplitterMouseMove);
      qx.core.Log.removeEvent(document, "mouseup", qx.core.Log.onSplitterMouseUp);

      for (var i=0; i<frames.length; ++i)
      {
        qx.core.Log.removeEvent(frames[i].document, "mousemove", qx.core.Log.onSplitterMouseMove);
        qx.core.Log.removeEvent(frames[i].document, "mouseup", qx.core.Log.onSplitterMouseUp);
      }
    },


    /**
     * Event handler method for the keydown event at the command line
     *
     * @type static
     * @param event {Object} Event object
     * @return {void} 
     */
    onCommandLineKeyDown : function(event)
    {
      if (event.keyCode == 13) qx.core.Log.evalCommandLine(); else if (event.keyCode == 27) qx.core.Log.commandLine.value = "";
    }
  },

  defer : function(statics, members, properties)
  {
    if (!("console" in window) || !("firebug" in console)) {
      window.console = statics;
    }

    // add listener - DO NOT poll for "document.body"
    qx.core.Init.getInstance().addEventListener("load", qx.core.Log.onload, qx.core.Log);
  }
});
