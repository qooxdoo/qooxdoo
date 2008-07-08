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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Each object, which should be managed by a {@link RadioManager} have to
 * implement this interface.
 */
qx.Interface.define("qx.ui.core.IRadioItem",
{
  extend : qx.ui.core.IFormElement,


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    "changeChecked" : "qx.event.type.Data"
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Set whether the item is checked
     *
     *  @param value {Boolean} whether the item should be checked
     */
    setChecked : function(value) {
      this.assertType(value, "boolean");
    },


    /**
     * Get whether the item is checked
     *
     * @return {Boolean} whether the item it checked
     */
    getChecked : function() {},


    /**
     * Set the radio manager, which manages this item
     *
     * @param value {qx.ui.core.RadioManager} The radio manager, which should
     *     manage the item.
     */
    setManager : function(value) {
      this.assertInstance(value, qx.ui.core.RadioManager);
    },


    /**
     * Get the radio manager, which manages this item
     *
     * @return {qx.ui.core.RadioManager} The radio manager, which manages the item.
     */
    getManager : function() {}
  }
});
