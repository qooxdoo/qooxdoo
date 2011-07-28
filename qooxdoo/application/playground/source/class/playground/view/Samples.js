/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

#asset(playground/*)
#ignore(require)
#ignore(ace)

************************************************************************ */

/**
 * Container for the examples.
 */
qx.Class.define("playground.view.Samples",
{
  extend : qx.ui.container.Composite,


  construct : function()
  {
    this.base(arguments);

    // layout stuff
    var layout = new qx.ui.layout.VBox();
    this.setLayout(layout);
    this.setDecorator("main");

    // caption
    var caption = new qx.ui.basic.Label(this.tr("Samples")).set({
      font       : "bold",
      padding    : 5,
      allowGrowX : true,
      allowGrowY : true
    });
    this.add(caption);

    this.__list = new qx.ui.list.List();
    this.add(this.__list, {flex: 1});
    this.__list.setDecorator("separator-vertical");
    this.__list.setLabelPath("name");

    var self = this;
    this.__list.setDelegate({
      filter : function(data) {
        return data.getMode() == self.getMode();
      },
      group : function(data) {
        if (data.getCategory() == "static") {
          return qx.locale.Manager.tr("Static");
        } else {
          return qx.locale.Manager.tr("User");
        }
      }
    });
    this.__list.getSelection().addListener("change", function() {
      var sample = this.__list.getSelection().getItem(0);
      if (sample) {
        this.fireDataEvent("selectSample", sample);
      }
    }, this);
  },


  events : {
    "selectSample" : "qx.event.type.Data"
  },


  properties : {
    model : {
      event : "changeModel",
      apply : "_applyModel"
    },

    mode : {
      check : "String",
      apply : "_applyMode",
      init : ""
    },

    currentSample : {
      apply : "_applyCurrentSample",
      nullable : true
    }
  },


  members :
  {
    __list : null,


    // property apply
    _applyCurrentSample : function(value) {
      this.__list.getSelection().setItem(0, value);
    },


    // property apply
    _applyModel : function(value) {
      if (value) {
        this.__list.setModel(value);
      }
    },


    // property apply
    _applyMode : function(value) {
      this.__list.refresh();
    }
  }
});