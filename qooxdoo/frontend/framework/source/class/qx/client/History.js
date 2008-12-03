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
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

   ======================================================================

   This class contains code based on the following work:

   * Yahoo! UI Library
     http://developer.yahoo.com/yui
     Version 2.2.0

     Copyright:
       (c) 2007, Yahoo! Inc.

     License:
       BSD: http://developer.yahoo.com/yui/license.txt


************************************************************************ */

/* ************************************************************************

#embed(qx.static/history/helper.html)

************************************************************************ */

/**
 * A helper for using the browser history in JavaScript Applications without
 * reloading the main page.
 *
 * Adds entries to the browser history and fires a "request" event when one of
 * the entries was requested by the user (e.g. by clicking on the back button).
 *
 * Browser history support is currently available for Internet Explorer 6/7,
 * Firefox, Opera 9 and WebKit. Safari 2 and older are not yet supported.
 *
 * This module is based on the ideas behind the YUI Browser History Manager
 * by Julien Lecomte (Yahoo), which is described at
 * http://yuiblog.com/blog/2007/02/21/browser-history-manager/. The Yahoo
 * implementation can be found at http://developer.yahoo.com/yui/history.
 * The original code is licensed under a BSD license
 * (http://developer.yahoo.com/yui/license.txt).
 */
qx.Class.define("qx.client.History",
{
  type : "singleton",
  extend : qx.core.Target,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @signature function()
   */
  construct : qx.core.Variant.select("qx.client",
  {
    "mshtml" : function()
    {
      this.base(arguments);

      this._iframe = document.createElement("iframe");
      this._iframe.style.visibility = "hidden";
      this._iframe.style.position = "absolute";
      this._iframe.style.left = "-1000px";
      this._iframe.style.top = "-1000px";

      /*
       * IMPORTANT NOTE FOR IE:
       * Setting the source before adding the iframe to the document.
       * Otherwise IE will bring up a "Unsecure items ..." warning in SSL mode
       */
      var src = qx.io.Alias.getInstance().resolve("static/html/blank.html");
      this._iframe.src = src;
      document.body.appendChild(this._iframe);

      this._titles = {};
      this._state = decodeURIComponent(this.__getHash());
      this._locationState = decodeURIComponent(this.__getHash());

      this.__waitForIFrame(function()
      {
        this.__storeState(this._state);
        this.__startTimer();
      }, this);
    },

    "default" : function()
    {
      this.base(arguments);

      this._titles = {};
      this._state = this.__getState();

      this.__startTimer();
    }
  }),




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    /**
     * Fired when the user moved in the history. The data property of the event
     * holds the state, which was passed to {@link #addToHistory}.
     */
    "request" : "qx.event.type.DataEvent"
  },






  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Interval for the timer, which periodically checks the browser history state
     * in milliseconds.
     */
    timeoutInterval :
    {
      check: "Number",
      init : 100,
      apply : "_applyTimeoutInterval"
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
     * This function is only there to ensure compatibility with older
     * qooxdoo versions
     * @deprecated
     */
    init : function() {
      qx.log.Logger.deprecatedMethodWarning(arguments.callee, "This method call is no longer needed.");
    },


    /**
     * Adds an entry to the browser history.
     *
     * @type member
     * @param state {String} a string representing the state of the
     *          application. This command will be delivered in the data property of
     *          the "request" event.
     * @param newTitle {String ? null} the page title to set after the history entry
     *          is done. This title should represent the new state of the application.
     */
    addToHistory : function(state, newTitle)
    {
      if (newTitle != null) {
        document.title = newTitle;
        this._titles[state] = newTitle;
      }
      if (state != this._state) {
        top.location.hash = "#" + encodeURIComponent(state)
        this.__storeState(state);
      }
    },


    /**
     * Get the current state of the browser history.
     *
     * @return {String} The current state
     */
    getState : function() {
      return this._state;
    },


    /**
     * Navigates back in the browser history.
     * Simulates a back button click.
     */
     navigateBack : function() {
       qx.client.Timer.once(function() {history.back();}, 0);
     },


    /**
     * Navigates forward in the browser history.
     * Simulates a forward button click.
     */
     navigateForward : function() {
       qx.client.Timer.once(function() {history.forward();}, 0);
     },


    /**
     * Apply the interval of the timer.
     *
     * @type member
     * @param newInterval {Integer} new timeout interval
     */
    _applyTimeoutInterval : function(value) {
      this._timer.setInterval(value);
    },


    /**
     * called on changes to the history using the browser buttons
     *
     * @param state {String} new state of the history
     */
    __onHistoryLoad : function(state) {
      this._state = state;
      this.createDispatchDataEvent("request", state);
      if (this._titles[state] != null) {
        document.title = this._titles[state];
      }
    },


    /**
     * Starts the timer polling for updates to the history IFrame on IE
     * or the fragment identifier on other browsers.
     */
    __startTimer : function()
    {
      this._timer = new qx.client.Timer(this.getTimeoutInterval());

      this._timer.addEventListener("interval", function(e) {
        var newHash = this.__getState();
        if (newHash != this._state) {
          this.__onHistoryLoad(newHash);
        }
      }, this);

      this._timer.start();
    },


    /**
     * Returns the fragment identifier of the top window URL
     *
     * @return {String} the fragment identifier
     */
    __getHash : function()
    {
      var href = top.location.href;
      var idx = href.indexOf( "#" );
      return idx >= 0 ? href.substring(idx+1) : "";
    },


    /**
     * Browser dependent function to read the current state of the history
     *
     * @return {String} current state of the browser history
     */
    __getState : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        // the location only changes if the user manually changes the fragment
        // identifier.
        var locationState = decodeURIComponent(this.__getHash());
        if (locationState != this._locationState)
        {
          this._locationState = locationState;
          this.__storeState(locationState);
          return locationState;
        }

        var doc = this._iframe.contentWindow.document;
        var elem = doc.getElementById("state");
        var iframeState = elem ? decodeURIComponent(elem.innerText) : "";

        return iframeState;
      },

      "default" : function() {
        return decodeURIComponent(this.__getHash());
      }
    }),


    /**
     * Save a state into the browser history.
     *
     * @param state {String} state to save
     * @return {Boolean} Whether the state could be saved. This function may
     *   fail on the Internet Explorer if the hidden IFrame is not yet fully
     *   loaded.
     */
    __storeState : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(state)
      {
        var html = '<html><body><div id="state">' + encodeURIComponent(state) + '</div></body></html>';
        try
        {
          var doc = this._iframe.contentWindow.document;
          doc.open();
          doc.write(html);
          doc.close();
        } catch (ex) {
          return false;
        }
        return true;
      },

      "default" : function(state)
      {
        // Opera needs to update the location, after the current thread has
        // finished to remember the history
        qx.client.Timer.once(function() {
          top.location.hash = "#" + encodeURIComponent(state);
        }, this, 0);
        return true;
      }
    }),


    /**
     * Waits for the IFrame being loaded. Once the IFrame is loaded
     * the callback is called with the provided context.
     *
     * @param callback {Function} This function will be called once the iframe is loaded
     * @param context {Object?window} The context for the callback.
     */
    __waitForIFrame : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(callback, context)
      {
        if ( !this._iframe.contentWindow || !this._iframe.contentWindow.document ) {
            // Check again in 10 msec...
            qx.client.Timer.once(function() {
              this.__waitForIFrame(callback, context);
            }, this, 10);
            return;
        }
        callback.call(context || window);
      },

      "default" : null
    })
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._timer.stop();
    this._disposeObjects("_timer");
    this._disposeFields("_iframe", "_titles");
  }
});
