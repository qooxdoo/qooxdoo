/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * Handler for the URL hash change.
 */
qx.Class.define("qx.ui.mobile.navigation.Handler",
{
  extend : qx.core.Object,


 /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param defaultHash {String?null} The {@link #defaultHash} to set.
   */
  construct : function(defaultHash)
  {
    this.base(arguments);
    this.__hashChangeHandler = qx.lang.Function.bind(this.__onHashChange, this);
    this.__registerListeners();
    if (defaultHash) {
      this.setDefaultHash(defaultHash);
    }
  },




 /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Default hash that should be returned when the real hash is <code>null</code>.
     */
    defaultHash :
    {
      check : "String",
      init : ""
    },


    /**
     * The current hash value.
     */
    hash :
    {
      check: "String",
      event : "changeHash",
      init : null,
      apply : "_applyHash"
    }
  },




 /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __hashChangeHandler : null,
    __previousHash : null,

    /**
     * Register hash change listeners
     */
    __registerListeners : function()
    {
      qx.bom.Event.addNativeListener(window, "hashchange", this.__hashChangeHandler);
    },


    /**
     * Remove hash change listeners
     */
    __unregisterListeners : function()
    {
      qx.bom.Event.removeNativeListener(window, "hashchange", this.__hashChangeHandler);
    },


    /**
     * Hash change event handler.
     *
     * @param evt {Event} The native event
     */
    __onHashChange : function(evt)
    {
      this.setHash(this.getLocationHash());
    },


    /**
     * Returns the current location hash or the default hash.
     *
     * @return {String} The current location hash or the default hash
     */
    getLocationHash : function()
    {
      var hash = this.getDefaultHash();
      if (window.location.hash) {
        hash = location.hash.substring(1);
      }
      return hash;
    },


    // property apply
    _applyHash : function(value, old)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.debug("Hash changed " + value);
      }

      if ((old != null) || (old == null && value != this.getDefaultHash())) {
        window.location.hash = value;
      }
    },


    /**
     * Removes the current hash from the history.
     */
    removeFromHistory : function()
    {
      var href = window.location.href;
      href = href.substring(0, href.indexOf("#"));
      window.location.replace(href + "#" + this.getHash());
    }
  },




 /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this.__unregisterListeners();
  }
});