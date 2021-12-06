/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * Timer manipulation for handling multiple timed callbacks with the use of
 * only a single native timer object.
 *
 * Use of these timers is via the methods start() and stop().  Examples:
 * <pre class='javascript'>
 * var timer = qx.util.TimerManager.getInstance();
 *
 * // Start a 5-second recurrent timer.
 * // Note that the first expiration is after 3 seconds
 * // (last parameter is 3000) but each subsequent expiration is
 * // at 5 second intervals.
 * timer.start(function(userData, timerId)
 *             {
 *               this.debug("Recurrent 5-second timer: " + timerId);
 *             },
 *             5000,
 *             this,
 *             null,
 *             3000);
 *
 * // Start a 1-second one-shot timer
 * timer.start(function(userData, timerId)
 *             {
 *               this.debug("One-shot 1-second timer: " + timerId);
 *             },
 *             0,
 *             this,
 *             null,
 *             1000);
 *
 * // Start a 2-second recurrent timer that stops itself after
 * // three iterations
 * timer.start(function(userData, timerId)
 *             {
 *               this.debug("Recurrent 2-second timer with limit 3:" +
 *                          timerId);
 *               if (++userData.count == 3)
 *               {
 *                 this.debug("Stopping recurrent 2-second timer");
 *                 timer.stop(timerId);
 *               }
 *             },
 *             2000,
 *             this,
 *             { count : 0 });
 *
 * // Start an immediate one-shot timer
 * timer.start(function(userData, timerId)
 *             {
 *               this.debug("Immediate one-shot timer: " + timerId);
 *             });
 * </pre>
 */
