/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)

************************************************************************ */

/* ************************************************************************

#module(core)
#module(log)

************************************************************************ */

/**
 * An appender. Does the actual logging.
 */
qx.Class.define("qx.log.appender.Abstract",
{
  extend : qx.log.LogEventProcessor,
  type : "abstract",




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {

    /** Whether the logger name and log level should be included in the formatted log message. */
    useLongFormat :
    {
      check : "Boolean",
      init : true
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    handleLogEvent : function(evt)
    {
      if (this.decideLogEvent(evt) != qx.log.Filter.DENY) {
        this.appendLogEvent(evt);
      }
    },


    /**
     * Appends a log event to the log.
     *
     * @type member
     * @abstract
     * @param evt {Map} The event to append.
     * @return {void}
     * @throws the abstract function warning.
     */
    appendLogEvent : function(evt) {
      throw new Error("appendLogEvent is abstract");
    },


    /**
     * Formats a log event.
     *
     * @type member
     * @param evt {Map} The log event to format.
     * @return {String} The formatted event.
     */
    formatLogEvent : function(evt)
    {
      var Logger = qx.log.Logger;

      var text = "";

      // Append the time stamp
      var time = new String(new Date().getTime() - qx.core.Bootstrap.LOADSTART);

      while (time.length < 6) {
        time = "0" + time;
      }

      text += time;

      // Append the level
      if (this.getUseLongFormat())
      {
        switch(evt.level)
        {
          case Logger.LEVEL_DEBUG:
            text += " DEBUG: ";
            break;

          case Logger.LEVEL_INFO:
            text += " INFO:  ";
            break;

          case Logger.LEVEL_WARN:
            text += " WARN:  ";
            break;

          case Logger.LEVEL_ERROR:
            text += " ERROR: ";
            break;

          case Logger.LEVEL_FATAL:
            text += " FATAL: ";
            break;
        }
      }
      else
      {
        text += ": ";
      }

      // Append the indent
      var indent = "";

      for (var i=0; i<evt.indent; i++) {
        indent += "  ";
      }

      text += indent;

      // Append the logger name and instance
      if (this.getUseLongFormat())
      {
        text += evt.logger.getName();

        if (evt.instanceId != null) {
          text += "[" + evt.instanceId + "]";
        }

        text += ": ";
      }

      // Append the message
      if (typeof evt.message == "string") {
        text += evt.message;
      }
      else
      {
        // The message is an object -> Log a dump of the object
        var obj = evt.message;

        if (obj == null) {
          text += "Object is null";
        }
        else
        {
          text += "--- Object: " + obj + " ---\n";
          var attrArr = new Array();

          try
          {
            for (var attr in obj) {
              attrArr.push(attr);
            }
          }
          catch(exc)
          {
            text += indent + "  [not readable: " + exc + "]\n";
          }

          attrArr.sort();

          for (var i=0; i<attrArr.length; i++)
          {
            try {
              text += indent + "  " + attrArr[i] + "=" + obj[attrArr[i]] + "\n";
            } catch(exc) {
              text += indent + "  " + attrArr[i] + "=[not readable: " + exc + "]\n";
            }
          }

          text += indent + "--- End of object ---";
        }
      }

      // Append the throwable
      if (evt.throwable != null)
      {
        var thr = evt.throwable;

        if (thr.name == null) {
          text += ": " + thr;
        } else {
          text += ": " + thr.name;
        }

        if (thr.message != null) {
          text += " - " + thr.message;
        }

        if (thr.number != null) {
          text += " (#" + thr.number + ")";
        }

        var trace = qx.dev.StackTrace.getStackTraceFromError(thr);
      }

      if (evt.trace) {
        var trace = evt.trace;
      }

      if (trace && trace.length > 0)
      {
        text += "\n";
        for (var i=0; i<trace.length; i++)
        {
          text += "  at " + trace[i] + "\n";
        }
      }

      return text;
    }
  }
});
