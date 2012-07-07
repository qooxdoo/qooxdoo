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
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * Representation of a form. A form widget can contain one or more {@link Row} widgets.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var title = new qx.ui.mobile.form.Title("Group");
 *   var form = new qx.ui.mobile.form.Form();
 *   form.add(new qx.ui.mobile.form.TextField(), "Username: ");
 *
 *   this.getRoot.add(title);
 *   this.getRoot.add(new qx.ui.mobile.form.renderer.Single(form));
 * </pre>
 *
 * This example creates a form and adds a row with a text field in it.
 */
qx.Class.define("qx.ui.mobile.form.Form",
{
  extend : qx.ui.form.Form,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
  },

  members :
  {

    /**
     * the renderer this form uses to be displayed
     *
     */
    __renderer : null,


    // overridden
    _createResetter : function() {
      return new qx.ui.mobile.form.Resetter();
    },


    /**
     *
     * setter for the renderer private variable
     * @param renderer {qx.ui.mobile.form.renderer.AbstractRenderer} the renderer
     *
     */
    setRenderer : function(renderer)
    {
      this.__renderer = renderer;
    },

    // override
    validate : function()
    {
      var validateResult = this.base(arguments);
      if(this.__renderer != null) {
        this.__renderer.resetForm();
      }
      var groups = this.getGroups();
      for (var i = 0; i < groups.length; i++)
      {
        var group = groups[i];
        for(var j=0; j<group.items.length; j++)
        {
          var item = group.items[j];
          if(!item.isValid())
          {
            if(this.__renderer != null)
            {
              this.__renderer.showErrorForItem(item);
            }
            else
            {
              alert('error '+item.getInvalidMessage());
            }
          }
        }
      }

      if(this.__renderer != null) {
        this.__renderer._domUpdated();
      }

      return validateResult;
    }
  }

});
