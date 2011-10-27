/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

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
 * The SelectBox
 *
 * an example of what can be done with the SelectBox:
 * *Example*
 *
 * <pre class='javascript'>
 *     var page1 = new qx.ui.mobile.page.Page();
 *     page1.addListener("initialize", function()
 *     {
 *       var sel = new qx.ui.mobile.form.SelectBox();
 *       page1.add(sel);
 *       var model = new qx.data.Array(["item1","item2"]);
 *       sel.setModel(model);
 *       dd.push("item3");
 *
 *
 *       var but = new qx.ui.mobile.form.Button("setSelection");
 *       page1.add(but);
 *       but.addListener("tap", function(){
 *         sel.setSelection("item3");
 *       }, this);
 *
 *       var title = new qx.ui.mobile.form.Title("item2");
 *       title.bind("value",sel,"value");
 *       sel.bind("value",title,"value");
 *       page1.add(title);
 *     },this);
 *
 *   page1.show();
 *  </pre>
 */
qx.Class.define("qx.ui.mobile.form.SelectBox",
{
  extend : qx.ui.mobile.core.Widget,
  include : [
    qx.ui.mobile.form.MValue,
    qx.ui.form.MForm
  ],
  implement : [
    qx.ui.form.IForm,
    qx.ui.form.IModel
  ],

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

    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "selectbox"
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
    __selectedIndex : null,

    // overridden
    _getTagName : function()
    {
      return "select";
    },


    /**
     * Returns the selected value of the element
     */
    getSelection : function() {
      return this.getValue();
    },


    /**
     * Sets the selected value of the element
     * @param value {String} the value of the selection
     */
    setSelection : function(value) {
      this.setValue(value);
    },


    /**
     * Sets the value of this selectbox.
     * It is called by setValue method of qx.ui.mobile.form.MValue mixin.
     * Implements the way the value is set for the element.
     * @param value {Boolean} the new value of the selectbox
     */
    _setValue : function(value) {
      var model = this.getModel();
      this.getContainerElement().selectedIndex = model.indexOf(value);
    },


    /**
     * Renders the selectbox. Override this if you would like to display the
     * values of the select box in a different way than the default.
     */
    _render : function(){
      this._setHtml("");
      var element = this.getContentElement();
      for(var i=0, l=this.getModel().getLength(); i<l; i++)
      {
        var item = this.getModel().getItem(i);
        var option = qx.bom.Element.create("option");
        qx.bom.element.Attribute.set(option,"value",item);
        option.appendChild(document.createTextNode(item));
        element.appendChild(option);
        if(i===this.__selectedIndex || (this.__selectedIndex==null && i===0)) {
          qx.bom.element.Attribute.set(option,"selected","true");
        }
      }
      this._domUpdated();
    },


    /**
     * Sets the model property to the new value
     * @param value {qx.data.Array}, the new model
     * @param old {qx.data.Array?}, the old model
     */
    _applyModel : function(value, old){
      value.addListener("change", this._render, this);
      if (old != null) {
        old.removeListener("change", this._render, this);
      }
      this._render();
    }
  }
});
