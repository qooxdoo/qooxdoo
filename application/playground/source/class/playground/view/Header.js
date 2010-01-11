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

************************************************************************ */
/**
 * Application header widget.
 */
qx.Class.define("playground.view.Header", 
{
  extend : qx.ui.container.Composite,

  construct : function()
  {
    this.base(arguments, new qx.ui.layout.HBox());
    this.setAppearance("app-header");
    
    var versionTag = this.tr("qooxdoo %1", qx.core.Setting.get("qx.version"));
    
    this.add(new qx.ui.basic.Label(this.tr("Playground")));
    this.add(new qx.ui.core.Spacer, { flex : 1 });
    this.add(new qx.ui.basic.Label(versionTag));    
  }
});