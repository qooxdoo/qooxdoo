/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Carsten Lergenmueller (carstenl)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * An appender that writes all messages to a memory container. The messages
 * can be retrieved later, f. i. when an error dialog pops up and the question
 * arises what actions have caused the error.
 */
qx.Class.define("qx.log.appender.RingBuffer",
{
  extend : Object,

  /**
   * @param maxMessages {Integer?50} Maximum number of messages in the buffer
   */
  construct : function(maxMessages)
  {
    this.__history = [];
    this.setMaxMessages(maxMessages || 50);
  },


  members :
  {
    __nextIndexToStoreTo : 0,
    __history : null,
    __maxMessages : 50,


    /**
     * Set the maximum number of messages to hold. If null the number of
     * messages is not limited.
     *
     * Warning: Changing this property will clear the events logged so far.
     *
     * @param maxMessages {Integer} the maximum number of messages to hold
     */
    setMaxMessages : function(maxMessages)
    {
      this.__maxMessages = maxMessages;
      this.clearHistory();
    },


    /**
     * Get the maximum number of messages to hold
     *
     * @return {Integer} the maximum number of messages
     */
    getMaxMessages : function() {
      return this.__maxMessages;
    },


    /**
     * Processes a single log entry
     *
     * @param entry {Map} The entry to process
     */
    process : function(entry)
    {
      var maxMessages = this.getMaxMessages();

      if (this.__history.length < maxMessages) {
        this.__history.push(entry);
      }
      else
      {
        this.__history[this.__nextIndexToStoreTo++] = entry;

        if (this.__nextIndexToStoreTo >= maxMessages) {
          this.__nextIndexToStoreTo = 0;
        }
      }
    },


    /**
     * Returns all stored log events
     *
     * @return {array} array of stored log events
     */
    getAllLogEvents : function() {
      return this.retrieveLogEvents(this.getMaxMessages());
    },


    /**
     * Returns log events which have been logged previously.
     *
     * @param count {Integer} The number of events to retrieve. If there are
     *    more events than the given count, the oldest ones will not be returned.
     * @return {array} array of stored log events
     */
    retrieveLogEvents : function(count)
    {
      if (count > this.__history.length) {
        count = this.__history.length;
      }

      if (this.__history.length == this.getMaxMessages()) {
        var indexOfYoungestElementInHistory = this.__nextIndexToStoreTo - 1;
      } else {
        indexOfYoungestElementInHistory = this.__history.length - 1;
      }
      var startIndex = indexOfYoungestElementInHistory - count + 1;

      if (startIndex < 0) {
        startIndex += this.__history.length;
      }

      var result;

      if (startIndex <= indexOfYoungestElementInHistory) {
        result = this.__history.slice(startIndex, indexOfYoungestElementInHistory + 1);
      } else {
        result = this.__history.slice(startIndex, this.__history.length).concat(this.__history.slice(0, indexOfYoungestElementInHistory + 1));
      }

      return result;
    },


    /**
     * Clears the log history
     */
    clearHistory : function()
    {
      this.__history = [];
      this.__nextIndexToStoreTo = 0;
    }
  }
});
