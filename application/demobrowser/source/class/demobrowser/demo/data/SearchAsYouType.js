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

/**
 * @tag noPlayground
 * @tag databinding
 * @tag filter
 */
qx.Class.define("demobrowser.demo.data.SearchAsYouType",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // create some stuff for the list items
      var names = [
        "Bart", "Lisa", "Homer", "Marge", "Moe",
        "Smithers", "Nelson", "Flanders", "Maggy", "Skinner"
      ];

      // create the data
      var rawData = [];
      for (var i = 0; i < 60; i++) {
        rawData.push(names[i % 10] + " " + i);
      }
      var data = new qx.data.Array(rawData);

      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
      this.getRoot().add(container, {top: 10, left: 10});

      // create the textfield
      var textfield = new qx.ui.form.TextField();
      textfield.setLiveUpdate(true);
      container.add(textfield);

      // create the list
      var list = new qx.ui.form.List();

      // add the widgets to the document
      container.add(list);

      // create the controller
      var controller = new qx.data.controller.List(data, list);

      // create the filter
      var filterObj = new demobrowser.demo.data.filter.SearchAsYouTypeFilter(controller);

      // set the filter
      controller.setDelegate(filterObj);

      // make every input in the textfield update the controller
      textfield.bind("changeValue", filterObj, "searchString");





      /* ***********************************************
       * DESCRIPTIONS
       * ********************************************* */
      // List Selection sync description
      var description = new qx.ui.basic.Label();
      description.setRich(true);
      description.setWidth(200);
      description.setValue(
        "<b>Search As You Type List</b><br/>"
        + "Type a name and the list will show only the matching results (case-sensitive)."
      );
      container.addAt(description, 0);
    }
  }
});
