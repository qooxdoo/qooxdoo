/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */


qx.Class.define("qx.test.event.type.Mouse",
{
  extend : qx.dev.unit.TestCase,


  members :
  {
    testClone : function()
    {
      var domEvent = {
        button: 2, // right button in IE and all other browsers
        clientX: 20,
        clientY: 40,
        srcElement: document.body,
        pageX: 20,
        pageY: 20,
        screenX: 1000,
        screenY: 400,
        wheelDelta: 20,
        detail: 20
      }

      var event = new qx.event.type.MouseWheel().init(domEvent, document.body, document.body, true, true);

      var reference = {
        button: event.getButton(),
        viewportLeft: event.getViewportLeft(),
        viewportTop: event.getViewportTop(),
        documentLeft: event.getDocumentLeft(),
        documentTop: event.getDocumentTop(),
        screenLeft: event.getScreenLeft(),
        screenTop: event.getScreenTop(),
        wheel: event.getWheelDelta()
      };

      var clone = event.clone();

      // simulate native event disposal
      qx.lang.Object.empty(domEvent);

      this.assertEquals(reference.button, clone.getButton());
      this.assertEquals(reference.viewportLeft, clone.getViewportLeft());
      this.assertEquals(reference.viewportTop, clone.getViewportTop());
      this.assertEquals(reference.documentLeft, clone.getDocumentLeft());
      this.assertEquals(reference.documentTop, clone.getDocumentTop());
      this.assertEquals(reference.screenLeft, clone.getScreenLeft());
      this.assertEquals(reference.screenTop, clone.getScreenTop());
      this.assertEquals(reference.wheel, clone.getWheelDelta());

      event.dispose();
      clone.dispose();
    }
  }
});