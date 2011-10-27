/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * Util class for widgets window.
 */
qx.Class.define("inspector.widgets.Util",
{
  statics :
  {
    getIconPath: function (element) {
      switch (element) {
        case "qx.ui.basic.Image":
          return "inspector/images/components/image.png";

        case "qx.ui.basic.Label":
          return "inspector/images/components/label.png";

        case "qx.ui.basic.Atom":
          return "inspector/images/components/atom.png";

        case "qx.ui.tree.Tree":
        case "qx.ui.treevirtual.TreeVirtual":
          return "inspector/images/components/tree.png";

        case "qx.ui.menu.Menu":
          return "inspector/images/components/menu.png";

        case "qx.ui.form.Button":
        case "qx.ui.menu.Button":
        case "qx.ui.menubar.Button":
        case "qx.ui.pageview.buttonview.Button":
        case "qx.ui.pageview.radioview.Button":
        case "qx.ui.pageview.tabview.Button":
        case "qx.ui.toolbar.Button":
          return "inspector/images/components/button.png";

        case "qx.ui.layout.CanvasLayout":
        case "qx.ui.layout.DockLayout":
        case "qx.ui.layout.FlowLayout":
        case "qx.ui.layout.GridLayout":
        case "qx.ui.menu.Layout":
          return "inspector/images/components/layout.png";

        case "qx.ui.layout.VBox":
          return "inspector/images/components/verticallayout.png";

        case "qx.ui.layout.HBox":
          return "inspector/images/components/horizontallayout.png";

        case "qx.ui.toolbar.ToolBar":
        case "qx.ui.menubar.MenuBar":
          return "inspector/images/components/toolbar.png";

        case "qx.ui.window.Window":
          return "inspector/images/components/window.png";

        case "qx.ui.groupbox.Groupbox":
        case "qx.ui.groupbox.CheckGroupBox":
        case "qx.ui.groupbox.RadioGroupBox":
          return "inspector/images/components/groupbox.png";

        case "qx.ui.form.Spinner":
          return "inspector/images/components/spinner.png";

        case "qx.ui.form.ComboBox":
          return "inspector/images/components/combobox.png";

        case "qx.ui.form.TextField":
          return "inspector/images/components/textfield.png";

        case "qx.ui.form.TextArea":
          return "inspector/images/components/textarea.png";

        case "qx.ui.splitpane.SplitPane":
          return "inspector/images/components/splitpane.png";

        case "qx.ui.table.Table":
          return "inspector/images/components/table.png";

        case "qx.ui.form.CheckBox":
          return "inspector/images/components/checkbox.png";

        case "qx.ui.form.RadioButton":
          return "inspector/images/components/radiobutton.png";

        default:
          return null;
      }
    }
  }
});