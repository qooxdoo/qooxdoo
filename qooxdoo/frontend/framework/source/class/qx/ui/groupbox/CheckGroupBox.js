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

#module(ui_form)

************************************************************************ */

qx.Clazz.define("qx.ui.groupbox.CheckGroupBox",
{
  extend : qx.ui.groupbox.GroupBox,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vLegend) {
    this.base(arguments, vLegend);
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _createLegendObject : function()
    {
      this._legendObject = new qx.ui.form.CheckBox;
      this._legendObject.setAppearance("check-box-field-set-legend");
      this._legendObject.setChecked(true);

      this.add(this._legendObject);
    },

    setIcon : null,
    getIcon : null
  }
});
