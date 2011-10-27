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
    
    __label : null,
    __icon : null,
    __childrenContainer : null,
    __emptyLabel : null,

    /**
     *
     * This function is responsible for creating and adding 2 children controls to the Button widget.
     * A label and an icon.
     * @param label {String} the text of the button
     * @param icon {String} A path to an image resource
     *
     */
    __createChildren : function(label, icon) {
      if(label)
      {
        this.__label = new qx.ui.mobile.basic.Label(label);
        this.__label.setAnonymous(true);
        this.__label.setWrap(false);
      }
      if(icon)
      {
        this.__icon = new qx.ui.mobile.basic.Image(icon);
        this.__icon.setAnonymous(true);
      }
      this.__childrenContainer = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox().set({alignY: "middle"}));
      this.__childrenContainer.setAnonymous(true);
      if(this.__icon) {
        this.__childrenContainer.add(this.__icon);
      }
      if(this.__label) {
        this.__childrenContainer.add(this.__label);
      }
      else
      {
        if(!this.__icon)
        {
          this.__emptyLabel = new qx.ui.mobile.basic.Label(" ");
          this.__childrenContainer.add(this.__emptyLabel);
        }
      }
      this._add(this.__childrenContainer);
    }
  },

 /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if(this.__label) {
      this.__label.dispose();
    }
    if(this.__emptyLabel) {
      this.__emptyLabel.dispose();
    }
    if(this.__icon) {
      this.__icon.dispose();
    }
    if(this.__childrenContainer) {
      this.__childrenContainer.dispose();
    }
    this.__label = this.__icon = this.__childrenContainer = this.__emptyLabel = null;
  }
});