/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * The structure of a tree row.
 *
 * This is a singleton class.  The constructor is not accessed by users;
 * instead, to obtain the one and only TreeRowStructure object, call either
 *
 * <pre class='javascript'>qx.legacy.ui.tree.TreeRowStructure.getInstance().newRow()</pre>
 *
 * or
 *
 * <pre class='javascript'>qx.legacy.ui.tree.TreeRowStructure.getInstance().standard().</pre>
 *
 * The structure of a tree row is provided by a
 * qx.legacy.ui.tree.TreeRowStructure.  The order of elements added to
 * this object is the order in which they will be presented in a tree row.
 *
 * The three standard parts of a tree: the indentation (and its associated
 * tree-lines, if enabled), the icon (selected or unselected), and the label
 * are added to the structure in the desired order by calling, respectively,
 * the methods addIndent(), addIcon() and addLabel().
 *
 * By default, indentation will appear at the beginning of the tree row.  This
 * can be changed by calling the addIndent() method after having calling other
 * add*() methods on this object.  If indentation is to be at the beginning of
 * the tree row, simply do not call addIndent().
 *
 * Any other object which is valid within a qx.legacy.ui.layout.HorizontalBoxLayout
 * may be added to the structure using addObject().  If the object has no
 * special treatment, it may be made anonymous with obj.SetAnonymous(true).
 * Otherwise, all handling for the object should be done by the application.
 *
 * A "standard" (traditional) tree row would be generated like this:
 *
 * <pre class='javascript'>
 * treeRowStructure = qx.legacy.ui.tree.TreeRowStructure.getInstance().standard("Trash");
 * </pre>
 *
 * which equates to issuing these commands:
 *
 * <pre class='javascript'>
 * treeRowStructure = qx.legacy.ui.tree.TreeRowStructure.getInstance().newRow();
 *
 * //treeRowStructure.addIndent()  // defaults to here; no need to call
 * treeRowStructure.addIcon();
 * treeRowStructure.addLabel("Trash");
 * </pre>
 *
 * The former method is typically preferred.
 *
 * An example of a more sophisticated structure:
 *
 * <pre class='javascript'>
 * treeRowStructure = qx.legacy.ui.tree.TreeRowStructure.getInstance().newRow();
 *
 * // A left-justified icon
 * obj = new qx.legacy.ui.basic.Image("icon/16/apps/office-calendar.png");
 * treeRowStructure.addObject(obj, true);
 *
 * // Here's our indentation and tree-lines
 * treeRowStructure.addIndent();
 *
 * // The standard tree icon follows
 * treeRowStructure.addIcon("icon/16/places/user-desktop.png","icon/16/apps/accessories-dictionary.png");
 *
 * // Right after the tree icon is a checkbox
 * obj = new qx.legacy.ui.form.CheckBox(null, 23, null, false);
 * obj.setPadding(0, 0);
 * treeRowStructure.addObject(obj, true);
 *
 * // The label
 * treeRowStructure.addLabel("Trash");
 *
 * // All else should be right justified
 * obj = new qx.legacy.ui.basic.HorizontalSpacer;
 * treeRowStructure.addObject(obj, true);
 *
 * // Add a file size, date and mode
 * obj = new qx.legacy.ui.basic.Label("23kb");
 * obj.setWidth(50);
 * treeRowStructure.addObject(obj, true);
 * obj = new qx.legacy.ui.basic.Label("11 Sept 1959");
 * obj.setWidth(150);
 * treeRowStructure.addObject(obj, true);
 * obj = new qx.legacy.ui.basic.Label("-rw-r--r--");
 * obj.setWidth(80);
 * treeRowStructure.addObject(obj, true);
 * </pre>
 */
