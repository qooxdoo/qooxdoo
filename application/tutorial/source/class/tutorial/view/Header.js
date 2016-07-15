/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

/**
 * The Application's header
 */
qx.Class.define("tutorial.view.Header",
{
  extend : qx.ui.container.Composite,

  events : {
    "selectTutorial" : "qx.event.type.Event"
  },

  /**
   * @ignore(qxc)
   */
  construct : function()
  {
    this.base(arguments);

    this.setLayout(new qx.ui.layout.Canvas());
    this.setAppearance("app-header");

    var title = new qx.ui.basic.Label("Live Tutorial");
    var select = new qx.ui.form.Button("Select Tutorial");
    select.setToolTipText("Choose another tutorial");
    select.setFont("default");
    select.setTextColor("black");
    select.addListener("execute", function() {
      this.fireEvent("selectTutorial");
    }, this);
    var version = new qxc.ui.versionlabel.VersionLabel();
    version.setFont("default");

    this.add(title, {left: 10, top: 5});
    this.add(select, {left: "40%", right: "40%"});
    this.add(version, {right: 10, top: 3});
  }
});
