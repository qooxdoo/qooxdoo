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
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/**
 * The Application's header
 */

qx.Class.define("feedreader.view.Header",
{
  extend : qx.ui.container.Composite,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.setLayout(new qx.ui.layout.HBox);
    this.setAppearance("app-header");

    var title = new qx.ui.basic.Label("Feed Reader");
    var version = new qx.ui.basic.Label("qooxdoo " + qx.core.Setting.get("qx.version"));

    this.add(title);
    this.add(new qx.ui.core.Spacer, {flex : 1});
    this.add(version);

  }
});