qx.Class.define("qx.util.TimerManager",
{
  extend : qx.core.Object,
  type   : "singleton",

  statics :
  {
    /** Time-ordered queue of timers */
    __timerQueue : [],

    /** Saved data for each timer */
    __timerData  : {},

    /** Next timer id value is determined by incrementing this */
    __timerId    : 0
  },

  members :
  {
    /** Whether we're currently listening on the interval timer event */
    __timerListenerActive : false,

    /**
     * Start a new timer
     *
     * @param callback {Function}
     *   Function to be called upon expiration of the timer.  The function is
     *   passed these parameters:
     *   <dl>
     *     <dt>userData</dt>
     *       <dd>The user data provided to the start() method</dd>
     *     <dt>timerId</dt>
     *       <dd>The timer id, as was returned by the start() method</dd>
     *   </dl>
     *
     * @param recurTime {Integer|null}
     *   If null, the timer will not recur.  Once the callback function
     *   returns the first time, the timer will be removed from the timer
     *   queue.  If non-null, upon return from the callback function, the
     *   timer will be reset to this number of milliseconds.
     *
     * @param context {qx.core.Object|null}
     *   Context (this) the callback function is called with.  If not
     *   provided, this Timer singleton object is used.
     *
     * @param userData {var}
     *   Data which is passed to the callback function upon timer expiry
     *
     * @param initialTime {Integer|null}
     *   Milliseconds before the callback function is called the very first
     *   time.  If not specified and recurTime is specified, then recurTime
     *   will be used as initialTime; otherwise initialTime will default
     *   to zero.
     *
     * @return {Integer}
     *   The timer id of this unique timer.  It may be provided to the stop()
     *   method to cancel a timer before expiration.
     */
    start : function(callback, recurTime, context, userData, initialTime)
    {
      // Get the expiration time for this timer
      if (typeof initialTime != "number")
      {
        initialTime = recurTime || 0;
      }

      var expireAt = (new Date()).getTime() + initialTime;

      // Save the callback, user data, and requested recurrency time as well
      // as the current expiry time
      this.self(arguments).__timerData[++this.self(arguments).__timerId] =
        {
          callback  : callback,
          userData  : userData || null,
          expireAt  : expireAt,
          recurTime : recurTime,
          context   : context || this
        };

      // Insert this new timer on the time-ordered timer queue
      this.__insertNewTimer(expireAt, this.self(arguments).__timerId);

      // Give 'em the timer id
      return this.self(arguments).__timerId;
    },

    /**
     * Stop a running timer
     *
     * @param timerId {Integer}
     *   A timer id previously returned by start()
     */
    stop : function(timerId)
    {
      // Find this timer id in the time-ordered list
      var timerQueue = this.self(arguments).__timerQueue;
      var length = timerQueue.length;
      for (var i = 0; i < length; i++)
      {
        // Is this the one we're looking for?
        if (timerQueue[i] == timerId)
        {
          // Yup.  Remove it.
          timerQueue.splice(i, 1);

          // We found it so no need to continue looping through the queue
          break;
        }
      }

      // Ensure it's gone from the timer data map as well
      delete this.self(arguments).__timerData[timerId];

      // If there are no more timers pending...
      if (timerQueue.length == 0 && this.__timerListenerActive)
      {
        // ... then stop listening for the periodic timer
        qx.event.Idle.getInstance().removeListener("interval",
                                                   this.__processQueue,
                                                   this);
        this.__timerListenerActive = false;
      }
    },

    /**
     * Insert a timer on the time-ordered list of active timers.
     *
     * @param expireAt {Integer}
     *   Milliseconds from now when this timer should expire
     *
     * @param timerId {Integer}
     *   Id of the timer to be time-ordered
     *
     */
    __insertNewTimer : function(expireAt, timerId)
    {
      // The timer queue is time-ordered so that processing timers need not
      // search the queue; rather, it can simply look at the first element
      // and if not yet ready to fire, be done.  Search the queue for the
      // appropriate place to insert this timer.
      var timerQueue = this.self(arguments).__timerQueue;
      var timerData = this.self(arguments).__timerData;
      var length = timerQueue.length;
      for (var i = 0; i < length; i++)
      {
        // Have we reached a later time?
        if (timerData[timerQueue[i]].expireAt > expireAt)
        {
          // Yup.  Insert our new timer id before this element.
          timerQueue.splice(i, 0, timerId);

          // No need to loop through the queue further
          break;
        }
      }

      // Did we find someplace in the middle of the queue for it?
      if (timerQueue.length == length)
      {
        // Nope.  Insert it at the end.
        timerQueue.push(timerId);
      }

      // If this is the first element on the queue...
      if (! this.__timerListenerActive)
      {
        // ... then start listening for the periodic timer.
        qx.event.Idle.getInstance().addListener("interval",
                                                this.__processQueue,
                                                this);
        this.__timerListenerActive = true;
      }

    },

    /**
     * Process the queue of timers.  Call the registered callback function for
     * any timer which has expired.  If the timer is marked as recurrent, the
     * timer is restarted with the recurrent timeout following completion of
     * the callback function.
     *
     */
    __processQueue : function()
    {
      // Get the current time
      var timeNow = (new Date()).getTime();

      // While there are timer elements that need processing...
      var timerQueue = this.self(arguments).__timerQueue;
      var timerData = this.self(arguments).__timerData;

      // Is it time to process the first timer element yet?
      while (timerQueue.length > 0 &&
             timerData[timerQueue[0]].expireAt <= timeNow)
      {
        // Yup.  Do it.  First, remove element from the queue.
        var expiredTimerId = timerQueue.shift();

        // Call the handler function for this timer
        var expiredTimerData = timerData[expiredTimerId];
        expiredTimerData.callback.call(expiredTimerData.context,
                                       expiredTimerData.userData,
                                       expiredTimerId);

        // If this is a recurrent timer which wasn't stopped by the callback...
        if (expiredTimerData.recurTime && timerData[expiredTimerId])
        {
          // ... then restart it.
          var now = (new Date()).getTime();
          expiredTimerData.expireAt = now + expiredTimerData.recurTime;

          // Insert this timer back on the time-ordered timer queue
          this.__insertNewTimer(expiredTimerData.expireAt, expiredTimerId);
        }
        else
        {
          // If it's not a recurrent timer, we can purge its data too.
          delete timerData[expiredTimerId];
        }
      }

      // If there are no more timers pending...
      if (timerQueue.length == 0 && this.__timerListenerActive)
      {
        // ... then stop listening for the periodic timer
        qx.event.Idle.getInstance().removeListener("interval",
                                                   this.__processQueue,
                                                   this);
        this.__timerListenerActive = false;
      }
    }
  }
});
