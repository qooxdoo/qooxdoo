/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

qx.Class.define("qx.test.mobile.container.Scroll",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testCreate : function()
    {
      var container = new qx.ui.mobile.container.Scroll();
      this.getRoot().add(container);
      container.destroy();
    },

    testHorizontalWayPoint: function () {
      var scrollContainer = new qx.ui.mobile.container.Scroll();
      scrollContainer.setWaypointsX([200]);
      qxWeb(scrollContainer.getContainerElement()).setStyle("overflow", "hidden");
      scrollContainer.addListener("waypoint", function (wayPoint) {
        var wayPointData = wayPoint.getData();
        this.resume(function () {
          this.assertEquals("x", wayPointData.axis);
          this.assertEquals(0, wayPointData.index);
          this.assertEquals("left", wayPointData.direction);
        }, this);
      }, this);

      var content = new qx.ui.mobile.core.Widget();
      qxWeb(content.getContainerElement()).setStyles({
        width: "5000px",
        height: "5000px"
      });

      scrollContainer.add(content);
      this.getRoot().add(scrollContainer);

      scrollContainer._updateWaypoints();
      setTimeout(function () {
        scrollContainer._setCurrentX(250);
      }, 100);

      this.wait();
    }
  }

});
