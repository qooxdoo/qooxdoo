/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Gabriel Munteanu (gabios)

************************************************************************ */

/**
 * SinglePlaceholder is a class used to render forms into a mobile page.
 * It presents a label into the placeholder of the form elements
 *
 */
qx.Class.define("qx.ui.mobile.form.renderer.SinglePlaceholder",
{

  extend : qx.ui.mobile.form.renderer.Single,

  construct : function(form)
  {
    this.base(arguments,form);
  },


  members :
  {

    // override
    addItems : function(items, names, title) {
      if(title != null)
      {
        this._showGroupHeader(title);
      }
      for(var i=0, l=items.length; i<l; i++)
      {
        var row = new qx.ui.mobile.form.Row();
        if (items[i].setPlaceholder === undefined) {
          throw new Error("Only widgets with placeholders supported.");
        }
        items[i].setPlaceholder(names[i]);
        row.add(items[i]);
        this._add(row);
      }
    }

  }
});
