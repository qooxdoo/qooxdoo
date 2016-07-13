/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)

************************************************************************ */

qx.Class.define("qx.test.bom.element.Dimension",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function()
    {
      this.__inlineElement = document.createElement("span");
      document.body.appendChild(this.__inlineElement);

      this.__inlineElementWithPadding = document.createElement("span");
      this.__inlineElementWithPadding.style.padding = "2px";
      document.body.appendChild(this.__inlineElementWithPadding);

      this.__blockElement = document.createElement("div");
      this.__blockElement.style.width = "200px";
      document.body.appendChild(this.__blockElement);

      this.__blockElementWithPadding = document.createElement("div");
      this.__blockElementWithPadding.style.padding = "2px";
      this.__blockElementWithPadding.style.width = "200px";
      document.body.appendChild(this.__blockElementWithPadding);
    },


    tearDown : function()
    {
      document.body.removeChild(this.__inlineElement);
      this.__inlineElement = null;

      document.body.removeChild(this.__inlineElementWithPadding);
      this.__inlineElementWithPadding = null;

      document.body.removeChild(this.__blockElement);
      this.__blockElement = null;

      document.body.removeChild(this.__blockElementWithPadding);
      this.__blockElementWithPadding = null;
    },


    testContentWidthOfInlineElement : function() {
      this.assertEquals(0, qx.bom.element.Dimension.getContentWidth(this.__inlineElement));
    },


    testContentWidthOfInlineElementWithPadding : function() {
      this.assertEquals(0, qx.bom.element.Dimension.getContentWidth(this.__inlineElementWithPadding));
    },


    testContentWidthOfBlockElement : function() {
      this.assertEquals(200, qx.bom.element.Dimension.getContentWidth(this.__blockElement));
    },


    testContentWidthOfBlockElementWithPadding : function() {
      this.assertEquals(200, qx.bom.element.Dimension.getContentWidth(this.__blockElementWithPadding));
    },

    testRoundingErrorInWidthAndHeightGetters : function() {
      // width = left - right = height = bottom - top = 38.416656494140625
      var mockElement1 =
      {
        getBoundingClientRect : function() {
          return {
            right: 91.58332824707031,
            left: 53.16667175292969,
            bottom: 91.58332824707031,
            top: 53.16667175292969
          };
        }
      };
      // exactly same width and height as mockElement1
      var mockElement2 =
      {
        getBoundingClientRect : function() {
          return {
            right: 91.58332824707031,
            left: 53.16667175292969,
            bottom: 91.58332824707031,
            top: 53.16667175292969
          };
        }
      };
      // make sure both mock objects have the same width
      this.assertEquals(mockElement1.getBoundingClientRect().right - mockElement1.getBoundingClientRect().left,
       mockElement2.getBoundingClientRect().right - mockElement2.getBoundingClientRect().left);
      // ... and the same height
      this.assertEquals(mockElement1.getBoundingClientRect().bottom - mockElement1.getBoundingClientRect().top,
       mockElement2.getBoundingClientRect().bottom - mockElement2.getBoundingClientRect().top);

      // the width and height calculation for both objects should return the same
      this.assertEquals(qx.bom.element.Dimension.getWidth(mockElement1), qx.bom.element.Dimension.getWidth(mockElement2));
      this.assertEquals(qx.bom.element.Dimension.getHeight(mockElement1), qx.bom.element.Dimension.getHeight(mockElement2));
    }
  }
});