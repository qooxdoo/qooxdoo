/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)
     * David Perez Carmona (david-perez)

************************************************************************ */

/* ************************************************************************

#require(qx.theme.Modern)
#require(qx.theme.Classic)
#require(qx.log.Logger)
#asset(qx/static/blank.gif)

************************************************************************ */

/**
 * A data cell renderer for the tree column of a simple tree
 */
qx.Class.define("qx.ui.treevirtual.SimpleTreeDataCellRenderer",
{
  extend : qx.ui.table.cellrenderer.Abstract,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.__am = qx.util.AliasManager.getInstance();
    this.__rm = qx.util.ResourceManager;
    this.__tm = qx.theme.manager.Appearance.getInstance();

    // Base URL used for indentation
    this.STATIC_URI =
      this.__rm.toUri(this.__am.resolve("static/"));

    // Get the image loader class.  The load() method is static.
    this.ImageLoader = qx.io2.ImageLoader;
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    MAIN_DIV_STYLE  :
      ';overflow:hidden;white-space:nowrap;border-right:1px solid #eeeeee;' +
      'padding-left:2px;padding-right:2px;cursor:default' +
      (qx.core.Variant.isSet("qx.client", "mshtml")
       ? ''
       : ';-moz-user-select:none;'),

    __icon : { },
    __initialized : false,
    __imagesPending : 0
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Set whether lines linking tree children shall be drawn on the tree.
     */
    useTreeLines :
    {
      check : "Boolean",
      init : true
    },

    /**
     * When true, exclude only the first-level tree lines, creating,
     * effectively, multiple unrelated root nodes.
     */
    excludeFirstLevelTreeLines :
    {
      check : "Boolean",
      init : false
    },

    /**
     * Set whether the open/close button should be displayed on a branch, even
     * if the branch has no children.
     */
    alwaysShowOpenCloseSymbol :
    {
      check : "Boolean",
      init : false
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    useTreeLines : function()
    {
      return this.getUseTreeLines();
    },

    // overridden
    _getCellStyle : function(cellInfo)
    {
      var node = cellInfo.value;

      // Return the style for the div for the cell.  If there's cell-specific
      // style information provided, append it.
      var html =
        this.base(arguments, cellInfo) +
        qx.ui.treevirtual.SimpleTreeDataCellRenderer.MAIN_DIV_STYLE +
        (node.cellStyle ? node.cellStyle + ";" : "");
      return html;
    },

    __addImage : function(urlAndToolTip)
    {
      var html = [];

      // Resolve the URI
      var source = this.__rm.toUri(this.__am.resolve(urlAndToolTip.url));

      // If we've been given positioning attributes, enclose image in a div
      if (urlAndToolTip.position)
      {
        html.push('<div style="position:absolute;');
        var pos = urlAndToolTip.position;
        var shiftRight = 0;
        var shiftDown = 0;

        if (pos.centerX)
        {
          var entry = qx.io2.ImageLoader.getSize(source);
          shiftRight = entry.width / 2;
        }

        if (pos.centerY)
        {
          var entry = qx.io2.ImageLoader.getSize(source);
          shiftDown = entry.height / 2;
        }

        if (pos.top !== undefined)
        {
          html.push('top:' + (pos.top + shiftDown) + 'px;');
        }

        if (pos.right !== undefined)
        {
          html.push('right:' + pos.right + 'px;');
        }

        if (pos.bottom !== undefined)
        {
          html.push('bottom:' + pos.bottom + 'px;');
        }

        if (pos.left !== undefined)
        {
          html.push('left:' + (pos.left + shiftRight) + 'px;');
        }

        if (pos.width !== undefined)
        {
          html.push('width:' + pos.width + 'px;');
        }

        if (pos.height !== undefined)
        {
          html.push('height:' + pos.height + 'px;');
        }

        html.push('">');
      }

      html.push('<img src="');

      if (qx.core.Variant.isSet("qx.client", "mshtml") &&
          /\.png$/i.test(urlAndToolTip.url))
      {
        html.push(
          this.STATIC_URI +
          "blank.gif" +
          '" style="filter:' +
          "progid:DXImageTransform.Microsoft.AlphaImageLoader(" +
          "  src='" + source + "',sizingMethod='scale')");
      }
      else
      {
        html.push(source + '" style="');
      }

      if (urlAndToolTip.imageWidth && urlAndToolTip.imageHeight)
      {
        html.push(
          ';width:' +
          urlAndToolTip.imageWidth +
          'px' +
          ';height:' +
          urlAndToolTip.imageHeight +
          'px');
      }

      var tooltip = urlAndToolTip.tooltip;

      if (tooltip != null)
      {
        html.push('" title="' + tooltip);
      }

      html.push('"/>');

      if (urlAndToolTip.position)
      {
        html.push('</div>');
      }

      return html.join("");
    },


    /**
     * Adds extra content just before the icon.
     * @param cellInfo {Map} The information about the cell.
     *      See {@link qx.ui.table.cellrenderer.Abstract#createDataCellHtml}.
     * @return {Map} with the HTML and width in pixels of the rendered content.
     */
    _addExtraContentBeforeIcon : function(cellInfo)
    {
      return { html: '', width: 0 };
    },

    // overridden
    _getContentHtml : function(cellInfo)
    {
      var html = "";
      var node = cellInfo.value;
      var imageUrl;

      // Generate the indentation.  Obtain icon determination values once
      // rather than each time through the loop.
      var bUseTreeLines = this.getUseTreeLines();
      var bExcludeFirstLevelTreeLines = this.getExcludeFirstLevelTreeLines();
      var bAlwaysShowOpenCloseSymbol = this.getAlwaysShowOpenCloseSymbol();

      // Horizontal position
      var pos = 0;

      for (var i=0; i<node.level; i++)
      {
        imageUrl = this._getIndentSymbol(i, node, bUseTreeLines,
                                         bAlwaysShowOpenCloseSymbol,
                                         bExcludeFirstLevelTreeLines);

        html += this.__addImage(
        {
          url         : imageUrl,
          position    :
          {
            top         : 0,
            left        : pos,
            width       : 19,
            height      : 16,
            centerX     : true
          }
        });
        pos += 19;
      }

      var extra = this._addExtraContentBeforeIcon(cellInfo);
      html += extra.html;
      pos += extra.width;

      // Add the node's icon
      imageUrl = (node.bSelected ? node.iconSelected : node.icon);

      if (!imageUrl)
      {
        if (node.type == qx.ui.treevirtual.SimpleTreeDataModel.Type.LEAF)
        {
          var o = this.__tm.styleFrom("tree-folder");
        }
        else
        {
          var states = { opened : node.bOpened };
          var o = this.__tm.styleFrom( "tree-folder", states);
        }

        imageUrl = o.icon;
      }

      html += this.__addImage(
      {
        url         : imageUrl,
        position    :
        {
          top         : 0,
          left        : pos,
          width       : 19,
          height      : 16
        }
      });

      // Add the node's label.  We calculate the "left" property with: each
      // tree line (indentation) icon is 19 pixels wide; the folder icon is 16
      // pixels wide, there are two pixels of padding at the left, and we want
      // 2 pixels between the folder icon and the label
      html +=
        '<div style="position:absolute;' +
        'left:' +
        ((node.level * 19) + 16 + 2 + 2) +
        'px;' +
        'top:0' +
        (node.labelStyle ? ";" + node.labelStyle : "") +
        ';">' +
        node.label +
        '</div>';

      return html;
    },


    /**
     * Determine the symbol to use for indentation of a tree row, at a
     * particular column.  The indentation to use may be just white space or
     * may be a tree line.  Tree lines come in numerous varieties, so the
     * appropriate one is selected.
     *
     * @type member
     *
     * @param column {Integer}
     *   The column of indentation being requested, zero-relative
     *
     * @param node {Node}
     *   The node being displayed in the row.  The properties of a node are
     *   described in {@link qx.ui.treevirtual.SimpleTreeDataModel}
     *
     * @param bUseTreeLines {Boolean}
     *   Whether to find an appropriate tree line icon, or simply provide
     *   white space.
     *
     * @param bAlwaysShowOpenCloseSymbol {Boolean}
     *   Whether to display the open/close icon for a node even if it has no
     *   children.
     *
     * @param bExcludeFirstLevelTreeLines {Boolean}
     *   If bUseTreeLines is enabled, then further filtering of the left-most
     *   tree line may be specified here.  If <i>true</i> then the left-most
     *   tree line, between top-level siblings, will not be displayed.
     *   If <i>false</i>, then the left-most tree line wiill be displayed
     *   just like all of the other tree lines.
     *
     * @return {var} TODOC
     */
    _getIndentSymbol : function(column,
                                node,
                                bUseTreeLines,
                                bAlwaysShowOpenCloseSymbol,
                                bExcludeFirstLevelTreeLines)
    {
      var STDCR = qx.ui.treevirtual.SimpleTreeDataCellRenderer;

      // If we're in column 0 and excludeFirstLevelTreeLines is enabled, then
      // we treat this as if no tree lines were requested.
      if (column == 0 && bExcludeFirstLevelTreeLines)
      {
        bUseTreeLines = false;
      }

      // If we're not on the final column...
      if (column < node.level - 1)
      {
        // then return either a line or a blank icon, depending on
        // bUseTreeLines
        return (bUseTreeLines && ! node.lastChild[column]
                ? STDCR.__icon.line
                : this.STATIC_URI + "blank.gif");
      }

      var bLastChild = node.lastChild[node.lastChild.length - 1];

      // Is this a branch node that does not have the open/close button hidden?
      if (node.type == qx.ui.treevirtual.SimpleTreeDataModel.Type.BRANCH &&
          ! node.bHideOpenClose)
      {
        // Does this node have any children, or do we always want the
        // open/close symbol to be shown?
        if (node.children.length > 0 || bAlwaysShowOpenCloseSymbol)
        {
          // If we're not showing tree lines...
          if (!bUseTreeLines)
          {
            // ... then just use a plus or minus
            return (node.bOpened
                    ? STDCR.__icon.minus
                    : STDCR.__icon.plus);
          }

          // Are we looking at a top-level, first child of its parent?
          if (column == 0 && node.bFirstChild)
          {
            // Yup.  If it's also a last child...
            if (bLastChild)
            {
              // ... then use no tree lines.
              return (node.bOpened
                      ? STDCR.__icon.onlyMinus
                      : STDCR.__icon.onlyPlus);
            }
            else
            {
              // otherwise, use descender lines but no ascender.
              return (node.bOpened
                      ? STDCR.__icon.startMinus
                      : STDCR.__icon.startPlus);
            }
          }

          // It's not a top-level, first child.  Is this the last child of its
          // parent?
          if (bLastChild)
          {
            // Yup.  Return an ending plus or minus.
            return (node.bOpened
                    ? STDCR.__icon.endMinus
                    : STDCR.__icon.endPlus);
          }

          // Otherwise, return a crossing plus or minus.
          return (node.bOpened
                  ? STDCR.__icon.crossMinus
                  : STDCR.__icon.crossPlus);
        }
      }

      // This node does not have any children.  Return an end or cross, if
      // we're using tree lines.
      if (bUseTreeLines)
      {
        // If this is a child of the root node...
        if (node.parentNodeId == 0)
        {
          // If this is the only child...
          if (bLastChild && node.bFirstChild)
          {
            // ... then return a blank.
            return this.STATIC_URI + "blank.gif";
          }

          // Otherwise, if this is the last child...
          if (bLastChild)
          {
            // ... then return an end line.
            return STDCR.__icon.end;
          }

          // Otherwise if this is the first child...
          if (node.bFirstChild)
          {
            // ... then return a start line.
            return STDCR.__icon.start;
          }
        }

        // If this is a last child, return and ending line; otherwise cross.
        return (bLastChild
                ? STDCR.__icon.end
                : STDCR.__icon.cross);
      }

      return this.STATIC_URI + "blank.gif";
    }
  },

  defer : function()
  {
    // Ensure that the theme is initialized
    qx.theme.manager.Meta.getInstance().initialize();

    var STDCR = qx.ui.treevirtual.SimpleTreeDataCellRenderer;
    if (! STDCR.__initialized)
    {
      var ImageLoader = qx.io2.ImageLoader;

      var am = qx.util.AliasManager.getInstance();
      var rm = qx.util.ResourceManager;
      var tm = qx.theme.manager.Appearance.getInstance();

      var loadImage = function(f)
      {
        ImageLoader.load(rm.toUri(am.resolve(f)));
      };
      
      STDCR.__icon.line =
        tm.styleFrom("treevirtual-line").icon;
      loadImage(STDCR.__icon.line);
      ++STDCR.__imagesPending;

      STDCR.__icon.minus =
        tm.styleFrom("treevirtual-minus").icon;
      loadImage(STDCR.__icon.minus);
      ++STDCR.__imagesPending;
      
      STDCR.__icon.plus =
        tm.styleFrom("treevirtual-plus").icon;
      loadImage(STDCR.__icon.plus);
      ++STDCR.__imagesPending;
      
      STDCR.__icon.onlyMinus =
        tm.styleFrom("treevirtual-only-minus").icon;
      loadImage(STDCR.__icon.onlyMinus);
      ++STDCR.__imagesPending;
      
      STDCR.__icon.onlyPlus =
        tm.styleFrom("treevirtual-only-plus").icon;
      loadImage(STDCR.__icon.onlyPlus);
      ++STDCR.__imagesPending;
      
      STDCR.__icon.startMinus =
        tm.styleFrom("treevirtual-start-minus").icon;
      loadImage(STDCR.__icon.startMinus);
      ++STDCR.__imagesPending;
      
      STDCR.__icon.startPlus =
        tm.styleFrom("treevirtual-start-plus").icon;
      loadImage(STDCR.__icon.startPlus);
      ++STDCR.__imagesPending;
      
      STDCR.__icon.endMinus =
        tm.styleFrom("treevirtual-end-minus").icon;
      loadImage(STDCR.__icon.endMinus);
      ++STDCR.__imagesPending;
      
      STDCR.__icon.endPlus =
        tm.styleFrom("treevirtual-end-plus").icon;
      loadImage(STDCR.__icon.endPlus);
      ++STDCR.__imagesPending;
      
      STDCR.__icon.crossMinus =
        tm.styleFrom("treevirtual-cross-minus").icon;
      loadImage(STDCR.__icon.crossMinus);
      ++STDCR.__imagesPending;
      
      STDCR.__icon.crossPlus =
        tm.styleFrom("treevirtual-cross-plus").icon;
      loadImage(STDCR.__icon.crossPlus);
      ++STDCR.__imagesPending;
      
      STDCR.__icon.end =
        tm.styleFrom("treevirtual-end").icon;
      loadImage(STDCR.__icon.end);
      ++STDCR.__imagesPending;
      
      STDCR.__icon.cross =
        tm.styleFrom("treevirtual-cross").icon;
      loadImage(STDCR.__icon.cross);
      ++STDCR.__imagesPending;

      STDCR.__initialized = true;
    }
  }
});
