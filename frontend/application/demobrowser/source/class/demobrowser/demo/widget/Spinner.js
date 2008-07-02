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
    main: function()
    {
      this.base(arguments);

      var layout = new qx.ui.layout.Grid(10, 8);
      layout.setColumnAlign(0, "left", "middle");
      layout.setColumnAlign(1, "right", "middle");
      layout.setColumnAlign(2, "left", "middle");
      layout.setColumnAlign(3, "left", "middle");

      var container = new qx.ui.container.Composite(layout).set({
        padding: 10
      });
      this.getRoot().add(container, {left:0,top:0});

      var row = 0;

      // ----- Spinner 1 -----
      var s1 = new qx.ui.form.Spinner(0, 50, 100);
      s1.set({
        editable: false
      });
      container.add(new qx.ui.basic.Label("Not Editable"), {column: 0, row: row});
      container.add(new qx.ui.basic.Label("100"), {column: 1, row: row});
      container.add(s1, {column: 2, row: row});
      container.add(new qx.ui.basic.Label("0"), {column: 3, row: row++});


      // ----- Spinner 2 -----
      var s2 = new qx.ui.form.Spinner(-30, 30, 30).set({
        wrap: true
      });
      container.add(new qx.ui.basic.Label("Wrap"), {column: 0, row: row});
      container.add(new qx.ui.basic.Label("30"), {column: 1, row: row});
      container.add(s2, {column: 2, row: row});
      container.add(new qx.ui.basic.Label("-30"), {column: 3, row: row++});


      // ----- Spinner 3 -----
      var s3 = new qx.ui.form.Spinner(-3000, 0, 3000).set({
        singleStep: 5,
        width: 100,
        font: qx.bom.Font.fromString("30px sans-serif"),
        backgroundColor: "#FABBBB",
        padding: 10
      });
      container.add(new qx.ui.basic.Label("Big font + singleStep=5"), {column: 0, row: row});
      container.add(new qx.ui.basic.Label("3000"), {column: 1, row: row});
      container.add(s3, {column: 2, row: row});
      container.add(new qx.ui.basic.Label("-3000"), {column: 3, row: row++});


      // ----- Spinner 4 -----
      s4 = new qx.ui.form.Spinner( -200, null, -100);
      container.add(new qx.ui.basic.Label("Null as value"), {column: 0, row: row});
      container.add(new qx.ui.basic.Label("-100"), {column: 1, row: row});
      container.add(s4, {column: 2, row: row});
      container.add(new qx.ui.basic.Label("-200"), {column: 3, row: row++});


      // ----- Spinner 5 -----
      var s5 = new qx.ui.form.Spinner(-200, null, -100).set({
        enabled: false
      });
      container.add(new qx.ui.basic.Label("Disabled"), {column: 0, row: row});
      container.add(new qx.ui.basic.Label("-100"), {column: 1, row: row});
      container.add(s5, {column: 2, row: row});
      container.add(new qx.ui.basic.Label("-200"), {column: 3, row: row++});


      // ----- Spinner 6 -----
      var s6 = new qx.ui.form.Spinner(0, 2000, 3000);
      s6.setSingleStep(0.5);
      // Number format Test
      var nf = new qx.util.format.NumberFormat();
      nf.setMaximumFractionDigits(2);
      s6.setNumberFormat(nf);

      container.add(new qx.ui.basic.Label("With number format"), {column: 0, row: row});
      container.add(new qx.ui.basic.Label("3000"), {column: 1, row: row});
      container.add(s6, {column: 2, row: row});
      container.add(new qx.ui.basic.Label("0"), {column: 3, row: row++});
      
      
      // ----- Spinner 7 -----
      var s7 = new qx.ui.form.Spinner(-30, 30, 30);
      s7.setAllowGrowY(false);
      container.add(new qx.ui.basic.Label("Styled"), {column: 0, row: row});
      container.add(new qx.ui.basic.Label("30"), {column: 1, row: row});
      container.add(s7, {column: 2, row: row});
      container.add(new qx.ui.basic.Label("-30"), {column: 3, row: row});      
      
      var b7 = new qx.ui.form.ToggleButton("Custom Style");
      b7.addListener("change", function(e) {
        s7.setAppearance(e.getValue() ? "colored-spinner" : "spinner");
      });
      container.add(b7, {column: 4, row: row++});
      
      
        
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
