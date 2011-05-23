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
     * Gabriel Munteanu (gabriel.munteanu@1and1.ro)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * The SelectBox
 */
qx.Class.define("qx.ui.mobile.form.SelectBox",
{
  extend : qx.ui.mobile.core.Widget,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param value {var?null} The value of the widget.
   */
  construct : function()
  {
    this.base(arguments);
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    
    /**
     * Whether this selectbox is enabled or not
     */
    enabled :
    {
      init: true,
      check : "Boolean",
      nullable: false,
      event : "changeEnabled",
      apply: "_applyEnabled"
    },
    
    /**
     * The model to use to render the list.
     */
    model :
    {
      check : "qx.data.Array",
      apply : "_applyModel",
      event: "changeModel",
      nullable : true,
      init : null
    }
  },

  members :
  {
    // overridden
    _getTagName : function()
    {
      return "select";
    },

    /**
     * Sets the enable property to the new value
     * @param value {Boolean}, the new value of the textarea
     * @param old {Boolean?}, the old value of the textarea
     * 
     */
    _applyEnabled : function(value,old)
    {
      if(value)
      {
        this._setAttribute("disabled",null)
      }
      else
      {
        this._setAttribute("disabled","disabled");
      }
    },
    
    __render : function(){
      
    },
    
    __syncModelToDOM : function(){
      this._setHtml("");
      var element = this.getContentElement();
      for(var i=0, l=this.getModel().getLength(); i<l; i++)
      {
        var item = this.getModel().getItem(i);
        var option = qx.bom.Element.create("option");
        qx.bom.element.Attribute.set(option,"value",item);
        option.appendChild(document.createTextNode(item));
        element.appendChild(option);
      }
      this._domUpdated();
    },
    
    _applyModel : function(value, old){
      this.__syncModelToDOM();
    }
  }
});
