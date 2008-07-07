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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

qx.Class.define("qx.ui.toolbar.RadioButton",
{
  extend : qx.ui.toolbar.CheckBox,
  implement : qx.ui.core.IRadioItem,




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The assigned {@link qx.ui.core.RadioManager} which handles the switching between registered buttons */
    manager :
    {
      check : "qx.ui.core.RadioManager",
      apply : "_applyManager",
      nullable : true
    },


    /** A user provided value, which is assosiated with the form widget. */
    value :
    {
      check : "String",
      nullable : true,
      event : "change"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyChecked : function(value, old)
    {
      this.base(arguments, value, old);

      if (value)
      {
        var mgr = this.getManager();
        if (mgr) {
          mgr.select(this);
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyManager : function(value, old)
    {
      if (old) {
        old.remove(this);
      }

      if (value) {
        value.add(this);
      }
    }
  }
});