qx.Class.define("qx.legacy.ui.tree.TreeRowStructure",
{
  type : "singleton",
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments);
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Prepare to define a new row.
     *
     * This reinitializes the singleton TreeRowStructure so that it is ready to
     * define a new tree row.
     *
     * @return {var} The singleton itself, purely for convenience.
     */
    newRow : function()
    {

      /* Create the indent, icon, and label objects */

      this._indentObject = new qx.legacy.ui.embed.HtmlEmbed;
      this._iconObject = new qx.legacy.ui.basic.Image;
      this._labelObject = new qx.legacy.ui.basic.Label;

      /* Create an object to hold the ordering of row objects */

      this._fields = new Array;

      /* Create an object to hold the icon names */

      this._icons = new Object;

      /* Initially assume that indentation goes at the beginning of the row */

      this._fields.push(this._indentObject);

      /* Set initial flags */

      this._indentAdded = false;
      this._iconAdded = false;
      this._labelAdded = false;

      /* Return the singleton (from which we were called) */

      return this;
    },


    /**
     * Define a new row with the 'standard' structure.
     *
     * This reinitializes the singleton TreeRowStructure to the state of a
     * standard'or traditional tree row:
     *   - indentation
     *   - icon
     *   - label
     *
     * The icon parameters may be omitted in which case the defaults will be
     * used.  If the label parameter is omitted, no label will appear.
     *
     * @param vLabel {String} The label text
     * @param vIcon {String} Relative path to the 'non-selected' icon
     * @param vIconSelected {String} Relative path to the 'selected' icon
     * @return {var} The singleton itself, purely for convenience.
     */
    standard : function(vLabel, vIcon, vIconSelected)
    {
      this.newRow();
      this.addIcon(vIcon, vIconSelected);
      this.addLabel(vLabel);

      return this;
    },


    /**
     * TODOC
     *
     * @return {void}
     * @throws TODOC
     */
    addIndent : function()
    {

      /* If the assumed indent object is in use... */

      if (!this._indentAdded)
      {

        /* ... then remove it. */

        this._fields.shift();
        this._indentAdded = true;
      }
      else
      {
        throw new Error("Indent object added more than once.");
      }

      /* Add the indentation to the structure */

      this._fields.push(this._indentObject);
    },


    /**
     * TODOC
     *
     * @param vIcon {var} TODOC
     * @param vIconSelected {var} TODOC
     * @return {void}
     * @throws TODOC
     */
    addIcon : function(vIcon, vIconSelected)
    {
      /* Ensure only one standard icon is added */

      if (!this._iconAdded) {
        this._iconAdded = true;
      } else {
        throw new Error("Icon object added more than once.");
      }

      /* Track the two icon names */

      if (vIcon !== undefined) {
        this._icons.unselected = vIcon;
      }

      if (vIconSelected !== undefined) {
        this._icons.selected = vIconSelected;
      }

      /* Add the icon to the structure */

      this._fields.push(this._iconObject);
    },


    /**
     * TODOC
     *
     * @param vLabel {var} TODOC
     * @return {void}
     * @throws TODOC
     */
    addLabel : function(vLabel)
    {

      /* Ensure only one standard label is added */

      if (!this._labelAdded) {
        this._labelAdded = true;
      } else {
        throw new Error("Label added more than once.");
      }

      /* Track the label text */

      this._label = vLabel;

      /* Add the label to the structure */

      this._fields.push(this._labelObject);
    },


    /**
     * Add an object to the tree row structure.  For convenience, vAnonymous can
     * be provided, and if a boolean value is provided, vObj.setAnonymous() {@link qx.legacy.ui.core.Widget#anonymous} is
     * called with the provided value.  If the object has already been
     * setAnonymous or if there is no need to do so, then provide no value for
     * vAnonymous or pass 'null'.
     *
     * @param vObj {qx.legacy.ui.core.Widget} Widget to add
     * @param vAnonymous {Boolean} Whether the widget should be set to be anonymous
     */
    addObject : function(vObj, vAnonymous)
    {

      /* Is requested, set this object's anonymous state */

      if (typeof vAnonymous == "boolean") {
        vObj.setAnonymous(vAnonymous);
      }

      /* Add this user-specified object to the structure */

      this._fields.push(vObj);
    },


    getLabelObject : function() {
      return this._labelObject;
    },

    getIconObject : function() {
      return this._iconObject;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeFields("_icons");
    this._disposeObjects('_indentObject', '_iconObject', '_labelObject');
    this._disposeArray("_fields");
  }
});
