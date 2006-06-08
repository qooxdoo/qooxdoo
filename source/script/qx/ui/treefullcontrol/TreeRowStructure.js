/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2006 by Derrell Lipman
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Derrell Lipman

************************************************************************ */

/* ************************************************************************

#package(tree)
#use(qx.ui.embed.HtmlEmbed)
#use(qx.ui.basic.Image)
#use(qx.ui.basic.Label)

************************************************************************ */

/**
 * @brief
 * The structure of a tree row.
 *
 * The structure of a tree row is provided by a
 * qx.ui.treefullcontrol.TreeRowStructure.  The order of elements added to
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
 * Any other object which is valid within a qx.ui.layout.HorizontalBoxLayout
 * may be added to the structure using addObject().  If the object has no
 * special treatment, it may be made anonymous with obj.SetAnonymous(true).
 * Otherwise, all handling for the object should be done by the application.
 *
 * A "standard" (traditional) tree row would be generated like this:
 *
 *   treeRowStructure = new qx.ui.treefullcontrol.TreeRowStructure();
 * //treeRowStructure.addIndent()  // defaults to here; no need to call
 *   treeRowStructure.addIcon();
 *   treeRowStructure.addLabel("Trash");
 *
 * An example of a more sophisticated structure:
 *
 *   treeRowStructure = new qx.ui.treefullcontrol.TreeRowStructure();
 *
 *   // A left-justified icon
 *   obj = new qx.ui.basic.Image("icons/16/alarm.png");
 *   treeRowStructure.addObject(obj, true);
 *
 *   // Here's our indentation and tree-lines
 *   treeRowStructure.addIndent();
 *
 *   // The standard tree icon follows
 *   treeRowStructure.addIcon("icons/16/desktop.png","icons/16/dictionary.png");
 *
 *   // Right after the tree icon is a checkbox
 *   obj = new qx.ui.form.CheckBox(null, 23, null, false);
 *   obj.setPadding(0, 0);
 *   treeRowStructure.addObject(obj, true);
 *
 *   // The label
 *   treeRowStructure.addLabel("Trash");
 *
 *   // All else should be right justified
 *   obj = new qx.ui.basic.HorizontalSpacer;
 *   treeRowStructure.addObject(obj, true);
 *
 *   // Add a file size, date and mode
 *   obj = new qx.ui.basic.Label("23kb");
 *   obj.setWidth(50);
 *   treeRowStructure.addObject(obj, true);
 *   obj = new qx.ui.basic.Label("11 Sept 1959");
 *   obj.setWidth(150);
 *   treeRowStructure.addObject(obj, true);
 *   obj = new qx.ui.basic.Label("-rw-r--r--");
 *   obj.setWidth(80);
 *   treeRowStructure.addObject(obj, true);
 */

qx.OO.defineClass("qx.ui.treefullcontrol.TreeRowStructure", qx.core.Object,
function()
{
  /* Create the indent, icon, and label objects */
  this._indentObject = new qx.ui.embed.HtmlEmbed;
  this._iconObject = new qx.ui.basic.Image;
  this._labelObject = new qx.ui.basic.Label;

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
});

qx.Proto.addIndent = function()
{
  /* If the assumed indent object is in use... */
  if (! this._indentAdded)
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
};

qx.Proto.addIcon = function(vIcon, vIconSelected)
{
  /* Ensure only one standard icon is added */
  if (! this._iconAdded)
  {
    this._iconAdded = true;
  }
  else
  {
    throw new Error("Icon object added more than once.");
  }

  /* Track the two icon names */
  this._icons.unselected = vIcon;
  this._icons.selected = vIconSelected;

  /* Add the icon to the structure */
  this._fields.push(this._iconObject);
};

qx.Proto.addLabel = function(vLabel)
{
  /* Ensure only one standard label is added */
  if (! this._labelAdded)
  {
    this._labelAdded = true;
  }
  else
  {
    throw new Error("Label added more than once.");
  }

  /* Track the label text */
  this._label = vLabel;

  /* Add the label to the structure */
  this._fields.push(this._labelObject);
};

/*
 * Add an object to the tree row structure.  For convenience, vAnonymous can
 * be provided, and if a boolean value is provided, vObj.setAnonymous() is
 * called with the provided value.  If the object has already been
 * setAnonymous or if there is no need to do so, then provide no value for
 * vAnonymous or pass 'null'.
 */
qx.Proto.addObject = function(vObj, vAnonymous)
{
  /* Is requested, set this object's anonymous state */
  if (typeof vAnonymous == "boolean")
  {
    vObj.setAnonymous(vAnonymous);
  }

  /* Add this user-specified object to the structure */
  this._fields.push(vObj);
};
