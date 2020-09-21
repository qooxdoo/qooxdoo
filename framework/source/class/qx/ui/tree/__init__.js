/**
  * The tree package contains classes that allow you to build up visual
  * trees, like the ones you are familiar with e.g. for browsing your file
  * system. Expanding
  * and collapsing tree nodes is handled automatically by showing or hiding the
  * contained subtree structure.
  *
  * To construct a tree, start up with the {@link qx.ui.tree.Tree Tree} class,
  * then use {@link qx.ui.tree.TreeFolder TreeFolder} and {@link
  * qx.ui.tree.TreeFile TreeFile} objects to populate your tree.
  *
  * *Example*
  *
  * Here is a little example of how to use the widget.
  *
  * <pre class='javascript'>
  * // Create the tree widget
  * var tree = new qx.ui.tree.Tree().set({
  *   width : 200,
  *   height : 400
  * });
  *
  * // Create a folder and set it the root folder
  * var root = new qx.ui.tree.TreeFolder("root");
  * tree.setRoot(root);
  *
  * // Create some folders:
  * var te1_1 = new qx.ui.tree.TreeFolder("Files");
  * var te1_2 = new qx.ui.tree.TreeFolder("Workspace");
  * var te1_3 = new qx.ui.tree.TreeFolder("Network");
  * var te1_4 = new qx.ui.tree.TreeFolder("Trash");
  *
  * // Create some content (leaves) and add it to the "Files" folder:
  * var te1_2_1 = new qx.ui.tree.TreeFile("Windows (C:)");
  * var te1_2_2 = new qx.ui.tree.TreeFile("Documents (D:)");
  * te1_2.add(te1_2_1, te1_2_2);
  *
  * // Add the content to the root folder
  * root.add(te1_1, te1_2, te1_3, te1_4);
  *
  * // Add the root widget to the application
  * this.getRoot().add(tree);
  * </pre>
  *
  * This example creates a tree with four folders inside it's root folder.
  *
  * *External Documentation*
  *
  * <a href='http://qooxdoo.org/docs/#desktop/widget/tree.md' target='_blank'>
  * Documentation of this widget in the qooxdoo manual.</a>
  */
