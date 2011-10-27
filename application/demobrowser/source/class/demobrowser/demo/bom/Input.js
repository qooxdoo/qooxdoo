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
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("demobrowser.demo.bom.Input",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var textField = qx.bom.Input.create("text");

      qx.event.Registration.addListener(textField, "input", function(e) {
        this.debug("Input (Single): " + e.getData());
      }, this);

      qx.event.Registration.addListener(textField, "change", function(e) {
        this.debug("Change (Single): " + e.getData());
      }, this);

      var textArea = qx.bom.Input.create("textarea");

      qx.event.Registration.addListener(textArea, "input", function(e) {
        this.debug("Input (Multi): " + e.getData());
      }, this);

      qx.event.Registration.addListener(textArea, "change", function(e) {
        this.debug("Change (Multi): " + e.getData());
      }, this);

      document.body.appendChild(textField);
      document.body.appendChild(textArea);




      var checkBox1 = qx.bom.Input.create("checkbox");

      var checkBox2 = qx.bom.Input.create("checkbox", {
        checked : true
      });

      qx.event.Registration.addListener(checkBox1, "change", function(e) {
        this.debug("Changed checkbox 1: " + e.getData());
      }, this);

      qx.event.Registration.addListener(checkBox2, "change", function(e) {
        this.debug("Changed checkbox 2: " + e.getData());
      }, this);

      document.body.appendChild(checkBox1);
      document.body.appendChild(checkBox2);



      var radioBox1 = qx.bom.Input.create("radio", {
        name : "radio1",
        value : "val1",
        checked : true
      });

      var radioBox2 = qx.bom.Input.create("radio", {
        name : "radio1",
        value : "val2"
      });

      function radioChange(e) {
        this.debug("Changed radio: " + e.getTarget().name + " = " + e.getData());
      }

      qx.event.Registration.addListener(radioBox1, "change", radioChange, this);
      qx.event.Registration.addListener(radioBox2, "change", radioChange, this);

      document.body.appendChild(radioBox1);
      document.body.appendChild(radioBox2);



      var selectBox1 = qx.bom.Input.create("select");
      var op;
      for (var i=0; i<10; i++)
      {
        op = document.createElement("option");
        op.value = "VAL" + i;
        op.appendChild(document.createTextNode("Value " + i));
        selectBox1.appendChild(op);
      }

      qx.event.Registration.addListener(selectBox1, "change", function(e) {
        this.debug("Changed selectbox1: " + e.getData());
      }, this);

      document.body.appendChild(selectBox1);





      var selectBox2 = qx.bom.Input.create("select", {
        size : 3
      });
      var op;
      for (var i=0; i<10; i++)
      {
        op = document.createElement("option");
        op.value = "VAL" + i;
        op.appendChild(document.createTextNode("Value " + i));
        selectBox2.appendChild(op);
      }

      qx.event.Registration.addListener(selectBox2, "change", function(e) {
        this.debug("Changed selectbox2: " + e.getData());
      }, this);

      document.body.appendChild(selectBox2);





      var selectBox3 = qx.bom.Input.create("select", {
        size : 3,
        multiple : true
      });
      var op;
      for (var i=0; i<10; i++)
      {
        op = document.createElement("option");
        op.value = "VAL" + i;
        op.appendChild(document.createTextNode("Value " + i));
        selectBox3.appendChild(op);
      }

      qx.event.Registration.addListener(selectBox3, "change", function(e) {
        this.debug("Changed selectbox3: " + e.getData());
      }, this);

      document.body.appendChild(selectBox3);




      var fileSelect = qx.bom.Input.create("file");

      qx.event.Registration.addListener(fileSelect, "change", function(e) {
        this.debug("Changed file select: " + e.getData());
      }, this);

      document.body.appendChild(fileSelect);
    }
  }
});
