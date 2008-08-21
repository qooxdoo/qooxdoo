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

/**
 * Radio buttons are used to manage a single selection. Radio buttons only
 * make sense used in a group of two or more of them. They are managed (connected)
 * to a {qx.ui.form.RadioGroup} to handle the selection.
 */
qx.Class.define("qx.ui.toolbar.RadioButton",
{
  extend : qx.ui.toolbar.CheckBox,
  implement : qx.ui.form.IRadioItem,




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The assigned {@link qx.ui.form.RadioGroup} which handles the switching between registered buttons */
    group :
    {
      check : "qx.ui.form.RadioGroup",
      apply : "_applyGroup",
      nullable : true
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

    // overridden
    _applyChecked : function(value, old)
    {
      this.base(arguments, value, old);

      if (value)
      {
        var grp = this.getGroup();
        if (grp) {
          grp.select(this);
        }
      }
    },


    // property apply
    _applyGroup : function(value, old)
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
