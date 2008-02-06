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

************************************************************************ */

/* ************************************************************************

#module(ui_toolbar)

************************************************************************ */

qx.Class.define("qx.ui.toolbar.RadioButton",
{
  extend : qx.ui.toolbar.CheckBox,





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The assigned qx.ui.selection.RadioManager which handles the switching between registered buttons */
    manager :
    {
      check : "qx.ui.selection.RadioManager",
      apply : "_applyManager",
      nullable : true
    },


    /**
     * The name of the radio group. All the radio elements in a group (registered by the same manager)
     *  have the same name (and could have a different value).
     */
    name :
    {
      check : "String",
      event : "changeName"
    },


    /** Prohibit the deselction of the checked radio button when clicked on it. */
    disableUncheck :
    {
      check : "Boolean",
      init : false
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
      APPLY ROUTINES
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

      var vManager = this.getManager();

      if (vManager) {
        vManager.handleItemChecked(this, value);
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
    },




    /*
    ---------------------------------------------------------------------------
      EVENTS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseup : function(e)
    {
      this.setCapture(false);

      if (!this.hasState("abandoned"))
      {
        this.addState("over");
        this.setChecked(this.getDisableUncheck() || !this.getChecked());
        this.execute();
      }

      this.removeState("abandoned");
      this.removeState("pressed");

      e.stopPropagation();
    }
  }
});
