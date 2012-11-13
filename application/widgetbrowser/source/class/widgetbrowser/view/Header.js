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
     * Tristan Koch (tristankoch)

************************************************************************ */
/* ************************************************************************
#use(qx.theme.Indigo);
#use(qx.theme.Simple);
#use(qx.theme.Classic);
#use(qx.theme.Modern)
************************************************************************ */

/**
 * The Application's header
 */

qx.Class.define("widgetbrowser.view.Header",
{
  extend : qx.ui.container.Composite,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @lint ignoreUndefined(qxc)
   */
  construct : function()
  {
    this.base(arguments);

    this.setLayout(new qx.ui.layout.HBox);
    this.setAppearance("app-header");
    this.getLayout().setAlignY("middle");

    var title = new qx.ui.basic.Label("Widget Browser");
    var version = new qxc.ui.versionlabel.VersionLabel();
    version.setFont("default");
    version.setAppearance("app-header-label");

    // Build select-box
    var select = new qx.ui.form.SelectBox("Theme");
    qx.core.Init.getApplication().getThemes().forEach(function(theme) {
      var name = Object.keys(theme)[0];
      var item = new qx.ui.form.ListItem(name + " Theme");
      item.setUserData("value", theme[name]);
      select.add(item);

      var value = theme[name];
      if (value == qx.core.Environment.get("qx.theme")) {
        select.setSelection( [item] );
      }
    });

    select.setFont("default");

    // Find current theme from URL search param
    var currentThemeItem = select.getSelectables().filter(function(item) {
      if (window.location.search) {
        return window.location.search.match(item.getUserData("value"));
      }
    })[0];

    select.setTextColor("black");

    select.addListener("changeSelection", function(evt) {
      var selected = evt.getData()[0].getUserData("value");

      var theme = qx.Theme.getByName(selected);
      if (theme) {
        qx.theme.manager.Meta.getInstance().setTheme(theme);
      } else {
        var part = selected.substr(selected.lastIndexOf(".") + 1, selected.length);
        part = part.toLowerCase();

        // change the text of the selected list item to 'Loading...'
        select.setEnabled(false);
        var listItem = evt.getData()[0];
        var oldText = listItem.getLabel();
        listItem.setLabel("Loading ...");
        qx.Part.require(part, function() {
          qx.theme.manager.Meta.getInstance().setTheme(
            qx.Theme.getByName(selected)
          );
          select.setEnabled(true);
          listItem.setLabel(oldText);
        }, this);
      }
    });

    // Set current theme
    if (currentThemeItem) {
      select.setSelection([currentThemeItem]);
    }

    // Finally assemble header
    this.add(title);
    this.add(new qx.ui.core.Spacer, {flex : 1});
    this.add(select);
    this.add(new qx.ui.core.Spacer, {width: "2%"});
    this.add(version);

  }
});