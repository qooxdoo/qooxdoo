/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)

************************************************************************ */
qx.Class.define("qx.test.bom.Location",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    __bodyStyles : null,
    __marginTop : null,
    __marginLeft : null,
    __left : null,
    __top : null,
    __position : null,
    __border : null,
    __padding : null,


    setUp : function()
    {
      this.__bodyStyles = document.body.style;
      this.__marginTop = this.__bodyStyles.marginTop;
      this.__marginLeft = this.__bodyStyles.marginLeft;
      this.__left = this.__bodyStyles.left;
      this.__top = this.__bodyStyles.top;
      this.__position = this.__bodyStyles.position;
      this.__border = this.__bodyStyles.border;
      this.__padding = this.__bodyStyles.padding;

      // set up the defaults
      this.__bodyStyles.marginLeft = "0px";
      this.__bodyStyles.marginTop = "0px";
      this.__bodyStyles.left = "0px";
      this.__bodyStyles.top = "0px";
      this.__bodyStyles.position = "static";
      this.__bodyStyles.padding = "0px";
    },

    tearDown : function()
    {
      this.__bodyStyles.marginTop = this.__marginTop;
      this.__bodyStyles.marginLeft = this.__marginLeft;
      this.__bodyStyles.top = this.__top;
      this.__bodyStyles.left = this.__left;
      this.__bodyStyles.position = this.__position;
      this.__bodyStyles.border = this.__border;
      this.__bodyStyles.padding = this.__padding;

      document.body.innerHTML = "";
    },

    testBodyLocationDefault : function()
    {
      // check the defaults
      var pos = qx.bom.element.Location.get(document.body);
      this.assertEquals(0, pos.left);
      this.assertEquals(0, pos.top);
    },

    testBodyLocationMargins : function()
    {
      // set the defaults
      this.__bodyStyles.marginLeft = "10px";
      this.__bodyStyles.marginTop = "20px";

      var pos = qx.bom.element.Location.get(document.body);
      this.assertEquals(10, pos.left);
      this.assertEquals(20, pos.top);
    },

    testBodyLocationBorder : function()
    {
      this.__bodyStyles.border = "5px solid black";

      var pos = qx.bom.element.Location.get(document.body);
      this.assertEquals(0, pos.left);
      this.assertEquals(0, pos.top);
    },

    testBodyLocationPadding : function()
    {
      this.__bodyStyles.padding = "5px";

      var pos = qx.bom.element.Location.get(document.body);
      this.assertEquals(0, pos.left);
      this.assertEquals(0, pos.top);
    },

    testBodyLocationMode : function()
    {
      this.__bodyStyles.marginLeft = "10px";
      this.__bodyStyles.marginTop = "20px";
      this.__bodyStyles.border = "5px solid black";
      this.__bodyStyles.padding = "30px";

      var pos = qx.bom.element.Location.get(document.body, "margin");
      this.assertEquals(0, pos.left);
      this.assertEquals(0, pos.top);

      var pos = qx.bom.element.Location.get(document.body, "box");
      this.assertEquals(10, pos.left);
      this.assertEquals(20, pos.top);

      var pos = qx.bom.element.Location.get(document.body, "border");
      this.assertEquals(15, pos.left);
      this.assertEquals(25, pos.top);

      var pos = qx.bom.element.Location.get(document.body, "scroll");
      this.assertEquals(15, pos.left);
      this.assertEquals(25, pos.top);

      var pos = qx.bom.element.Location.get(document.body, "padding");
      this.assertEquals(45, pos.left);
      this.assertEquals(55, pos.top);
    },


    testDivStatic : function()
    {
      document.body.innerHTML =
        '<div id="div1" style=" position: static; margin: 5px; border: 2px solid #000; padding: 3px; width: 200px; height: 200px;">' +
          '<div id="div2" style="position: static; margin: 5px; border: 2px solid #000; padding: 3px; width: 150px; height: 150px;">' +
            '<div id="div3" style="position: static; margin: 5px; border: 2px solid #000; padding: 3px; width: 100px; height: 100px;"></div>' +
          '</div>' +
        '</div>';

      var div1 = document.getElementById("div1");
      var pos = qx.bom.element.Location.get(div1);
      this.assertEquals(5, pos.left, "left1");
      this.assertEquals(5, pos.top, "top1");

      var div2 = document.getElementById("div2");
      var pos = qx.bom.element.Location.get(div2);
      this.assertEquals(5 + 2 + 3 + 5, pos.left, "left2");

      var badIE = qx.core.Environment.get("engine.name") == "mshtml" &&
        (parseFloat(qx.core.Environment.get("engine.version")) < 8 ||
         qx.core.Environment.get("browser.quirksmode") ||
         qx.core.Environment.get("browser.documentmode") === 7);

      if (badIE) {
        this.assertEquals(12, pos.top, "top2 (IE)");
      } else {
        this.assertEquals(5 + 2 + 3 + 5, pos.top, "top2");
      }


      var div3 = document.getElementById("div3");
      var pos = qx.bom.element.Location.get(div3);
      this.assertEquals(15 + 5 + 2 + 3, pos.left, "left3");
      if (badIE) {
        this.assertEquals(19, pos.top, "top3 (IE)");
      } else {
        this.assertEquals(15 + 5 + 2 + 3, pos.top, "top3");
      }
    },


    testDivRelative : function()
    {
      document.body.innerHTML =
      '<div id="div1" style="position: relative; top: 5px; left: 5px; margin: 5px; border: 2px solid #000; padding: 3px; width: 200px; height: 200px;">' +
        '<div id="div2" style="position: relative; top: 5px; left: 5px; margin: 5px; border: 2px solid #000; padding: 3px; width: 150px; height: 150px;">' +
          '<div id="div3" style="position: relative; top: -5px; left: -5px; margin: 5px; border: 2px solid #000; padding: 3px; width: 100px; height: 100px;"></div>' +
        '</div>' +
      '</div>';

      var div1 = document.getElementById("div1");
      var pos = qx.bom.element.Location.get(div1);
      this.assertEquals(10, pos.left);
      this.assertEquals(10, pos.top);

      var div2 = document.getElementById("div2");
      var pos = qx.bom.element.Location.get(div2);
      this.assertEquals(10 + 5 + 2 + 3 + 5, pos.left, "left2");

      var badIE = qx.core.Environment.get("engine.name") == "mshtml" &&
        (parseFloat(qx.core.Environment.get("engine.version")) < 8 ||
         qx.core.Environment.get("browser.quirksmode") ||
         qx.core.Environment.get("browser.documentmode") === 7);

      if (badIE) {
        this.assertEquals(10 + 5 + 2 + 5, pos.top, "top2 (IE)");
      } else  {
        this.assertEquals(10 + 5 + 2 + 3 + 5, pos.top, "top2");
      }

      var div3 = document.getElementById("div3");
      var pos = qx.bom.element.Location.get(div3);
      this.assertEquals(25 - 5 + 5 + 2 + 3, pos.left, "left3");
      if (badIE) {
        this.assertEquals(24, pos.top, "top3 (IE)");
      } else {
        this.assertEquals(25 - 5 + 5 + 2 + 3, pos.top, "top3");
      }
    },


    testDivAbsolute : function()
    {
      document.body.innerHTML =
      '<div id="div1" style="position: absolute; top: 200px; left: 10px; margin: 5px; border: 2px solid #000; padding: 3px; width: 200px; height: 200px;">' +
        '<div id="div2" style="position: absolute; top: -100px; left: -10px; margin: 5px; border: 2px solid #000; padding: 3px; width: 150px; height: 150px;">' +
          '<div id="div3" style="position: absolute; top: 100px; left: 10px; margin: 5px; border: 2px solid #000; padding: 3px; width: 100px; height: 100px;"></div>' +
        '</div>' +
      '</div>';

      var div1 = document.getElementById("div1");
      var pos = qx.bom.element.Location.get(div1);
      this.assertEquals(10 + 5, pos.left);
      this.assertEquals(200 + 5, pos.top);

      var div2 = document.getElementById("div2");
      var pos = qx.bom.element.Location.get(div2);
      this.assertEquals(15 - 10 + 2 + 5, pos.left);
      this.assertEquals(205 - 100 + 2 + 5, pos.top);

      var div3 = document.getElementById("div3");
      var pos = qx.bom.element.Location.get(div3);
      this.assertEquals(12 + 10 + 5 + 2, pos.left);
      this.assertEquals(112 + 100 + 5 + 2, pos.top);
    },


    testDivMixedPositions : function()
    {
      document.body.innerHTML =
      '<div id="absolute1" style="position: absolute; top: 300px; left: 400px; margin: 5px; border: 2px solid #000; padding: 3px; width: 100px; height: 100px;">' +
      ' <div id="relative1" style="position: relative; top: 50px; left: 50px; margin: 5px; border: 2px solid #000; padding: 3px; width: 300px; height: 300px;">' +
      '   <div id="static1" style="overflow: hidden; position: static; margin: 5px; border: 2px solid #000; padding: 3px; width: 250px; height: 250px;">' +
      '     <div id="relative2" style="overflow: auto; position: relative; top: 10px; left: 10px; margin: 5px; border: 2px solid #000; padding: 3px; width: 200px; height: 200px;">' +
      '       <div id="absolute2" style="position: absolute; top: 30px; left: -90px; margin: 5px; border: 2px solid #000; padding: 3px; width: 200px; height: 200px;">' +
      '         <div id="static2" style="position: static; margin: 10px; border: 2px solid #000; padding: 3px; width: 250px; height: 250px;">' +
      '         </div>' +
      '       </div>' +
      '     </div>' +
      '   </div>' +
      '  </div>' +
      '</div>';

      var absolute1 = document.getElementById("absolute1");
      var pos = qx.bom.element.Location.get(absolute1);
      this.assertEquals(400 + 5, pos.left);
      this.assertEquals(300 + 5, pos.top);

      var relative1 = document.getElementById("relative1");
      var pos = qx.bom.element.Location.get(relative1);
      this.assertEquals(405 + 2 + 3 + 50 + 5, pos.left);

      var badIE = qx.core.Environment.get("engine.name") == "mshtml" &&
        (parseFloat(qx.core.Environment.get("engine.version")) < 8 ||
         qx.core.Environment.get("browser.quirksmode") ||
         qx.core.Environment.get("browser.documentmode") === 7);

      if (badIE) {
        this.assertEquals(362, pos.top, "top2 (IE)");
      } else {
        this.assertEquals(305 + 2 + 3 + 50 + 5, pos.top, "top2");
      }

      var static1 = document.getElementById("static1");
      var pos = qx.bom.element.Location.get(static1);
      this.assertEquals(465 + 2 + 3 + 5, pos.left);
      if (badIE) {
        this.assertEquals(369, pos.top, "top3 (IE)");
      } else {
        this.assertEquals(365 + 2 + 3 + 5, pos.top, "top3");
      }

      var relative2 = document.getElementById("relative2");
      var pos = qx.bom.element.Location.get(relative2);
      this.assertEquals(475 + 2 + 3 + 10 + 5, pos.left);
      if (badIE) {
        this.assertEquals(386, pos.top, "top4 (IE)");
      } else {
        this.assertEquals(375 + 2 + 3 + 10 + 5, pos.top, "top4");
      }

      var absolute2 = document.getElementById("absolute2");
      var pos = qx.bom.element.Location.get(absolute2);
      this.assertEquals(495 + 2 - 90 + 5, pos.left);
      if (badIE) {
        this.assertEquals(423, pos.top, "top4 (IE)");
      } else {
        this.assertEquals(395 + 2 + 30 + 5, pos.top, "top4");
      }

      var static2 = document.getElementById("static2");
      var pos = qx.bom.element.Location.get(static2);
      this.assertEquals(412 + 3 + 2 + 10, pos.left);
      if (badIE) {
        this.assertEquals(435, pos.top, "top5 (IE)");
      } else {
        this.assertEquals(432 + 3 + 2 + 10, pos.top, "top5");
      }
    },


    testDivWithBodyMargin : function()
    {
      this.__bodyStyles.marginLeft = "10px";
      this.__bodyStyles.marginTop = "20px";

      document.body.innerHTML = '<div id="div">affe</div>';

      var div = document.getElementById("div");
      var pos = qx.bom.element.Location.get(div);
      this.assertEquals(10, pos.left);
      this.assertEquals(20, pos.top);
    },


    testDivWithBodyPadding : function()
    {
      this.__bodyStyles.padding = "10px";
      document.body.innerHTML = '<div id="div"></div>';

      var div = document.getElementById("div");
      var pos = qx.bom.element.Location.get(div);

      this.assertEquals(10, pos.left);
      this.assertEquals(10, pos.top);
    },


    testDivWithBodyBorder : function()
    {
      this.__bodyStyles.border = "10px solid black";
      document.body.innerHTML = '<div id="div">juhu</div>';

      var div = document.getElementById("div");
      var pos = qx.bom.element.Location.get(div);

      // IE quirks mode puts the border outside of the body
      if (qx.core.Environment.get("engine.name") == "mshtml" &&
        qx.core.Environment.get("browser.quirksmode"))
      {
        this.assertEquals(0, pos.left);
        this.assertEquals(0, pos.top);
      }
      else
      {
        this.assertEquals(10, pos.left);
        this.assertEquals(10, pos.top);
      }
    },


    testDivLocationMode : function()
    {
      document.body.innerHTML = '<div id="div" style="margin: 5px; padding: 10px; border: 3px solid green;"></div>';

      var div = document.getElementById("div");
      var pos = qx.bom.element.Location.get(div, "margin");
      this.assertEquals(0, pos.left);
      this.assertEquals(0, pos.top);

      var pos = qx.bom.element.Location.get(div, "box");
      this.assertEquals(5, pos.left);
      this.assertEquals(5, pos.top);

      var pos = qx.bom.element.Location.get(div, "border");
      this.assertEquals(8, pos.left);
      this.assertEquals(8, pos.top);

      var pos = qx.bom.element.Location.get(div, "scroll");
      this.assertEquals(8, pos.left);
      this.assertEquals(8, pos.top);

      var pos = qx.bom.element.Location.get(div, "padding");
      this.assertEquals(18, pos.left);
      this.assertEquals(18, pos.top);
    },


    testDivInline : function()
    {
      document.body.innerHTML =
      '<div style="width:100px">' +
       '<span id="span1" style="margin-left: 10px"><img src="about:blank" width="10px" height="10px" style="border: 0px"></img></span>' +
       '<span id="span2" style="margin-left: 10px">a</span>' +
       '</div>';

      var span1 = document.getElementById("span1");
      var pos = qx.bom.element.Location.get(span1);
      this.assertEquals(10, pos.left);

      var span2 = document.getElementById("span2");
      var pos = qx.bom.element.Location.get(span2);
      this.assertEquals(30, pos.left);
    },


    testDivFixed : function()
    {
      if (qx.core.Environment.get("browser.name") === "ie" &&
          parseInt(qx.core.Environment.get("browser.version"), 10) < 7)
      {
        this.skip("position: fixed not supported in IE 6");
      }
      document.body.innerHTML =
      '<div style="position: absolute; left: 0px; top: 0px; width: 20px; height: 1000px;"></div>' +
      '<div id="test" style="position: fixed; width: 300px; height: 600px; top: 50px;"></div>';
      window.scrollTo(0,100);
      var pos = qx.bom.element.Location.get(document.getElementById("test"));
      this.assertEquals(150, pos.top);
    }
  }
});
