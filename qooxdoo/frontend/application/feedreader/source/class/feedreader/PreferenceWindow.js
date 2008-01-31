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
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#embed(qx.icontheme/16/actions/dialog-ok.png)
#embed(qx.icontheme/16/actions/dialog-cancel.png)

************************************************************************ */

qx.Class.define("feedreader.PreferenceWindow",
{
  extend : qx.ui.window.Window,

  construct : function()
  {
    this.base(arguments, this.tr("Preferences"), "icon/16/apps/preferences.png");

    this.set(
    {
      modal         : true,
      showMinimize  : false,
      showMaximize  : false,
      allowMaximize : false
    });

    this.addToDocument();

    this._addContent();
  },

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _addContent : function()
    {
      var winLayout = new qx.ui.layout.VerticalBoxLayout();

      winLayout.set(
      {
        width   : "100%",
        height  : "auto",
        spacing : 5,
        padding : 5
      });

      this.add(winLayout);

      var gb = new qx.ui.groupbox.GroupBox(this.tr("Theme"));

      gb.set(
      {
        height : "auto",
        width  : "100%"
      });

      winLayout.add(gb);

      var vb = new qx.ui.layout.VerticalBoxLayout();
      gb.add(vb);

      var btn_classic = new qx.ui.form.RadioButton("Classic");
      var btn_ext = new qx.ui.form.RadioButton("Ext");
      btn_ext.setChecked(true);
      var rm = new qx.ui.selection.RadioManager();
      rm.add(btn_classic, btn_ext);
      vb.add(btn_classic, btn_ext);

      var hb = new qx.ui.layout.HorizontalBoxLayout();

      hb.set(
      {
        width                   : "100%",
        horizontalChildrenAlign : "right",
        spacing                 : 5,
        paddingRight            : 3
      });

      var btn_cancel = new qx.ui.form.Button(this.tr("Cancel"));
      btn_cancel.addEventListener("execute", this.close, this);
      var btn_ok = new qx.ui.form.Button(this.tr("OK"));

      btn_ok.addEventListener("execute", function()
      {
        if (btn_ext.getChecked()) {
          qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Ext);
        } else {
          qx.theme.manager.Meta.getInstance().setTheme(qx.theme.ClassicRoyale);
        }

        this.close();
      },
      this);

      hb.add(btn_cancel);
      hb.add(btn_ok);

      winLayout.add(hb);

      this._prefWindow = this;
      this.addEventListener("appear", this.centerToBrowser, this);
    }
  }
});
