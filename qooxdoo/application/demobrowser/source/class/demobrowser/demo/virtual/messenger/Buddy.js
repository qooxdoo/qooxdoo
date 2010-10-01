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
   * Fabian Jakobs (fjakobs)
   * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/*************************************************************************
#asset(demobrowser/demo/icons/imicons/*)
************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.messenger.Buddy",
{
  extend : qx.ui.core.Widget,

  construct : function()
  {
    this.base(arguments);

    this.set({
      padding : [0, 3]
    });

    this._setLayout(new qx.ui.layout.HBox(3).set({
      alignY : "middle"
    }));
    this.icon = new qx.ui.basic.Image().set({
      width : 26,
      height : 26,
      scale : true
    })
    this.label = new qx.ui.basic.Label().set({
      allowGrowX : true
    });
    this.statusIcon = new qx.ui.basic.Image;
    this._add(this.statusIcon);
    this._add(this.label, {flex : 1});
    this._add(this.icon);
  }
});
