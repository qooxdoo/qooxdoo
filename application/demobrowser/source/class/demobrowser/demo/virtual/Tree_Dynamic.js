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

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/22/places/folder.png)
#asset(qx/icon/${qx.icontheme}/22/mimetypes/office-document.png)
#asset(demobrowser/demo/icons/loading22.gif)

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.Tree_Dynamic",
{
  extend : qx.application.Standalone,

  members :
  {
    count : 0,

    main : function()
    {
      this.base(arguments);

      var root = {
        label: "Root",
        children: [],
        icon: "default",
        loaded: true
      };
      root = qx.data.marshal.Json.createModel(root, true)
      this.createRandomData(root);

      var tree = new qx.ui.tree.VirtualTree(root, "label", "children");
      this.getRoot().add(tree, {edge: 20});

      tree.setIconPath("icon");
      tree.setIconOptions({
        converter : function(value, model)
        {
          if (value == "default") {
            if (model.getChildren != null) {
              return "icon/22/places/folder.png";
            } else {
              return "icon/22/mimetypes/office-document.png";
            }
          } else {
            return "demobrowser/demo/icons/loading22.gif";
          }
        }
      });

      var that = this;
      var delegate = {
        bindItem : function(controller, item, index)
        {
          controller.bindDefaultProperties(item, index);

          controller.bindProperty("", "open",
          {
            converter : function(value, model, source, target)
            {
              var isOpen = target.isOpen();
              if (isOpen && !value.getLoaded())
              {
                value.setLoaded(true);

                qx.event.Timer.once(function()
                {
                  value.getChildren().removeAll();
                  this.createRandomData(value);
                }, that, 1000);
              }

              return isOpen;
            }
          }, item, index);
        }
      };
      tree.setDelegate(delegate);
    },

    createRandomData : function(parent)
    {
      var items = parseInt(Math.random() * 50);

      for (var i = 0; i < items; i++) {
        var node = {
          label: "Item " + this.count++,
          icon: "default",
          loaded: true
        }

        if (Math.random() > 0.3)
        {
          node["loaded"] = false;
          node["children"] = [{
            label: "Loading",
            icon: "loading"
          }];
        }

        parent.getChildren().push(qx.data.marshal.Json.createModel(node, true));
      }
    }
  }
});
