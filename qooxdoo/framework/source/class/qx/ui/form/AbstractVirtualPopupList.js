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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("qx.ui.form.AbstractVirtualPopupList",
{
  extend  : qx.ui.core.Widget,
  include : qx.ui.form.MForm,
  implement : qx.ui.form.IForm,
  type : "abstract",


  construct : function(model)
  {
    this.base(arguments);

    // set the layout
    var layout = new qx.ui.layout.HBox();
    this._setLayout(layout);
    layout.setAlignY("middle");

    // Register listeners
    this.addListener("keypress", this._handleKeyboard, this);
    this.addListener("click", this._handleMouse, this);
    this.addListener("mousewheel", this._handleMouse, this);
    this.addListener("blur", this._onBlur, this);
    this.addListener("resize", this._onResize, this);
  },


  properties :
  {
    // overridden
    focusable :
    {
      refine : true,
      init : true
    },

    // overridden
    width :
    {
      refine : true,
      init : 120
    },

    /** Data array containing the data which should be shown in the list. */
    model :
    {
      check : "qx.data.Array",
      apply : "_applyModel",
      event: "changeModel",
      nullable : false,
      deferredInit : true
    },


    /**
     * Delegation object which can have one or more functions defined by the
     * {@link qx.ui.list.core.IListDelegate} interface.
     */
    delegate :
    {
      apply: "_applyDelegate",
      event: "changeDelegate",
      init: null,
      nullable: true
    },


    /**
     * The path to the property which holds the information that should be
     * displayed as a label. This is only needed if objects are stored in the
     * model.
     */
    labelPath :
    {
      check: "String",
      apply: "_applyLabelPath",
      nullable: true
    },


    /**
     * The path to the property which holds the information that should be
     * displayed as a group label. This is only needed if objects are stored in the
     * model.
     */
    groupLabelPath :
    {
      check: "String",
      apply: "_applyGroupLabelPath",
      nullable: true
    },


    /**
     * A map containing the options for the label binding. The possible keys
     * can be found in the {@link qx.data.SingleValueBinding} documentation.
     */
    labelOptions :
    {
      apply: "_applyLabelOptions",
      nullable: true
    },


    /**
     * A map containing the options for the group label binding. The possible keys
     * can be found in the {@link qx.data.SingleValueBinding} documentation.
     */
    groupLabelOptions :
    {
      apply: "_applyGroupLabelOptions",
      nullable: true
    },


    /** Default item height */
    itemHeight :
    {
      check : "Integer",
      init : 25,
      apply : "_applyRowHeight",
      themeable : true
    },


    /**
     * The maximum height of the list popup. Setting this value to
     * <code>null</code> will set cause the list to be auto-sized.
     */
    maxListHeight :
    {
      check : "Number",
      apply : "_applyMaxListHeight",
      nullable: true,
      init : 200
    },

    /**
     * Formatter which format the value from the selected <code>ListItem</code>.
     * Uses the default formatter {@link #_defaultFormat}.
     */
    format :
    {
      check : "Function",
      init : function(item) {
        return this._defaultFormat(item);
      },
      nullable : true
    }
  },


  members :
  {
    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates : {
      focused : true
    },

    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "dropdown":
          control = new qx.ui.form.VirtualDropDownList(this);
          break;
      }

      return control || this.base(arguments, id);
    },


    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */


    // property apply
    _applyModel : function(value, old) {

    },


    // property apply
    _applyDelegate : function(value, old) {

    },


    // property apply
    _applyLabelPath : function(value, old) {

    },


    // property apply
    _applyGroupLabelPath : function(value, old) {

    },


    // property apply
    _applyLabelOptions : function(value, old) {

    },


    // property apply
    _applyGroupLabelOptions : function(value, old) {

    },


    // property apply
    _applyRowHeight : function(value, old) {

    },


    // property apply
    _applyMaxListHeight : function(value, old) {
      this.getChildControl("list").setMaxHeight(value);
    },


    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */


    /**
     * Shows the list popup.
     */
    open : function()
    {
      this.getChildControl("dropdown").open();
    },


    /**
     * Hides the list popup.
     */
    close : function() {
      this.getChildControl("dropdown").close();
    },


    /**
     * Toggles the popup's visibility.
     */
    toggle : function()
    {
      this.getChildControl("dropdown").toggle();
    },


    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */


    /**
     * Handler for the blur event of the current widget.
     *
     * @param e {qx.event.type.Focus} The blur event.
     */
    _onBlur : function(e) {
      this.close();
    },


    _handleKeyboard : function(event)
    {
    },


    _handleMouse : function(event)
    {
    },


    /**
     * Updates list minimum size.
     *
     * @param e {qx.event.type.Data} Data event
     */
    _onResize : function(e){
      this.getChildControl("dropdown").setMinWidth(e.getData().width);
    },


    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */


    _getAction : function(event)
    {

    },


    _defaultFormat : function(item)
    {
    }
  },


  destruct : function()
  {
  }
});
