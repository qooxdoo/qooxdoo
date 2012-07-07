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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * @tag test
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.test.Style",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var elementStyle = 'font-size:12pt;text-align:center;font-family:"Trebuchet MS","Lucida Grande",Verdana,sans-serif;color:white;left:90px;top:90px;position:absolute;width:200px;height:55px;border:2px #E5E5E5 solid;background-color:#134275;z-Index:10;';
      var myElement = qx.dom.Element.create('div', { style : elementStyle });

      document.body.appendChild(myElement);

      myElement.id = "testDiv";
      myElement.innerHTML = 'Welcome to <br><b style="color:#F3FFB3;">qooxdoo</b> animations!';
    }
  }
});
