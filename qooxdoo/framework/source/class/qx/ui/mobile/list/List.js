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
 * The list widget displays the data of a model in a list.
 */
qx.Class.define("qx.ui.mobile.list.List",
{
  extend : qx.ui.mobile.core.Widget,


 /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    this.addListener("tap", this._onTap, this);
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
     * The list item that should be used to render the data.
     */
    listItem :
    {
      check : "qx.ui.mobile.list.ListItem",
      apply : "_applyListItem",
      nullable : true,
      init : null
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
      var originalTarget = evt.getOriginalTarget();
      var index = -1;
      if (qx.bom.element.Attribute.get(originalTarget, "data-selectable") != "false"
          && qx.dom.Element.hasChild(this.getContainerElement(), originalTarget))
      {
        index = qx.dom.Hierarchy.getElementIndex(originalTarget);
      }
      if (index != -1) {
        this.fireDataEvent("changeSelection", index);
      }
    },


    // property apply
    _applyListItem : function(value, old) {},


    // property apply
    _applyModel : function(value, old)
    {
      this.setItemCount(value ? value.getLength() : 0);
      this.__render();
    },


    /**
     * Clears the list.
     */
    clear : function()
    {
      this._setHtml("");
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
        element.appendChild(this.__createItemElement(index, model.getItem(index)));
      }
      this._domUpdated();
    },


    /**
     * Sets the data to the list item and creates a clone of it.
     *
     * @return {Element} the cloned list item.
     */
    __createItemElement : function(index, data)
    {
      var listItem = this.getListItem();
      listItem.setData(data);
      var selectable = listItem.isSelectable();
      var children = listItem.getChildren();
      for (var i = 0, length=children.length; i < length; i++) {
        children[i].setAnonymous(selectable);
      }
      return listItem.getContainerElement().cloneNode(true);
    }
  }
});
