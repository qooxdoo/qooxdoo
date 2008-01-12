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

/* ************************************************************************

#module(core)

************************************************************************ */

/**
 * Add user data handling to a class. This mixins provide the methods
 * {@link #setUserData} and {@link #getUserData} for a user friendly
 * interface.
 *
 * The stored fields are automatically disposed correctly. However the
 * assigned values are not disposed e.g. qooxdoo objects stored are not
 * disposed with the objects which contains the user data.
 */
qx.Mixin.define("qx.core.MUserData",
{
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Store user defined data inside the object.
     *
     * @type member
     * @param key {String} the key
     * @param value {Object} the value of the user data
     * @return {void}
     */
    setUserData : function(key, value)
    {
      if (!this.__userData) {
        this.__userData = {};
      }

      this.__userData[key] = value;
    },


    /**
     * Load user defined data from the object
     *
     * @type member
     * @param key {String} the key
     * @return {Object} the user data
     */
    getUserData : function(key)
    {
      if (!this.__userData) {
        return null;
      }

      return this.__userData[key];
    }
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("__userData");
  }
});
