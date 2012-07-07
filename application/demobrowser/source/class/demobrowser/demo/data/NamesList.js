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

#asset(demobrowser/demo/data/persons.json)

************************************************************************ */

/**
 * @tag databinding
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.data.NamesList",
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
      controller.setLabelPath("firstname");
      // convert for the label
      controller.setLabelOptions({converter: function(data, model) {
        return model ? model.getLastname() + ", " + data : "no model...";
      }});


      // create the data store
      var url = qx.util.ResourceManager.getInstance().toUri("demobrowser/demo/data/persons.json");
      var store = new qx.data.store.Json(url);

      // create the status label
      var status = new qx.ui.basic.Label("Loading...");
      this.getRoot().add(status, {left: 120, top: 80});

      // connect the store and the controller
      store.bind("model.persons", controller, "model");

      // bind the status label
      store.bind("state", status, "value");





      /* ***********************************************
       * DESCRIPTIONS
       * ********************************************* */
      var description = new qx.ui.basic.Label();
      description.setRich(true);
      description.setWidth(470);
      description.setValue(
        "<b>List bound to data in a json file</b><br/>"
        + "Loading the json file <a href='" + url +"' target='_blank'>"
        + "persons.json</a> and bind the items to the list widget. In the "
        + "converter for the label, the names will be set to both, the first "
        + "and last name."
      );
      this.getRoot().add(description, {left: 10, top: 10});

    }
  }
});
