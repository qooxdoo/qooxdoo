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

/**
 * @appearance check-box-group-box-legend {qx.legacy.ui.form.CheckBox}
 */
qx.Class.define("qx.legacy.ui.groupbox.CheckGroupBox",
{
  extend : qx.legacy.ui.groupbox.GroupBox,





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Creates the legend sub widget. Instead of the normal <code>qx.legacy.ui.basic.Atom</code>
     * a <code>qx.legacy.ui.form.CheckBox</code> is used.
     *
     * @return {void}
     */
    _createLegendObject : function()
    {
      this._legendObject = new qx.legacy.ui.form.CheckBox;
      this._legendObject.setAppearance("check-box-group-box-legend");
      this._legendObject.setChecked(true);

      this.add(this._legendObject);
    },

    setIcon : null,
    getIcon : null
  }
});
