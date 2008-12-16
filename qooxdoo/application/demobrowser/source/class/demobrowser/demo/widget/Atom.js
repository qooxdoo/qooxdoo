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

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/32/actions/go-previous.png)
#asset(qx/icon/${qx.icontheme}/32/actions/go-up.png)
#asset(qx/icon/${qx.icontheme}/32/actions/go-next.png)
#asset(qx/icon/${qx.icontheme}/32/actions/go-down.png)

#asset(qx/icon/${qx.icontheme}/32/apps/internet-feed-reader.png)
#asset(qx/icon/${qx.icontheme}/32/apps/utilities-notes.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.Atom",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);


      // Container of Row #1
      var container1 = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
      this.getRoot().add(container1, { left : 20, top: 20});



      // Icon Position Property
      container1.add(new qx.ui.basic.Atom("Icon Left", "icon/32/actions/go-previous.png").set({
        backgroundColor : "#E6FAED",
        decorator : "main",
        iconPosition : "left",
        padding : 5,
        allowGrowY: false
      }));

      container1.add(new qx.ui.basic.Atom("Icon Top", "icon/32/actions/go-up.png").set({
        backgroundColor : "#E6FAED",
        decorator : "main",
        iconPosition : "top",
        padding : 5,
        allowGrowY: false
      }));

      container1.add(new qx.ui.basic.Atom("Icon Right", "icon/32/actions/go-next.png").set({
        backgroundColor : "#E6FAED",
        decorator : "main",
        iconPosition : "right",
        padding : 5,
        allowGrowY: false
      }));

      container1.add(new qx.ui.basic.Atom("Icon Bottom", "icon/32/actions/go-down.png").set({
        backgroundColor : "#E6FAED",
        decorator : "main",
        iconPosition : "bottom",
        padding : 5,
        allowGrowY: false
      }));



      // Spacer
      container1.add(new qx.ui.core.Spacer().set({width:40}));



      // Show Property
      container1.add(new qx.ui.basic.Atom("Atom Without Label", "icon/32/apps/internet-feed-reader.png").set({
        backgroundColor : "#FAF8E6",
        decorator : "main",
        show : "icon",
        padding : 5,
        allowGrowY: false
      }));

      container1.add(new qx.ui.basic.Atom("Atom Without Icon", "icon/32/apps/internet-feed-reader.png").set({
        backgroundColor : "#FAF8E6",
        decorator : "main",
        show : "label",
        padding : 5,
        allowGrowY: false
      }));




      // Container of Row #2
      var container2 = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
      this.getRoot().add(container2, { left : 20, top: 150});


      // Shrinking (horizontally)
      container2.add(new qx.ui.basic.Atom("Atom With Long Label").set({
        backgroundColor : "#E6EDFA",
        decorator : "main",
        padding : 5,
        width : 100,
        allowGrowY: false
      }));

      container2.add(new qx.ui.basic.Atom("Atom With Long Label", "icon/32/apps/internet-feed-reader.png").set({
        backgroundColor : "#E6EDFA",
        decorator : "main",
        padding : 5,
        width : 150,
        allowGrowY: false
      }));

      container2.add(new qx.ui.basic.Atom("Atom With Long Label", "icon/32/apps/internet-feed-reader.png").set({
        backgroundColor : "#EAE6FA",
        decorator : "main",
        iconPosition : "top",
        padding : 5,
        width : 100,
        allowGrowY: false
      }));




      // Container of Row #3
      var container3 = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
      this.getRoot().add(container3, { left : 20, top: 250});

      container3.add(new qx.ui.basic.Atom("Wider Atom").set({
        backgroundColor : "#E6EDFA",
        decorator : "main",
        center : true,
        padding : 5,
        width : 100,
        allowGrowY: false
      }));

      container3.add(new qx.ui.basic.Atom("Wider Atom", "icon/32/apps/utilities-notes.png").set({
        backgroundColor : "#E6EDFA",
        decorator : "main",
        center : true,
        padding : 5,
        width : 140,
        allowGrowY: false
      }));


      container3.add(new qx.ui.basic.Atom("Higher Atom", "icon/32/apps/utilities-notes.png").set({
        backgroundColor : "#E6EDFA",
        decorator : "main",
        iconPosition : "top",
        center : true,
        padding : 5,
        height : 100,
        allowGrowY: false
      }));
    }
  }
});
