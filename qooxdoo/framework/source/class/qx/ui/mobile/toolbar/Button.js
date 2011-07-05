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
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * A button used in toolbars.
 *
 */
qx.Class.define("qx.ui.mobile.toolbar.Button",
{
  extend : qx.ui.mobile.form.Button,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param label {String?null} optional label that will be used as the text of the button
   * @param icon {String?null} optional URI to an image, that will be used in the button
   */
    construct : function(label, icon)
    {
      this.base(arguments);
      this.__createChildren(label, icon);
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
        init : "toolbar-button"
      }
    },
    
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    
    // override
    _applyValue : function(value, old) {
      
    },
    
    /**
     *
     * This function is responsible for creating and adding 2 children controls to the Button widget.
     * A label and an icon.
     * @param label {String} the text of the button
     * @param icon {String} A path to an image resource
     * 
     */
    __createChildren : function(label, icon) {
      var labelControl, iconControl, container;
      if(label) {
        labelControl = new qx.ui.mobile.basic.Label(label);
        labelControl.setAnonymous(true);
        labelControl.setWrap(false);
      }
      if(icon) {
        iconControl = new qx.ui.mobile.basic.Image(icon);
        iconControl.setAnonymous(true);
      }
      var layout = new qx.ui.mobile.layout.VBox().set({alignY: "middle"});
      container = new qx.ui.mobile.container.Composite(layout);
      container.setAnonymous(true);
      if(iconControl) {
        container.add(iconControl);
      }
      if(labelControl)
      {
        container.add(labelControl);
      }
      else
      {
        if(!iconControl) {
          container.add(new qx.ui.mobile.basic.Label(" "));
        }
      }
      this._add(container);
    }
  },
  
 /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    // TODO
  }
});