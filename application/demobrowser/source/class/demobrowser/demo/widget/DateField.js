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

/* ************************************************************************

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.DateField",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      /* Set locale to english to avoid language mix if browser locale is
       * non-english. */
      qx.locale.Manager.getInstance().setLocale("en");

      // Default date field //////////////////////////////////////
      this.getRoot().add(new qx.ui.basic.Label("Default"), {top: 15, left: 20});
      var dateField = new qx.ui.form.DateField();
      this.getRoot().add(dateField, {top: 35, left: 20});
      dateField.setValue(new Date());
      dateField.addListener("changeValue", function(e) {
        this.debug("Change Value: " + e.getData());
      });
      ////////////////////////////////////////////////////////////

      // Date field with date formater ///////////////////////////
      this.getRoot().add(new qx.ui.basic.Label("With date formater"), {top: 15, left: 150});
      var dateFieldFormat = new qx.ui.form.DateField();
      this.getRoot().add(dateFieldFormat, {top: 35, left: 150});
      dateFieldFormat.setValue(new Date());


      var format1 = new qx.util.format.DateFormat("MM-yyyy");
      var format2 = new qx.util.format.DateFormat("MM/dd/yyyy");
      var format3 = new qx.util.format.DateFormat("dd.MM.yyyy");
      dateFieldFormat.setDateFormat(format2);


      var setFormat1Button = new qx.ui.form.Button("MM-yyyy");
      setFormat1Button.setWidth(120);
      this.getRoot().add(setFormat1Button, {top: 80, left: 150});
      setFormat1Button.addListener("execute", function(e) {
        dateFieldFormat.setDateFormat(format1);
      });

      var setFormat2Button = new qx.ui.form.Button("MM/dd/yyyy");
      setFormat2Button.setWidth(120);
      this.getRoot().add(setFormat2Button, {top: 110, left: 150});
      setFormat2Button.addListener("execute", function(e) {
        dateFieldFormat.setDateFormat(format2);
      });

      var setFormat3Button = new qx.ui.form.Button("dd.MM.yyyy");
      setFormat3Button.setWidth(120);
      this.getRoot().add(setFormat3Button, {top: 140, left: 150});
      setFormat3Button.addListener("execute", function(e) {
        dateFieldFormat.setDateFormat(format3);
      });
      ////////////////////////////////////////////////////////////

      // external manipulation of the date field /////////////////
      this.getRoot().add(new qx.ui.basic.Label("Set data"), {top: 15, left: 280});
      var dateFieldManipulation = new qx.ui.form.DateField();
      this.getRoot().add(dateFieldManipulation, {top: 35, left: 280});

      var setCurrentButton = new qx.ui.form.Button("Set current date");
      setCurrentButton.setWidth(120);
      this.getRoot().add(setCurrentButton, {top: 80, left: 280});
      setCurrentButton.addListener("execute", function(e) {
        dateFieldManipulation.setValue(new Date());
      });

      var resetDateButton = new qx.ui.form.Button("Reset");
      resetDateButton.setWidth(120);
      this.getRoot().add(resetDateButton, {top: 110, left: 280});
      resetDateButton.addListener("execute", function(e) {
        dateFieldManipulation.resetValue();
      });

      ////////////////////////////////////////////////////////////

      // Get stuff of the date field /////////////////////////////
      this.getRoot().add(new qx.ui.basic.Label("Get data"), {top: 15, left: 410});
      var dateFieldGet = new qx.ui.form.DateField();
      this.getRoot().add(dateFieldGet, {top: 35, left: 410});

      var dateLabel = new qx.ui.basic.Label();
      this.getRoot().add(dateLabel, {left: 410, top: 88});

      var getDateButton = new qx.ui.form.Button("Get date");
      getDateButton.setWidth(120);
      this.getRoot().add(getDateButton, {left: 410, top: 80});
      getDateButton.addListener("execute", function(e) {
        dateLabel.setValue(dateFieldGet.getValue() + "");
      });
      ////////////////////////////////////////////////////////////
    }
  }
});
