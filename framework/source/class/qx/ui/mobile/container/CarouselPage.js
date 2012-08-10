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
 * A {@link  qx.ui.mobile.container.Carousel} contains multiple {@link  qx.ui.mobile.container.CarouselPage}.
 * CarouselPages can be simply added/removed to a carousel and may contain any widget.
 * 
 * Pagination indicator of carousel updates automatically when a carouselPage is added or removed.
 * 
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *  
 *  var carousel = new qx.ui.mobile.container.Carousel(0.3);
 *  var carouselPage1 = new qx.ui.mobile.container.CarouselPage();
 *  var carouselPage2 = new qx.ui.mobile.container.CarouselPage();
 *     
 *  carouselPage1.add(new qx.ui.mobile.basic.Label("This is a carousel. Please swipe left."));
 *  carouselPage2.add(new qx.ui.mobile.basic.Label("Now swipe right."));
 *     
 *  carousel.addPage(carouselPage1);
 *  carousel.addPage(carouselPage2);
 * </pre>
 */
qx.Class.define("qx.ui.mobile.container.CarouselPage",
{
  extend : qx.ui.mobile.container.Composite,
  
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct : function()
  {
    this.base(arguments);
  },
  
  
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties :
  {
    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "carousel-page"
    }
  }

});
