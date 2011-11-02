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
/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/apps/office-calendar.png)
#asset(qx/icon/${qx.icontheme}/32/apps/office-address-book.png)

************************************************************************ */

/**
 * @tag test
 */
qx.Class.define("demobrowser.demo.test.UIDeclaration",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // create a definition for a form
      var formDef =
      {
       clazz: qx.ui.form.Form,
       children:
       [
         {
           type : "Header",
           label : "Simple Form"
         },
         {
           type: "Item",
           label: "First Name",
           validator: null,
           name: "firstname",
           widget:
           {
             clazz: qx.ui.form.TextField,
             required: true,
             width: 200
           }
         },
         {
           type: "Item",
           label: "Last Name",
           widget:
           {
             clazz: qx.ui.form.TextField
           }
         },
         {
           type: "Item",
           label: "Company",
           widget:
           {
             clazz: qx.ui.form.TextField
           }
         },
         {
           type: "Item",
           label: "Email",
           widget:
           {
             clazz: qx.ui.form.TextField
           }
         },
         {
           type: "Item",
           label: "Date",
           widget:
           {
             clazz: qx.ui.form.DateField
           }
         },
         ////////////
         // BUTTONS
         ////////////
         {
           type: "Button",
           widget:
           {
             clazz: qx.ui.form.Button,
             label: "Save"
           }
         },
         {
           type: "Button",
           widget:
           {
             clazz: qx.ui.form.Button,
             label: "Cancel"
           }
         }
       ]
      };



      // create a definition for a window
      var winDef =
      {
        clazz : qx.ui.window.Window,
        layout :
        {
          clazz : qx.ui.layout.VBox,
          spacing : 10
        },
        layoutProperties :
        {
          left : 20,
          top : 20
        },
        showStatusbar : true,
        status : "Demo loaded",
        caption : "First Window",
        icon : "icon/16/apps/office-calendar.png",
        id : "win",
        listeners :
        [
          {
            event : "move",
            handler : function(e) {
              this.debug("Moved to: " + e.getData().left + "x" + e.getData().top);
            }
          },
          {
            event : "resize",
            handler : function(e) {
              this.debug("Resized to: " + e.getData().width + "x" + e.getData().height);
            }
          }
        ],
        children :
        [
          {
            clazz : qx.ui.basic.Atom,
            label : "Welcome to your first own Window.<br/>Have fun!",
            icon : "icon/32/apps/office-address-book.png",
            rich : true
          },
          {
            clazz : qx.ui.tabview.TabView,
            layoutProperties : {flex:1},
            children :
            [
              {
                clazz : qx.ui.tabview.Page,
                label : "Page 1",
                layoutProperties : {flex:1},
                layout :
                {
                  clazz : qx.ui.layout.Canvas
                },
                children :
                [
                  formDef
                ]
              },
              {
                clazz : qx.ui.tabview.Page,
                label : "Page 2",
                layoutProperties : {flex:1}
              },
              {
                clazz : qx.ui.tabview.Page,
                label : "Page 3",
                layoutProperties : {flex:1}
              }
            ]
          }
        ]
      };


      // parse the windows definition
      this.addFromDefinition(winDef);

      // open the created window accessed via id
      this.win.open();
    },


    addFromDefinition : function(definition)
    {
      var root = this.getRoot();
      this.__addItem(root, definition);
    },


    __addItem : function(root, definition)
    {
      var widget = new definition.clazz();

      // set the widget properties
      var properties = qx.lang.Object.clone(definition);
      delete properties.clazz;
      delete properties.layout;
      delete properties.children;
      delete properties.id;
      delete properties.listeners;
      widget.set(properties);

      // create the id reference
      if (definition.id != null) {
        this[definition.id] = widget;
      }

      // set the layout
      if (definition.layout != null) {
        var layout = new definition.layout.clazz();
        // set the layout properties
        var properties = qx.lang.Object.clone(definition.layout);
        delete properties.clazz;
        layout.set(properties);
        widget.setLayout(layout);
      }

      // handle the children
      var children = definition.children;
      if (children != null) {
        for (var i = 0; i < children.length; i++) {
          if (widget instanceof qx.ui.form.Form) {
            this.__addFormItem(widget, children[i]);
          } else {
            this.__addItem(widget, children[i]);
          }
        }
      }

      // add the widget
      if (widget instanceof qx.ui.form.Form) {
        root.add(new qx.ui.form.renderer.Single(widget));
      } else {
        root.add(widget, definition.layoutProperties);
      }

      // add the listener
      if (definition.listeners) {
        for (var i = 0; i < definition.listeners.length; i++) {
          var listenerDef = definition.listeners[i];
          widget.addListener(listenerDef.event, listenerDef.handler, listenerDef.context);
        }
      }
    },


    __addFormItem : function(root, definition)
    {
      // check the group header first
      if (definition.type === "Header") {
        root.addGroupHeader(definition.label)
        return;
      }

      // go threw the definition
      var widget = new definition.widget.clazz();
      // set the widget properties
      var properties = qx.lang.Object.clone(definition.widget);
      delete properties.clazz;
      widget.set(properties);

      if (definition.type === "Item") {
        root.add(widget, definition.label, definition.validator, definition.name);
      } else if (definition.type === "Button") {
        root.addButton(widget);
      }
    }
  }
});


