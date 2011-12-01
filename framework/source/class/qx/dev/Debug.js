/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006, 2007 Derrell Lipman
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Useful debug capabilities
 */
qx.Class.define("qx.dev.Debug",
{
  statics :
  {
    /**
     * Flag that shows whether dispose profiling is currently active
     * @internal
     */
    disposeProfilingActive : false,

    /**
     * Recursively display an object (as a debug message)
     *
     *
     * @param obj {Object}
     *   The object to be recursively displayed
     *
     * @param initialMessage {String, null}
     *   The initial message to be displayed.
     *
     * @param maxLevel {Integer ? 10}
     *   The maximum level of recursion.  Objects beyond this level will not
     *   be displayed.
     *
     * @return {void}
     */
    debugObject : function(obj, initialMessage, maxLevel)
    {
      // We've compiled the complete message.  Give 'em what they came for!
      qx.log.Logger.debug(this,
                          qx.dev.Debug.debugObjectToString(obj,
                                                           initialMessage,
                                                           maxLevel,
                                                           false));
    },

    /**
     * Recursively display an object (into a string)
     *
     *
     * @param obj {Object}
     *   The object to be recursively displayed
     *
     * @param initialMessage {String, null}
     *   The initial message to be displayed.
     *
     * @param maxLevel {Integer ? 10}
     *   The maximum level of recursion.  Objects beyond this level will not
     *   be displayed.
     *
     * @param bHtml {Boolean ? false}
     *   If true, then render the debug message in HTML;
     *   Otherwise, use spaces for indentation and "\n" for end of line.
     *
     * @return {String}
     *   The string containing the recursive display of the object
     */
    debugObjectToString : function(obj, initialMessage, maxLevel, bHtml)
    {
      // If a maximum recursion level was not specified...
      if (!maxLevel)
      {
        // ... then create one arbitrarily
        maxLevel = 10;
      }

      // If they want html, the differences are "<br>" instead of "\n"
      // and how we do the indentation.  Define the end-of-line string
      // and a start-of-line function.
      var eol = (bHtml ? "</span><br>" : "\n");
      var sol = function(currentLevel)
      {
        var indentStr;
        if (! bHtml)
        {
          indentStr = "";
          for (var i = 0; i < currentLevel; i++)
          {
            indentStr += "  ";
          }
        }
        else
        {
          indentStr =
            "<span style='padding-left:" + (currentLevel * 8) + "px;'>";
        }
        return indentStr;
      };

      // Initialize an empty message to be displayed
      var message = "";

      // Function to recursively display an object
      var displayObj = function(obj, level, maxLevel)
      {
        // If we've exceeded the maximum recursion level...
        if (level > maxLevel)
        {
          // ... then tell 'em so, and get outta dodge.
          message += (
            sol(level) +
              "*** TOO MUCH RECURSION: not displaying ***" +
              eol);
          return;
        }

        // Is this an ordinary non-recursive item?
        if (typeof (obj) != "object")
        {
          // Yup.  Just add it to the message.
          message += sol(level) + obj + eol;
          return;
        }

        // We have an object  or array.  For each child...
        for (var prop in obj)
        {
          // Is this child a recursive item?
          if (typeof (obj[prop]) == "object")
          {
            try
            {
              // Yup.  Determine the type and add it to the message
              if (obj[prop] instanceof Array)
              {
                message += sol(level) + prop + ": " + "Array" + eol;
              }
              else if (obj[prop] === null)
              {
                message += sol(level) + prop + ": " + "null" + eol;
                continue;
              }
              else if (obj[prop] === undefined)
              {
                message += sol(level) + prop + ": " + "undefined" + eol;
                continue;
              }
              else
              {
                message += sol(level) + prop + ": " + "Object" + eol;
              }

              // Recurse into it to display its children.
              displayObj(obj[prop], level + 1, maxLevel);
            }
            catch (e)
            {
              message +=
                sol(level) + prop + ": EXCEPTION expanding property" + eol;
            }
          }
          else
          {
            // We have an ordinary non-recursive item.  Add it to the message.
            message += sol(level) + prop + ": " + obj[prop] + eol;
          }
        }
      };

      // Was an initial message provided?
      if (initialMessage)
      {
        // Yup.  Add it to the displayable message.
        message += sol(0) + initialMessage + eol;
      }

      if (obj instanceof Array)
      {
        message += sol(0) + "Array, length=" + obj.length + ":" + eol;
      }
      else if (typeof(obj) == "object")
      {
        var count = 0;
        for (var prop in obj)
        {
          count++;
        }
        message += sol(0) + "Object, count=" + count + ":" + eol;
      }

      message +=
        sol(0) +
        "------------------------------------------------------------" +
        eol;

      try
      {
        // Recursively display this object
        displayObj(obj, 0, maxLevel);
      }
      catch(ex)
      {
        message += sol(0) + "*** EXCEPTION (" + ex + ") ***" + eol;
      }

      message +=
        sol(0) +
        "============================================================" +
        eol;

      return message;
    },


    /**
     * Get the name of a member/static function or constructor defined using the new style class definition.
     * If the function could not be found <code>null</code> is returned.
     *
     * This function uses a linear search, so don't use it in performance critical
     * code.
     *
     * @param func {Function} member function to get the name of.
     * @param functionType {String?"all"} Where to look for the function. Possible values are "members", "statics", "constructor", "all"
     * @return {String|null} Name of the function (null if not found).
     */
    getFunctionName: function(func, functionType)
    {
      var clazz = func.self;
      if (!clazz) {
        return null;
      }

      // unwrap
      while(func.wrapper) {
        func = func.wrapper;
      }

      switch (functionType)
      {
        case "construct":
          return func == clazz ? "construct" : null;

        case "members":
          return qx.lang.Object.getKeyFromValue(clazz, func);

        case "statics":
          return qx.lang.Object.getKeyFromValue(clazz.prototype, func);

        default:
          // constructor
          if (func == clazz) {
            return "construct";
          }

          return (
            qx.lang.Object.getKeyFromValue(clazz.prototype, func) ||
            qx.lang.Object.getKeyFromValue(clazz, func) ||
            null
          );
      }
    },


    /**
     * Returns a string representing the given model. The string will include
     * all model objects to a given recursive depth.
     *
     * @param model {qx.core.Object} The model object.
     * @param maxLevel {Number ? 10} The amount of max recursive depth.
     * @param html {Boolean ? false} If the returned string should have \n\r as
     *   newline of <br>.
     * @param indent {Number ? 1} The indentation level.
     *   (Needed for the recursion)
     *
     * @return {String} A string representation of the given model.
     */
    debugProperties: function(model, maxLevel, html, indent) {
      // set the default max depth of the recursion
      if (maxLevel == null) {
        maxLevel = 10;
      }
      // set the default startin indent
      if (indent == null) {
        indent = 1;
      }

      var newLine = "";
      html ? newLine = "<br>" : newLine = "\r\n";

      var message = "";

      if (
        qx.lang.Type.isNumber(model)
        || qx.lang.Type.isString(model)
        || qx.lang.Type.isBoolean(model)
        || model == null
        || maxLevel <= 0
      ) {
        return model;

      } else if (qx.Class.hasInterface(model.constructor, qx.data.IListData)) {
        // go threw the data structure
        for (var i = 0; i < model.length; i++) {
          // print out the indentation
          for (var j = 0; j < indent; j++) {
            message += "-"
          }
          message += "index(" + i + "): "
            + this.debugProperties(model.getItem(i), maxLevel - 1, html, indent + 1)
            + newLine;
        }
        return message + newLine;

      } else if (model.constructor != null) {
        // go threw all properties
        var properties = model.constructor.$$properties;
        for (var key in properties) {
          message += newLine;
          // print out the indentation
          for (var j = 0; j < indent; j++) {
            message += "-"
          }
          message += " " + key + ": " + this.debugProperties(
            model["get" + qx.lang.String.firstUp(key)](), maxLevel - 1, html, indent + 1
          );
        }
        return message;
      }
      return "";
    },


    /**
     * Starts a dispose profiling session. Use {@link #stopDisposeProfiling} to
     * get the results
     *
     * @signature function()
     */
    startDisposeProfiling : qx.core.Environment.select("qx.debug.dispose", {
      "true" : function() {
        this.disposeProfilingActive = true;
        this.__nextHashFirst = qx.core.ObjectRegistry.getNextHash();
      },

      "default" : qx.lang.Function.empty
    }),


    /**
     * Returns a list of any (qx) objects that were created but not disposed since
     * {@link #startDisposeProfiling} was called. Also returns a stack trace
     * recorded at the time the object was created.
     *
     * @signature function(checkFunction)
     * @param checkFunction {Function} Custom check function. It is called once
     * for each object that was created after dispose profiling was started,
     * with the object as the only parameter. If it returns false, the object
     * will not be included in the returned list
     * @return {Map[]} List of maps. Each map contains two keys:
     * <code>object</code> and <code>stackTrace</code>
     */
    stopDisposeProfiling : qx.core.Environment.select("qx.debug.dispose", {
      "true" : function(checkFunction) {
        if (!this.__nextHashFirst) {
          qx.log.Logger.error("Call " + this.classname + ".startDisposeProfiling first.");
          return [];
        }

        //qx.core.ObjectRegistry.saveStackTraces = false;
        this.disposeProfilingActive = false;

        var undisposedObjects = [];
        // If destroy calls another destroy, flushing the queue once is not enough
        while (!qx.ui.core.queue.Dispose.isEmpty()) {
          qx.ui.core.queue.Dispose.flush();
        }
        var nextHashLast = qx.core.ObjectRegistry.getNextHash();
        var postId = qx.core.ObjectRegistry.getPostId();
        var traces = qx.core.ObjectRegistry.getStackTraces();
        for (var hash = this.__nextHashFirst; hash<nextHashLast; hash++) {
          var obj = qx.core.ObjectRegistry.fromHashCode(hash + postId);
          if (obj && obj.isDisposed && !obj.isDisposed()) {
            // User-defined check
            if (checkFunction && typeof checkFunction == "function" &&
              !checkFunction(obj)) {
                continue;
            }
            // Singleton instances
            if (obj.constructor.$$instance === obj) {
              continue;
            }
            // Event handlers
            if (qx.Class.implementsInterface(obj, qx.event.IEventHandler)) {
              continue;
            }
            // Pooled Decorators
            if (obj.$$pooled) {
              continue;
            }
            // Dynamic decorators
            if (qx.Class.implementsInterface(obj, qx.ui.decoration.IDecorator) &&
              qx.theme.manager.Decoration.getInstance().isCached(obj)) {
              continue;
            }
            // ignored objects
            if (obj.$$ignoreDisposeWarning) {
              continue;
            }
            // Dynamic fonts
            if (obj instanceof qx.bom.Font &&
              qx.theme.manager.Font.getInstance().isDynamic(obj)) {
              continue;
            }
            undisposedObjects.push({
              object : obj,
              stackTrace : traces[hash + postId] ? traces[hash + postId] : null
            });
          }
        }
        delete this.__nextHashFirst;
        return undisposedObjects;
      },

      "default" : qx.lang.Function.empty
    })
  }
});
