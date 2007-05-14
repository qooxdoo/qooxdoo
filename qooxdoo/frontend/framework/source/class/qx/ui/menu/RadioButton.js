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
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyChecked : function(propValue, propOldValue, propData)
    {
      this.base(arguments, propValue, propOldValue, propData);

      var vManager = this.getManager();

      if (vManager) {
        vManager.handleItemChecked(this, propValue);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyManager : function(propValue, propOldValue, propData)
    {
      if (propOldValue) {
        propOldValue.remove(this);
      }

      if (propValue) {
        propValue.add(this);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyName : function(propValue, propOldValue, propData)
    {
      if (this.getManager()) {
        this.getManager().setName(propValue);
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
