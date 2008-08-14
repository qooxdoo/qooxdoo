/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 David Perez Carmona

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * David Perez Carmona (david-perez)

************************************************************************ */

/* ************************************************************************

#module(treevirtual)
#embed(qx.widgettheme/menu/checkbox.gif*)

************************************************************************ */

/**
 * Adds the capability of render checboxes just before the text.
 */
qx.Class.define("qx.ui.treevirtual.CheckBoxDataCellRenderer",
{
  extend : qx.ui.treevirtual.SimpleTreeDataCellRenderer,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    arguments.callee.base.apply(this, arguments);
    this.CHECKBOX_URI = 'url('+qx.io.Alias.getInstance().resolve('widget/menu/checkbox.gif')+')';
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Checkbox width in pixels.
     * Its height can be customized by using the {@link #checkBoxStyle} property.
     */
    checkBoxWidth:
    {
      check: "Integer",
      init: 12
    },

    /**
     * Advanced property to customize the appearance of the checkbox.
     */
    checkBoxStyle:
    {
      check: "String",
      init: "height:12px;border:1px solid #000;margin:0 1px;padding:0"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // Overriden
    updateDataCellElement : function(cellInfo, cellElement) {
      arguments.callee.base.apply(this, arguments);
      var node = cellInfo.value, child = cellElement.childNodes;
      for (var i = 0; i < child.length; i++)
      {
        if (child[i].className=='__cb__')
        {
          var st = child[i].style;
          st.backgroundImage = node.bSelected ? this.CHECKBOX_URI:'';
          // Children partially selected
          st.backgroundColor = node.bSelected == 'p' ? '#DDD':'';
          break;
        }
      }
    },

    /**
     * TODOC
     * @return {Map}
     */
    _addExtraContentBeforeIcon : function(cellInfo)
    {
      var node = cellInfo.value;
      return {
        html:
          '<img src="'+this.STATIC_IMAGE_URI+'blank.gif" class="__cb__" style="'+this.getCheckBoxStyle()+';width:'+
          this.getCheckBoxWidth()+'px;background:'+
          (node.bSelected=='p' ? '#DDD ':'')+
          (node.bSelected ? this.CHECKBOX_URI:'')+' center no-repeat"/>',
        width: 2+this.getCheckBoxWidth()+2
      }
    }
  }
});
