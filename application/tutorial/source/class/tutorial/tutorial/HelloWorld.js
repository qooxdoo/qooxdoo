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
qx.Class.define("tutorial.tutorial.HelloWorld", 
{
  statics :
  {
    steps : [
      {
        text : "<h1>Hello World</h2>test<b> with html</b>",
        code : function() {
          var button = new qx.ui.form.Button("Hello...");
        }
      },
      {
        text : "second step text",
        code : function() {
          var button = new qx.ui.form.Button("Hello...");
          this.getRoot().add(button, {left: 50, top: 20});
        }
      },
      {
        text : "3rd step text",
        code : function() {
          var button = new qx.ui.form.Button("Hello...");
          this.getRoot().add(button, {left: 50, top: 20});

          button.addListener("execute", function() {
            alert("... World!");
          });
        }
      }
    ]
  }
});