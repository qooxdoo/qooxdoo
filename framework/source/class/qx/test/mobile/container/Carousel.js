/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

qx.Class.define("qx.test.mobile.container.Carousel",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testInit : function()
    {
      var carousel = new qx.ui.mobile.container.Carousel(0.4);
      this.getRoot().add(carousel);
      carousel.destroy();
    },


    testAddCarouselPage : function()
    {
      var carousel = new qx.ui.mobile.container.Carousel();
      var carouselPage = new qx.ui.mobile.container.Composite();
      carousel.add(carouselPage);

      this.getRoot().add(carousel);

      carousel.destroy();
      carouselPage.destroy();
    },


    testRemoveCarouselPage : function()
    {
      var carousel = new qx.ui.mobile.container.Carousel();
      var carouselPage = new qx.ui.mobile.container.Composite();

      carousel.add(carouselPage);

      carousel.removePageByIndex(0);

      this.getRoot().add(carousel);

      carousel.destroy();
      carouselPage.destroy();
    },


    testPageSwitch : function()
    {
      var carousel = new qx.ui.mobile.container.Carousel();
      var carouselPage1 = new qx.ui.mobile.container.Composite();
      carousel.add(carouselPage1);

      var carouselPage2 = new qx.ui.mobile.container.Composite();
      carousel.add(carouselPage2);

      this.getRoot().add(carousel);

      this.assertEquals(0,carousel.getShownPageIndex());

      carousel.nextPage();
      this.assertEquals(1, carousel.getShownPageIndex());

      // OVERFLOW
      carousel.nextPage();
      this.assertEquals(1, carousel.getShownPageIndex());

      carousel.previousPage();
      this.assertEquals(0,carousel.getShownPageIndex());

      // OVERFLOW
      carousel.previousPage();
      this.assertEquals(0,carousel.getShownPageIndex());

      carousel.destroy();
      carouselPage1.destroy();
      carouselPage2.destroy();
    },


    testScrollToPage : function()
    {
      var carousel = new qx.ui.mobile.container.Carousel();
      var carouselPage1 = new qx.ui.mobile.container.Composite();
      carousel.add(carouselPage1);

      var carouselPage2 = new qx.ui.mobile.container.Composite();
      carousel.add(carouselPage2);

      this.getRoot().add(carousel);

      this.assertEquals(0,carousel.getShownPageIndex());

      carousel.scrollToPage(1);
      this.assertEquals(1, carousel.getShownPageIndex());

      carousel.destroy();
      carouselPage1.destroy();
      carouselPage2.destroy();
    }
  }

});
