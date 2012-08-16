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
     * Alexander Steitz (aback)
     * David Werner (psycledw)

************************************************************************ */

/* ************************************************************************
#ignore(boxData)
************************************************************************ */

/**
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.bom.Portal",
{
  extend : qx.application.Native,

  members :
  {
    /**
     * @lint ignoreUndefined(boxData)
     */
    main : function()
    {
      this.base(arguments);

      boxData =
      {
        groupBoxes :
        {
          "groupBoxLeft" :
          {
            id        : "groupBoxLeft",
            name      : "GroupBox Left",
            boxes : [
              "box0",
              "box1",
              "box2",
              "box3"
            ]
          },

          "groupBoxRight" :
          {
            id        : "groupBoxRight",
            name      : "GroupBox Right",
            boxes : [
              "box4",
              "box5",
              "box6",
              "box7"
            ]
          }
        },

        boxes :
        {
          box0 :
          {
            id   : "box0",
            name : "box0",

            width : "300px",
            height : "120px",

            minWidth : "10px",
            maxWidth : "350px",
            minHeight : "10px",
            maxHeight : "700px",

            draggable : true,

            resizable : true,
            resizeHandles : 1
          },

          box1 :
          {
            id   : "box1",
            name : "box1",

            width : "300px",
            height : "100px",

            minWidth : "10px",
            maxWidth : "350px",
            minHeight : "10px",
            maxHeight : "700px",

            draggable : true,

            resizable : false,
            resizeHandles : 1
          },

          box2 :
          {
            id   : "box2",
            name : "box2",

            width : "300px",
            height : "100px",

            minWidth : "10px",
            maxWidth : "350px",
            minHeight : "10px",
            maxHeight : "700px",

            draggable : false,

            resizable : false,
            resizeHandles : 0
          },

          box3 :
          {
            id   : "box3",
            name : "box3",

            width : "300px",
            height : "100px",

            minWidth : "10px",
            maxWidth : "350px",
            minHeight : "10px",
            maxHeight : "700px",

            draggable : true,

            resizable : true,
            resizeHandles : 3
          },

          box4 :
          {
            id   : "box4",
            name : "box4",

            width : "300px",
            height : "100px",

            minWidth : "10px",
            maxWidth : "350px",
            minHeight : "10px",
            maxHeight : "700px",

            draggable : true,

            resizable : true,
            resizeHandles : 1
          },

          box5 :
          {
            id   : "box5",
            name : "box5",

            width : "250px",
            height : "200px",

            minWidth : "10px",
            maxWidth : "500px",
            minHeight : "10px",
            maxHeight : "700px",

            draggable : true,

            resizable : true,
            resizeHandles : 2
          },

          box6 :
          {
            id   : "box6",
            name : "box6",

            width : "300px",
            height : "100px",

            minWidth : "10px",
            maxWidth : "350px",
            minHeight : "10px",
            maxHeight : "700px",

            draggable : false,

            resizable : false,
            resizeHandles : 0
          },

          box7 :
          {
            id   : "box7",
            name : "box7",

            width : "300px",
            height : "140px",

            minWidth : "10px",
            maxWidth : "350px",
            minHeight : "10px",
            maxHeight : "700px",

            draggable : true,

            resizable : true,
            resizeHandles : 2
          }
        }
      }


      demobrowser.demo.bom.portal.box.Manager.getInstance().load();
      demobrowser.demo.bom.portal.dragdrop.Manager.getInstance();
    }
  }
});
