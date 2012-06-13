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
 * AbstractRenderer is an abstract class used to encapsulate
 * behaviours of how a form can be rendered into a mobile page.
 * Its subclasses can extend it and override {@link #addItems} and {@link #addButton}
 * methods in order to customize the way the form gets into the DOM.
 *
 *
 */
qx.Class.define("qx.ui.mobile.form.renderer.AbstractRenderer",
{
  type : "abstract",
  extend : qx.ui.mobile.core.Widget,
  implement : qx.ui.form.renderer.IFormRenderer,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param form {qx.ui.mobile.form.Form} The form to be rendered
   */
  construct : function(form)
  {
    this.base(arguments);
        // add the groups
    var groups = form.getGroups();
    for (var i = 0; i < groups.length; i++)
    {
      var group = groups[i];
      this.addItems(
        group.items, group.labels, group.title, group.options, group.headerOptions
      );
    }

    // add the buttons
    var buttons = form.getButtons();
    var buttonOptions = form.getButtonOptions();
    for (var i = 0; i < buttons.length; i++) {
      this.addButton(buttons[i], buttonOptions[i]);
    }
    form.setRenderer(this);
    this._form = form;
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "form"
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

   members :
  {

    _form : null,


    // interface implementation
    addItems : function(items, names, title) {
      throw new Error("Abstract method call");
    },


    // interface implementation
    addButton : function(button) {
      throw new Error("Abstract method call");
    },

    /**
     * Shows an error to the user when a form element is in invalid state
     * usually it prints an error message, so that user can rectify the filling of the form element.
     * @param item {qx.ui.mobile.core.Widget} the form item
     */
    showErrorForItem : function(item) {
      throw new Error("Abstract method call");
    },

    /**
     *
     * Resets the errors for the form by removing any error messages
     * inserted into DOM in the case of invalid form elements
     *
     */
    resetForm : function() {
      throw new Error("Abstract method call");
    }
  }

});
