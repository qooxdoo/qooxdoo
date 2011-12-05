/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/* ************************************************************************
#asset(qx/icon/Tango/16/actions/help-contents.png)
************************************************************************ */

/**
 * Displays instructions for the Feature Config Editor
 */

qx.Class.define("fce.view.HelpWindow", {

  extend : qx.ui.window.Window,

  construct : function()
  {
    this.base(arguments, "Help", "icon/16/actions/help-contents.png");
    this.setWidth(500);
    this.setHeight(450);

    this.setLayout(new qx.ui.layout.Canvas());

    this._addContent();
  },

  members : {

    /**
     * Adds a scroll container with the content
     */
    _addContent : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
      container.setPadding(5);
      var scroll = new qx.ui.container.Scroll(container);
      this.add(scroll, {edge: 0});
      var h1 = new qx.ui.basic.Label("Overview");
      h1.setFont("bigger");
      container.add(h1);

      var linkStyle = "display: inline; color: blue;";

      var qxVer = qx.core.Environment.get("qx.version");
      var manualLink = "http://manual.qooxdoo.org/" + qxVer
        + "/pages/application/featureconfigeditor.html#browser-specific-builds";
      var p1 = new qx.ui.basic.Label("The purpose of this application is to help"
        + " developers create configurations for <a href=\"" + manualLink + "\" "
        + "target=\"_blank\" style=\"" + linkStyle + "\">browser-specific builds</a>."
        + " Multiple sets of client features can be compared to find common values.");
      p1.setRich(true);
      container.add(p1);

      var h2 = new qx.ui.basic.Label("View Components");
      h2.setFont("bigger");
      container.add(h2);

      var p2 = new qx.ui.basic.Label("The <strong>Available Features</strong> "
        + "table initially displays all keys defined in <a style=\"" + linkStyle + "\""
        + "href=\"http://demo.qooxdoo.org/" + qxVer + "/apiviewer/#qx.core.Environment\""
        + "target=\"_blank\">qx.core.Environment</a> with the values detected for "
        + "the currently used client.<br/>"
        + "Additional feature sets, e.g. from different browsers, can be added "
        + "to the table using the <strong>Import Feature Map</strong> button.");
      p2.setRich(true);
      container.add(p2);

      var p3 = new qx.ui.basic.Label("Individual key/value pairs can be added to "
        + "the <strong>Selected Features</strong> list by double-clicking, "
        + "clicking and dragging or by selecting them and using the &quot;right "
        + "arrow&quot; button.");
      p3.setRich(true);
      container.add(p3);

      var p4 = new qx.ui.basic.Label("The <strong>Selected Features</strong> list"
        + " displays the selected environment settings and allows editing of their "
        + "values. Entries can be removed by selecting them and then either pressing "
        + "the &quot;Del&quot; key or clicking the &quot;left arrow&quot; button.");
      p4.setRich(true);
      container.add(p4);

      var p5 = new qx.ui.basic.Label("The <strong>JSON</strong> box displays a "
        + "serialization of the currently selected configuration. This map can "
        + "be used as the value of an &quot;environment&quot; configuration key.");
      p5.setRich(true);
      container.add(p5);
    }
  }
});