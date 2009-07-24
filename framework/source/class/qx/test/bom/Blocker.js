/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Back (aback)

************************************************************************ */

qx.Class.define("qx.test.bom.Blocker",
{
  extend : qx.dev.unit.TestCase,

  members :
  {

    setUp : function() {
      var blocker = qx.bom.Blocker;
      
      this.__blockedElement = qx.bom.Element.create("div");
      qx.bom.element.Style.setStyles(this.__blockedElement, {
        position: "absolute",
        top: "100px",
        left: "100px",
        width: "500px",
        height: "500px",
        zIndex: 200
      });
      
      qx.dom.Element.insertBegin(this.__blockedElement, document.body);
    },


    tearDown : function() {
      
    },

    testBlockWholeDocument : function()
    {
      qx.bom.Blocker.block();
      
      var blockerElement = qx.bom.Collection.query("#__qxBlockerElement")[0];
      
      this.assertNotNull(blockerElement, "Blocker element not inserted.");
      this.assertEquals(qx.bom.Document.getWidth(), qx.bom.element.Dimension.getWidth(blockerElement));
      this.assertEquals(qx.bom.Document.getHeight(), qx.bom.element.Dimension.getHeight(blockerElement));
                      
      var blockerIframeElement = qx.bom.Collection.query("#__qxBlockerIframeElement")[0];
      this.assertNotNull(blockerIframeElement, "Blocker iframe element not inserted");
      this.assertEquals(qx.bom.Document.getWidth(), qx.bom.element.Dimension.getWidth(blockerIframeElement));
      this.assertEquals(qx.bom.Document.getHeight(), qx.bom.element.Dimension.getHeight(blockerIframeElement));       
      
      qx.bom.Blocker.unblock();
    },
    
    
    testUnblockWholeDocument : function()
    {
      qx.bom.Blocker.block();
      qx.bom.Blocker.unblock();
      
      var blockerElement = qx.bom.Collection.query("#__qxBlockerElement")[0];
      this.assertUndefined(blockerElement, "Blocker not correctly removed");
                      
      var blockerIframeElement = qx.bom.Collection.query("#__qxBlockerIframeElement")[0];
      this.assertUndefined(blockerIframeElement, "Blocker iframe not correctly removed");
    },
    
    
    testBlockElement : function()
    {
      qx.bom.Blocker.block(this.__blockedElement);
      
      var blockerElement = qx.bom.Collection.query("#__qxBlockerElement")[0];
      
      this.assertNotNull(blockerElement, "Blocker element not inserted.");
      
      this.assertEquals(qx.bom.element.Dimension.getWidth(this.__blockedElement), qx.bom.element.Dimension.getWidth(blockerElement));
      this.assertEquals(qx.bom.element.Dimension.getHeight(this.__blockedElement), qx.bom.element.Dimension.getHeight(blockerElement));
      
      this.assertEquals(qx.bom.element.Location.getLeft(this.__blockedElement), qx.bom.element.Location.getLeft(blockerElement));
      this.assertEquals(qx.bom.element.Location.getTop(this.__blockedElement), qx.bom.element.Location.getTop(blockerElement));
      
      this.assertEquals(qx.bom.element.Style.get(this.__blockedElement, "zIndex") - 1, qx.bom.element.Style.get(blockerElement, "zIndex"));
      
      var blockerIframeElement = qx.bom.Collection.query("#__qxBlockerIframeElement")[0];
      this.assertEquals(qx.bom.element.Style.get(this.__blockedElement, "zIndex") - 2, qx.bom.element.Style.get(blockerIframeElement, "zIndex"));
            
      qx.bom.Blocker.unblock();
    },
    
    
    testBlockerColor : function()
    {
      qx.bom.Blocker.setBlockerColor("#FF0000");
      qx.bom.Blocker.block();
      
      var blockerElement = qx.bom.Collection.query("#__qxBlockerElement")[0];
      
      if (qx.bom.client.Engine.MSHTML || qx.bom.client.Engine.OPERA) {
        this.assertEquals(qx.bom.element.Style.get(blockerElement, "backgroundColor"), "#ff0000");
      } else {
        this.assertEquals(qx.bom.element.Style.get(blockerElement, "backgroundColor"), "rgb(255, 0, 0)");
      }
      
      qx.bom.Blocker.unblock();
    },
    
    
    testBlockerOpacity : function()
    {
      qx.bom.Blocker.setBlockerOpacity(0.7);
      qx.bom.Blocker.block();
      
      var blockerElement = qx.bom.Collection.query("#__qxBlockerElement")[0];
      this.assertEquals(qx.bom.element.Opacity.get(blockerElement), 0.7);
      
      qx.bom.Blocker.unblock();
    },
    
    
    testDoubleBlocking : function()
    {
      qx.bom.Blocker.block();
      qx.bom.Blocker.block();
      
      var blockerCollection = qx.bom.Collection.query("#__qxBlockerElement");
      this.assertTrue(blockerCollection.length == 1, "Only one blocker element should be inserted");
      
      qx.bom.Blocker.unblock();
    },
    
    
    testDoubleUnBlocking : function()
    {
      qx.bom.Blocker.block();
      qx.bom.Blocker.unblock();
      qx.bom.Blocker.unblock();
      
      var blockerCollection = qx.bom.Collection.query("#__qxBlockerElement");
      this.assertTrue(blockerCollection.length == 0);
    }
  }
});
