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

************************************************************************ */

/* ************************************************************************

#asset(demobrowser/demo/data/list.json)
#asset(qx/icon/${qx.icontheme}/16/mimetypes/*)

************************************************************************ */

/**
 * @tag databinding
 */
qx.Class.define("demobrowser.demo.data.JsonToList",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // create and add the list
      var list = new qx.ui.form.List();
      this.getRoot().add(list, {left: 10, top: 80});

      // create the controller
      var controller = new qx.data.controller.List(null, list);
      // set the name for the label property
      controller.setLabelPath("name");
      // set a converter for the icons
      controller.setIconOptions({converter : function(data) {
        return "icon/16/mimetypes/" + data + ".png";
      }});
      // set the name of the icon property
      controller.setIconPath("type");

      // create the data store
      var url = qx.util.ResourceManager.getInstance().toUri("demobrowser/demo/data/list.json");
      var store = new qx.data.store.Json(url);

      // create the status label
      var status = new qx.ui.basic.Label("Loading...");
      this.getRoot().add(status, {left: 120, top: 80});

      // connect the store and the controller
      store.bind("model.items", controller, "model");

      // bind the status label
      store.bind("state", status, "value");





      /* ***********************************************
       * DESCRIPTIONS
       * ********************************************* */
      var description = new qx.ui.basic.Label();
      description.setRich(true);
      description.setWidth(450);
      description.setValue(
        "<b>List bound to data in a json file</b><br/>"
        + "Loading the json file <a href='" + url +"' target='_blank'>"
        + "list.json</a> and bind the items to the list widget. The icons "
        + " will be created by a converter which converts the type to an icon url."
      );
      this.getRoot().add(description, {left: 10, top: 10});

    }
  }
});
