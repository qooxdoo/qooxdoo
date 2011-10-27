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
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("showcase.Page",
{
  extend: qx.core.Object,

  construct: function()
  {
    this.initReadyState();
  },

  properties :
  {
    name : {
      check: "String",
      event: "changeName"
    },

    icon : {
      check: "String",
      event: "changeIcon"
    },

    part : {
      check: "String",
      event: "changePart"
    },

    description : {
      check: "String",
      event: "changeDescription"
    },

    contentClass : {
    },

    controlClass : {
      nullable: true
    },



    content : {
      check : "showcase.AbstractContent"
    },

    readyState :
    {
      check: ["initialized", "loading", "complete"],
      init: "initialized",
      event: "changeState"
    }
  },


  members :
  {
    load : function(callback, context)
    {
      var callback = callback || qx.lang.Function.empty;
      var context = context || this;

      var state = this.getReadyState();
      if (state == "complete")
      {
        callback.call(context, this);
        return;
      }
      else if (state == "loading")
      {
        return this.addListenerOnce("changeState", function() {
          callback.call(context, this);
        });
      }
      else
      {
        this.setReadyState("loading");
        qx.io.PartLoader.require(this.getPart(), function() {
          this._initializeContent();
          this.setReadyState("complete");
          callback.call(context, this);
        }, this);
      }
    },


    _initializeContent : function()
    {
      var contentClass = qx.Class.getByName(this.getContentClass());
      this.setContent(new contentClass(this));
    }
  }
});