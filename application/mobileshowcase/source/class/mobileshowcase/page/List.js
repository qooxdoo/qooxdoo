/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * Mobile page for showing the "list" showcase.
 */
qx.Class.define("mobileshowcase.page.List",
{
  extend : mobileshowcase.page.Abstract,


  construct : function()
  {
    this.base(arguments);
    this.setTitle("List");
  },


  members :
  {
    _model : null,
    _waypointsY: ["0%", "25%", "50%", "75%", "100%", 200],
           
    // overridden
    /**
     * @lint ignoreDeprecated(alert)
     */
    _initialize: function() {
      this.base(arguments);

      qx.bom.element.Style.set(this.getContent().getContentElement(), "position", "relative");

      this.__waypointInfoLabel = new qx.ui.mobile.container.Composite();
      this.__waypointInfoLabel.addCssClass("waypoint-info");
      this.add(this.__waypointInfoLabel);

      var scrollContainer = this._getScrollContainer();
      scrollContainer.setWaypointsY(this._waypointsY);
      scrollContainer.addListener("waypoint", this._onWaypoint, this);

      this._model = this._createModel();

      var list = new qx.ui.mobile.list.List({
        configureItem: function(item, data, row) {
          item.setImage("mobileshowcase/icon/internet-mail.png");
          item.setTitle(data.title);
          item.setSubtitle(data.subtitle);
          item.setSelectable(data.selectable);
          item.setShowArrow(data.selectable);
          item.setRemovable(data.removable);
        },

        configureGroupItem: function(item, data, group) {
          item.setTitle("#" + group + " " + data.title);
          item.setSelectable(true);
        },

        group: function(data, row) {
          var title = "Items";
          if (data.selectable) {
            title = "Selectable Items";
          } else if (data.removable) {
            title = "Removable Items";
          }
          return {
            title: title
          };
        }
      });

      list.setModel(this._model);

      list.addListener("changeSelection", function(evt) {
        this._showDialog("You selected Item #" + evt.getData());
      }, this);

      list.addListener("changeGroupSelection", function(evt) {
        this._showDialog("You selected Group #" + evt.getData());
      }, this);

      list.addListener("removeItem", function(evt) {
       this._model.removeAt(evt.getData());
      }, this);

      this.getContent().add(list);
    },


    _onWaypoint : function(evt) {
      var targetElement = this.__waypointInfoLabel.getContentElement();
      var index = evt.getData().index;
      var direction = evt.getData().direction;

      qx.bom.element.Animation.animate(targetElement, {
        "duration": 1000,
        "keep": 100,
        "keyFrames": {
          0: {
            "opacity": 0
          },
          10: {
            "opacity": 1
          },
          80: {
            "opacity": 1
          },
          100: {
            "opacity": 0
          }
        }
      });
 
      qx.bom.element.Attribute.set(targetElement, "data-waypoint-label", this._waypointsY[index]+ " ["+direction+"]");
      qx.bom.element.Attribute.set(targetElement, "data-waypoint", index);
    },


    /**
     * Displays a confirm dialog with the passed text.
     * @param text {String} text to display.
     */
    _showDialog: function(text) {
      qx.ui.mobile.dialog.Manager.getInstance().confirm("Selection", text, null, this, ["OK"]);
    },


    /**
     * Creates the model with the example data.
     * @return {qx.data.Array} data array.
     */
    _createModel: function() {
      var data = [];
      for (var i = 0; i < 50; i++) {
        data.push({
          title: "Item #" + i,
          subtitle: "Subtitle for Item #" + i,
          selectable: i < 6,
          removable: i > 5 && i < 11
        });
      }
      return new qx.data.Array(data);
    }
  }
});