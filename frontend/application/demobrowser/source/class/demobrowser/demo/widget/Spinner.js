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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.Spinner",
{
  extend : qx.application.Standalone,

  members :
  {
    addSimpleSpinner : function(container, row)
    {
      var spinner = new qx.ui.form.Spinner();
      container.add(new qx.ui.basic.Label("Simple"), {column: 0, row: row});
      container.add(new qx.ui.basic.Label("0"), {column: 1, row: row});
      container.add(spinner, {column: 2, row: row});
      container.add(new qx.ui.basic.Label("100"), {column: 3, row: row});
    },

    addNonEditableSpinner : function(container, row)
    {
      var spinner = new qx.ui.form.Spinner(0, 50, 100);
      spinner.setEditable(false);
      container.add(new qx.ui.basic.Label("Not Editable"), {column: 0, row: row});
      container.add(new qx.ui.basic.Label("0"), {column: 1, row: row});
      container.add(spinner, {column: 2, row: row});
      container.add(new qx.ui.basic.Label("100"), {column: 3, row: row});
    },

    addWrappingSpinner : function(container, row)
    {
      var spinner = new qx.ui.form.Spinner(-30, 30, 30);
      spinner.setWrap(true);
      container.add(new qx.ui.basic.Label("Wrap"), {column: 0, row: row});
      container.add(new qx.ui.basic.Label("-30"), {column: 1, row: row});
      container.add(spinner, {column: 2, row: row});
      container.add(new qx.ui.basic.Label("30"), {column: 3, row: row});
    },

    addStyledSpinner : function(container, row)
    {
      var spinner = new qx.ui.form.Spinner().set({
        width: 140,
        font: qx.bom.Font.fromString("30px sans-serif"),
        backgroundColor: "#FABBBB",
        padding: 10
      });
      container.add(new qx.ui.basic.Label("Big font"), {column: 0, row: row});
      container.add(new qx.ui.basic.Label("0"), {column: 1, row: row});
      container.add(spinner, {column: 2, row: row});
      container.add(new qx.ui.basic.Label("100"), {column: 3, row: row});
    },

    addSteppedSpinner : function(container, row)
    {
      var spinner = new qx.ui.form.Spinner(-3000, 0, 3000).set({
        singleStep: 25
      });
      container.add(new qx.ui.basic.Label("Stepped"), {column: 0, row: row});
      container.add(new qx.ui.basic.Label("-3000"), {column: 1, row: row});
      container.add(spinner, {column: 2, row: row});
      container.add(new qx.ui.basic.Label("3000"), {column: 3, row: row});
    },

    addDisabledSpinner : function(container, row)
    {
      var spinner = new qx.ui.form.Spinner;
      spinner.setEnabled(false);
      container.add(new qx.ui.basic.Label("Disabled"), {column: 0, row: row});
      container.add(new qx.ui.basic.Label("0"), {column: 1, row: row});
      container.add(spinner, {column: 2, row: row});
      container.add(new qx.ui.basic.Label("100"), {column: 3, row: row++});
    },

    addFormattedSpinner : function(container, row)
    {
      var spinner = new qx.ui.form.Spinner(0, 2000, 3000);
      spinner.setSingleStep(0.5);

      // Number format Test
      var nf = new qx.util.format.NumberFormat();
      nf.setMaximumFractionDigits(2);
      spinner.setNumberFormat(nf);

      container.add(new qx.ui.basic.Label("Number format"), {column: 0, row: row});
      container.add(new qx.ui.basic.Label("0"), {column: 1, row: row});
      container.add(spinner, {column: 2, row: row});
      container.add(new qx.ui.basic.Label("3000"), {column: 3, row: row++});
    },

    addThemedSpinner : function(container, row)
    {
      var spinner = new qx.ui.form.Spinner(-30, 30, 30);
      spinner.setAllowGrowY(false);
      container.add(new qx.ui.basic.Label("Styled"), {column: 0, row: row});
      container.add(new qx.ui.basic.Label("-30"), {column: 1, row: row});
      container.add(spinner, {column: 2, row: row});
      container.add(new qx.ui.basic.Label("30"), {column: 3, row: row});

      var button = new qx.ui.form.ToggleButton("Custom Style");
      button.setAllowGrowY(false);
      button.addListener("changeChecked", function(e) {
        spinner.setAppearance(e.getData() ? "colored-spinner" : "spinner");
      });
      container.add(button, {column: 4, row: row++});
    },


    main: function()
    {
      this.base(arguments);

      var layout = new qx.ui.layout.Grid(10, 8);
      layout.setColumnAlign(0, "left", "middle");
      layout.setColumnAlign(1, "right", "middle");
      layout.setColumnAlign(2, "left", "middle");
      layout.setColumnAlign(3, "left", "middle");

      var container = new qx.ui.container.Composite(layout);
      container.setPadding(10);
      this.getRoot().add(container, {left:0,top:0});

      this.addSimpleSpinner(container, 0);
      this.addNonEditableSpinner(container, 1);
      this.addWrappingSpinner(container, 2);
      this.addStyledSpinner(container, 3);
      this.addSteppedSpinner(container, 4);
      this.addDisabledSpinner(container, 5);
      this.addFormattedSpinner(container, 6);
      this.addThemedSpinner(container, 7);

      qx.Theme.define("coloredspinner",
      {
        "title" : "Color Spinner Extension",

        "appearances" :
        {
          "colored-spinner" :
          {
            states : [ "focused", "disabled" ],

            style : function(states)
            {
              return {
                decorator       : "outset",
                textColor       : states.disabled ? "text-disabled" : "undefined",
                backgroundColor : states.focused ? "#C1E9F5" : "field",
                font : "large"
              };
            }
          },

          "colored-spinner/textfield" :
          {
            style : function(states)
            {
              return {
                padding: [3, 5]
              };
            }
          },

          "colored-spinner/upbutton" :
          {
            alias : "button",
            states : [ "pressed" ],

            style : function(states)
            {
              return {
                icon : "decoration/arrows/up-small.gif",
                backgroundColor : states.pressed ? "#8ED721" : "#679C18",
                padding : [ 4, 8 ]
              }
            }
          },

          "colored-spinner/downbutton" :
          {
            alias : "button",
            states : [ "pressed" ],

            style : function(states)
            {
              return {
                icon : "decoration/arrows/down-small.gif",
                backgroundColor : states.pressed ? "#E96241" : "#D53E18",
                padding : [ 4, 8 ]
              };
            }
          }
        }
      });

      qx.Theme.include(qx.theme.manager.Appearance.getInstance().getAppearanceTheme(), coloredspinner);
    }
  }
});
