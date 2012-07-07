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
 * The list widget displays the data of a model in a list.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *
 *    // Data for the list
 *    var data = [
 *       {title : "Row1", subtitle : "Sub1"},
 *       {title : "Row2", subtitle : "Sub2"},
 *       {title : "Row3", subtitle : "Sub3"}
 *   ];
 *
 *   // Create the list with a delegate that
 *   // configures the list item.
 *   var list = new qx.ui.mobile.list.List({
 *     configureItem : function(item, data, row)
 *     {
 *       item.setTitle(data.title);
 *       item.setSubtitle(data.subtitle);
 *       item.setShowArrow(true);
 *     }
 *   });
 *
 *   // Set the model of the list
 *   list.setModel(new qx.data.Array(data));
 *
 *   // Add an changeSelection event
 *   list.addListener("changeSelection", function(evt) {
 *     alert("Index: " + evt.getData())
 *   }, this);
 *
 *   this.getRoot.add(list);
 * </pre>
 *
 * This example creates a list with a delegate that configures the list item with
 * the given data. A listener for the event {@link #changeSelection} is added.
 */
qx.Class.define("qx.ui.mobile.list.List",
{
  extend : qx.ui.mobile.core.Widget,


 /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param delegate {Object?null} The {@link #delegate} to use
   */
  construct : function(delegate)
  {
    this.base(arguments);
    this.addListener("tap", this._onTap, this);
    this.__provider = new qx.ui.mobile.list.provider.Provider(this);
    if (delegate) {
      this.setDelegate(delegate);
    }
  },


 /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * Fired when the selection is changed.
     */
    changeSelection : "qx.event.type.Data"
  },


  properties :
  {
    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "list"
    },


    /**
     * Delegation object which can have one or more functions defined by the
     * {@link qx.ui.mobile.list.IListDelegate} interface.
     */
    delegate :
    {
      apply: "_applyDelegate",
      event: "changeDelegate",
      init: null,
      nullable: true
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
    },


    /**
     * Number of items to display. Auto set by model.
     * Reset to limit the amount of data that should be displayed.
     */
    itemCount : {
      check : "Integer",
      init : 0
    }
  },




 /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __provider : null,


    // overridden
    _getTagName : function()
    {
      return "ul";
    },


    /**
     * Event handler for the "tap" event.
     *
     * @param evt {qx.event.type.Tap} The tap event
     */
    _onTap : function(evt)
    {
      var element = evt.getOriginalTarget();
      var index = -1;
      while (element.tagName != "LI") {
        element = element.parentNode;
      }
      if (qx.bom.element.Attribute.get(element, "data-selectable") != "false"
          && qx.dom.Element.hasChild(this.getContainerElement(), element))
      {
        index = qx.dom.Hierarchy.getElementIndex(element);
      }
      if (index != -1) {
        this.fireDataEvent("changeSelection", index);
      }
    },


    // property apply
    _applyModel : function(value, old)
    {
      if (old != null) {
        old.removeListener("changeBubble", this.__onModelChange, this);
      }
      if (value != null) {
        value.addListener("changeBubble", this.__onModelChange, this);
      }
      this.__onModelChange();
    },


    // property apply
    _applyDelegate : function(value, old) {
      this.__provider.setDelegate(value);
    },


    /**
     * Reacts on model changes.
     */
    __onModelChange : function()
    {
      var model = this.getModel();
      this.setItemCount(model ? model.getLength() : 0);
      this.__render();
    },


    /**
     * Renders the list.
     */
    __render : function()
    {
      this._setHtml("");
      var itemCount = this.getItemCount();
      var model = this.getModel();

      var element = this.getContentElement();
      for (var index = 0; index < itemCount; index++) {
        var itemElement = this.__provider.getItemElement(model.getItem(index), index);
        element.appendChild(itemElement);
      }
      this._domUpdated();
    }
  },


 /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("__provider");
  }
});
