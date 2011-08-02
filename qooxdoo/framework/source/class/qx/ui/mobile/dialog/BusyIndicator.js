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
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * This class blocks events and can be included into all widgets.
 *
 */
qx.Class.define("qx.ui.mobile.dialog.BusyIndicator",
{
  extend : qx.ui.mobile.core.Blocker,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
 
  /**
   * @param infoText {String?null} the message to be shown.
   */
  construct : function(infoText)
  {
    this.base(arguments);
    
    this.__createChildren(infoText);
    
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __spinner : null,
    __infoLabel : null,
    __widgetContainer : null,
    
    /**
     * Creates the DOM elements necessary to show the indicator.
     * @param labelText {String?null} the message to be shown.
     * 
     */
    __createChildren : function(labelText)
    {
      this.__widgetContainer = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox().set({alignY: "middle"}));
      this.__widgetContainer.addCssClass("spinnerContainer");

      this.__spinner = new qx.ui.mobile.core.Widget();
      this.__spinner.addCssClass("spinner");
      this.__widgetContainer.add(this.__spinner);
      
      if(labelText) {
        this.__infoLabel = new qx.ui.mobile.basic.Label(labelText);
        this.__widgetContainer.add(this.__infoLabel);
      }
      
      this._add(this.__widgetContainer);
    }
  }
});
