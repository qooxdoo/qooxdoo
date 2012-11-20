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
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * Mobile page showing the "Carousel" showcase.
 */
qx.Class.define("mobileshowcase.page.Carousel",
{
  extend : qx.ui.mobile.page.NavigationPage,

  construct : function()
  {
    this.base(arguments);
    this.setTitle("Carousel");
    this.setShowBackButton(true);
    this.setBackButtonText("Back");
  },


  members :
  {
    // overridden
    _initialize : function()
    {
      this.base(arguments);

      var carousel = new qx.ui.mobile.container.Carousel(0.5);
      carousel.setHeight(350);

      var page1 = new qx.ui.mobile.container.Composite();
      page1.addCssClass("carousel-example-1");

      var page1Label =new qx.ui.mobile.basic.Label("This is a carousel. Please swipe left.");
      page1Label.addCssClass("carousel-label-1");
      page1.add(page1Label);

      var page2 = new qx.ui.mobile.container.Composite();
      page2.addCssClass("carousel-example-2");
      page2.add(new qx.ui.mobile.basic.Label("It contains multiple carousel pages."));

      var page3 = new qx.ui.mobile.container.Composite();
      page3.addCssClass("carousel-example-3");
      var page3label = new qx.ui.mobile.basic.Label("Carousel pages may contain any widgets like labels, images, buttons etc.");
      page3.add(page3label);

      var nextButton = new qx.ui.mobile.form.Button("Next Page");
      nextButton.addCssClass("example-button");
      nextButton.addListener("tap",carousel.nextPage,carousel);

      var previousButton = new qx.ui.mobile.form.Button("Previous Page");
      previousButton.addCssClass("example-button");
      previousButton.addListener("tap",carousel.previousPage,carousel);

      var page3group = new qx.ui.mobile.form.Group([previousButton,nextButton],false);
      page3group.setLayout(new qx.ui.mobile.layout.HBox());
      page3.add(page3group);

      var page4 = new qx.ui.mobile.container.Composite();
      page4.addCssClass("carousel-example-4");
      page4.add(new qx.ui.mobile.basic.Label("The carousel snaps on every page."));

      var page5 = new qx.ui.mobile.container.Composite();
      page5.addCssClass("carousel-example-5");
      page5.add(new qx.ui.mobile.basic.Label("Previous page is shown when you swipe right."),{flex:1});

      carousel.add(page1);
      carousel.add(page2);
      carousel.add(page3);
      carousel.add(page4);
      carousel.add(page5);

      this.getContent().add(carousel);
    },



    // overridden
    _back : function()
    {
     qx.core.Init.getApplication().getRouting().executeGet("/", {reverse:true});
    }
  }
});