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
 * 
 * A mark feature also exists which can be used to remember a point in time. 
 * When retrieving log events, it is possible to get only those events
 * after the marked time. This is useful if data from the buffer is extracted
 * and f. i. sent to a logging system. Whenever this happens, a mark() call
 * can be used so that the next extraction will only get new data.
 */
qx.Class.define("qx.log.appender.RingBuffer",
{
  extend : Object,

  /**
   * @param maxMessages {Integer?50} Maximum number of messages in the buffer
   */
  construct : function(maxMessages)
  {
    this.setMaxMessages(maxMessages || 50);
  },


  members :
  {
    //Next slot in ringbuffer to use
    __nextIndexToStoreTo : 0,
    
    //Number of elements in ring buffer
    __elementsStored : 0,
    
    //Was a mark set?
    __isMarkActive: false,
    
    //How many elements were stored since setting of mark?
    __elementsStoredSinceMark : 0, 
    
    //ring buffer
    __history : null,
    
    //Maximum number of messages to store. Could be converted to a qx property.
    __maxMessages : null,


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
      this.__history[this.__nextIndexToStoreTo] = entry;
      
      this.__nextIndexToStoreTo = this.__addToIndex(this.__nextIndexToStoreTo, 1);

      //Count # of stored elements
      var max = this.getMaxMessages();
      if (this.__elementsStored < max){
        this.__elementsStored++;
      }
      
      //Count # of stored elements since last mark call
      if (this.__isMarkActive && (this.__elementsStoredSinceMark < max)){
        this.__elementsStoredSinceMark++;
      }
    },
    
    /** 
     * Remembers the current position in the ring buffer
     * 
     */
    mark : function(){
      this.__isMarkActive = true;
      this.__elementsStoredSinceMark = 0;
    },
    
    /** 
     * Removes the current mark position
     * 
     */
    clearMark : function(){
      this.__isMarkActive = false;
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
     *    
     * @param startingFromMark {Boolean ? false} If true, only entries since the last call to mark()
     *                                           will be returned
     * @return {array} array of stored log events
     */
    retrieveLogEvents : function(count, startingFromMark)
    {
      //Trim count so it does not exceed ringbuffer size
      if (count > this.__elementsStored) {
        count = this.__elementsStored;
      }

      //Trim count so it does not exceed last call to mark (if mark was called and startingFromMark was true)
      if (startingFromMark && this.__isMarkActive && (count > this.__elementsStoredSinceMark)){
        count = this.__elementsStoredSinceMark;
      }

      if (count > 0){

        var indexOfYoungestElementInHistory = this.__addToIndex(this.__nextIndexToStoreTo,  -1);
        var startIndex = this.__addToIndex(indexOfYoungestElementInHistory, - count + 1);
        
        var result;
          
        if (startIndex <= indexOfYoungestElementInHistory) {
          //Requested segment not wrapping around ringbuffer boundary, get in one run
          result = this.__history.slice(startIndex, indexOfYoungestElementInHistory + 1);
        } else {
          //Requested segment wrapping around ringbuffer boundary, get two parts & concat
          result = this.__history.slice(startIndex, this.__elementsStored).concat(this.__history.slice(0, indexOfYoungestElementInHistory + 1));
        }        
      } else {
        result = [];
      }

      return result;
    },


    /**
     * Clears the log history
     */
    clearHistory : function()
    {
      this.__history = new Array(this.getMaxMessages());
      this.__elementsStored = 0;
      this.__elementsStoredSinceMark = 0;
      this.__nextIndexToStoreTo = 0;
    },
    
    /**
     * Adds a number to an ringbuffer index. Does a modulus calculation, 
     * i. e. if the index leaves the ringbuffer space it will wrap around to 
     * the other end of the ringbuffer.
     * 
     * @param idx {Number} The current index.
     * @param addMe {Number} The number to add.
     */
    __addToIndex : function (idx, addMe){
      var max = this.getMaxMessages();
      var result = (idx + addMe) % max;
      
      //If negative, wrap up into the ringbuffer space
      if (result < 0){
        result += max;
      }
      return result;
    }
  }
});
