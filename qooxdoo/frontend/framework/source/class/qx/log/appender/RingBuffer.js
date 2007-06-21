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
     * Carsten Lergenmueller (carstenl)

************************************************************************ */

/* ************************************************************************

#module(log)

************************************************************************ */

/**
 * An appender that writes all messages to a memory container. The messages
 * can be retrieved later, f. i. when an error dialog pops up and the question
 * arises what actions have caused the error.
 *
 */
qx.Class.define("qx.log.appender.RingBuffer",
{
  extend : qx.log.appender.Abstract,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._history = [];
    this._nextIndexToStoreTo = 0;
    this._appenderToFormatStrings = null;
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * The maximum number of messages to hold. If null the number of messages is not
     * limited. Warning: Changing this property will clear the events logged so far.
     */
    maxMessages :
    {
      check : "Integer",
      init : 50,
      apply : "_applyMaxMessages"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {void}
     */
    _applyMaxMessages : function(value, old)
    {
      this._history = [];
      this._nextIndexToStoreTo = 0;
    },

    // overridden
    appendLogEvent : function(evt)
    {
    evt.time = new Date().getTime() - qx._LOADSTART;

      var maxMessages = this.getMaxMessages();

      if (this._history.length < maxMessages) {
        this._history.push(evt);
      }
      else
      {
        this._history[this._nextIndexToStoreTo++] = evt;

        if (this._nextIndexToStoreTo >= maxMessages) {
          this._nextIndexToStoreTo = 0;
        }
      }
    },


    /**
     * Returns log events which have been logged previously.
     *
     * @type member
     * @param count {Integer} The number of events to retreive. If there are more events than the
     *                      given count, the oldest ones will not be returned.
     * @return {array} array of stored log events
     */
    retrieveLogEvents : function(count)
    {
      if (count > this._history.length) {
        count = this._history.length;
      }

      var indexOfYoungestElementInHistory = this._history.length == this.getMaxMessages() ? this._nextIndexToStoreTo - 1 : this._history.length - 1;
      var startIndex = indexOfYoungestElementInHistory - count + 1;

      if (startIndex < 0) {
        startIndex += this._history.length;
      }

      var result;

      if (startIndex <= indexOfYoungestElementInHistory) {
        result = this._history.slice(startIndex, indexOfYoungestElementInHistory + 1);
      } else {
        result = this._history.slice(startIndex, this._history.length).concat(this._history.slice(0, indexOfYoungestElementInHistory + 1));
      }

      return result;
    },


    /**
     * Returns a string holding the information of log events which have been logged previously.
     *
     * @type member
     * @param count {Integer} The number of events to retreive. If there are more events than the
     *                      given count, the oldest ones will not be returned.
     * @return {String} string
     */
    formatLogEvents : function(count)
    {
      if (this._appenderToFormatStrings == null) {
        this._appenderToFormatStrings = new qx.log.appender.Abstract();
      }

      var events = this.retrieveLogEvents(count);
      var string = "";

      for (var idx=0; idx<events.length; idx++) {
        string += this._appenderToFormatStrings.formatLogEvent(events[idx]) + "\n";
      }

      return string;
    }
  }
});
