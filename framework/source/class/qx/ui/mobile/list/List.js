/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)
     * Christopher Zuendorf (czuendorf)

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

    if (qx.core.Environment.get("qx.dynlocale")) {
      qx.locale.Manager.getInstance().addListener("changeLocale", this._onChangeLocale, this);
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
      
      // Click on border: do nothing.
      if(element.tagName == "UL") {
        return;
      }
      
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
        old.removeListener("changeBubble", this.__onModelChangeBubble, this);
      }
      if (value != null) {
        value.addListener("changeBubble", this.__onModelChangeBubble, this);
      }

      if (old != null) {
        old.removeListener("change", this.__onModelChange, this);
      }
      if (value != null) {
        value.addListener("change", this.__onModelChange, this);
      }
      
      if (old != null) {
        old.removeListener("changeLength", this.__onModelChangeLength, this);
      }
      if (value != null) {
        value.addListener("changeLength", this.__onModelChangeLength, this);
      }
      
      
      this.__render();
    },


    // property apply
    _applyDelegate : function(value, old) {
      this.__provider.setDelegate(value);
    },
    
    
    /**
     * Listen on model 'changeLength' event.
     * @param evt {qx.event.type.Data} data event which contains model change data.
     */
    __onModelChangeLength : function(evt) {
      this.__render();
    },

    /**
     * Locale change event handler
     *
     * @signature function(e)
     * @param e {Event} the change event
     */
    _onChangeLocale : qx.core.Environment.select("qx.dynlocale",
    {
      "true" : function(e)
      {
        this.__render();
      },

      "false" : null
    }),


    /**
     * Reacts on model 'change' event.
     * @param evt {qx.event.type.Data} data event which contains model change data.
     */
    __onModelChange : function(evt) {
      if(evt && evt.getData() && evt.getData().type == "order") {
        this.__render();
      }
    },


    /**
     * Reacts on model 'changeBubble' event.
     * @param evt {qx.event.type.Data} data event which contains model changeBubble data.
     */
    __onModelChangeBubble : function(evt)
    {
      if(evt) {
        var data = evt.getData();
        var isArray = (qx.lang.Type.isArray(data.old) && qx.lang.Type.isArray(data.value));
        if(!isArray || (isArray && data.old.length == data.value.length)) {
          var rows = this._extractRowsToRender(data.name);
          for (var i=0; i < rows.length; i++) {
            this.__renderRow(rows[i]);
          }
        }
      }
    },
    
    
    /**
     * Extracts all rows, which should be rendered from "changeBubble" event's
     * data.name.
     * @param name {String} The 'data.name' String of the "changeBubble" event,
     *    which contains the rows that should be rendered.
     * @return {Integer[]} An array with integer values, representing the rows which should
     *  be rendered.
     */
    _extractRowsToRender : function(name) {
      var rows = [];
      
      // "[0-2].propertyName" | "[0].propertyName" | "0"
      var containsPoint = (name.indexOf(".")!=-1);
      if(containsPoint) {
        // "[0-2].propertyName" | "[0].propertyName"
        var candidate = name.split(".")[0];
        
        // Normalize
        candidate = candidate.replace("[","");
        candidate = candidate.replace("]","");
        // "[0-2]" | "[0]"
        var isRange = (candidate.indexOf("-") != -1);
        
        if(isRange) {
          var rangeMembers = candidate.split("-");
          // 0
          var startRange = parseInt(rangeMembers[0],10);
          // 2
          var endRange = parseInt(rangeMembers[1],10);
          
          for(var i = startRange; i <= endRange; i++) {
            rows.push(i);
          }
        } else {
          // "[0]"
          rows.push(parseInt(candidate.match(/\d+/)[0], 10));
        }
      } else {
        // "0"
        var match = name.match(/\d+/);
        if(match.length == 1) {
          rows.push(parseInt(match[0], 10));
        }
      }
      
      return rows;
    },


    /**
     * Renders a specific row identified by its index.
     * @param index {Integer} index of the row which should be rendered.
     */
    __renderRow : function(index) {
      var model = this.getModel();
      var element = this.getContentElement();
      var itemElement = this.__provider.getItemElement(model.getItem(index), index);

      var oldNode = element.childNodes[index];

      element.replaceChild(itemElement, oldNode);

      this._domUpdated();
    },


    /**
     * Renders the list.
     */
    __render : function()
    {
      this._setHtml("");

      var model = this.getModel();
      this.setItemCount(model ? model.getLength() : 0);

      var itemCount = this.getItemCount();

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
    if (qx.core.Environment.get("qx.dynlocale")) {
      qx.locale.Manager.getInstance().removeListener("changeLocale", this._onChangeLocale, this);
    }
  }
});
