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
qx.Class.define("demobrowser.demo.data.Gears", 
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);
      
      var personBox = new qx.ui.groupbox.GroupBox("Person");
      this.getRoot().add(personBox, {left: 10, top: 50});

      
      personBox.setLayout(new qx.ui.layout.Grid(0, 3));
      
      personBox.add(new qx.ui.basic.Label("First Name: "), {row: 0, column: 0});
      personBox.add(new qx.ui.basic.Label("LastName: "), {row: 1, column: 0});
      personBox.add(new qx.ui.basic.Label("Age: "), {row: 2, column: 0});
      
      var firstName = new qx.ui.form.TextField();
      personBox.add(firstName, {row: 0, column: 1});
      var lastName = new qx.ui.form.TextField();
      personBox.add(lastName, {row: 1, column: 1});     
      var age = new qx.ui.form.Spinner(0, 0, 1000);
      personBox.add(age, {row: 2, column: 1});

      
      // create the controller for the detail view
      var controller = new qx.data.controller.Object();
      controller.addTarget(firstName, "value", "firstname", true);
      controller.addTarget(lastName, "value", "lastname", true);
      controller.addTarget(age, "value", "age", true);
      
      var store = new demobrowser.demo.data.store.Gears();
      
      // connect the selected model item of the list to the detail view
      store.bind("model", controller, "model");      
      

      /* ***********************************************
       * HEADLINE
       * ********************************************* */  
      var headline = new qx.ui.basic.Label();
      headline.setRich(true);
      headline.setWidth(260);
      headline.setContent(
        "<span style='font-size: 20px'>google Gears</span>"
      );
      this.getRoot().add(headline, {left: 10, top: 10});   
            
    }
  }
});

