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

************************************************************************ */

/**
 * Default history manager implementation. Either polls for URL fragment
 * identifier (hash) changes or uses the native "hashchange" event.
 *
 * @internal
 */
qx.Class.define("qx.bom.NativeHistory",
{
  extend : qx.bom.History,

  construct : function()
  {
    this.base(arguments);
    this.__attachListeners();
  },


  members :
  {
    __checkOnHashChange : null,


    /**
     * Attach hash change listeners
     */
    __attachListeners : function()
    {
      if (qx.bom.History.SUPPORTS_HASH_CHANGE_EVENT)
      {
        this.__checkOnHashChange = qx.lang.Function.bind(this.__onHashChange, this);
        qx.bom.Event.addNativeListener(window, "hashchange", this.__checkOnHashChange);
      }
      else
      {
        qx.event.Idle.getInstance().addListener("interval", this.__onHashChange, this);
      }
    },


    /**
     * Remove hash change listeners
     */
    __detatchListeners : function()
    {
      if (qx.bom.History.SUPPORTS_HASH_CHANGE_EVENT) {
        qx.bom.Event.removeNativeListener(window, "hashchange", this.__checkOnHashChange);
      } else {
        qx.event.Idle.getInstance().removeListener("interval", this.__onHashChange, this);
      }
    },


    /**
     * hash change event handler
     */
    __onHashChange : function()
    {
      var currentState = this._readState();

      if (qx.lang.Type.isString(currentState) && currentState != this.getState()) {
        this._onHistoryLoad(currentState);
      }
    },


    /**
     * Browser dependent function to read the current state of the history
     *
     * @return {String} current state of the browser history
     */
    _readState : function() {
      return this._decode(this._getHash());
    },


    /**
     * Save a state into the browser history.
     *
     * @param state {String} state to save
     * @return {void}
     */
    _writeState : qx.core.Environment.select("engine.name",
    {
      "opera" : function(state)
      {
        qx.event.Timer.once(function()
        {
          this._setHash(this._encode(state));
        }, this, 0);
      },

      "default" : function (state) {
        this._setHash(this._encode(state));
      }
    })
  },


  destruct : function() {
    this.__detatchListeners();
  }
});