/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Sebastian Werner, http://sebastian-werner.net

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

qx.Class.define("demobrowser.demo.bom.Selector",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // List by Slickspeed - Selector performance test
      var list = 
      [
        "body",
        "div",
        "body div",
        "div p",
        "div > p",
        "div + p",
        "div ~ p",
        "div[class^=exa][class$=mple]",
        "div p a",
        "div, p, a",
        ".note",
        "div.example",
        "ul .tocline2",
        "div.example, div.note",
        "#title",
        "h1#title",
        "div #title",
        "ul.toc li.tocline2",
        "ul.toc > li.tocline2",
        "h1#title + div > p",
        "h1[id]:contains(Selectors)",
        "a[href][lang][class]",
        "div[class]",
        "div[class=example]",
        "div[class^=exa]",
        "div[class$=mple]",
        "div[class*=e]",
        "div[class|=dialog]",
        "div[class!=made_up]",
        "div[class~=example]",
        "div:not(.example)",
        "p:contains(selectors)",
        "p:nth-child(even)",
        "p:nth-child(2n)",
        "p:nth-child(odd)",
        "p:nth-child(2n+1)",
        "p:nth-child(n)",
        "p:only-child",
        "p:last-child",
        "p:first-child"
      ];

      var result;
      var Selector = qx.bom.Selector;
      for (var i=0, l=list.length; i<l; i++) 
      {
        result = Selector.query(list[i]);
        qx.log.Logger.debug("Selected " + result.length + " elems with \"" + list[i] + "\"");
      }
      
      // Use ElementCollection API
      qx.bom.Selector.query("div + p").setStyle("color", "red");
    }
  }
});
