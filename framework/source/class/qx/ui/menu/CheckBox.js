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
 * Renders a special checkbox button inside a menu. The button behaves like
 * a normal {@link qx.ui.form.CheckBox} and shows a check icon when
 * checked; normally shows no icon when not checked (depends on the theme).
 */
qx.Class.define("qx.ui.menu.CheckBox",
{
  extend : qx.ui.menu.AbstractButton,
  implement : qx.ui.form.IFormElement,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param label {String} Initial label
   * @param menu {qx.ui.menu.Menu} Initial sub menu
   */
  construct : function(label, menu)
  {
    this.base(arguments);

    // Initialize with incoming arguments
    if (label != null) {
      this.setLabel(label);
    }

    if (menu != null) {
      this.setMenu(menu);
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "menu-checkbox"
    },

    /** The value of the widget. Mainly used for serialization proposes. */
    value :
    {
      check : "String",
      nullable : true,
      event : "changeValue"
    },

    /** The name of the widget. Mainly used for serialization proposes. */
    name :
    {
      check : "String",
      nullable : true,
      event : "changeName"
    },

    /** Whether the button is checked */
    checked :
    {
      check : "Boolean",
      init : false,
      apply : "_applyChecked",
      event: "changeChecked"
    }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // property apply
    _applyChecked : function(value, old)
    {
      value ?
        this.addState("checked") :
        this.removeState("checked");
    },


    // overridden
    _onMouseUp : function(e)
    {
      if (e.isLeftPressed()) {
        this.toggleChecked();
      }
    },


    // overridden
    _onKeyPress : function(e) {
      this.toggleChecked();
    }
  }
});
