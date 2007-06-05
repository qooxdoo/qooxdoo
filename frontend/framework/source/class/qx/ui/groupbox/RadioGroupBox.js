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

/**
 * @appearance radio-button-group-box-legend {qx.ui.form.RadioButton}
 */
qx.Class.define("qx.ui.groupbox.RadioGroupBox",
{
  extend : qx.ui.groupbox.GroupBox,





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Creates the legend sub widget. Instead of the normal <code>qx.ui.basic.Atom</code>
     * a <code>qx.ui.form.RadioButton</code> is used.
     *
     * @type member
     * @return {void}
     */
    _createLegendObject : function()
    {
      this._legendObject = new qx.ui.form.RadioButton;
      this._legendObject.setAppearance("radio-button-group-box-legend");
      this._legendObject.setChecked(true);

      this.add(this._legendObject);
    },

    setIcon : null,
    getIcon : null
  }
});
