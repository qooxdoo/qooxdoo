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
 * A toolbar widget.
 *
 */
qx.Class.define("qx.ui.mobile.toolbar.ToolBar",
{
  extend : qx.ui.mobile.container.Composite,

 /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(layout)
  {
    this.base(arguments, layout);
    if (!layout) {
      this.setLayout(new qx.ui.mobile.layout.HBox().set({
        alignY : "middle"
      }));
    }
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
      init : "toolbar"
    }
  },
  
  members :
  {
  
    __hidden: false,
    
    //overide
    add : function(child, layoutProperties)
    {
      if(!(child instanceof qx.ui.mobile.toolbar.Separator))
      {
        layoutProperties = layoutProperties ? layoutProperties : {};
        qx.lang.Object.carefullyMergeWith(layoutProperties, {flex: 1});
      }
      this.base(arguments, child, layoutProperties);
    },
    
    show : function()
    {
      this.removeCssClass('toolbar-hidden');
      this.__hidden = false;
    },
    
    hide : function()
    {
      this.addCssClass('toolbar-hidden');
      this.__hidden = true;
    },
    
    toggle : function()
    {
      this.__hidden ? this.show() : this.hide();
    }
  }
});
