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
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#use(qx.event.handler.Input)

************************************************************************ */

/**
 * Native mouse events
 */
qx.Class.define("demobrowser.demo.event.EventDemo",
{
  extend : qx.application.Native,

  members :
  {
    main : function()
    {
      this.base(arguments);

      var btnClear = document.getElementById("btnClear");

      if (btnClear)
      {
        qx.bom.Element.addListener(
          btnClear,
          "click",
          this._clearLog,
          this
        );
      }
    },


    _initLogger : function(columns, el, maxLogSize)
    {
      this.__tableHead = "<table><tr><th>" + columns.join("</th><th>") + "</th></tr>";
      this.__maxLogSize = maxLogSize || 50;
      this.__logDiv = el;

      this._clearLog();
    },


    _clearLog : function()
    {
      this.__logDiv.innerHTML = this.__tableHead + "</table>";
      this.__logs = [];
    },


    _log : function(values)
    {
      this.__logs.unshift(values);
      this.__logs = this.__logs.slice(0, this.__maxLogSize);

      str = [this.__tableHead];
      for (var i=0; i<this.__logs.length; i++) {
        str.push("<tr><td>", this.__logs[i].join("</td><td>"), "</td></tr>");
      }

      str.push("</table>");
      this.__logDiv.innerHTML = str.join("");
      this.__logDiv.scrollTop = 0;
    }

  }
});
