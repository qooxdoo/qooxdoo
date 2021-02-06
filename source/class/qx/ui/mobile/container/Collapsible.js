/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * Creates a Collapsible widget.
 * It contains a {@link qx.ui.mobile.basic.Label Label} for the header and a {@link qx.ui.mobile.container.Composite Composite}
 * for the content.
 *
 * The visibility of the content composite toggles when user taps on header.
 *
 * *Example*
 *
 * Here is an example of how to use the widget.
 *
 * <pre class='javascript'>
 *  var collapsible = new qx.ui.mobile.container.Collapsible("Collapsible Header");
 *  collapsible.setCombined(false);
 *  collapsible.setCollapsed(false);
 *
 *  var label = new qx.ui.mobile.basic.Label("This is the content of the Collapsible.");
 *  collapsible.add(label);
 *
 * </pre>
 *
 */
qx.Class.define("qx.ui.mobile.container.Collapsible",
{
  extend : qx.ui.mobile.core.Widget,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
  * @param title {String?} the text which should be displayed in the Collapsible's header label.
  */
  construct : function(title)
  {
    this.base(arguments);

    this._header = this._createHeader();
    this._header.addCssClass("collapsible-header");
    this._header.addListener("tap", this.toggleCollapsed, this);
    this.setTitle(title);

    this._content = this._createContent();
    this._content.addCssClass("collapsible-content");

    this._add(this._header);
    this._add(this._content);

    this.initCollapsed();
    this.initCombined();

    this.addCssClass("gap");
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties : {
    // overridden
    defaultCssClass : {
      refine : true,
      init : "collapsible"
    },


    /** The collapsed state of this widget. */
    collapsed : {
      check : "Boolean",
      init : true,
      nullable : false,
      apply : "_applyCollapsed",
      event : "changeCollapsed"
    },


    /** Controls whether the Collapsible's content
        should be visually associated with its headers. */
    combined : {
      check : "Boolean",
      init : true,
      apply : "_applyCombined"
    }

  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members :
  {
    _header : null,
    _content : null,


    /**
    * Adds a new child widget to the Collapsible's content composite.
    * @param child {qx.ui.mobile.core.Widget} the widget to add.
    * @param layoutProperties {Map?} (default:null) Optional layout data for widget.
    */
    add : function(child, layoutProperties) {
      if(child && this._content instanceof qx.ui.mobile.container.Composite) {
        this._content.add(child, layoutProperties);
      }
    },


    /**
    * Setter for the Collapsible's header title.
    * @param title {String} the Collapsible's title.
    */
    setTitle : function(title) {
      if(title && this._header instanceof qx.ui.mobile.basic.Label) {
        this._header.setValue(title);
      }
    },


    /**
    * Getter for the Collapsible's header label.
    * @return {qx.ui.mobile.basic.Label} the header.
    */
    getHeader : function() {
      return this._header;
    },


    /**
    * Getter for the Collapsible's content composite.
    * @return {qx.ui.mobile.container.Composite} the content composite.
    */
    getContent : function() {
      return this._content;
    },


    /**
    * Factory method for the Collapsible's header.
    * @return {qx.ui.mobile.basic.Label} the label which represents the header.
    */
    _createHeader : function() {
      var header = new qx.ui.mobile.basic.Label();
      header.setAnonymous(false);
      header.setActivatable(true);
      return header;
    },


    /**
    * Factory method for the Collapsible's content.
    * @return {qx.ui.mobile.container.Composite} the content composite.
    */
    _createContent : function() {
      return new qx.ui.mobile.container.Composite();
    },


    // property apply
    _applyCollapsed : function(value, old) {
      if(value === true) {
        this._content.exclude();
        this.addCssClass("collapsed");
      } else {
        this._content.show();
        this.removeCssClass("collapsed");
      }
    },


    // property apply
    _applyCombined : function(value, old) {
      if(value === true) {
        this.addCssClass("combined");
      }
      else {
        this.removeCssClass("combined");
      }
    }
  },


  destruct : function()
  {
    this._header.removeListener("tap", this.toggleCollapsed,this);
    this._disposeObjects("_header", "_content");
  }
});
