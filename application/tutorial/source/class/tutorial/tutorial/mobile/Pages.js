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
qx.Class.define("tutorial.tutorial.mobile.Pages", 
{
  statics :
  {
    description : "App featuring two pages", 

    steps: [
      function() {
        var page1 = new qx.ui.mobile.page.NavigationPage();
        page1.setTitle("Page 1");

        page1.addListener("initialize", function() {
          var button = new qx.ui.mobile.form.Button(
            "Next Page"
          );
          page1.getContent().add(button);
        },this);

        var page2 = new qx.ui.mobile.page.NavigationPage();
        page2.set({
          title : "Page 2",
          showBackButton : true,
          backButtonText : "Back"
        });

        this.getManager().addDetail([page1,page2]);
        page1.show();
      },


      function() {
        var page1 = new qx.ui.mobile.page.NavigationPage();
        page1.setTitle("Page 1");

        page1.addListener("initialize", function() {
          var button = new qx.ui.mobile.form.Button(
            "Next Page"
          );
          page1.getContent().add(button);

          button.addListener("tap", function() {
            page2.show();
          }, this);
        },this);

        var page2 = new qx.ui.mobile.page.NavigationPage();
        page2.set({
          title : "Page 2",
          showBackButton : true,
          backButtonText : "Back"
        });
        page2.addListener("back", function() {
          page1.show({reverse:true});
        }, this);

        this.getManager().addDetail([page1,page2]);
        page1.show();
      }
    ]
  }
});