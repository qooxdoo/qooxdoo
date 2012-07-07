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
     * Martin Wittemann (wittemann)

************************************************************************ */

/**
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.bom.Storage",
{
  extend : qx.application.Native,

  members :
  {
    __storage : null,

    main : function()
    {
      this.base(arguments);

      this.setUsing();

      this.__storage = qx.bom.Storage.getLocal();

      var saveButton = document.getElementById("save");
      var clearButton = document.getElementById("clear");
      var removeButton = document.getElementById("remove");

      var self = this;
      qx.bom.Event.addNativeListener(saveButton, "click", function() {
        var key = qx.bom.Input.getValue(document.getElementById("key"));
        var value = qx.bom.Input.getValue(document.getElementById("value"));
        self.__storage.setItem(key, value);
        self.updateList();
      });

      qx.bom.Event.addNativeListener(clearButton, "click", function() {
        self.__storage.clear();
        self.updateList();
      });

      qx.bom.Event.addNativeListener(removeButton, "click", function() {
        self.__storage.removeItem(self.__storage.getKey(0));
        self.updateList();
      });


      this.updateList();
    },

    updateList : function() {
      var list = document.getElementById("list");
      list.innerHTML = "";
      this.__storage.forEach(function(key, value) {
        list.innerHTML += key + ":" + value + "<br>";
      }, list);
      if (list.innerHTML == "") {
        list.innerHTML = "<em>no content</em>";
      }
    },


    setUsing : function() {
      var label = document.getElementById("using");
      if (qx.core.Environment.get("html.storage.local")) {
        label.innerHTML = "Web Storage";
      } else if (qx.core.Environment.get("html.storage.userdata")) {
        label.innerHTML = "userData Storage";
      } else {
        label.innerHTML = "Memory Storage";
      }
    }
  }
});
