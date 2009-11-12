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

   ----------------------------------------------------------------------

     http://developer.yahoo.com/yui/license.html

     Copyright (c) 2009, Yahoo! Inc.
     All rights reserved.

     Redistribution and use of this software in source and binary forms,
     with or without modification, are permitted provided that the
     following conditions are met:

     * Redistributions of source code must retain the above copyright
       notice, this list of conditions and the following disclaimer.
     * Redistributions in binary form must reproduce the above copyright
       notice, this list of conditions and the following disclaimer in
       the documentation and/or other materials provided with the
       distribution.
     * Neither the name of Yahoo! Inc. nor the names of its contributors
       may be used to endorse or promote products derived from this
       software without specific prior written permission of Yahoo! Inc.

     THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
     "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
     LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
     FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
     COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
     INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
     (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
     SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
     HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
     STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
     ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
     OF THE POSSIBILITY OF SUCH DAMAGE.

************************************************************************ */

/* ************************************************************************

#asset(qx/static/blank.html)

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
qx.Class.define("qx.bom.History",
{
  type : "singleton",
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @signature function()
   */
  construct : function()
  {
    this.base(arguments);

    this.__titles = {};
    this.__location = window.location;

    this.__setInitialState();

    if (qx.bom.History.supportsHashChangeEvent()) {
      this.__initHashChangeEvent();
    } else {
      this.__initTimer();
    }
  },


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
    "request" : "qx.event.type.Data"
  },


  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */


  statics :
  {

    /**
     * @return {Boolean}
     */
    supportsHashChangeEvent : qx.core.Variant.select("qx.client",
    {
      "mshtml" : qx.lang.Function.returnFalse,

      "default" : function () {
        return "onhashchange" in window;
      }
    })

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
    },

    /**
     * Property holding the current title
     */
    title : 
    {
      check : "String",
      event : "changeTitle",
      nullable : true,
      apply    : "_applyTitle"
    },

    /**
     * Property holding the current state of the history.
     */
    state : 
    {
      check : "String",
      event : "changeState",
      nullable : true,
      apply    : "_applyState"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __iframe : null,
    __titles : null,
    __timer : null,
    __locationState : null,
    __location : null,
    __checkOnHashChange : null,
    __iframeReady : false,


    /**
     * @return {void}
     */
    __initHashChangeEvent : function ()
    {
      this.__checkOnHashChange = qx.lang.Function.bind(this._checkOnHashChange, this);

      qx.bom.Event.addNativeListener(window, "hashchange", this.__checkOnHashChange);

      this.__initIframe();
    },


    /**
     * @return {void}
     */
    __initTimer : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        this.__initIframe(function () {
          this.__startTimer();
        });
      },
  
      "default" : function() {
        this.__startTimer();
      }
    }),


    /**
     * @return {void}
     */
    __setInitialState : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        var hash = this.__getHash();
        this.setState(hash);
        this.__locationState = hash;
      },
  
      "default" : function() {
        this.setState(this.__getState());
      }
    }),


    /**
     * @return {void}
     */
    __initIframe : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(handler)
      {
        this.__iframe = this._createIframe();
        document.body.appendChild(this.__iframe);

        this.__waitForIFrame(function()
        {
          this.__writeStateToIframe(this.getState());

          if (handler) {
            handler.call(this);
          }
        }, this);
      },

      "default" : qx.lang.Function.empty
    }),


    /**
     * @param value {String}
     * @return {String}
     */
    _encode : function (value) {
      return encodeURIComponent(value);
    },


    /**
     * @param value {String}
     * @return {String}
     */
    _decode : function (value) {
      return decodeURIComponent(value);
    },


    // property apply
    _applyState : function (state) {
      this.__setHash(state);
    },


    // property apply
    _applyTitle : function (title)
    {
      if (title != null) {
        document.title = title || "";
      }
    },


    /**
     * IMPORTANT NOTE FOR IE:
     * Setting the source before adding the iframe to the document.
     * Otherwise IE will bring up a "Unsecure items ..." warning in SSL mode
     * 
     * @return {IframeElement}
     */
    _createIframe : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function ()
      {
        var iframe = qx.bom.Iframe.create({
          src : qx.util.ResourceManager.getInstance().toUri("qx/static/blank.html")
        });

        iframe.style.visibility = "hidden";
        iframe.style.position = "absolute";
        iframe.style.left = "-1000px";
        iframe.style.top = "-1000px";

        return iframe;
      },

      "default" : qx.lang.Function.returnNull
    }),


    /**
     * Adds an entry to the browser history.
     *
     * @param state {String} a string representing the state of the
     *          application. This command will be delivered in the data property of
     *          the "request" event.
     * @param newTitle {String ? null} the page title to set after the history entry
     *          is done. This title should represent the new state of the application.
     */
    addToHistory : function(state, newTitle)
    {
      if (!qx.lang.Type.isString(state)) {
        state = state + "";
      }

      if (qx.lang.Type.isString(newTitle))
      {
        this.setTitle(newTitle);
        this.__titles[state] = newTitle;
      }

      this.setState(state);
      this.__storeState(state);
    },


    /**
     * Navigates back in the browser history.
     * Simulates a back button click.
     */
     navigateBack : function() {
       qx.event.Timer.once(function() {history.back();}, 0);
     },


    /**
     * Navigates forward in the browser history.
     * Simulates a forward button click.
     */
     navigateForward : function() {
       qx.event.Timer.once(function() {history.forward();}, 0);
     },


    /**
     * Apply the interval of the timer.
     *
     * @param newInterval {Integer} new timeout interval
     */
    _applyTimeoutInterval : function(value)
    {
      if (this.__timer) {
        this.__timer.setInterval(value);
      }
    },


    /**
     * called on changes to the history using the browser buttons
     *
     * @param state {String} new state of the history
     */
    __onHistoryLoad : function(state) 
    {
      if (!state) {
        state = "";
      }

      this.setState(state);
      this.fireDataEvent("request", state);

      if (this.__titles[state] != null) {
        this.setTitle(this.__titles[state]);
      }
    },


    /**
     * Starts the timer polling for updates to the history IFrame on IE
     * or the fragment identifier on other browsers.
     */
    __startTimer : function()
    {
      this.__timer = new qx.event.Timer(this.getTimeoutInterval());
      this.__timer.addListener("interval", this._checkOnHashChange, this);
      this.__timer.start();
    },


    /**
     * @param e {qx.event.type.Event}
     * @return {void}
     */
    _checkOnHashChange : function(e)
    {
      var currentState = this.__getState();

      if (currentState != this.getState()) {
        this.__onHistoryLoad(currentState);
      }
    },


    /**
     * sets the fragment identifier of the top window URL
     *
     * @return value {String} the fragment identifier
     */
    __setHash : function (value)
    {
      if (this.__getState() != value)
      {
        qx.event.Timer.once(function() {
          this.__location.hash = value && value.length > 0 ? "#" + this._encode(value) : "";
        }, this, 0);
      }
    },


    /**
     * Returns the fragment identifier of the top window URL. For gecko browsers we 
     * have to use a regular expression to avoid encoding problems.
     *
     * @return {String} the fragment identifier
     */
    __getHash : qx.core.Variant.select("qx.client",
    {
      "gecko" : function()
      {
        var hash = /#(.*)$/.exec(this.__location.href);
        return hash && hash[1] ? this._decode(hash[1]) : "";
      },

      "default" : function () {
        return this._decode(this.__location.hash.substr(1)) || "";
      }
    }),


    /**
     * @param locationState {String}
     * @return {Boolean}
     */
    __isCurrentLocationState : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function (locationState) {
        return locationState != this.__locationState;
      },

      "default" : qx.lang.Function.returnFalse
    }),


    /**
     * @param locationState {String}
     * @return {String}
     */
    __storeLocationState : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function (locationState)
      {
        this.__locationState = locationState;
        this.__storeState(locationState);

        return locationState;
      },

      "default" : qx.lang.Function.empty
    }),


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
        // TODO: check for IE8, same problems like other IE?
        var locationState = this.__getHash();

        if (!this.__isCurrentLocationState(locationState)) {
          return this.__storeLocationState();
        }

        return this.__getStateFromIframe() || "";
      },

      "default" : function() {
        return this.__getHash();
      }
    }),


    /**
     * @return {String}
     */
    __getStateFromIframe : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        if (!this.__iframeReady) {
          return "";
        }

        var doc = this.__iframe.contentWindow.document;
        var elem = doc.getElementById("state");

        return elem ? this._decode(elem.innerText) : "";
      },

      "default" : qx.lang.Function.returnNull
    }),


    /**
     * @param state {String}
     * @return {void}
     */
    __writeStateToIframe : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(state)
      {
        try
        {
          var doc = this.__iframe.contentWindow.document;
          doc.open();
          doc.write('<html><body><div id="state">' + this._encode(state) + '</div></body></html>');
          doc.close();
        }
        catch (ex) {
          // ignore
        }
      },

      "default" : qx.lang.Function.empty
    }),


    /**
     * Save a state into the browser history.
     *
     * @param state {String} state to save
     * @return {void}
     */
    __storeState : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(state) {
        this.__writeStateToIframe(state);
      },

      "default" : qx.lang.Function.empty
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
      "mshtml" : function(callback, context, retry)
      {
        if (typeof retry === "undefined") {
          retry = 0;
        }

        if ( !this.__iframe.contentWindow || !this.__iframe.contentWindow.document )
        {
          if (retry > 20) {
            throw new Error("can't initialize iframe");
          }

          qx.event.Timer.once(function() {
            this.__waitForIFrame(callback, context, ++retry);
          }, this, 10);

          return;
        }

        this.__iframeReady = true;
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
    if (this.__timer) {
      this.__timer.stop();
    }

    if (qx.bom.History.supportsHashChangeEvent()) {
      qx.bom.Event.removeNativeListener(window, "hashchange", this.__checkOnHashChange);
    }

    this._disposeObjects("__timer");
    this._disposeFields("__iframe", "__titles", "__location", "__checkOnHashChange");
  }
});
