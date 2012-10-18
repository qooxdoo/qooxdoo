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
qx.Class.define("tutorial.tutorial.desktop.Single_Value_Binding", 
{
  statics :
  {
    description : "Binding of simple values", 

    steps: [
      function() {
        var slider = new qx.ui.form.Slider();
        slider.setWidth(100);
        slider.setMinimum(0);
        slider.setMaximum(8);
        this.getRoot().add(slider, {left: 10, top: 15});

        var button = new qx.ui.form.Button("x pieces");
        this.getRoot().add(button, {left: 120, top: 10});
      },

      function() {
        var slider = new qx.ui.form.Slider();
        slider.setWidth(100);
        slider.setMinimum(0);
        slider.setMaximum(8);
        this.getRoot().add(slider, {left: 10, top: 15});

        var button = new qx.ui.form.Button("x pieces");
        this.getRoot().add(button, {left: 120, top: 10});

        slider.bind("value", button, "label", {
          converter: function(data) {
            return data + " pieces";
          }
        });
      }
    ]
  }
});
