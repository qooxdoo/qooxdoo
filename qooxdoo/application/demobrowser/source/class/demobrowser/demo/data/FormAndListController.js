/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * @tag databinding
 * @tag list contorller
 * @tag form controller
 */
qx.Class.define("demobrowser.demo.data.FormAndListController", 
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // create some dummy data
      var data = {
        firstname: "Martin",
        lastname: "Wittemann",
        gender: ["male", "female", "dont know!", "Alien"]
      };
      var model = qx.data.marshal.Json.createModel(data);

      // create the form
      var form = new qx.ui.form.Form();

      // firstname
      var firstname = new qx.ui.form.TextField();
      form.add(firstname, "Firstname");

      // lastname
      var lastname = new qx.ui.form.TextField();
      form.add(lastname, "Lastname");

      // gender
      var gender = new qx.ui.form.SelectBox();
      new qx.data.controller.List(model.getGender(), gender);
      form.add(gender, "Gender");

      // create the form and add it to the root
      this.getRoot().add(new qx.ui.form.renderer.Single(form), {left: 30, top: 20});

      // create a form controller!
      var formController = new qx.data.controller.Form(model, form);

      
      // A button to log the models content
      var logButton = new qx.ui.form.Button("Show model data in the log");
      this.getRoot().add(logButton, {left: 240, top: 20});
      logButton.addListener("execute", function() {
        this.debug(qx.dev.Debug.debugProperties(model));
      }, this);
    }
  }
});