/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_menu)
#embed(qx.static/image/blank.gif)

************************************************************************ */

/**
 * @appearance menu-radio-button
 */
qx.Class.define("qx.ui.menu.RadioButton",
{
  extend : qx.ui.menu.CheckBox,





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "menu-radio-button"
    },

    /** The assigned qx.manager.selection.RadioManager which handles the switching between registered buttons */
    manager :
    {
      check : "qx.manager.selection.RadioManager",
      nullable : true,
      apply : "_modifyManager"
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
      MODIFIER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _modifyChecked : function(value, old)
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
    _modifyManager : function(value, old)
    {
      if (old) {
        old.remove(this);
      }

      if (value) {
        value.add(this);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _modifyName : function(value, old)
    {
      if (this.getManager()) {
        this.getManager().setName(value);
      }
    },




    /*
    ---------------------------------------------------------------------------
      EXECUTE
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _processExecute : function() {
      this.setChecked(true);
    }
  }
});
