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
 * This widget displays a dialog.
 *
 * *Example*
 *
 * <pre class='javascript'>
 * var label = new qx.ui.mobile.basic.Label("Hello World");
 * var dialog = new qx.ui.mobile.dialog.Dialog(label);
 * dialog.setTitle("Info");
 * dialog.setModal(true); // true by default
 * dialog.show();
 * </pre>
 *
 * This example creates a label widget and adds this widget to a dialog.
 */
qx.Class.define("qx.ui.mobile.dialog.Dialog",
{
  extend : qx.ui.mobile.dialog.Popup,

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
      init : "dialog"
    },


    /**
     * Whether the dialog should be displayed modal.
     */
    modal :
    {
      init : true,
      check : "Boolean",
      nullable: false
    }

  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __blocker : false,


    /**
     * Shows the blocker.
     */
    show : function()
    {
      if(this.getModal())
      {
        this._getBlocker().show();
      }
      this.base(arguments);
    },


    /**
     * Hides the blocker. The blocker is only hidden when the hide method
     * is called as many times as the {@link #show} method.
     */
    hide : function()
    {
      if(this.getModal())
      {
        this._getBlocker().hide();
      }
      this.base(arguments);
    },


    /**
     * Returns the blocker widget.
     *
     * @return {qx.ui.mobile.core.Blocker} Returns the blocker widget.
     */
    _getBlocker : function()
    {
      if(!this.__blocker) {
        this.__blocker = new qx.ui.mobile.core.Blocker();
        this.__blocker.hide();
        qx.core.Init.getApplication().getRoot().add(this.__blocker);
        var blockerZIndex = qx.bom.element.Style.get(this.__blocker.getContainerElement(), 'zIndex');
        blockerZIndex = parseInt(blockerZIndex) +1;
        qx.bom.element.Style.set(this.getContainerElement(), 'zIndex', blockerZIndex);
      }
      return this.__blocker;
    }

  }

});
