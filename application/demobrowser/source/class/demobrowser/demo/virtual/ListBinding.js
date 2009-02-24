/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Fabian Jakobs (fjakobs)
   * Martin Wittemann (martinwittemann)

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.ListBinding",
{
  extend : qx.application.Standalone,


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // create a list
      qx.Class.define("virtual.List", 
      {
        extend : qx.ui.virtual.core.Scroller,


        construct : function()
        {
          this.base(arguments, 0, 1, 20, 100);

          this.__rowLayer = new qx.ui.virtual.layer.Row("white", "#EEE");
          this.getPane().addLayer(this.__rowLayer);
          this.getPane().addLayer(new qx.ui.virtual.layer.GridLines("horizontal"));
          this.getPane().addLayer(new qx.ui.virtual.layer.GridLines("vertical"));      
          this.__cellLayer = new qx.ui.virtual.layer.HtmlCell(this);
          this.getPane().addLayer(this.__cellLayer);   

          this.getPane().addListener("resize", this._onResize, this); 

          this.__manager = new qx.ui.virtual.selection.Row(this.getPane(), this);
          this.__manager.attachMouseEvents(this.getPane());
          this.__manager.attachKeyEvents(this);
          this.__manager.set({
            mode: "multi"
          });

          this.__manager.addListener("changeSelection", function(e) {
            this.fireDataEvent("changeSelection", e.getData());
          }, this);
        },

        events: {
          "changeSelection": "qx.event.type.Data"
        },

        properties : {
          rowCount : {
            check : "Integer",
            event : "changeRowCount",
            init : 0,
            apply : "_applyRowCount"
          },

          delegate : {
            check : "Object",
            event: "changeDelegate",
            init: null,
            nullable: true
          }
        },

        members :
        {
          update: function() {
            this.__cellLayer.updateLayerData();
          },


          _applyRowCount: function(value, old) {
            this.getPane().getRowConfig().setItemCount(value);
          },

          styleSelectable : function(item, type, wasAdded)
          {
            if (type !== "selected") {
              return;
            }
            if (wasAdded) {
              this.__rowLayer.setDecorator(item, "selected");
            } else {
              this.__rowLayer.setDecorator(item, null);
            }
            this.__cellLayer.updateLayerData();
          },

          _onResize : function(e) {
            this.getPane().getColumnConfig().setItemSize(0, e.getData().width);
          },


          getCellHtml : function(row, col, left, top, width, height)
          {    
            var delegate = this.getDelegate() || {};
            var content = delegate.getCellData ? delegate.getCellData(row) : "";

            if (this.__manager.isItemSelected(row)) {
              var color = "color: white;"
            } else {
              color = ""
            }

            var html = [
              "<div style='",
              "position: absolute;",
              "width:", width, "px;",
              "height:", height, "px;",
              "left:", left, "px;",
              "top:", top, "px;",
              color,
              "'>",        
              content,
              "</div>"                  
            ];
            return html.join("");
          }
        }
      });


      
      // create the controller
      qx.Class.define("virtual.VirtualListController", 
      {
        extend : qx.core.Object,


        construct : function(model, target)
        {
          this.base(arguments);

          this.setSelection(new qx.data.Array());

          if (model != null) {
            this.setModel(model);
          }
          if (target != null) {
            this.setTarget(target);
          }
        },

        properties : {
          target : {
            check : "virtual.List",
            event: "changeTarget",
            nullable: true,
            init: null,
            apply: "_applyTarget"
          },

          model : {
            check : "qx.data.IListData",
            event : "changeModel",
            nullable: true,
            init: null,
            apply: "_applyModel"
          },

          selection : {
            check : "qx.data.IListData",
            event : "changeSelection",
            apply: "_applySelection"

          }

        },

        members :
        {
          _applyTarget: function(value, old) {
            if (value != null) {
              value.setDelegate(this);

              this.__changeSelectionListenerId = value.addListener(
                "changeSelection", this.__onChangeSelection, this
              );
            }

            if (old != null) {
              old.setDelegate(null);
              old.removeListenerById(this.__changeSelectionListenerId);
            }

            if (this.getModel() == null) {
              return;
            }

            this._syncRowCount();
          },


          _applyModel: function(value, old) {
            if (value != null) {
              this.__changeLengthListenerId = value.addListener(
                "changeLength", this.__onChangeLengthModel, this
              );
              this.__changeListenerId = value.addListener(
                "change", this.__onChangeModel, this
              );
            }

            if (old != null) {
              old.removeListenerById(this.__changeLengthListenerId);
              old.removeListenerById(this.__changeListenerId);
            }

            if (this.getTarget() != null) {
              this._syncRowCount();
            }
          },

          _applySelection: function(value, old) {

          },

          __onChangeSelection: function(e) {
            var targetSelection = e.getData();
            var selection = [];

            for (var i = 0; i < targetSelection.length; i++) {
              var modelItem = this.getModel().getItem(targetSelection[i]);
              selection.push(modelItem);
            }

            // put the first two parameter into the selection array
            selection.unshift(this.getSelection().length);
            selection.unshift(0);
            this.getSelection().splice.apply(this.getSelection(), selection);
          },

          __onChangeLengthModel: function(e) {
            this._syncRowCount();
          },


          __onChangeModel: function(e) {
            var target = this.getTarget();
            if (target != null) {
              target.update();
            }

          },    

          _syncRowCount: function() {
            var model = this.getModel();
            var length = model ? model.length : 0;
            this.getTarget().setRowCount(length);
          },


          getCellData: function(row) {
            var model = this.getModel();
            return (model ? model.getItem(row) : "");
          }    

        }
      });



      // create a list
      var list = new virtual.List();
      this.getRoot().add(list, {left: 10, top: 10});
      
      // build up the data
      model = [];
      for (var i = 0; i < 10000; i++) {
        model.push("Affe " + i);
      }
      model = new qx.data.Array(model);
      
      // define a controller for the binding
      var controller = new virtual.VirtualListController(model, list);
      
      // create a list for the selection    
      var selectedList = new virtual.List();
      this.getRoot().add(selectedList, {left: 500, top: 10});
      
      // create a controller for the selection
      var selectedController = new virtual.VirtualListController(
        controller.getSelection(), selectedList
      );
        
    }
  }
});
