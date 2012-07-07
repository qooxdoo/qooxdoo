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
 * The widget displays a busy indicator.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var busyIndicator = new qx.ui.mobile.dialog.BusyIndicator("Please wait");
 *   this.getRoot().add(busyIndicator);
 * </pre>
 *
 * This example create a widget to display the busy indicator.
 */
qx.Class.define("qx.ui.mobile.dialog.BusyIndicator",
{
  extend : qx.ui.mobile.basic.Atom,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param label {String} Label to use
   */
  construct : function(label)
  {
    // the image passed as second argument is a blank 20x20 transparent png
    this.base(arguments, label, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAQAAAAngNWGAAAAAXNSR0IArs4c6QAAAAJiS0dEAP+Hj8y/AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAB3RJTUUH2wsJDS8ybObCaQAAABBJREFUKM9jYBgFo2AUkAIAAzQAATnIy0MAAAAASUVORK5CYII=');
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
      init : "spinnerContainer"
    },


    /**
     * The spinner css class to use.
     */
    spinnerClass :
    {
      apply : "_applySpinnerClass",
      nullable : false,
      check : "String",
      init : "spinner"
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    _createIconWidget : function(iconUrl)
    {
      var iconWidget = this.base(arguments,iconUrl);
      iconWidget.addCssClass(this.getSpinnerClass());
      return iconWidget;
    },


    // property apply
    _applySpinnerClass : function(value, old)
    {
      if (old) {
        this.getIconWidget().removeCssClass(old);
      }
      if(value) {
        this.getIconWidget().addCssClass(value);
      }
    }
  }
});
