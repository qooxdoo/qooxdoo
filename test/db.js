var db = {
    "classInfo": {
      "qxt.Application": {
        "mtime": "2017-05-31T09:22:33.000Z",
        "libraryName": "qxt",
        "dependsOn": {
          "qx.application.Standalone": {
            "load": true,
            "construct": true
          },
          "qx.core.Environment": {},
          "qx.log.appender.Native": {},
          "qx.log.appender.Console": {},
          "qx.util.format.DateFormat": {},
          "qx.locale.Manager": {},
          "qx.ui.form.Button": {},
          "qx.ui.form.TextField": {},
          "com.zenesis.qx.upload.UploadButton": {},
          "com.zenesis.qx.upload.UploadMgr": {}
        },
        "extends": "qx.application.Standalone",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {},
            "qxt.customEnvironment": {},
            "qxt.applicationName": {}
          }
        },
        "assets": [
          "qxt/*",
          "qx/icon/${qx.icontheme}/16/mimetypes/*"
        ],
        "translations": [
          {
            "msgid": "Translation One",
            "lineNo": 67
          },
          {
            "msgid": "Translation Singular",
            "msgid_plural": "Translation Plural",
            "lineNo": 68
          },
          {
            "msgid": "Translation Three",
            "comment": "Comment about Translation Three",
            "lineNo": 69
          },
          {
            "msgid": "Translation Four Singular",
            "msgid_plural": "Translation Four Plural",
            "comment": "Comment about Translation Four",
            "lineNo": 70
          },
          {
            "msgid": "Last month",
            "lineNo": 71
          },
          {
            "msgid": "Translation One",
            "lineNo": 73
          },
          {
            "msgid": "Translation Singular",
            "msgid_plural": "Translation Plural",
            "lineNo": 74
          },
          {
            "msgid": "Translation Three",
            "comment": "Comment about Translation Three",
            "lineNo": 75
          },
          {
            "msgid": "Translation Four Singular",
            "msgid_plural": "Translation Four Plural",
            "comment": "Comment about Translation Four",
            "lineNo": 76
          },
          {
            "msgid": "Last month",
            "lineNo": 77
          },
          {
            "msgid": "First Button",
            "lineNo": 83
          },
          {
            "msgid": "Add File(s)",
            "lineNo": 93
          }
        ]
      },
      "qxt.theme.Theme": {
        "mtime": "2013-10-28T14:46:28.000Z",
        "libraryName": "qxt",
        "dependsOn": {
          "qxt.theme.Color": {
            "load": true
          },
          "qxt.theme.Decoration": {
            "load": true
          },
          "qxt.theme.Font": {
            "load": true
          },
          "qx.theme.icon.Tango": {
            "load": true
          },
          "qxt.theme.Appearance": {
            "load": true
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.theme.Simple": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Theme": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.theme.simple.Color": {
            "load": true
          },
          "qx.theme.simple.Decoration": {
            "load": true
          },
          "qx.theme.simple.Font": {
            "load": true
          },
          "qx.theme.simple.Appearance": {
            "load": true
          },
          "qx.theme.icon.Tango": {
            "load": true
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.application.Standalone": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.core.Init": {
            "require": true
          },
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.application.AbstractGui": {
            "load": true
          },
          "qx.ui.root.Application": {}
        },
        "extends": "qx.application.AbstractGui",
        "include": [],
        "implement": []
      },
      "qx.core.Environment": {
        "mtime": "2017-05-26T12:19:06.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "hasDefer": true
      },
      "qx.log.appender.Native": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.log.appender.Util": {
            "require": true
          },
          "qx.bom.client.Html": {
            "require": true
          },
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {},
          "qx.log.Logger": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "html.console": {
              "className": "qx.bom.client.Html"
            }
          }
        },
        "hasDefer": true
      },
      "qx.log.appender.Console": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.event.handler.Window": {
            "require": true
          },
          "qx.event.handler.Keyboard": {
            "require": true
          },
          "qx.event.handler.Gesture": {
            "require": true
          },
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.Stylesheet": {},
          "qx.log.Logger": {},
          "qx.core.ObjectRegistry": {},
          "qx.event.Registration": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.log.appender.Util": {},
          "qx.event.type.Tap": {},
          "qx.event.type.Pointer": {},
          "qx.dom.Hierarchy": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "hasDefer": true
      },
      "qx.util.format.DateFormat": {
        "mtime": "2017-05-26T12:19:06.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.util.format.IFormat": {
            "load": true
          },
          "qx.locale.Date": {
            "construct": true
          },
          "qx.locale.Manager": {},
          "qx.core.Environment": {
            "load": true
          },
          "qx.log.Logger": {},
          "qx.lang.String": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.util.format.IFormat"
        ],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {}
          }
        }
      },
      "qx.locale.Manager": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.event.dispatch.Direct": {
            "require": true
          },
          "qx.locale.LocalizedString": {
            "require": true
          },
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.lang.Array": {},
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.Locale": {
            "load": true
          },
          "qx.log.Logger": {},
          "qx.lang.String": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "locale": {
              "className": "qx.bom.client.Locale"
            },
            "locale.default": {
              "className": "qx.bom.client.Locale",
              "load": true
            },
            "locale.variant": {
              "className": "qx.bom.client.Locale"
            },
            "qx.debug": {},
            "qx.dynlocale": {}
          }
        }
      },
      "qx.ui.form.Button": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.basic.Atom": {
            "load": true,
            "construct": true
          },
          "qx.ui.core.MExecutable": {
            "load": true
          },
          "qx.ui.form.IExecutable": {
            "load": true
          },
          "qx.ui.core.Widget": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.ui.layout.Atom": {
            "load": true
          },
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.basic.Atom",
        "include": [
          "qx.ui.core.MExecutable"
        ],
        "implement": [
          "qx.ui.form.IExecutable"
        ]
      },
      "qx.ui.form.TextField": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.form.AbstractField": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.bom.client.Engine": {},
          "qx.bom.client.Browser": {},
          "qx.bom.client.Device": {},
          "qx.ui.core.Widget": {
            "load": true
          },
          "qx.bom.client.Css": {
            "load": true
          },
          "qx.locale.Manager": {
            "load": true
          },
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.form.AbstractField",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "className": "qx.bom.client.Engine"
            },
            "engine.version": {
              "className": "qx.bom.client.Engine"
            },
            "browser.documentmode": {
              "className": "qx.bom.client.Browser"
            },
            "device.type": {
              "className": "qx.bom.client.Device"
            }
          }
        }
      },
      "com.zenesis.qx.upload.UploadButton": {
        "mtime": "2016-02-15T09:51:11.000Z",
        "libraryName": "com.zenesis.qx.upload",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.form.Button": {
            "load": true
          },
          "com.zenesis.qx.upload.MUploadButton": {
            "load": true
          },
          "qx.ui.basic.Atom": {
            "load": true
          },
          "qx.ui.core.Widget": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.ui.layout.Atom": {
            "load": true
          },
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.form.Button",
        "include": [
          "com.zenesis.qx.upload.MUploadButton"
        ],
        "implement": []
      },
      "com.zenesis.qx.upload.UploadMgr": {
        "mtime": "2016-02-15T09:51:11.000Z",
        "libraryName": "com.zenesis.qx.upload",
        "dependsOn": {
          "qx.event.handler.Input": {
            "require": true
          },
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "com.zenesis.qx.upload.MParameters": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.bom.client.Engine": {},
          "qx.core.Assert": {},
          "com.zenesis.qx.upload.InputElement": {},
          "qx.lang.Function": {},
          "com.zenesis.qx.upload.XhrHandler": {},
          "com.zenesis.qx.upload.FormHandler": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [
          "com.zenesis.qx.upload.MParameters"
        ],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "className": "qx.bom.client.Engine"
            }
          }
        }
      },
      "qx.Class": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Interface": {
            "require": true
          },
          "qx.Mixin": {
            "require": true
          },
          "qx.lang.normalize.Array": {
            "require": true
          },
          "qx.lang.normalize.Date": {
            "require": true
          },
          "qx.lang.normalize.Error": {
            "require": true
          },
          "qx.lang.normalize.Function": {
            "require": true
          },
          "qx.lang.normalize.String": {
            "require": true
          },
          "qx.lang.normalize.Object": {
            "require": true
          },
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.core.Property": {
            "load": true
          },
          "qx.util.OOUtil": {
            "load": true
          },
          "qx.lang.Type": {},
          "qx.core.Aspect": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "module.property": {
              "load": true
            },
            "qx.debug": {
              "load": true
            },
            "qx.aspects": {
              "load": true,
              "defer": true
            },
            "module.events": {}
          }
        },
        "hasDefer": true
      },
      "qxt.theme.Color": {
        "mtime": "2013-10-28T14:46:28.000Z",
        "libraryName": "qxt",
        "dependsOn": {
          "qx.Theme": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.theme.modern.Color": {
            "load": true
          }
        },
        "extends": "qx.theme.modern.Color",
        "include": [],
        "implement": []
      },
      "qxt.theme.Decoration": {
        "mtime": "2013-10-28T14:46:28.000Z",
        "libraryName": "qxt",
        "dependsOn": {
          "qx.Theme": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.theme.modern.Decoration": {
            "load": true
          }
        },
        "extends": "qx.theme.modern.Decoration",
        "include": [],
        "implement": []
      },
      "qxt.theme.Font": {
        "mtime": "2013-10-28T14:46:28.000Z",
        "libraryName": "qxt",
        "dependsOn": {
          "qx.Theme": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.theme.modern.Font": {
            "load": true
          }
        },
        "extends": "qx.theme.modern.Font",
        "include": [],
        "implement": []
      },
      "qx.theme.icon.Tango": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Theme": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qxt.theme.Appearance": {
        "mtime": "2013-10-28T14:46:28.000Z",
        "libraryName": "qxt",
        "dependsOn": {
          "qx.Theme": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.theme.modern.Appearance": {
            "load": true
          }
        },
        "extends": "qx.theme.modern.Appearance",
        "include": [],
        "implement": []
      },
      "qx.Theme": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.dev.StackTrace": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {
              "load": true
            }
          }
        }
      },
      "qx.theme.simple.Color": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Theme": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.Css": {
            "load": true
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "css.rgba": {
              "load": true,
              "className": "qx.bom.client.Css"
            }
          }
        }
      },
      "qx.theme.simple.Decoration": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Theme": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.theme.simple.Font": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Theme": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.theme.simple.Appearance": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Theme": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.theme.simple.Image": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "assets": [
          "qx/icon/Tango/16/apps/office-calendar.png",
          "qx/icon/Tango/16/places/folder-open.png",
          "qx/icon/Tango/16/places/folder.png",
          "qx/icon/Tango/16/mimetypes/text-plain.png",
          "qx/icon/Tango/16/actions/view-refresh.png",
          "qx/icon/Tango/16/actions/window-close.png",
          "qx/icon/Tango/16/actions/dialog-cancel.png",
          "qx/icon/Tango/16/actions/dialog-ok.png"
        ]
      },
      "qx.core.Init": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.event.handler.Application": {
            "require": true
          },
          "qx.event.handler.Window": {
            "require": true
          },
          "qx.event.dispatch.Direct": {
            "require": true
          },
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.BaseInit": {
            "load": true
          },
          "qx.event.Registration": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "hasDefer": true
      },
      "qx.application.AbstractGui": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.core.Init": {
            "require": true
          },
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.application.IApplication": {
            "load": true
          },
          "qx.locale.MTranslation": {
            "load": true
          },
          "qx.theme.manager.Meta": {},
          "qx.ui.tooltip.Manager": {},
          "qx.ui.style.Stylesheet": {},
          "qx.ui.core.queue.Manager": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [
          "qx.locale.MTranslation"
        ],
        "implement": [
          "qx.application.IApplication"
        ]
      },
      "qx.ui.root.Application": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.event.handler.Window": {
            "require": true
          },
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.root.Abstract": {
            "load": true,
            "construct": true
          },
          "qx.dom.Node": {
            "construct": true
          },
          "qx.event.Registration": {
            "construct": true
          },
          "qx.ui.layout.Canvas": {
            "construct": true
          },
          "qx.ui.core.queue.Layout": {
            "construct": true
          },
          "qx.ui.core.FocusHandler": {
            "construct": true,
            "load": true
          },
          "qx.core.Environment": {
            "construct": true,
            "load": true
          },
          "qx.bom.client.OperatingSystem": {
            "construct": true
          },
          "qx.ui.core.Widget": {
            "construct": true,
            "load": true
          },
          "qx.bom.client.Engine": {},
          "qx.html.Root": {},
          "qx.ui.popup.Manager": {},
          "qx.ui.menu.Manager": {},
          "qx.bom.Viewport": {},
          "qx.bom.element.Style": {},
          "qx.dom.Element": {},
          "qx.ui.core.queue.Visibility": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          }
        },
        "extends": "qx.ui.root.Abstract",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "os.name": {
              "construct": true,
              "className": "qx.bom.client.OperatingSystem"
            },
            "engine.name": {
              "className": "qx.bom.client.Engine"
            }
          }
        }
      },
      "qx.Bootstrap": {
        "mtime": "2017-06-01T09:07:01.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.data.IListData": {},
          "qx.util.OOUtil": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.log.appender.Util": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.log.Logger": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.bom.client.Html": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [
            "html.webworker",
            "html.filereader",
            "html.geolocation",
            "html.audio",
            "html.audio.ogg",
            "html.audio.mp3",
            "html.audio.wav",
            "html.audio.au",
            "html.audio.aif",
            "html.video",
            "html.video.ogg",
            "html.video.h264",
            "html.video.webm",
            "html.storage.local",
            "html.storage.session",
            "html.storage.userdata",
            "html.classlist",
            "html.xpath",
            "html.xul",
            "html.canvas",
            "html.svg",
            "html.vml",
            "html.dataset",
            "html.element.contains",
            "html.element.compareDocumentPosition",
            "html.element.textcontent",
            "html.console",
            "html.image.naturaldimensions",
            "html.history.state",
            "html.selection",
            "html.node.isequalnode",
            "html.fullscreen"
          ],
          "required": {}
        },
        "hasDefer": true
      },
      "qx.log.Logger": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.dev.StackTrace": {
            "require": true
          },
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.lang.Array": {},
          "qx.core.Environment": {},
          "qx.lang.Function": {},
          "qx.log.appender.RingBuffer": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {}
          }
        },
        "hasDefer": true
      },
      "qx.event.handler.Window": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.event.type.Native": {
            "require": true
          },
          "qx.event.Pool": {
            "require": true
          },
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.event.IEventHandler": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.event.Registration": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.lang.Function": {},
          "qx.bom.Event": {},
          "qx.core.Environment": {
            "load": true
          },
          "qx.event.GlobalError": {},
          "qx.core.ObjectRegistry": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.event.IEventHandler",
          "qx.core.IDisposable"
        ],
        "environment": {
          "provided": [],
          "required": {
            "qx.globalErrorHandling": {
              "className": "qx.event.GlobalError"
            }
          }
        },
        "hasDefer": true
      },
      "qx.event.handler.Keyboard": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.event.handler.UserAction": {
            "require": true
          },
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.event.IEventHandler": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.core.Environment": {
            "construct": true,
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.bom.client.Engine": {
            "construct": true,
            "load": true,
            "defer": "load"
          },
          "qx.event.Registration": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.event.type.KeyInput": {},
          "qx.event.type.Data": {},
          "qx.event.type.KeySequence": {},
          "qx.event.util.Keyboard": {},
          "qx.event.handler.Focus": {},
          "qx.lang.Function": {},
          "qx.bom.Event": {},
          "qx.event.GlobalError": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.OperatingSystem": {},
          "qx.core.ObjectRegistry": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.event.IEventHandler",
          "qx.core.IDisposable"
        ],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "construct": true,
              "className": "qx.bom.client.Engine",
              "load": true,
              "defer": true
            },
            "os.name": {
              "className": "qx.bom.client.OperatingSystem"
            }
          }
        },
        "hasDefer": true
      },
      "qx.event.handler.Gesture": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.event.handler.Pointer": {
            "require": true
          },
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.handler.GestureCore": {
            "load": true,
            "construct": true
          },
          "qx.event.IEventHandler": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.event.Registration": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.event.type.Tap": {
            "load": true
          },
          "qx.event.type.Swipe": {
            "load": true
          },
          "qx.event.type.Rotate": {
            "load": true
          },
          "qx.event.type.Pinch": {
            "load": true
          },
          "qx.event.type.Track": {
            "load": true
          },
          "qx.event.type.Roll": {
            "load": true
          },
          "qx.lang.Function": {},
          "qx.core.Environment": {},
          "qx.bom.client.Engine": {},
          "qx.bom.client.Browser": {},
          "qx.bom.Event": {},
          "qx.bom.client.Event": {},
          "qx.event.type.Pointer": {},
          "qx.event.type.Data": {}
        },
        "extends": "qx.event.handler.GestureCore",
        "include": [],
        "implement": [
          "qx.event.IEventHandler",
          "qx.core.IDisposable"
        ],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "className": "qx.bom.client.Engine"
            },
            "browser.documentmode": {
              "className": "qx.bom.client.Browser"
            }
          }
        },
        "hasDefer": true
      },
      "qx.bom.Stylesheet": {
        "mtime": "2017-06-01T09:03:46.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.bom.client.Stylesheet": {
            "require": true
          },
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {},
          "qx.core.Assert": {},
          "qx.dom.Element": {},
          "qx.util.Uri": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "html.stylesheet.createstylesheet": {
              "className": "qx.bom.client.Stylesheet"
            },
            "qx.debug": {},
            "html.stylesheet.insertrule": {
              "className": "qx.bom.client.Stylesheet"
            },
            "html.stylesheet.deleterule": {
              "className": "qx.bom.client.Stylesheet"
            },
            "html.stylesheet.addimport": {
              "className": "qx.bom.client.Stylesheet"
            },
            "html.stylesheet.removeimport": {
              "className": "qx.bom.client.Stylesheet"
            }
          }
        }
      },
      "qx.core.ObjectRegistry": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {},
          "qx.dev.Debug": {},
          "qx.dev.StackTrace": {},
          "qx.log.Logger": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug.dispose": {},
            "qx.debug": {}
          }
        },
        "hasDefer": true
      },
      "qx.event.Registration": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.event.Manager": {
            "require": true
          },
          "qx.dom.Node": {
            "require": true
          },
          "qx.lang.Function": {
            "require": true
          },
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.log.Logger": {},
          "qx.core.ObjectRegistry": {},
          "qx.event.type.Event": {},
          "qx.event.Pool": {},
          "qx.core.Assert": {},
          "qx.Promise": {},
          "qx.event.IEventHandler": {},
          "qx.event.IEventDispatcher": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {},
            "qx.promise": {
              "load": true
            }
          }
        }
      },
      "qx.event.type.Tap": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.type.Pointer": {
            "load": true
          }
        },
        "extends": "qx.event.type.Pointer",
        "include": [],
        "implement": []
      },
      "qx.event.type.Pointer": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.type.Mouse": {
            "load": true
          },
          "qx.bom.Event": {}
        },
        "extends": "qx.event.type.Mouse",
        "include": [],
        "implement": []
      },
      "qx.dom.Hierarchy": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.dom.Node": {},
          "qx.core.Environment": {},
          "qx.bom.client.Html": {},
          "qx.lang.Array": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "html.element.contains": {
              "className": "qx.bom.client.Html"
            },
            "html.element.compareDocumentPosition": {
              "className": "qx.bom.client.Html"
            }
          }
        }
      },
      "qx.core.Object": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.core.ObjectRegistry": {
            "require": true,
            "construct": true
          },
          "qx.core.Environment": {
            "load": true,
            "construct": true,
            "usage": "dynamic"
          },
          "qx.data.MBinding": {
            "load": true
          },
          "qx.core.MLogging": {
            "load": true
          },
          "qx.core.MEvent": {
            "load": true
          },
          "qx.core.MProperty": {
            "load": true
          },
          "qx.core.MAssert": {
            "load": true
          },
          "qx.Class": {
            "construct": true,
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.IDisposable": {
            "construct": true
          },
          "qx.core.Property": {
            "load": true
          },
          "qx.Bootstrap": {},
          "qx.util.DisposeUtil": {},
          "qx.event.Registration": {}
        },
        "extends": "Object",
        "include": [
          "qx.core.Environment",
          "qx.data.MBinding",
          "qx.core.MLogging",
          "qx.core.MEvent",
          "qx.core.MProperty",
          "qx.core.MAssert"
        ],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.automaticMemoryManagement": {
              "construct": true
            },
            "module.property": {
              "load": true
            },
            "qx.debug": {},
            "qx.debug.dispose.level": {},
            "module.events": {}
          }
        }
      },
      "qx.util.format.IFormat": {
        "mtime": "2016-05-12T09:02:16.000Z",
        "libraryName": "qx",
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.locale.Date": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.locale.Manager": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.Assert": {},
          "qx.core.Object": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {}
          }
        }
      },
      "qx.lang.String": {
        "mtime": "2017-06-01T09:03:46.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.lang.normalize.String": {
            "require": true
          },
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.lang.Function": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.event.dispatch.Direct": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.event.IEventDispatcher": {
            "load": true
          },
          "qx.event.Registration": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.event.type.Event": {},
          "qx.promise": {},
          "qx.Promise": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.event.IEventDispatcher"
        ],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {},
            "qx.promise": {}
          }
        },
        "hasDefer": true
      },
      "qx.locale.LocalizedString": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.type.BaseString": {
            "load": true,
            "construct": true
          },
          "qx.locale.Manager": {}
        },
        "extends": "qx.type.BaseString",
        "include": [],
        "implement": []
      },
      "qx.lang.Array": {
        "mtime": "2016-09-05T08:26:48.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.lang.normalize.Date": {
            "require": true
          },
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.data.IListData": {},
          "qx.Class": {},
          "qx.core.Environment": {},
          "qx.bom.client.Engine": {},
          "qx.data.Array": {},
          "qx.core.Assert": {},
          "qx.lang.Type": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "className": "qx.bom.client.Engine"
            },
            "qx.debug": {}
          }
        }
      },
      "qx.bom.client.Locale": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.OperatingSystem": {},
          "qx.lang.Type": {},
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [
            "locale",
            "locale.variant",
            "locale.default"
          ],
          "required": {}
        },
        "hasDefer": true
      },
      "qx.ui.basic.Atom": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.Widget": {
            "load": true,
            "construct": true
          },
          "qx.core.Environment": {
            "construct": true,
            "load": true
          },
          "qx.ui.layout.Atom": {
            "construct": true
          },
          "qx.ui.basic.Label": {},
          "qx.ui.basic.Image": {},
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.core.Widget",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {
              "construct": true
            }
          }
        }
      },
      "qx.ui.core.MExecutable": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {},
          "qx.util.PropertyUtil": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.form.IExecutable": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Interface": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.form.AbstractField": {
        "mtime": "2017-05-26T12:19:06.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.Widget": {
            "load": true,
            "construct": true
          },
          "qx.ui.form.IStringForm": {
            "load": true
          },
          "qx.ui.form.IForm": {
            "load": true
          },
          "qx.ui.form.MForm": {
            "load": true
          },
          "qx.core.Environment": {
            "construct": true,
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.Engine": {},
          "qx.bom.client.Browser": {},
          "qx.theme.manager.Color": {},
          "qx.ui.style.Stylesheet": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.bom.client.Css": {
            "construct": true
          },
          "qx.locale.Manager": {
            "construct": true,
            "load": true
          },
          "qx.html.Input": {},
          "qx.util.ResourceManager": {},
          "qx.theme.manager.Font": {},
          "qx.bom.webfonts.WebFont": {},
          "qx.bom.Font": {},
          "qx.html.Element": {},
          "qx.bom.Label": {},
          "qx.ui.core.queue.Layout": {},
          "qx.event.type.Data": {},
          "qx.lang.Type": {},
          "qx.html.Label": {},
          "qx.bom.Stylesheet": {
            "load": true
          },
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.core.Widget",
        "include": [
          "qx.ui.form.MForm"
        ],
        "implement": [
          "qx.ui.form.IStringForm",
          "qx.ui.form.IForm"
        ],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "className": "qx.bom.client.Engine"
            },
            "browser.name": {
              "className": "qx.bom.client.Browser"
            },
            "engine.version": {
              "className": "qx.bom.client.Engine"
            },
            "css.placeholder": {
              "construct": true,
              "className": "qx.bom.client.Css"
            },
            "qx.dynlocale": {
              "construct": true,
              "load": true
            },
            "browser.documentmode": {
              "className": "qx.bom.client.Browser"
            },
            "browser.version": {
              "className": "qx.bom.client.Browser"
            }
          }
        },
        "hasDefer": true
      },
      "qx.bom.client.Engine": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [
            "engine.version",
            "engine.name"
          ],
          "required": {}
        },
        "hasDefer": true
      },
      "qx.bom.client.Browser": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.bom.client.OperatingSystem": {
            "require": true
          },
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.Engine": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [
            "browser.name",
            "browser.version",
            "browser.documentmode",
            "browser.quirksmode"
          ],
          "required": {}
        },
        "hasDefer": true
      },
      "qx.bom.client.Device": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [
            "device.name",
            "device.touch",
            "device.type",
            "device.pixelRatio"
          ],
          "required": {}
        },
        "hasDefer": true
      },
      "com.zenesis.qx.upload.MUploadButton": {
        "mtime": "2016-02-15T09:51:11.000Z",
        "libraryName": "com.zenesis.qx.upload",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          },
          "com.zenesis.qx.upload.MParameters": {
            "load": true
          }
        },
        "extends": null,
        "include": [
          "com.zenesis.qx.upload.MParameters"
        ],
        "implement": []
      },
      "qx.event.handler.Input": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.event.IEventHandler": {
            "load": true
          },
          "qx.lang.Function": {
            "construct": true
          },
          "qx.core.Environment": {
            "construct": true,
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.Engine": {
            "construct": true,
            "load": true
          },
          "qx.event.Registration": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.bom.client.Browser": {},
          "qx.bom.Event": {},
          "qx.event.type.Data": {},
          "qx.event.GlobalError": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.event.IEventHandler"
        ],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "construct": true,
              "className": "qx.bom.client.Engine",
              "load": true
            },
            "engine.version": {
              "className": "qx.bom.client.Engine"
            },
            "browser.documentmode": {
              "className": "qx.bom.client.Browser"
            },
            "browser.version": {
              "className": "qx.bom.client.Browser"
            }
          }
        },
        "hasDefer": true
      },
      "com.zenesis.qx.upload.MParameters": {
        "mtime": "2016-02-15T09:51:11.000Z",
        "libraryName": "com.zenesis.qx.upload",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.core.Assert": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.lang.Type": {
            "require": true
          },
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.Class": {},
          "qx.core.AssertionError": {},
          "qx.lang.Json": {},
          "qx.lang.String": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "com.zenesis.qx.upload.InputElement": {
        "mtime": "2016-02-15T09:51:11.000Z",
        "libraryName": "com.zenesis.qx.upload",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.html.Element": {
            "load": true,
            "construct": true
          },
          "qx.core.Environment": {
            "construct": true,
            "load": true
          },
          "qx.bom.client.Browser": {
            "construct": true
          },
          "qx.bom.client.Engine": {
            "construct": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.html.Element",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "browser.name": {
              "construct": true,
              "className": "qx.bom.client.Browser"
            },
            "browser.version": {
              "construct": true,
              "className": "qx.bom.client.Browser"
            }
          }
        }
      },
      "qx.lang.Function": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.lang.Array": {
            "require": true
          },
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {},
          "qx.core.Assert": {},
          "qx.core.Object": {},
          "qx.event.GlobalError": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {},
            "qx.globalErrorHandling": {
              "className": "qx.event.GlobalError"
            }
          }
        }
      },
      "com.zenesis.qx.upload.XhrHandler": {
        "mtime": "2016-02-15T10:00:35.000Z",
        "libraryName": "com.zenesis.qx.upload",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "com.zenesis.qx.upload.AbstractHandler": {
            "load": true
          },
          "com.zenesis.qx.upload.File": {},
          "qx.core.Object": {
            "load": true
          },
          "qx.core.Assert": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "com.zenesis.qx.upload.AbstractHandler",
        "include": [],
        "implement": []
      },
      "com.zenesis.qx.upload.FormHandler": {
        "mtime": "2016-02-15T09:51:11.000Z",
        "libraryName": "com.zenesis.qx.upload",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "com.zenesis.qx.upload.AbstractHandler": {
            "load": true
          },
          "com.zenesis.qx.upload.File": {},
          "qx.bom.Event": {},
          "qx.dom.Element": {},
          "qx.bom.element.Style": {},
          "qx.core.Object": {
            "load": true
          },
          "qx.core.Assert": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "com.zenesis.qx.upload.AbstractHandler",
        "include": [],
        "implement": []
      },
      "qx.Interface": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.lang.normalize.Array": {
            "require": true
          },
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.util.OOUtil": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {
              "load": true
            }
          }
        }
      },
      "qx.Mixin": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.lang.normalize.Array": {
            "require": true
          },
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.util.OOUtil": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {
              "load": true
            }
          }
        }
      },
      "qx.lang.normalize.Array": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.bom.client.EcmaScript": {},
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.core.Assert": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {}
          }
        },
        "hasDefer": true
      },
      "qx.lang.normalize.Date": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "defer": "load",
            "usage": "dynamic"
          },
          "qx.bom.client.EcmaScript": {
            "load": true,
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "ecmascript.date.now": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.EcmaScript"
            },
            "ecmascript.date.parse": {
              "load": true,
              "defer": true
            }
          }
        },
        "hasDefer": true
      },
      "qx.lang.normalize.Error": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "defer": "load",
            "usage": "dynamic"
          },
          "qx.bom.client.EcmaScript": {
            "load": true,
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "ecmascript.error.toString": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.EcmaScript"
            }
          }
        },
        "hasDefer": true
      },
      "qx.lang.normalize.Function": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "defer": "load",
            "usage": "dynamic"
          },
          "qx.bom.client.EcmaScript": {
            "load": true,
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "ecmascript.function.bind": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.EcmaScript"
            }
          }
        },
        "hasDefer": true
      },
      "qx.lang.normalize.String": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "defer": "load",
            "usage": "dynamic"
          },
          "qx.bom.client.EcmaScript": {
            "load": true,
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "ecmascript.string.trim": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.EcmaScript"
            },
            "ecmascript.string.startsWith": {
              "load": true,
              "defer": true
            },
            "ecmascript.string.endsWith": {
              "load": true,
              "defer": true
            }
          }
        },
        "hasDefer": true
      },
      "qx.lang.normalize.Object": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "defer": "load",
            "usage": "dynamic"
          },
          "qx.bom.client.EcmaScript": {
            "load": true,
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "ecmascript.object.keys": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.EcmaScript"
            }
          }
        },
        "hasDefer": true
      },
      "qx.core.Property": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.type.Data": {},
          "qx.event.dispatch.Direct": {},
          "qx.promise": {},
          "qx.Promise": {},
          "qx.core.Object": {},
          "qx.log.Logger": {},
          "qx.core.Aspect": {},
          "qx.lang.String": {},
          "qx.Class": {},
          "qx.Interface": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "module.events": {},
            "qx.promise": {},
            "qx.debug": {
              "load": true
            },
            "qx.debug.property.level": {},
            "qx.aspects": {}
          }
        }
      },
      "qx.util.OOUtil": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.lang.Type": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.core.Aspect": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.theme.modern.Color": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Theme": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.Css": {
            "load": true
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "css.rgba": {
              "load": true,
              "className": "qx.bom.client.Css"
            }
          }
        }
      },
      "qx.theme.modern.Decoration": {
        "mtime": "2016-05-12T09:02:16.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Theme": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "assets": [
          "qx/decoration/Modern/toolbar/toolbar-part.gif"
        ]
      },
      "qx.theme.modern.Font": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Theme": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.OperatingSystem": {
            "load": true
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "os.name": {
              "load": true,
              "className": "qx.bom.client.OperatingSystem"
            },
            "os.version": {
              "load": true,
              "className": "qx.bom.client.OperatingSystem"
            }
          }
        }
      },
      "qx.theme.modern.Appearance": {
        "mtime": "2016-05-12T09:02:16.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Theme": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "assets": [
          "qx/icon/Tango/16/places/folder-open.png",
          "qx/icon/Tango/16/places/folder.png",
          "qx/icon/Tango/16/mimetypes/office-document.png",
          "qx/icon/Tango/16/actions/window-close.png",
          "qx/icon/Tango/22/places/folder-open.png",
          "qx/icon/Tango/22/places/folder.png",
          "qx/icon/Tango/22/mimetypes/office-document.png",
          "qx/icon/Tango/32/places/folder-open.png",
          "qx/icon/Tango/32/places/folder.png",
          "qx/icon/Tango/32/mimetypes/office-document.png",
          "qx/icon/Tango/16/apps/office-calendar.png",
          "qx/icon/Tango/16/apps/utilities-color-chooser.png",
          "qx/icon/Tango/16/actions/view-refresh.png",
          "qx/icon/Tango/16/actions/dialog-cancel.png",
          "qx/icon/Tango/16/actions/dialog-ok.png",
          "qx/decoration/Modern/cursors/*",
          "qx/decoration/Modern/scrollbar/scrollbar-left.png",
          "qx/decoration/Modern/scrollbar/scrollbar-right.png",
          "qx/decoration/Modern/scrollbar/scrollbar-up.png",
          "qx/decoration/Modern/scrollbar/scrollbar-down.png",
          "qx/decoration/Modern/toolbar/toolbar-handle-knob.gif",
          "qx/decoration/Modern/tree/open-selected.png",
          "qx/decoration/Modern/tree/closed-selected.png",
          "qx/decoration/Modern/tree/open.png",
          "qx/decoration/Modern/tree/closed.png",
          "qx/decoration/Modern/form/checked.png",
          "qx/decoration/Modern/form/undetermined.png",
          "qx/decoration/Modern/form/tooltip-error-arrow-right.png",
          "qx/decoration/Modern/form/tooltip-error-arrow.png",
          "qx/decoration/Modern/window/minimize-active-hovered.png",
          "qx/decoration/Modern/window/minimize-active.png",
          "qx/decoration/Modern/window/minimize-inactive.png",
          "qx/decoration/Modern/window/restore-active-hovered.png",
          "qx/decoration/Modern/window/restore-active.png",
          "qx/decoration/Modern/window/restore-inactive.png",
          "qx/decoration/Modern/window/maximize-active-hovered.png",
          "qx/decoration/Modern/window/maximize-active.png",
          "qx/decoration/Modern/window/maximize-inactive.png",
          "qx/decoration/Modern/window/close-active-hovered.png",
          "qx/decoration/Modern/window/close-active.png",
          "qx/decoration/Modern/window/close-inactive.png",
          "qx/decoration/Modern/splitpane/knob-horizontal.png",
          "qx/decoration/Modern/splitpane/knob-vertical.png",
          "qx/decoration/Modern/arrows/down.png",
          "qx/decoration/Modern/arrows/up.png",
          "qx/decoration/Modern/arrows/right.png",
          "qx/decoration/Modern/arrows/left.png",
          "qx/decoration/Modern/arrows/rewind.png",
          "qx/decoration/Modern/arrows/forward.png",
          "qx/decoration/Modern/arrows/up-invert.png",
          "qx/decoration/Modern/arrows/down-invert.png",
          "qx/decoration/Modern/arrows/right-invert.png",
          "qx/decoration/Modern/arrows/up-small.png",
          "qx/decoration/Modern/arrows/down-small.png",
          "qx/decoration/Modern/menu/checkbox-invert.gif",
          "qx/decoration/Modern/menu/checkbox.gif",
          "qx/decoration/Modern/menu/radiobutton-invert.gif",
          "qx/decoration/Modern/menu/radiobutton.gif",
          "qx/decoration/Modern/table/select-column-order.png",
          "qx/decoration/Modern/table/ascending.png",
          "qx/decoration/Modern/table/descending.png",
          "qx/decoration/Modern/table/boolean-true.png",
          "qx/decoration/Modern/table/boolean-false.png",
          "qx/static/blank.gif",
          "qx/static/blank.png",
          "qx/decoration/Modern/colorselector/*"
        ]
      },
      "qx.dev.StackTrace": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.lang.normalize.String": {
            "require": true
          },
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {},
          "qx.bom.client.EcmaScript": {
            "load": true,
            "defer": "load"
          },
          "qx.lang.Array": {},
          "qx.Class": {},
          "qx.lang.Function": {},
          "qx.core.ObjectRegistry": {},
          "qx.lang.Type": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "ecmascript.error.stacktrace": {
              "className": "qx.bom.client.EcmaScript"
            },
            "qx.debug": {}
          }
        },
        "hasDefer": true
      },
      "qx.bom.client.Css": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.bom.Style": {
            "require": true
          },
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.Engine": {},
          "qx.bom.client.Browser": {},
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [
            "css.textoverflow",
            "css.placeholder",
            "css.borderradius",
            "css.boxshadow",
            "css.gradient.linear",
            "css.gradient.filter",
            "css.gradient.radial",
            "css.gradient.legacywebkit",
            "css.boxmodel",
            "css.rgba",
            "css.borderimage",
            "css.borderimage.standardsyntax",
            "css.usermodify",
            "css.userselect",
            "css.userselect.none",
            "css.appearance",
            "css.float",
            "css.boxsizing",
            "css.inlineblock",
            "css.opacity",
            "css.textShadow",
            "css.textShadow.filter",
            "css.alphaimageloaderneeded",
            "css.pointerevents",
            "css.flexboxSyntax"
          ],
          "required": {}
        },
        "hasDefer": true
      },
      "qx.theme.simple.Image": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [],
        "assets": [
          "qx/decoration/Simple/*",
          "qx/static/blank.png"
        ]
      },
      "qx.event.handler.Application": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.bom.client.Engine": {
            "require": true
          },
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.event.IEventHandler": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.event.Registration": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.lang.Function": {},
          "qx.bom.client.Browser": {},
          "qx.bom.Event": {},
          "qx.event.GlobalError": {},
          "qx.core.ObjectRegistry": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.event.IEventHandler",
          "qx.core.IDisposable"
        ],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "className": "qx.bom.client.Engine"
            },
            "browser.documentmode": {
              "className": "qx.bom.client.Browser"
            },
            "qx.globalErrorHandling": {
              "className": "qx.event.GlobalError"
            }
          }
        },
        "hasDefer": true,
        "unresolved": [
          {
            "name": "qx.$$domReady",
            "locations": [
              {
                "start": {
                  "line": 220,
                  "column": 10
                },
                "end": {
                  "line": 220,
                  "column": 23
                }
              }
            ],
            "load": true,
            "defer": false
          }
        ]
      },
      "qx.core.BaseInit": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {},
          "qx.bom.client.Engine": {},
          "qx.log.Logger": {},
          "qx.bom.client.OperatingSystem": {},
          "qx.Bootstrap": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "className": "qx.bom.client.Engine"
            },
            "engine.version": {
              "className": "qx.bom.client.Engine"
            },
            "os.name": {
              "className": "qx.bom.client.OperatingSystem"
            },
            "qx.application": {}
          }
        }
      },
      "qx.application.IApplication": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Interface": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.locale.MTranslation": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.locale.Manager": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.theme.manager.Meta": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.theme.manager.Color": {},
          "qx.theme.manager.Decoration": {},
          "qx.theme.manager.Font": {},
          "qx.theme.manager.Icon": {},
          "qx.theme.manager.Appearance": {},
          "qx.core.Environment": {
            "load": true
          },
          "qx.Theme": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": []
      },
      "qx.ui.tooltip.Manager": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.event.Registration": {
            "construct": true
          },
          "qx.event.Timer": {
            "construct": true
          },
          "qx.ui.tooltip.ToolTip": {},
          "qx.ui.core.Widget": {},
          "qx.ui.form.IForm": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": []
      },
      "qx.ui.style.Stylesheet": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.bom.Stylesheet": {
            "construct": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": []
      },
      "qx.ui.core.queue.Manager": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.event.handler.UserAction": {
            "require": true
          },
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.AnimationFrame": {},
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.ui.core.queue.Widget": {},
          "qx.log.Logger": {},
          "qx.ui.core.queue.Visibility": {},
          "qx.ui.core.queue.Appearance": {},
          "qx.ui.core.queue.Layout": {},
          "qx.html.Element": {
            "load": true,
            "defer": "load"
          },
          "qx.ui.core.queue.Dispose": {},
          "qx.dev.StackTrace": {},
          "qx.event.Registration": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.bom.client.Event": {
            "load": true,
            "defer": "load"
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug.ui.queue": {},
            "qx.debug": {
              "load": true
            },
            "event.touch": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.Event"
            }
          }
        },
        "hasDefer": true
      },
      "qx.ui.root.Abstract": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.Widget": {
            "load": true,
            "construct": true
          },
          "qx.ui.core.MChildrenHandling": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.ui.core.MBlocker": {
            "load": true
          },
          "qx.ui.window.MDesktop": {
            "load": true
          },
          "qx.ui.core.FocusHandler": {
            "construct": true
          },
          "qx.ui.core.queue.Visibility": {
            "construct": true
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.Engine": {
            "load": true
          },
          "qx.bom.Stylesheet": {},
          "qx.bom.element.Cursor": {},
          "qx.dom.Node": {},
          "qx.bom.client.Event": {},
          "qx.bom.Event": {},
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.core.Widget",
        "include": [
          "qx.ui.core.MChildrenHandling",
          "qx.ui.core.MBlocker",
          "qx.ui.window.MDesktop"
        ],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "load": true,
              "className": "qx.bom.client.Engine"
            },
            "event.help": {
              "className": "qx.bom.client.Event"
            }
          }
        },
        "hasDefer": true
      },
      "qx.dom.Node": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.layout.Canvas": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.layout.Abstract": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.layout.Util": {},
          "qx.lang.Type": {}
        },
        "extends": "qx.ui.layout.Abstract",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {
              "load": true
            }
          }
        }
      },
      "qx.ui.core.queue.Layout": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.queue.Manager": {},
          "qx.ui.core.queue.Visibility": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.core.FocusHandler": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.bom.element.Location": {},
          "qx.ui.core.Widget": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": []
      },
      "qx.bom.client.OperatingSystem": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [
            "os.name",
            "os.version"
          ],
          "required": {}
        },
        "hasDefer": true
      },
      "qx.ui.core.Widget": {
        "mtime": "2017-06-01T09:03:46.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.ui.core.EventHandler": {},
          "qx.event.handler.DragDrop": {},
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.LayoutItem": {
            "load": true,
            "construct": true
          },
          "qx.locale.MTranslation": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.Assert": {},
          "qx.util.ObjectPool": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.layout.Abstract": {},
          "qx.ui.core.queue.Layout": {},
          "qx.ui.core.queue.Visibility": {},
          "qx.lang.Object": {},
          "qx.theme.manager.Decoration": {},
          "qx.ui.core.queue.Manager": {},
          "qx.ui.root.Inline": {},
          "qx.html.Element": {},
          "qx.lang.Array": {},
          "qx.event.Registration": {},
          "qx.event.dispatch.MouseCapture": {},
          "qx.Bootstrap": {},
          "qx.locale.Manager": {},
          "qx.bom.client.Engine": {},
          "qx.theme.manager.Color": {},
          "qx.lang.Type": {},
          "qx.ui.core.queue.Appearance": {},
          "qx.theme.manager.Appearance": {},
          "qx.core.Property": {},
          "qx.ui.core.DragDropCursor": {},
          "qx.bom.element.Location": {},
          "qx.ui.core.queue.Dispose": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.ui.core.queue.Widget": {},
          "qx.core.Object": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          }
        },
        "extends": "qx.ui.core.LayoutItem",
        "include": [
          "qx.locale.MTranslation"
        ],
        "implement": [
          "qx.core.IDisposable"
        ],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {},
            "qx.dynlocale": {},
            "engine.name": {
              "className": "qx.bom.client.Engine"
            }
          }
        },
        "assets": [
          "qx/static/blank.gif"
        ]
      },
      "qx.html.Root": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.html.Element": {
            "load": true,
            "construct": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.html.Element",
        "include": [],
        "implement": []
      },
      "qx.ui.popup.Manager": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.event.Registration": {
            "construct": true
          },
          "qx.bom.Element": {
            "construct": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.ui.popup.Popup": {},
          "qx.lang.Array": {},
          "qx.ui.core.Widget": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {}
          }
        }
      },
      "qx.ui.menu.Manager": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.event.Registration": {
            "construct": true
          },
          "qx.core.Environment": {
            "construct": true,
            "load": true
          },
          "qx.bom.client.Event": {
            "construct": true
          },
          "qx.bom.Element": {
            "construct": true
          },
          "qx.event.Timer": {
            "construct": true
          },
          "qx.ui.menu.Menu": {},
          "qx.ui.menu.AbstractButton": {},
          "qx.lang.Array": {},
          "qx.ui.core.Widget": {},
          "qx.ui.menubar.Button": {},
          "qx.ui.menu.Button": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "event.touch": {
              "construct": true,
              "className": "qx.bom.client.Event"
            },
            "qx.debug": {}
          }
        }
      },
      "qx.bom.Viewport": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.Document": {},
          "qx.core.Environment": {},
          "qx.bom.client.OperatingSystem": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "os.name": {
              "className": "qx.bom.client.OperatingSystem"
            }
          }
        }
      },
      "qx.bom.element.Style": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.lang.String": {
            "require": true
          },
          "qx.bom.client.Css": {
            "require": true
          },
          "qx.bom.element.Clip": {
            "require": true,
            "load": true
          },
          "qx.bom.element.Cursor": {
            "require": true,
            "load": true
          },
          "qx.bom.element.Opacity": {
            "require": true,
            "load": true
          },
          "qx.bom.element.BoxSizing": {
            "require": true,
            "load": true
          },
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {},
          "qx.lang.Object": {},
          "qx.bom.Style": {},
          "qx.core.Assert": {},
          "qx.dom.Node": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "css.appearance": {
              "className": "qx.bom.client.Css"
            },
            "css.userselect": {
              "className": "qx.bom.client.Css"
            },
            "css.textoverflow": {
              "className": "qx.bom.client.Css"
            },
            "css.borderimage": {
              "className": "qx.bom.client.Css"
            },
            "css.float": {
              "className": "qx.bom.client.Css"
            },
            "css.usermodify": {
              "className": "qx.bom.client.Css"
            },
            "css.boxsizing": {
              "className": "qx.bom.client.Css"
            },
            "qx.debug": {}
          }
        },
        "hasDefer": true
      },
      "qx.dom.Element": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {},
          "qx.bom.client.Engine": {},
          "qx.bom.element.Attribute": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "className": "qx.bom.client.Engine"
            }
          }
        }
      },
      "qx.data.IListData": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Interface": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.log.appender.RingBuffer": {
        "mtime": "2016-05-12T09:02:16.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.util.RingBuffer": {
            "load": true
          }
        },
        "extends": "qx.util.RingBuffer",
        "include": [],
        "implement": []
      },
      "qx.event.type.Native": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.type.Event": {
            "load": true
          },
          "qx.bom.Event": {}
        },
        "extends": "qx.event.type.Event",
        "include": [],
        "implement": []
      },
      "qx.event.Pool": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.util.ObjectPool": {
            "load": true,
            "construct": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.util.ObjectPool",
        "include": [],
        "implement": []
      },
      "qx.event.IEventHandler": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Interface": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.core.IDisposable": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Interface": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.bom.Event": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {},
          "qx.log.Logger": {},
          "qx.bom.client.Engine": {},
          "qx.bom.client.Browser": {},
          "qx.bom.client.CssTransition": {},
          "qx.bom.Style": {},
          "qx.lang.String": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {},
            "engine.name": {
              "className": "qx.bom.client.Engine"
            },
            "browser.name": {
              "className": "qx.bom.client.Browser"
            },
            "browser.documentmode": {
              "className": "qx.bom.client.Browser"
            },
            "css.transition": {
              "className": "qx.bom.client.CssTransition"
            }
          }
        }
      },
      "qx.event.GlobalError": {
        "mtime": "2017-06-01T09:03:46.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.core.Environment": {
            "load": true,
            "defer": "load",
            "usage": "dynamic"
          },
          "qx.core.WindowError": {},
          "qx.core.GlobalError": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [
            "qx.globalErrorHandling"
          ],
          "required": {
            "qx.globalErrorHandling": {
              "className": "qx.event.GlobalError"
            }
          }
        },
        "hasDefer": true
      },
      "qx.event.handler.UserAction": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.event.IEventHandler": {
            "load": true
          },
          "qx.event.Registration": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.event.IEventHandler"
        ],
        "hasDefer": true
      },
      "qx.event.type.KeyInput": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.type.Dom": {
            "load": true
          }
        },
        "extends": "qx.event.type.Dom",
        "include": [],
        "implement": []
      },
      "qx.event.type.Data": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.type.Event": {
            "load": true
          }
        },
        "extends": "qx.event.type.Event",
        "include": [],
        "implement": []
      },
      "qx.event.type.KeySequence": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.type.Dom": {
            "load": true
          },
          "qx.event.util.Keyboard": {}
        },
        "extends": "qx.event.type.Dom",
        "include": [],
        "implement": []
      },
      "qx.event.util.Keyboard": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.OperatingSystem": {
            "load": true
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "os.name": {
              "load": true,
              "className": "qx.bom.client.OperatingSystem"
            }
          }
        },
        "hasDefer": true
      },
      "qx.event.handler.Focus": {
        "mtime": "2017-05-26T12:19:06.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.event.dispatch.DomBubbling": {},
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.event.IEventHandler": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.core.Environment": {
            "construct": true,
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.OperatingSystem": {
            "construct": true
          },
          "qx.application.Inline": {
            "construct": true
          },
          "qx.core.Init": {
            "construct": true
          },
          "qx.event.Registration": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.bom.client.Engine": {
            "load": true
          },
          "qx.bom.Selection": {},
          "qx.event.type.Focus": {},
          "qx.lang.Function": {},
          "qx.bom.Event": {},
          "qx.bom.client.Browser": {
            "load": true
          },
          "qx.event.GlobalError": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.element.Attribute": {},
          "qx.core.ObjectRegistry": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.event.IEventHandler",
          "qx.core.IDisposable"
        ],
        "environment": {
          "provided": [],
          "required": {
            "os.name": {
              "construct": true,
              "className": "qx.bom.client.OperatingSystem"
            },
            "os.version": {
              "construct": true,
              "className": "qx.bom.client.OperatingSystem"
            },
            "engine.name": {
              "load": true,
              "className": "qx.bom.client.Engine"
            },
            "browser.name": {
              "load": true,
              "className": "qx.bom.client.Browser"
            }
          }
        },
        "hasDefer": true
      },
      "qx.event.handler.Pointer": {
        "mtime": "2017-06-01T09:03:46.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.event.dispatch.DomBubbling": {
            "require": true
          },
          "qx.event.type.Pointer": {
            "require": true
          },
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.handler.PointerCore": {
            "load": true,
            "construct": true
          },
          "qx.event.IEventHandler": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.event.Registration": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.bom.client.Engine": {
            "load": true
          },
          "qx.bom.client.Browser": {
            "load": true
          },
          "qx.bom.Event": {},
          "qx.event.type.dom.Pointer": {},
          "qx.event.type.Data": {},
          "qx.bom.client.Event": {
            "load": true
          },
          "qx.bom.client.Device": {
            "load": true
          }
        },
        "extends": "qx.event.handler.PointerCore",
        "include": [],
        "implement": [
          "qx.event.IEventHandler",
          "qx.core.IDisposable"
        ],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "className": "qx.bom.client.Engine"
            },
            "browser.documentmode": {
              "className": "qx.bom.client.Browser"
            }
          }
        },
        "hasDefer": true
      },
      "qx.event.handler.GestureCore": {
        "mtime": "2017-06-01T09:03:46.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.core.Environment": {},
          "qx.bom.client.Engine": {},
          "qx.bom.client.Browser": {},
          "qx.bom.client.Event": {},
          "qx.bom.Event": {},
          "qx.bom.AnimationFrame": {},
          "qx.lang.Function": {},
          "qx.event.type.dom.Custom": {},
          "qx.util.Wheel": {},
          "qx.log.Logger": {},
          "qx.bom.client.OperatingSystem": {},
          "qx.event.Timer": {}
        },
        "extends": "Object",
        "include": [],
        "implement": [
          "qx.core.IDisposable"
        ],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "className": "qx.bom.client.Engine"
            },
            "browser.documentmode": {
              "className": "qx.bom.client.Browser"
            },
            "event.mousewheel": {
              "className": "qx.bom.client.Event"
            },
            "event.dispatchevent": {
              "className": "qx.bom.client.Event"
            },
            "qx.debug.touchpad.detection": {},
            "os.name": {
              "className": "qx.bom.client.OperatingSystem"
            },
            "os.version": {
              "className": "qx.bom.client.OperatingSystem"
            }
          }
        }
      },
      "qx.event.type.Swipe": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.type.Pointer": {
            "load": true
          }
        },
        "extends": "qx.event.type.Pointer",
        "include": [],
        "implement": []
      },
      "qx.event.type.Rotate": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.type.Pointer": {
            "load": true
          }
        },
        "extends": "qx.event.type.Pointer",
        "include": [],
        "implement": []
      },
      "qx.event.type.Pinch": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.type.Pointer": {
            "load": true
          }
        },
        "extends": "qx.event.type.Pointer",
        "include": [],
        "implement": []
      },
      "qx.event.type.Track": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.type.Pointer": {
            "load": true
          }
        },
        "extends": "qx.event.type.Pointer",
        "include": [],
        "implement": []
      },
      "qx.event.type.Roll": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.type.Pointer": {
            "load": true
          },
          "qx.event.Registration": {},
          "qx.event.handler.Gesture": {}
        },
        "extends": "qx.event.type.Pointer",
        "include": [],
        "implement": []
      },
      "qx.bom.client.Event": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.Engine": {},
          "qx.bom.Event": {},
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [
            "event.touch",
            "event.mouseevent",
            "event.mousecreateevent",
            "event.dispatchevent",
            "event.customevent",
            "event.mspointer",
            "event.help",
            "event.hashchange",
            "event.mousewheel",
            "event.auxclick"
          ],
          "required": {}
        },
        "hasDefer": true
      },
      "qx.bom.client.Stylesheet": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.Stylesheet": {},
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [
            "html.stylesheet.createstylesheet",
            "html.stylesheet.insertrule",
            "html.stylesheet.deleterule",
            "html.stylesheet.addimport",
            "html.stylesheet.removeimport"
          ],
          "required": {}
        },
        "hasDefer": true
      },
      "qx.util.Uri": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {},
          "qx.lang.Type": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {}
          }
        }
      },
      "qx.dev.Debug": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.log.Logger": {},
          "qx.lang.Object": {},
          "qx.lang.Type": {},
          "qx.data.IListData": {},
          "qx.lang.String": {},
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.ObjectRegistry": {},
          "qx.ui.core.queue.Dispose": {},
          "qx.event.IEventHandler": {},
          "qx.Interface": {},
          "qx.ui.decoration.IDecorator": {},
          "qx.theme.manager.Decoration": {},
          "qx.bom.Font": {},
          "qx.theme.manager.Font": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug.dispose": {
              "load": true
            }
          }
        }
      },
      "qx.event.Manager": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.bom.Event": {
            "require": true,
            "construct": true
          },
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "construct": true
          },
          "qx.core.Environment": {
            "construct": true
          },
          "qx.event.GlobalError": {
            "construct": true
          },
          "qx.util.DeferredCall": {
            "construct": true
          },
          "qx.log.Logger": {},
          "qx.core.Assert": {},
          "qx.event.IEventHandler": {},
          "qx.lang.Array": {},
          "qx.event.type.Event": {},
          "qx.event.Pool": {},
          "qx.util.DisposeUtil": {}
        },
        "extends": "Object",
        "include": [],
        "implement": [
          "qx.core.IDisposable"
        ],
        "environment": {
          "provided": [],
          "required": {
            "qx.globalErrorHandling": {
              "construct": true,
              "className": "qx.event.GlobalError"
            },
            "qx.debug": {}
          }
        }
      },
      "qx.event.type.Event": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.event.Registration": {},
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Assert": {
            "load": true
          },
          "qx.event.Pool": {},
          "qx.promise": {
            "load": true
          },
          "qx.Promise": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {},
            "qx.promise": {
              "load": true
            }
          }
        }
      },
      "qx.Promise": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.core.Assert": {
            "construct": true
          },
          "qx.data.Array": {},
          "qx.core.Environment": {
            "load": true,
            "defer": "load",
            "usage": "dynamic"
          },
          "qx.bom.Event": {},
          "qx.log.Logger": {},
          "qx.event.GlobalError": {},
          "qx.lang.Array": {},
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [
            "qx.promise.warnings",
            "qx.promise.longStackTraces"
          ],
          "required": {
            "qx.promise.warnings": {},
            "qx.promise.longStackTraces": {},
            "qx.promise": {},
            "qx.debug": {
              "load": true,
              "defer": true
            }
          }
        },
        "hasDefer": true
      },
      "qx.event.IEventDispatcher": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Interface": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.type.Event": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.promise": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.Promise": {
            "construct": true
          },
          "qx.core.Assert": {
            "construct": true
          },
          "qx.data.Array": {},
          "qx.core.Environment": {
            "load": true,
            "defer": "load",
            "usage": "dynamic"
          },
          "qx.bom.Event": {},
          "qx.log.Logger": {},
          "qx.event.GlobalError": {},
          "qx.lang.Array": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [
            "qx.promise.warnings",
            "qx.promise.longStackTraces"
          ],
          "required": {
            "qx.promise.warnings": {},
            "qx.promise.longStackTraces": {},
            "qx.promise": {},
            "qx.debug": {
              "load": true,
              "defer": true
            }
          }
        },
        "hasDefer": true
      },
      "qx.event.type.Mouse": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.type.Dom": {
            "load": true
          },
          "qx.core.Environment": {},
          "qx.bom.client.Browser": {},
          "qx.bom.client.Engine": {},
          "qx.dom.Node": {},
          "qx.bom.Viewport": {}
        },
        "extends": "qx.event.type.Dom",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "browser.name": {
              "className": "qx.bom.client.Browser"
            },
            "browser.documentmode": {
              "className": "qx.bom.client.Browser"
            },
            "engine.name": {
              "className": "qx.bom.client.Engine"
            }
          }
        }
      },
      "qx.data.MBinding": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.data.SingleValueBinding": {},
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.Promise": {},
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.promise": {
              "load": true
            }
          }
        }
      },
      "qx.core.MLogging": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.log.Logger": {
            "load": true
          },
          "qx.lang.Array": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.core.MEvent": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.event.dispatch.Direct": {},
          "qx.event.handler.Object": {},
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.Registration": {
            "load": true
          },
          "qx.event.type.Data": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.core.MProperty": {
        "mtime": "2017-06-01T09:03:46.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Property": {},
          "qx.Bootstrap": {},
          "qx.core.Environment": {},
          "qx.core.Assert": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {}
          }
        }
      },
      "qx.core.MAssert": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.core.Assert": {
            "require": true
          },
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.util.DisposeUtil": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.ObjectRegistry": {},
          "qx.core.Environment": {},
          "qx.ui.mobile.core.Widget": {},
          "qx.core.Assert": {},
          "qx.ui.mobile.container.Composite": {},
          "qx.ui.container.Composite": {},
          "qx.ui.container.Scroll": {},
          "qx.ui.container.SlideBar": {},
          "qx.ui.container.Stack": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {}
          }
        }
      },
      "qx.type.BaseString": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.core.ObjectRegistry": {},
          "qx.core.Object": {},
          "qx.core.Environment": {
            "load": true,
            "defer": "load",
            "usage": "dynamic"
          },
          "qx.core.MAssert": {
            "load": true,
            "defer": "load"
          }
        },
        "extends": "Object",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {
              "load": true,
              "defer": true
            }
          }
        },
        "hasDefer": true
      },
      "qx.data.Array": {
        "mtime": "2017-06-01T09:03:46.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.data.marshal.MEventBubbling": {
            "load": true
          },
          "qx.data.IListData": {
            "load": true
          },
          "qx.lang.Array": {
            "construct": true
          },
          "qx.core.Environment": {
            "construct": true,
            "load": true
          },
          "qx.core.Assert": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [
          "qx.data.marshal.MEventBubbling"
        ],
        "implement": [
          "qx.data.IListData"
        ],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {
              "construct": true
            }
          }
        }
      },
      "qx.ui.layout.Atom": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.layout.Abstract": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.layout.Util": {},
          "qx.ui.basic.Label": {}
        },
        "extends": "qx.ui.layout.Abstract",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {
              "load": true
            }
          }
        }
      },
      "qx.ui.basic.Label": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.Widget": {
            "load": true,
            "construct": true
          },
          "qx.ui.form.IStringForm": {
            "load": true
          },
          "qx.core.Environment": {
            "construct": true,
            "load": true,
            "usage": "dynamic"
          },
          "qx.locale.Manager": {
            "construct": true
          },
          "qx.bom.client.Css": {},
          "qx.bom.client.Html": {},
          "qx.html.Label": {},
          "qx.theme.manager.Color": {},
          "qx.theme.manager.Font": {},
          "qx.bom.webfonts.WebFont": {},
          "qx.bom.Font": {},
          "qx.ui.core.queue.Layout": {},
          "qx.bom.Label": {},
          "qx.bom.client.OperatingSystem": {},
          "qx.bom.client.Engine": {},
          "qx.bom.client.Browser": {},
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.core.Widget",
        "include": [],
        "implement": [
          "qx.ui.form.IStringForm"
        ],
        "environment": {
          "provided": [],
          "required": {
            "qx.dynlocale": {
              "construct": true,
              "load": true
            },
            "css.textoverflow": {
              "className": "qx.bom.client.Css"
            },
            "html.xul": {
              "className": "qx.bom.client.Html"
            },
            "qx.debug": {},
            "os.name": {
              "className": "qx.bom.client.OperatingSystem"
            },
            "engine.name": {
              "className": "qx.bom.client.Engine"
            },
            "engine.version": {
              "className": "qx.bom.client.Engine"
            },
            "browser.name": {
              "className": "qx.bom.client.Browser"
            },
            "browser.version": {
              "className": "qx.bom.client.Browser"
            }
          }
        }
      },
      "qx.ui.basic.Image": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.Widget": {
            "load": true,
            "construct": true
          },
          "qx.util.AliasManager": {},
          "qx.theme.manager.Color": {},
          "qx.io.ImageLoader": {},
          "qx.lang.String": {},
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.Css": {},
          "qx.html.Image": {},
          "qx.html.Label": {},
          "qx.html.Element": {},
          "qx.util.ResourceManager": {},
          "qx.bom.client.Engine": {
            "load": true
          },
          "qx.bom.client.Browser": {},
          "qx.bom.element.Decoration": {},
          "qx.bom.AnimationFrame": {},
          "qx.theme.manager.Font": {},
          "qx.lang.Object": {},
          "qx.theme.manager.Decoration": {},
          "qx.bom.client.Device": {},
          "qx.ui.core.queue.Layout": {},
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.core.Widget",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "css.alphaimageloaderneeded": {
              "className": "qx.bom.client.Css"
            },
            "engine.name": {
              "className": "qx.bom.client.Engine",
              "load": true
            },
            "engine.version": {
              "className": "qx.bom.client.Engine"
            },
            "browser.documentmode": {
              "className": "qx.bom.client.Browser"
            },
            "qx.debug": {}
          }
        }
      },
      "qx.util.PropertyUtil": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {},
          "qx.core.Property": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.form.IStringForm": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Interface": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.form.IForm": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Interface": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.form.MForm": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "construct": true,
            "load": true,
            "usage": "dynamic"
          },
          "qx.locale.Manager": {
            "construct": true
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.dynlocale": {
              "construct": true,
              "load": true
            }
          }
        }
      },
      "qx.theme.manager.Color": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.util.ValueManager": {
            "load": true
          },
          "qx.util.ColorUtil": {},
          "qx.core.Object": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.util.ValueManager",
        "include": [],
        "implement": []
      },
      "qx.html.Input": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.html.Element": {
            "load": true,
            "construct": true
          },
          "qx.bom.Input": {},
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.Engine": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.html.Element",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "className": "qx.bom.client.Engine",
              "load": true
            }
          }
        }
      },
      "qx.util.ResourceManager": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.core.Environment": {
            "load": true,
            "defer": "load",
            "usage": "dynamic"
          },
          "qx.bom.client.Engine": {
            "load": true,
            "defer": "load"
          },
          "qx.bom.client.Transport": {
            "load": true,
            "defer": "load"
          },
          "qx.util.LibraryManager": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "className": "qx.bom.client.Engine",
              "load": true,
              "defer": true
            },
            "io.ssl": {
              "className": "qx.bom.client.Transport",
              "load": true,
              "defer": true
            }
          }
        },
        "hasDefer": true
      },
      "qx.theme.manager.Font": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.util.ValueManager": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.bom.Font": {},
          "qx.lang.Object": {},
          "qx.bom.webfonts.WebFont": {},
          "qx.core.Object": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          }
        },
        "extends": "qx.util.ValueManager",
        "include": [],
        "implement": [
          "qx.core.IDisposable"
        ]
      },
      "qx.bom.webfonts.WebFont": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.Font": {
            "load": true
          },
          "qx.bom.webfonts.Manager": {},
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.bom.Font",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {}
          }
        }
      },
      "qx.bom.Font": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.lang.String": {},
          "qx.theme.manager.Color": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": []
      },
      "qx.html.Element": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.module.Animation": {
            "require": true
          },
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.log.Logger": {},
          "qx.bom.Element": {},
          "qx.dom.Hierarchy": {},
          "qx.bom.client.Engine": {},
          "qx.bom.element.Scroll": {},
          "qx.bom.Selection": {},
          "qx.event.handler.Appear": {},
          "qx.event.Registration": {},
          "qx.event.handler.Focus": {},
          "qx.event.dispatch.MouseCapture": {},
          "qx.core.Assert": {},
          "qx.dom.Element": {},
          "qx.bom.element.Attribute": {},
          "qx.bom.element.Style": {},
          "qx.lang.Array": {},
          "qx.bom.client.Css": {},
          "qx.event.Manager": {},
          "qx.util.DeferredCall": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.util.DeferredCallManager": {
            "load": true
          },
          "qx.lang.Function": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.core.IDisposable"
        ],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {},
            "engine.name": {
              "className": "qx.bom.client.Engine"
            },
            "css.userselect": {
              "className": "qx.bom.client.Css"
            },
            "css.userselect.none": {
              "className": "qx.bom.client.Css"
            }
          }
        },
        "hasDefer": true
      },
      "qx.bom.Label": {
        "mtime": "2017-06-01T09:03:46.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.dom.Element": {},
          "qx.core.Environment": {},
          "qx.bom.client.Css": {},
          "qx.bom.client.Html": {},
          "qx.bom.element.Style": {},
          "qx.core.Assert": {},
          "qx.bom.element.Attribute": {},
          "qx.bom.element.Dimension": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "css.textoverflow": {
              "className": "qx.bom.client.Css"
            },
            "html.xul": {
              "className": "qx.bom.client.Html"
            },
            "qx.debug": {}
          }
        }
      },
      "qx.html.Label": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.html.Element": {
            "load": true
          },
          "qx.bom.Label": {},
          "qx.core.Object": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.html.Element",
        "include": [],
        "implement": []
      },
      "qx.core.AssertionError": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.type.BaseError": {
            "load": true,
            "construct": true
          },
          "qx.dev.StackTrace": {
            "construct": true
          }
        },
        "extends": "qx.type.BaseError",
        "include": [],
        "implement": []
      },
      "qx.lang.Json": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {},
          "qx.bom.client.Runtime": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "runtime.name": {
              "className": "qx.bom.client.Runtime"
            }
          }
        },
        "unresolved": [
          {
            "name": "_isProperty.call",
            "locations": [
              {
                "start": {
                  "line": 486,
                  "column": 12
                },
                "end": {
                  "line": 486,
                  "column": 27
                }
              },
              {
                "start": {
                  "line": 520,
                  "column": 62
                },
                "end": {
                  "line": 520,
                  "column": 77
                }
              },
              {
                "start": {
                  "line": 520,
                  "column": 127
                },
                "end": {
                  "line": 520,
                  "column": 142
                }
              },
              {
                "start": {
                  "line": 530,
                  "column": 61
                },
                "end": {
                  "line": 530,
                  "column": 76
                }
              },
              {
                "start": {
                  "line": 536,
                  "column": 31
                },
                "end": {
                  "line": 536,
                  "column": 46
                }
              },
              {
                "start": {
                  "line": 610,
                  "column": 41
                },
                "end": {
                  "line": 610,
                  "column": 56
                }
              },
              {
                "start": {
                  "line": 654,
                  "column": 145
                },
                "end": {
                  "line": 654,
                  "column": 160
                }
              }
            ]
          },
          {
            "name": "Symbol.iterator",
            "locations": [],
            "load": true,
            "defer": false
          }
        ]
      },
      "com.zenesis.qx.upload.AbstractHandler": {
        "mtime": "2016-02-15T09:51:11.000Z",
        "libraryName": "com.zenesis.qx.upload",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.core.Assert": {
            "construct": true
          },
          "qx.lang.Type": {},
          "qx.log.Logger": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": []
      },
      "com.zenesis.qx.upload.File": {
        "mtime": "2016-02-15T09:51:11.000Z",
        "libraryName": "com.zenesis.qx.upload",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.core.Assert": {
            "construct": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": []
      },
      "qx.bom.client.EcmaScript": {
        "mtime": "2017-06-01T09:03:46.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [
            "ecmascript.array.indexof",
            "ecmascript.array.lastindexof",
            "ecmascript.array.foreach",
            "ecmascript.array.filter",
            "ecmascript.array.map",
            "ecmascript.array.some",
            "ecmascript.array.find",
            "ecmascript.array.findIndex",
            "ecmascript.array.every",
            "ecmascript.array.reduce",
            "ecmascript.array.reduceright",
            "ecmascript.date.now",
            "ecmascript.date.parse",
            "ecmascript.error.toString",
            "ecmascript.error.stacktrace",
            "ecmascript.function.bind",
            "ecmascript.object.keys",
            "ecmascript.string.startsWith",
            "ecmascript.string.endsWith",
            "ecmascript.string.trim",
            "ecmascript.function.async",
            "ecmascript.mutationobserver",
            "ecmascript.promise.native"
          ],
          "required": {}
        },
        "hasDefer": true
      },
      "qx.bom.Style": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.lang.String": {
            "require": true
          },
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.dom.Node": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "hasDefer": true
      },
      "qx.theme.manager.Decoration": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.core.Environment": {
            "construct": true,
            "load": true
          },
          "qx.bom.client.Engine": {
            "construct": true
          },
          "qx.bom.client.Browser": {
            "construct": true
          },
          "qx.lang.Type": {},
          "qx.ui.style.Stylesheet": {},
          "qx.Bootstrap": {},
          "qx.lang.Object": {},
          "qx.ui.decoration.Decorator": {},
          "qx.ui.decoration.IDecorator": {},
          "qx.util.AliasManager": {},
          "qx.core.ObjectRegistry": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.core.IDisposable"
        ],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "construct": true,
              "className": "qx.bom.client.Engine"
            },
            "browser.documentmode": {
              "construct": true,
              "className": "qx.bom.client.Browser"
            }
          }
        }
      },
      "qx.theme.manager.Icon": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.util.AliasManager": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": []
      },
      "qx.theme.manager.Appearance": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.lang.Array": {},
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {}
          }
        }
      },
      "qx.event.Timer": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.Assert": {},
          "qx.event.GlobalError": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.ObjectRegistry": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.core.IDisposable"
        ],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {}
          }
        }
      },
      "qx.ui.tooltip.ToolTip": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.popup.Popup": {
            "load": true,
            "construct": true
          },
          "qx.ui.layout.HBox": {
            "construct": true
          },
          "qx.ui.basic.Atom": {},
          "qx.ui.basic.Image": {},
          "qx.ui.container.Composite": {
            "load": true
          },
          "qx.ui.core.Widget": {
            "load": true
          },
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.popup.Popup",
        "include": [],
        "implement": []
      },
      "qx.bom.AnimationFrame": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.lang.normalize.Date": {
            "require": true
          },
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.Emitter": {
            "load": true
          },
          "qx.core.Environment": {},
          "qx.bom.client.CssAnimation": {}
        },
        "extends": "qx.event.Emitter",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "css.animation.requestframe": {
              "className": "qx.bom.client.CssAnimation"
            }
          }
        },
        "hasDefer": true,
        "unresolved": [
          {
            "name": "performance.now",
            "locations": [
              {
                "start": {
                  "line": 85,
                  "column": 41
                },
                "end": {
                  "line": 85,
                  "column": 56
                }
              },
              {
                "start": {
                  "line": 85,
                  "column": 61
                },
                "end": {
                  "line": 85,
                  "column": 76
                }
              }
            ]
          },
          {
            "name": "performance.timing",
            "locations": [
              {
                "start": {
                  "line": 202,
                  "column": 44
                },
                "end": {
                  "line": 202,
                  "column": 62
                }
              },
              {
                "start": {
                  "line": 202,
                  "column": 66
                },
                "end": {
                  "line": 202,
                  "column": 84
                }
              }
            ]
          },
          {
            "name": "performance.timing.navigationStart",
            "locations": [
              {
                "start": {
                  "line": 202,
                  "column": 66
                },
                "end": {
                  "line": 202,
                  "column": 100
                }
              }
            ]
          }
        ]
      },
      "qx.ui.core.queue.Widget": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.lang.Array": {},
          "qx.lang.Object": {},
          "qx.ui.core.queue.Manager": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.core.queue.Visibility": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.lang.Array": {},
          "qx.ui.core.queue.Manager": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.core.queue.Appearance": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.lang.Array": {},
          "qx.ui.core.queue.Manager": {},
          "qx.ui.core.queue.Visibility": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.core.queue.Dispose": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.lang.Array": {},
          "qx.ui.core.queue.Manager": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.core.MChildrenHandling": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.core.MBlocker": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.Blocker": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.window.MDesktop": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.window.Window": {},
          "qx.Class": {},
          "qx.lang.Array": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.bom.element.Cursor": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.element.Style": {},
          "qx.core.Environment": {
            "load": true,
            "defer": "load",
            "usage": "dynamic"
          },
          "qx.bom.client.Engine": {
            "load": true,
            "defer": "load"
          },
          "qx.bom.client.Browser": {
            "load": true,
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.Engine"
            },
            "engine.version": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.Engine"
            },
            "browser.documentmode": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.Browser"
            },
            "browser.quirksmode": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.Browser"
            }
          }
        },
        "hasDefer": true
      },
      "qx.ui.layout.Abstract": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.LayoutItem": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {
              "load": true
            }
          }
        }
      },
      "qx.ui.layout.Util": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.theme.manager.Decoration": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.bom.element.Location": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.element.Style": {},
          "qx.dom.Node": {},
          "qx.bom.Viewport": {},
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.Engine": {
            "load": true
          },
          "qx.bom.client.Browser": {},
          "qx.bom.element.BoxSizing": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "load": true,
              "className": "qx.bom.client.Engine"
            },
            "browser.quirksmode": {
              "className": "qx.bom.client.Browser"
            }
          }
        }
      },
      "qx.ui.core.EventHandler": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.event.IEventHandler": {
            "load": true
          },
          "qx.event.Registration": {
            "construct": true,
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.ui.core.Widget": {},
          "qx.event.type.Event": {},
          "qx.event.Pool": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.event.IEventHandler"
        ],
        "hasDefer": true
      },
      "qx.event.handler.DragDrop": {
        "mtime": "2017-06-01T08:57:27.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.event.handler.Gesture": {
            "require": true
          },
          "qx.event.handler.Keyboard": {
            "require": true
          },
          "qx.event.handler.Capture": {
            "require": true
          },
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.event.IEventHandler": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.event.Registration": {
            "construct": true,
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.event.type.Drag": {},
          "qx.ui.core.Widget": {},
          "qx.ui.core.DragDropCursor": {},
          "qx.bom.element.Style": {},
          "qx.event.Timer": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.event.IEventHandler",
          "qx.core.IDisposable"
        ],
        "hasDefer": true
      },
      "qx.ui.core.LayoutItem": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.core.Environment": {
            "construct": true,
            "load": true,
            "usage": "dynamic"
          },
          "qx.theme.manager.Meta": {
            "construct": true
          },
          "qx.util.PropertyUtil": {},
          "qx.ui.core.queue.Layout": {},
          "qx.core.Init": {},
          "qx.ui.core.queue.Visibility": {},
          "qx.lang.Object": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.dyntheme": {
              "construct": true,
              "load": true
            },
            "qx.debug": {}
          }
        }
      },
      "qx.util.ObjectPool": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.core.IDisposable"
        ]
      },
      "qx.lang.Object": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.lang.normalize.Object": {
            "require": true
          },
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {},
          "qx.core.Assert": {},
          "qx.lang.Type": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {}
          }
        }
      },
      "qx.ui.root.Inline": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.event.handler.ElementResize": {},
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.root.Abstract": {
            "load": true,
            "construct": true
          },
          "qx.ui.core.MLayoutHandling": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.core.Environment": {
            "construct": true,
            "load": true
          },
          "qx.ui.layout.Basic": {
            "construct": true
          },
          "qx.ui.core.queue.Layout": {
            "construct": true
          },
          "qx.ui.core.FocusHandler": {
            "construct": true,
            "load": true
          },
          "qx.bom.client.Engine": {
            "construct": true
          },
          "qx.dom.Node": {
            "construct": true
          },
          "qx.event.Registration": {
            "construct": true
          },
          "qx.bom.element.Dimension": {},
          "qx.bom.element.Style": {},
          "qx.html.Root": {},
          "qx.event.Timer": {},
          "qx.ui.popup.Manager": {},
          "qx.ui.menu.Manager": {},
          "qx.ui.core.Widget": {
            "load": true
          },
          "qx.ui.core.queue.Visibility": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          }
        },
        "extends": "qx.ui.root.Abstract",
        "include": [
          "qx.ui.core.MLayoutHandling"
        ],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {
              "construct": true
            },
            "engine.name": {
              "construct": true,
              "className": "qx.bom.client.Engine"
            }
          }
        },
        "hasDefer": true
      },
      "qx.event.dispatch.MouseCapture": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.event.handler.Focus": {},
          "qx.event.handler.Window": {},
          "qx.event.handler.Capture": {},
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.dispatch.AbstractBubbling": {
            "load": true,
            "construct": true
          },
          "qx.event.Registration": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.dom.Hierarchy": {},
          "qx.bom.Event": {},
          "qx.event.type.Event": {},
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.Engine": {
            "load": true
          },
          "qx.bom.client.Browser": {
            "load": true
          },
          "qx.bom.client.OperatingSystem": {
            "load": true
          }
        },
        "extends": "qx.event.dispatch.AbstractBubbling",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "load": true,
              "className": "qx.bom.client.Engine"
            },
            "browser.documentmode": {
              "load": true,
              "className": "qx.bom.client.Browser"
            },
            "os.version": {
              "load": true,
              "className": "qx.bom.client.OperatingSystem"
            }
          }
        },
        "hasDefer": true
      },
      "qx.ui.core.DragDropCursor": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.basic.Image": {
            "load": true,
            "construct": true
          },
          "qx.ui.core.MPlacement": {
            "load": true
          },
          "qx.ui.core.Widget": {
            "load": true
          },
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.basic.Image",
        "include": [
          "qx.ui.core.MPlacement"
        ],
        "implement": []
      },
      "qx.bom.Element": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.event.dispatch.Direct": {
            "require": true
          },
          "qx.event.dispatch.DomBubbling": {
            "require": true
          },
          "qx.event.handler.Keyboard": {
            "require": true
          },
          "qx.event.handler.Mouse": {
            "require": true
          },
          "qx.event.handler.Element": {
            "require": true
          },
          "qx.event.handler.Appear": {
            "require": true
          },
          "qx.event.handler.Touch": {
            "require": true
          },
          "qx.event.handler.Offline": {
            "require": true
          },
          "qx.event.handler.Input": {
            "require": true
          },
          "qx.event.handler.Pointer": {
            "require": true
          },
          "qx.event.handler.Gesture": {
            "require": true
          },
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.Registration": {},
          "qx.event.handler.Focus": {},
          "qx.event.dispatch.MouseCapture": {},
          "qx.core.Environment": {},
          "qx.bom.client.Engine": {},
          "qx.xml.Document": {},
          "qx.dom.Hierarchy": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "className": "qx.bom.client.Engine"
            }
          }
        }
      },
      "qx.ui.popup.Popup": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.container.Composite": {
            "load": true,
            "construct": true
          },
          "qx.ui.core.MPlacement": {
            "load": true
          },
          "qx.core.Init": {},
          "qx.ui.popup.Manager": {},
          "qx.ui.core.Widget": {
            "load": true
          },
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.container.Composite",
        "include": [
          "qx.ui.core.MPlacement"
        ],
        "implement": []
      },
      "qx.ui.menu.Menu": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.Widget": {
            "load": true,
            "construct": true
          },
          "qx.ui.core.MPlacement": {
            "load": true
          },
          "qx.ui.core.MRemoteChildrenHandling": {
            "load": true
          },
          "qx.ui.menu.Layout": {
            "construct": true
          },
          "qx.ui.core.Blocker": {
            "construct": true
          },
          "qx.ui.menu.Separator": {},
          "qx.ui.menu.Manager": {},
          "qx.ui.menu.AbstractButton": {},
          "qx.ui.menu.MenuSlideBar": {},
          "qx.ui.layout.Grow": {},
          "qx.lang.Array": {},
          "qx.ui.core.queue.Widget": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.core.Widget",
        "include": [
          "qx.ui.core.MPlacement",
          "qx.ui.core.MRemoteChildrenHandling"
        ],
        "implement": []
      },
      "qx.ui.menu.AbstractButton": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.Widget": {
            "load": true,
            "construct": true
          },
          "qx.ui.core.MExecutable": {
            "load": true
          },
          "qx.ui.form.IExecutable": {
            "load": true
          },
          "qx.ui.menu.ButtonLayout": {
            "construct": true
          },
          "qx.ui.basic.Image": {},
          "qx.ui.basic.Label": {},
          "qx.ui.menu.Manager": {},
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.locale.Manager": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.core.Widget",
        "include": [
          "qx.ui.core.MExecutable"
        ],
        "implement": [
          "qx.ui.form.IExecutable"
        ],
        "environment": {
          "provided": [],
          "required": {
            "qx.dynlocale": {
              "load": true
            }
          }
        }
      },
      "qx.ui.menubar.Button": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.form.MenuButton": {
            "load": true,
            "construct": true
          },
          "qx.ui.toolbar.ToolBar": {},
          "qx.ui.menu.Manager": {},
          "qx.ui.form.Button": {
            "load": true
          },
          "qx.ui.basic.Atom": {
            "load": true
          },
          "qx.ui.core.Widget": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.ui.layout.Atom": {
            "load": true
          },
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.form.MenuButton",
        "include": [],
        "implement": []
      },
      "qx.ui.menu.Button": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.menu.AbstractButton": {
            "load": true,
            "construct": true
          },
          "qx.ui.core.Widget": {
            "load": true
          },
          "qx.ui.menu.ButtonLayout": {
            "load": true
          },
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.menu.AbstractButton",
        "include": [],
        "implement": []
      },
      "qx.bom.Document": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.Engine": {
            "load": true
          },
          "qx.bom.Viewport": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "load": true,
              "className": "qx.bom.client.Engine"
            },
            "engine.version": {
              "className": "qx.bom.client.Engine"
            }
          }
        }
      },
      "qx.bom.element.Clip": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.lang.normalize.String": {
            "require": true
          },
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.element.Style": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.bom.element.Opacity": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.Engine": {
            "load": true
          },
          "qx.bom.client.Css": {},
          "qx.bom.element.Style": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "load": true,
              "className": "qx.bom.client.Engine"
            },
            "css.opacity": {
              "className": "qx.bom.client.Css"
            }
          }
        }
      },
      "qx.bom.element.BoxSizing": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {},
          "qx.bom.client.Css": {},
          "qx.bom.Style": {},
          "qx.log.Logger": {},
          "qx.bom.element.Style": {},
          "qx.bom.Document": {},
          "qx.dom.Node": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "css.boxsizing": {
              "className": "qx.bom.client.Css"
            },
            "qx.debug": {}
          }
        }
      },
      "qx.bom.element.Attribute": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.Engine": {
            "load": true
          },
          "qx.bom.client.Browser": {},
          "qx.lang.Type": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "html.element.textcontent": {
              "load": true
            },
            "engine.name": {
              "load": true,
              "className": "qx.bom.client.Engine"
            },
            "browser.documentmode": {
              "className": "qx.bom.client.Browser"
            }
          }
        }
      },
      "qx.util.RingBuffer": {
        "mtime": "2016-06-28T12:54:27.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": "Object",
        "include": [],
        "implement": []
      },
      "qx.bom.client.CssTransition": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.Style": {},
          "qx.bom.Event": {},
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [
            "css.transition"
          ],
          "required": {}
        },
        "hasDefer": true
      },
      "qx.core.WindowError": {
        "mtime": "2017-06-01T09:03:46.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": "Error",
        "include": [],
        "implement": []
      },
      "qx.core.GlobalError": {
        "mtime": "2017-06-01T09:03:46.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic",
            "construct": true
          },
          "qx.core.Assert": {
            "construct": true
          }
        },
        "extends": "Error",
        "include": [],
        "implement": []
      },
      "qx.event.type.Dom": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.type.Native": {
            "load": true
          },
          "qx.core.Environment": {},
          "qx.bom.client.OperatingSystem": {},
          "qx.bom.client.Engine": {}
        },
        "extends": "qx.event.type.Native",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "os.name": {
              "className": "qx.bom.client.OperatingSystem"
            },
            "engine.name": {
              "className": "qx.bom.client.Engine"
            }
          }
        }
      },
      "qx.event.dispatch.DomBubbling": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.dispatch.AbstractBubbling": {
            "load": true
          },
          "qx.event.Registration": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          }
        },
        "extends": "qx.event.dispatch.AbstractBubbling",
        "include": [],
        "implement": [],
        "hasDefer": true
      },
      "qx.application.Inline": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.core.Init": {
            "require": true
          },
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.application.AbstractGui": {
            "load": true
          },
          "qx.ui.root.Page": {}
        },
        "extends": "qx.application.AbstractGui",
        "include": [],
        "implement": []
      },
      "qx.bom.Selection": {
        "mtime": "2017-06-01T09:03:46.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.Html": {
            "load": true
          },
          "qx.dom.Node": {},
          "qx.bom.Range": {},
          "qx.util.StringSplit": {},
          "qx.bom.client.Engine": {},
          "qx.bom.Element": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "html.selection": {
              "load": true,
              "className": "qx.bom.client.Html"
            },
            "engine.name": {
              "className": "qx.bom.client.Engine"
            }
          }
        }
      },
      "qx.event.type.Focus": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.type.Event": {
            "load": true
          }
        },
        "extends": "qx.event.type.Event",
        "include": [],
        "implement": []
      },
      "qx.event.handler.PointerCore": {
        "mtime": "2017-06-01T09:03:46.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.bom.client.Event": {
            "require": true,
            "construct": true
          },
          "qx.bom.client.Device": {
            "require": true,
            "construct": true
          },
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic",
            "construct": true
          },
          "qx.bom.client.Engine": {
            "load": true,
            "construct": true
          },
          "qx.bom.client.Browser": {
            "load": true,
            "construct": true
          },
          "qx.lang.Function": {},
          "qx.dom.Node": {},
          "qx.event.Emitter": {},
          "qx.bom.Event": {},
          "qx.event.type.dom.Pointer": {},
          "qx.bom.client.OperatingSystem": {},
          "qx.lang.Array": {}
        },
        "extends": "Object",
        "include": [],
        "implement": [
          "qx.core.IDisposable"
        ],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "load": true,
              "className": "qx.bom.client.Engine",
              "construct": true
            },
            "browser.documentmode": {
              "load": true,
              "className": "qx.bom.client.Browser",
              "construct": true
            },
            "event.mspointer": {
              "construct": true,
              "className": "qx.bom.client.Event"
            },
            "device.touch": {
              "construct": true,
              "className": "qx.bom.client.Device"
            },
            "os.name": {
              "className": "qx.bom.client.OperatingSystem"
            },
            "event.dispatchevent": {
              "className": "qx.bom.client.Event"
            }
          }
        }
      },
      "qx.event.type.dom.Pointer": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.type.dom.Custom": {
            "load": true,
            "construct": true
          },
          "qx.dom.Node": {},
          "qx.bom.Viewport": {},
          "qx.core.Environment": {
            "load": true,
            "defer": "load",
            "usage": "dynamic"
          },
          "qx.bom.client.Event": {},
          "qx.bom.client.Engine": {
            "load": true,
            "defer": "load"
          },
          "qx.bom.client.OperatingSystem": {
            "load": true,
            "defer": "load"
          }
        },
        "extends": "qx.event.type.dom.Custom",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "event.mouseevent": {
              "className": "qx.bom.client.Event"
            },
            "event.mousecreateevent": {
              "className": "qx.bom.client.Event"
            },
            "engine.name": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.Engine"
            },
            "os.name": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.OperatingSystem"
            },
            "os.version": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.OperatingSystem"
            }
          }
        },
        "hasDefer": true
      },
      "qx.event.type.dom.Custom": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {},
          "qx.bom.client.Event": {},
          "qx.lang.Object": {}
        },
        "extends": "Object",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "event.customevent": {
              "className": "qx.bom.client.Event"
            }
          }
        }
      },
      "qx.util.Wheel": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {},
          "qx.log.Logger": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug.touchpad.detection": {}
          }
        }
      },
      "qx.ui.decoration.IDecorator": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Interface": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.util.DeferredCall": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.util.DeferredCallManager": {
            "require": true,
            "construct": true
          },
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {}
          }
        }
      },
      "qx.data.SingleValueBinding": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {},
          "qx.core.Assert": {},
          "qx.core.AssertionError": {},
          "qx.lang.String": {},
          "qx.lang.Function": {},
          "qx.data.IListData": {},
          "qx.core.ValidationError": {},
          "qx.log.Logger": {},
          "qx.lang.Type": {},
          "qx.lang.Array": {},
          "qx.core.ObjectRegistry": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {},
            "qx.debug.databinding": {}
          }
        }
      },
      "qx.event.handler.Object": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.event.IEventHandler": {
            "load": true
          },
          "qx.event.Registration": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.event.IEventHandler"
        ],
        "hasDefer": true
      },
      "qx.ui.mobile.core.Widget": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.ui.mobile.core.EventHandler": {},
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.locale.MTranslation": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.Assert": {},
          "qx.event.GlobalError": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.handler.Appear": {},
          "qx.ui.mobile.core.DomUpdatedHandler": {},
          "qx.dom.Element": {},
          "qx.lang.Array": {},
          "qx.ui.mobile.layout.Abstract": {},
          "qx.bom.client.CssTransform": {},
          "qx.bom.element.Style": {},
          "qx.bom.element.Attribute": {},
          "qx.bom.element.Class": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.event.Registration": {},
          "qx.bom.Lifecycle": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [
          "qx.locale.MTranslation"
        ],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {},
            "css.transform.3d": {
              "className": "qx.bom.client.CssTransform"
            }
          }
        },
        "hasDefer": true
      },
      "qx.ui.mobile.container.Composite": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.mobile.core.Widget": {
            "load": true,
            "construct": true
          },
          "qx.ui.mobile.core.MChildrenHandling": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.ui.mobile.core.MLayoutHandling": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.mobile.core.Widget",
        "include": [
          "qx.ui.mobile.core.MChildrenHandling",
          "qx.ui.mobile.core.MLayoutHandling"
        ],
        "implement": [],
        "hasDefer": true
      },
      "qx.ui.container.Composite": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.Widget": {
            "load": true,
            "construct": true
          },
          "qx.ui.core.MChildrenHandling": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.ui.core.MLayoutHandling": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.event.type.Data": {},
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.core.Widget",
        "include": [
          "qx.ui.core.MChildrenHandling",
          "qx.ui.core.MLayoutHandling"
        ],
        "implement": [],
        "hasDefer": true
      },
      "qx.ui.container.Scroll": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.scroll.AbstractScrollArea": {
            "load": true,
            "construct": true
          },
          "qx.ui.core.MContentPadding": {
            "load": true
          },
          "qx.ui.core.Widget": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.bom.client.Scroll": {
            "load": true
          },
          "qx.ui.layout.Canvas": {
            "load": true
          },
          "qx.ui.layout.Grid": {
            "load": true
          },
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.ui.layout.Abstract": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.core.scroll.AbstractScrollArea",
        "include": [
          "qx.ui.core.MContentPadding"
        ],
        "implement": []
      },
      "qx.ui.container.SlideBar": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.Widget": {
            "load": true,
            "construct": true
          },
          "qx.ui.core.MRemoteChildrenHandling": {
            "load": true
          },
          "qx.ui.core.MRemoteLayoutHandling": {
            "load": true
          },
          "qx.ui.form.RepeatButton": {},
          "qx.ui.container.Composite": {},
          "qx.ui.core.scroll.ScrollPane": {},
          "qx.ui.layout.HBox": {},
          "qx.ui.layout.VBox": {},
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.core.Widget",
        "include": [
          "qx.ui.core.MRemoteChildrenHandling",
          "qx.ui.core.MRemoteLayoutHandling"
        ],
        "implement": []
      },
      "qx.ui.container.Stack": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.Widget": {
            "load": true,
            "construct": true
          },
          "qx.ui.core.ISingleSelection": {
            "load": true
          },
          "qx.ui.core.MSingleSelectionHandling": {
            "load": true
          },
          "qx.ui.core.MChildrenHandling": {
            "load": true
          },
          "qx.ui.layout.Grow": {
            "construct": true
          },
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.core.Widget",
        "include": [
          "qx.ui.core.MSingleSelectionHandling",
          "qx.ui.core.MChildrenHandling"
        ],
        "implement": [
          "qx.ui.core.ISingleSelection"
        ]
      },
      "qx.data.marshal.MEventBubbling": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {},
          "qx.Class": {},
          "qx.lang.Function": {},
          "qx.data.IListData": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.util.AliasManager": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.util.ValueManager": {
            "load": true,
            "construct": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.util.ValueManager",
        "include": [],
        "implement": []
      },
      "qx.io.ImageLoader": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.lang.Type": {},
          "qx.lang.Function": {},
          "qx.core.Environment": {},
          "qx.event.GlobalError": {},
          "qx.bom.client.Engine": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.globalErrorHandling": {
              "className": "qx.event.GlobalError"
            }
          }
        }
      },
      "qx.html.Image": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.html.Element": {
            "load": true
          },
          "qx.bom.element.Decoration": {},
          "qx.core.Environment": {
            "load": true
          },
          "qx.bom.client.Engine": {},
          "qx.core.Object": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.html.Element",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "className": "qx.bom.client.Engine"
            }
          }
        }
      },
      "qx.bom.element.Decoration": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.Engine": {
            "load": true
          },
          "qx.util.ResourceManager": {},
          "qx.bom.element.Style": {},
          "qx.bom.client.Css": {},
          "qx.theme.manager.Font": {},
          "qx.lang.Object": {},
          "qx.bom.Style": {},
          "qx.core.Assert": {},
          "qx.io.ImageLoader": {},
          "qx.log.Logger": {},
          "qx.bom.element.Background": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "load": true,
              "className": "qx.bom.client.Engine"
            },
            "css.alphaimageloaderneeded": {
              "className": "qx.bom.client.Css"
            },
            "qx.debug": {}
          }
        }
      },
      "qx.util.ValueManager": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": []
      },
      "qx.util.ColorUtil": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.Class": {},
          "qx.theme.manager.Color": {},
          "qx.lang.String": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.bom.Input": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.lang.Array": {
            "require": true
          },
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Assert": {},
          "qx.lang.Object": {},
          "qx.dom.Element": {},
          "qx.lang.Type": {},
          "qx.bom.client.Engine": {
            "load": true
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {},
            "engine.name": {
              "className": "qx.bom.client.Engine",
              "load": true
            }
          }
        }
      },
      "qx.bom.client.Transport": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.Engine": {},
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [
            "io.maxrequests",
            "io.ssl",
            "io.xhr"
          ],
          "required": {}
        },
        "hasDefer": true
      },
      "qx.util.LibraryManager": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": []
      },
      "qx.bom.webfonts.Manager": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.util.ResourceManager": {},
          "qx.core.Environment": {
            "load": true
          },
          "qx.bom.client.Engine": {},
          "qx.bom.client.Browser": {},
          "qx.event.Timer": {},
          "qx.lang.Array": {},
          "qx.bom.client.OperatingSystem": {},
          "qx.bom.Stylesheet": {},
          "qx.bom.webfonts.Validator": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "className": "qx.bom.client.Engine"
            },
            "engine.version": {
              "className": "qx.bom.client.Engine"
            },
            "browser.documentmode": {
              "className": "qx.bom.client.Browser"
            },
            "browser.name": {
              "className": "qx.bom.client.Browser"
            },
            "browser.version": {
              "className": "qx.bom.client.Browser"
            },
            "os.name": {
              "className": "qx.bom.client.OperatingSystem"
            },
            "os.version": {
              "className": "qx.bom.client.OperatingSystem"
            },
            "qx.debug": {}
          }
        }
      },
      "qx.module.Animation": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.module.Css": {
            "require": true
          },
          "qx.module.Event": {
            "require": true
          },
          "qx.module.Environment": {
            "require": true
          },
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.element.Animation": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "hasDefer": true
      },
      "qx.bom.element.Scroll": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.element.Style": {},
          "qx.core.Environment": {},
          "qx.bom.client.Engine": {},
          "qx.dom.Node": {},
          "qx.bom.Viewport": {},
          "qx.bom.element.Location": {},
          "qx.event.Registration": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "className": "qx.bom.client.Engine"
            }
          }
        }
      },
      "qx.event.handler.Appear": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.event.IEventHandler": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.event.Registration": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.bom.client.Engine": {},
          "qx.bom.client.Browser": {}
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.event.IEventHandler",
          "qx.core.IDisposable"
        ],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "className": "qx.bom.client.Engine"
            },
            "browser.documentmode": {
              "className": "qx.bom.client.Browser"
            }
          }
        },
        "hasDefer": true
      },
      "qx.bom.element.Dimension": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.element.Style": {},
          "qx.core.Environment": {},
          "qx.bom.client.Engine": {},
          "qx.dom.Node": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "className": "qx.bom.client.Engine"
            }
          }
        }
      },
      "qx.type.BaseError": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": "Error",
        "include": [],
        "implement": []
      },
      "qx.bom.client.Runtime": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.Browser": {},
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [
            "runtime.name"
          ],
          "required": {}
        },
        "hasDefer": true,
        "unresolved": [
          {
            "name": "Titanium.userAgent",
            "locations": [
              {
                "start": {
                  "line": 53,
                  "column": 15
                },
                "end": {
                  "line": 53,
                  "column": 33
                }
              }
            ]
          }
        ]
      },
      "qx.ui.decoration.Decorator": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.decoration.Abstract": {
            "load": true
          },
          "qx.ui.decoration.IDecorator": {
            "load": true
          },
          "qx.ui.decoration.MBackgroundColor": {
            "load": true
          },
          "qx.ui.decoration.MBorderRadius": {
            "load": true
          },
          "qx.ui.decoration.MBoxShadow": {
            "load": true
          },
          "qx.ui.decoration.MDoubleBorder": {
            "load": true
          },
          "qx.ui.decoration.MLinearBackgroundGradient": {
            "load": true
          },
          "qx.ui.decoration.MBorderImage": {
            "load": true
          },
          "qx.ui.decoration.MTransition": {
            "load": true
          },
          "qx.lang.String": {},
          "qx.lang.Type": {}
        },
        "extends": "qx.ui.decoration.Abstract",
        "include": [
          "qx.ui.decoration.MBackgroundColor",
          "qx.ui.decoration.MBorderRadius",
          "qx.ui.decoration.MBoxShadow",
          "qx.ui.decoration.MDoubleBorder",
          "qx.ui.decoration.MLinearBackgroundGradient",
          "qx.ui.decoration.MBorderImage",
          "qx.ui.decoration.MTransition"
        ],
        "implement": [
          "qx.ui.decoration.IDecorator"
        ]
      },
      "qx.ui.layout.HBox": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.layout.Abstract": {
            "load": true,
            "construct": true
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.layout.Util": {},
          "qx.theme.manager.Decoration": {}
        },
        "extends": "qx.ui.layout.Abstract",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {
              "load": true
            }
          }
        }
      },
      "qx.event.Emitter": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": "Object",
        "include": [],
        "implement": []
      },
      "qx.bom.client.CssAnimation": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.bom.Stylesheet": {
            "require": true
          },
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.Style": {},
          "qx.bom.Event": {},
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [
            "css.animation",
            "css.animation.requestframe"
          ],
          "required": {}
        },
        "hasDefer": true
      },
      "qx.ui.core.Blocker": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic",
            "construct": true
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.ui.root.Abstract": {
            "construct": true
          },
          "qx.core.Environment": {
            "construct": true,
            "load": true,
            "usage": "dynamic"
          },
          "qx.theme.manager.Meta": {
            "construct": true
          },
          "qx.theme.manager.Color": {},
          "qx.event.Registration": {},
          "qx.event.handler.Focus": {},
          "qx.ui.core.Widget": {},
          "qx.html.Blocker": {},
          "qx.event.type.Event": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.dyntheme": {
              "construct": true,
              "load": true
            }
          }
        }
      },
      "qx.ui.window.Window": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.Widget": {
            "load": true,
            "construct": true
          },
          "qx.ui.core.MRemoteChildrenHandling": {
            "load": true
          },
          "qx.ui.core.MRemoteLayoutHandling": {
            "load": true
          },
          "qx.ui.core.MResizable": {
            "load": true
          },
          "qx.ui.core.MMovable": {
            "load": true
          },
          "qx.ui.core.MContentPadding": {
            "load": true
          },
          "qx.ui.layout.VBox": {
            "construct": true
          },
          "qx.core.Init": {
            "construct": true
          },
          "qx.ui.core.FocusHandler": {
            "construct": true
          },
          "qx.ui.window.Manager": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.ui.window.IDesktop": {},
          "qx.ui.container.Composite": {},
          "qx.ui.layout.HBox": {},
          "qx.ui.basic.Label": {},
          "qx.ui.layout.Grid": {},
          "qx.ui.basic.Image": {},
          "qx.ui.form.Button": {},
          "qx.event.type.Event": {},
          "qx.bom.client.Engine": {},
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.event.Registration": {
            "load": true
          },
          "qx.event.handler.DragDrop": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.core.Widget",
        "include": [
          "qx.ui.core.MRemoteChildrenHandling",
          "qx.ui.core.MRemoteLayoutHandling",
          "qx.ui.core.MResizable",
          "qx.ui.core.MMovable",
          "qx.ui.core.MContentPadding"
        ],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {},
            "engine.name": {
              "className": "qx.bom.client.Engine"
            }
          }
        }
      },
      "qx.event.handler.Capture": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.event.IEventHandler": {
            "load": true
          },
          "qx.event.Registration": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.event.IEventHandler"
        ],
        "hasDefer": true
      },
      "qx.event.type.Drag": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.type.Event": {
            "load": true
          },
          "qx.dom.Node": {},
          "qx.bom.Viewport": {},
          "qx.event.Registration": {},
          "qx.event.handler.DragDrop": {}
        },
        "extends": "qx.event.type.Event",
        "include": [],
        "implement": []
      },
      "qx.event.handler.ElementResize": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.event.IEventHandler": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.event.Timer": {
            "construct": true
          },
          "qx.event.Registration": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.bom.element.Dimension": {},
          "qx.lang.Object": {},
          "qx.event.type.Data": {},
          "qx.core.Environment": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.event.IEventHandler",
          "qx.core.IDisposable"
        ],
        "hasDefer": true
      },
      "qx.ui.core.MLayoutHandling": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.layout.Basic": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.layout.Abstract": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": "qx.ui.layout.Abstract",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {
              "load": true
            }
          }
        }
      },
      "qx.event.dispatch.AbstractBubbling": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.event.IEventDispatcher": {
            "load": true
          },
          "qx.event.type.Event": {},
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.event.IEventDispatcher"
        ],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {}
          }
        }
      },
      "qx.ui.core.MPlacement": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.lang.Function": {},
          "qx.event.Idle": {},
          "qx.bom.element.Location": {},
          "qx.util.placement.Placement": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.event.handler.Mouse": {
        "mtime": "2017-06-01T09:03:46.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.event.handler.UserAction": {
            "require": true
          },
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.event.IEventHandler": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.event.Registration": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.OperatingSystem": {
            "load": true
          },
          "qx.bom.Event": {},
          "qx.event.type.MouseWheel": {},
          "qx.event.type.Mouse": {},
          "qx.event.type.Data": {},
          "qx.lang.Function": {},
          "qx.bom.client.Event": {},
          "qx.event.GlobalError": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.Engine": {
            "load": true
          },
          "qx.event.handler.DragDrop": {},
          "qx.dom.Hierarchy": {},
          "qx.core.ObjectRegistry": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.event.IEventHandler",
          "qx.core.IDisposable"
        ],
        "environment": {
          "provided": [],
          "required": {
            "os.name": {
              "load": true,
              "className": "qx.bom.client.OperatingSystem"
            },
            "engine.name": {
              "className": "qx.bom.client.Engine",
              "load": true
            }
          }
        },
        "hasDefer": true
      },
      "qx.event.handler.Element": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.event.IEventHandler": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.event.Registration": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.lang.Function": {},
          "qx.bom.Event": {},
          "qx.event.GlobalError": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.type.Native": {},
          "qx.core.Environment": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.event.IEventHandler",
          "qx.core.IDisposable"
        ],
        "hasDefer": true
      },
      "qx.event.handler.Touch": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.event.handler.UserAction": {
            "require": true
          },
          "qx.event.handler.Orientation": {
            "require": true
          },
          "qx.event.type.Tap": {
            "require": true
          },
          "qx.event.type.Swipe": {
            "require": true
          },
          "qx.event.type.Track": {
            "require": true
          },
          "qx.event.type.Rotate": {
            "require": true
          },
          "qx.event.type.Pinch": {
            "require": true
          },
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.handler.TouchCore": {
            "load": true,
            "construct": true
          },
          "qx.event.IEventHandler": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.event.Registration": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.event.type.Touch": {},
          "qx.event.type.Data": {},
          "qx.event.GlobalError": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "defer": "load",
            "usage": "dynamic"
          },
          "qx.bom.client.Event": {
            "load": true,
            "defer": "load"
          }
        },
        "extends": "qx.event.handler.TouchCore",
        "include": [],
        "implement": [
          "qx.event.IEventHandler",
          "qx.core.IDisposable"
        ],
        "environment": {
          "provided": [],
          "required": {
            "event.touch": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.Event"
            }
          }
        },
        "hasDefer": true
      },
      "qx.event.handler.Offline": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.event.IEventHandler": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.event.Registration": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.lang.Function": {},
          "qx.bom.Event": {},
          "qx.event.GlobalError": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.type.Event": {},
          "qx.event.handler.Appear": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.event.IEventHandler",
          "qx.core.IDisposable"
        ],
        "hasDefer": true
      },
      "qx.xml.Document": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "defer": "load",
            "usage": "dynamic"
          },
          "qx.bom.client.Plugin": {
            "load": true,
            "defer": "load"
          },
          "qx.bom.client.Xml": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "plugin.activex": {
              "className": "qx.bom.client.Plugin",
              "load": true,
              "defer": true
            },
            "xml.implementation": {
              "className": "qx.bom.client.Xml"
            },
            "xml.domparser": {
              "className": "qx.bom.client.Xml"
            }
          }
        },
        "hasDefer": true
      },
      "qx.ui.core.MRemoteChildrenHandling": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.menu.Layout": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.layout.VBox": {
            "load": true
          },
          "qx.lang.Array": {},
          "qx.ui.layout.Abstract": {
            "load": true
          }
        },
        "extends": "qx.ui.layout.VBox",
        "include": [],
        "implement": []
      },
      "qx.ui.menu.Separator": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.Widget": {
            "load": true
          },
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.core.Widget",
        "include": [],
        "implement": []
      },
      "qx.ui.menu.MenuSlideBar": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.container.SlideBar": {
            "load": true,
            "construct": true
          },
          "qx.ui.form.HoverButton": {},
          "qx.ui.core.Widget": {
            "load": true
          },
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.container.SlideBar",
        "include": [],
        "implement": []
      },
      "qx.ui.layout.Grow": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.layout.Abstract": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": "qx.ui.layout.Abstract",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {
              "load": true
            }
          }
        }
      },
      "qx.ui.menu.ButtonLayout": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.layout.Abstract": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.lang.Array": {},
          "qx.ui.layout.Util": {},
          "qx.ui.menu.Menu": {}
        },
        "extends": "qx.ui.layout.Abstract",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {
              "load": true
            }
          }
        }
      },
      "qx.ui.form.MenuButton": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.form.Button": {
            "load": true,
            "construct": true
          },
          "qx.ui.menu.Manager": {},
          "qx.ui.basic.Atom": {
            "load": true
          },
          "qx.ui.core.Widget": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.ui.layout.Atom": {
            "load": true
          },
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.form.Button",
        "include": [],
        "implement": []
      },
      "qx.ui.toolbar.ToolBar": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.Widget": {
            "load": true,
            "construct": true
          },
          "qx.ui.core.MChildrenHandling": {
            "load": true
          },
          "qx.ui.layout.HBox": {
            "construct": true
          },
          "qx.util.PropertyUtil": {},
          "qx.ui.core.Spacer": {},
          "qx.ui.toolbar.Separator": {},
          "qx.ui.menubar.Button": {},
          "qx.ui.toolbar.Part": {},
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.core.Widget",
        "include": [
          "qx.ui.core.MChildrenHandling"
        ],
        "implement": []
      },
      "qx.ui.root.Page": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.root.Abstract": {
            "load": true,
            "construct": true
          },
          "qx.ui.layout.Basic": {
            "construct": true
          },
          "qx.ui.core.queue.Layout": {
            "construct": true
          },
          "qx.ui.core.FocusHandler": {
            "construct": true,
            "load": true
          },
          "qx.core.Environment": {
            "construct": true,
            "load": true
          },
          "qx.bom.client.Engine": {
            "construct": true
          },
          "qx.html.Root": {},
          "qx.bom.Document": {},
          "qx.ui.core.Widget": {
            "load": true
          },
          "qx.ui.core.queue.Visibility": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          }
        },
        "extends": "qx.ui.root.Abstract",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "construct": true,
              "className": "qx.bom.client.Engine"
            }
          }
        }
      },
      "qx.bom.Range": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.Html": {
            "load": true
          },
          "qx.dom.Node": {},
          "qx.bom.Selection": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "html.selection": {
              "load": true,
              "className": "qx.bom.client.Html"
            }
          }
        }
      },
      "qx.util.StringSplit": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.util.DeferredCallManager": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.lang.Function": {
            "construct": true
          },
          "qx.lang.Object": {},
          "qx.event.GlobalError": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.core.IDisposable"
        ]
      },
      "qx.core.ValidationError": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.type.BaseError": {
            "load": true
          }
        },
        "extends": "qx.type.BaseError",
        "include": [],
        "implement": []
      },
      "qx.ui.mobile.core.EventHandler": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.event.handler.Touch": {
            "require": true
          },
          "qx.event.handler.Pointer": {
            "require": true
          },
          "qx.event.dispatch.DomBubbling": {
            "require": true
          },
          "qx.ui.mobile.core.Widget": {
            "require": true
          },
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.event.IEventHandler": {
            "load": true
          },
          "qx.event.Registration": {
            "construct": true,
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.bom.Viewport": {},
          "qx.bom.element.Attribute": {},
          "qx.bom.element.Class": {},
          "qx.event.handler.GestureCore": {},
          "qx.event.type.Event": {},
          "qx.event.Pool": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.event.IEventHandler"
        ],
        "hasDefer": true
      },
      "qx.ui.mobile.core.DomUpdatedHandler": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.event.IEventHandler": {
            "load": true
          },
          "qx.event.Registration": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.ui.mobile.core.Widget": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.event.IEventHandler"
        ],
        "hasDefer": true
      },
      "qx.ui.mobile.layout.Abstract": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {}
          }
        }
      },
      "qx.bom.client.CssTransform": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.Style": {},
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [
            "css.transform",
            "css.transform.3d"
          ],
          "required": {}
        },
        "hasDefer": true
      },
      "qx.bom.element.Class": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.Html": {
            "load": true
          },
          "qx.log.Logger": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "html.classlist": {
              "load": true,
              "className": "qx.bom.client.Html"
            },
            "qx.debug": {}
          }
        }
      },
      "qx.bom.Lifecycle": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.event.Registration": {
            "require": true
          },
          "qx.event.handler.Application": {
            "require": true
          },
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.mobile.core.MChildrenHandling": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.mobile.core.MLayoutHandling": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.core.scroll.AbstractScrollArea": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.Widget": {
            "load": true,
            "construct": true
          },
          "qx.ui.core.scroll.MScrollBarFactory": {
            "load": true
          },
          "qx.ui.core.scroll.MRoll": {
            "load": true
          },
          "qx.ui.core.MDragDropScrolling": {
            "load": true
          },
          "qx.core.Environment": {
            "construct": true,
            "load": true
          },
          "qx.bom.client.Scroll": {
            "construct": true
          },
          "qx.ui.layout.Canvas": {
            "construct": true
          },
          "qx.ui.layout.Grid": {
            "construct": true
          },
          "qx.ui.core.scroll.ScrollPane": {},
          "qx.ui.core.queue.Manager": {},
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.ui.core.DragDropScrolling": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.core.Widget",
        "include": [
          "qx.ui.core.scroll.MScrollBarFactory",
          "qx.ui.core.scroll.MRoll",
          "qx.ui.core.MDragDropScrolling"
        ],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "os.scrollBarOverlayed": {
              "construct": true,
              "className": "qx.bom.client.Scroll"
            }
          }
        }
      },
      "qx.ui.core.MContentPadding": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.core.MRemoteLayoutHandling": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.form.RepeatButton": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.form.Button": {
            "load": true,
            "construct": true
          },
          "qx.event.AcceleratingTimer": {
            "construct": true
          },
          "qx.ui.basic.Atom": {
            "load": true
          },
          "qx.ui.core.Widget": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.ui.layout.Atom": {
            "load": true
          },
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.form.Button",
        "include": [],
        "implement": []
      },
      "qx.ui.core.scroll.ScrollPane": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.Widget": {
            "load": true,
            "construct": true
          },
          "qx.ui.layout.Grow": {
            "construct": true
          },
          "qx.bom.AnimationFrame": {},
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.core.Widget",
        "include": [],
        "implement": []
      },
      "qx.ui.layout.VBox": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.layout.Abstract": {
            "load": true,
            "construct": true
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.layout.Util": {},
          "qx.theme.manager.Decoration": {}
        },
        "extends": "qx.ui.layout.Abstract",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {
              "load": true
            }
          }
        }
      },
      "qx.ui.core.ISingleSelection": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Interface": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.core.MSingleSelectionHandling": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.SingleSelectionManager": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.bom.element.Background": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {},
          "qx.bom.client.Engine": {},
          "qx.lang.String": {},
          "qx.util.ResourceManager": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "className": "qx.bom.client.Engine"
            },
            "engine.version": {
              "className": "qx.bom.client.Engine"
            }
          }
        }
      },
      "qx.bom.webfonts.Validator": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.event.Timer": {},
          "qx.bom.element.Dimension": {},
          "qx.lang.Object": {},
          "qx.bom.element.Style": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": []
      },
      "qx.module.Css": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.dom.Node": {},
          "qx.bom.element.Dimension": {},
          "qx.bom.Document": {},
          "qx.bom.Viewport": {},
          "qx.bom.Stylesheet": {},
          "qx.bom.element.Location": {},
          "qx.lang.String": {},
          "qx.bom.element.Style": {},
          "qx.bom.element.Class": {},
          "qxWeb": {
            "load": true,
            "defer": "load"
          },
          "qx.bom.Selector": {
            "load": true
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "hasDefer": true
      },
      "qx.module.Event": {
        "mtime": "2017-06-01T09:03:46.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.module.Polyfill": {
            "require": true
          },
          "qx.module.Environment": {
            "require": true
          },
          "qx.module.event.PointerHandler": {},
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qxWeb": {
            "load": true,
            "defer": "load"
          },
          "qx.bom.Event": {},
          "qx.lang.Type": {},
          "qx.lang.Array": {},
          "qx.event.Emitter": {},
          "qx.bom.Selector": {
            "load": true
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "hasDefer": true
      },
      "qx.module.Environment": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "defer": "load",
            "usage": "dynamic"
          },
          "qx.bom.client.Browser": {
            "load": true,
            "defer": "load"
          },
          "qx.bom.client.Engine": {
            "load": true,
            "defer": "load"
          },
          "qx.bom.client.Device": {
            "load": true,
            "defer": "load"
          },
          "qx.bom.client.Event": {
            "load": true,
            "defer": "load"
          },
          "qxWeb": {
            "load": true,
            "defer": "load"
          },
          "qx.bom.Selector": {
            "load": true
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "browser.name": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.Browser"
            },
            "browser.version": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.Browser"
            },
            "browser.quirksmode": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.Browser"
            },
            "browser.documentmode": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.Browser"
            },
            "engine.name": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.Engine"
            },
            "engine.version": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.Engine"
            },
            "device.name": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.Device"
            },
            "device.type": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.Device"
            },
            "event.touch": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.Event"
            },
            "event.mspointer": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.Event"
            }
          }
        },
        "hasDefer": true
      },
      "qx.bom.element.Animation": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {},
          "qx.bom.client.CssAnimation": {},
          "qx.bom.element.AnimationCss": {},
          "qx.bom.element.AnimationJs": {},
          "qx.lang.String": {},
          "qx.bom.Style": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "css.animation": {
              "className": "qx.bom.client.CssAnimation"
            }
          }
        }
      },
      "qxWeb": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic",
            "construct": true
          },
          "qx.type.BaseArray": {
            "load": true
          },
          "qx.lang.Array": {},
          "qx.core.Environment": {},
          "qx.bom.Selector": {
            "construct": true
          },
          "qx.lang.Type": {}
        },
        "extends": "qx.type.BaseArray",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {}
          }
        },
        "hasDefer": true
      },
      "qx.ui.decoration.Abstract": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.ui.decoration.IDecorator": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.ui.decoration.IDecorator"
        ]
      },
      "qx.ui.decoration.MBackgroundColor": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {},
          "qx.theme.manager.Color": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.theme": {},
            "qx.debug": {}
          }
        }
      },
      "qx.ui.decoration.MBorderRadius": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {},
          "qx.bom.client.Engine": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "className": "qx.bom.client.Engine"
            },
            "qx.debug": {}
          }
        }
      },
      "qx.ui.decoration.MBoxShadow": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {},
          "qx.bom.client.Css": {},
          "qx.bom.Style": {},
          "qx.theme.manager.Color": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "css.boxshadow": {
              "className": "qx.bom.client.Css"
            },
            "qx.theme": {},
            "qx.debug": {}
          }
        }
      },
      "qx.ui.decoration.MDoubleBorder": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.decoration.MSingleBorder": {
            "load": true
          },
          "qx.ui.decoration.MBackgroundImage": {
            "load": true
          },
          "qx.core.Environment": {},
          "qx.bom.client.Css": {},
          "qx.theme.manager.Color": {},
          "qx.bom.Style": {},
          "qx.log.Logger": {},
          "qx.util.ColorUtil": {}
        },
        "extends": null,
        "include": [
          "qx.ui.decoration.MSingleBorder",
          "qx.ui.decoration.MBackgroundImage"
        ],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "css.boxshadow": {
              "className": "qx.bom.client.Css"
            },
            "qx.theme": {},
            "css.boxsizing": {
              "className": "qx.bom.client.Css"
            },
            "css.borderradius": {
              "className": "qx.bom.client.Css"
            },
            "css.rgba": {
              "className": "qx.bom.client.Css"
            },
            "qx.debug": {}
          }
        }
      },
      "qx.ui.decoration.MLinearBackgroundGradient": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {},
          "qx.bom.client.Css": {},
          "qx.lang.Type": {},
          "qx.util.ColorUtil": {},
          "qx.theme.manager.Color": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "css.gradient.legacywebkit": {
              "className": "qx.bom.client.Css"
            },
            "css.gradient.filter": {
              "className": "qx.bom.client.Css"
            },
            "css.gradient.linear": {
              "className": "qx.bom.client.Css"
            },
            "css.borderradius": {
              "className": "qx.bom.client.Css"
            },
            "qx.theme": {},
            "qx.debug": {}
          }
        }
      },
      "qx.ui.decoration.MBorderImage": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.util.AliasManager": {},
          "qx.util.ResourceManager": {},
          "qx.core.Environment": {},
          "qx.bom.client.Css": {},
          "qx.bom.Style": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "css.borderimage.standardsyntax": {
              "className": "qx.bom.client.Css"
            },
            "qx.debug": {}
          }
        }
      },
      "qx.ui.decoration.MTransition": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {},
          "qx.bom.client.CssTransition": {},
          "qx.bom.Style": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "css.transition": {
              "className": "qx.bom.client.CssTransition"
            },
            "qx.debug": {}
          }
        }
      },
      "qx.html.Blocker": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.html.Element": {
            "load": true,
            "construct": true
          },
          "qx.theme.manager.Color": {
            "construct": true
          },
          "qx.core.Environment": {
            "construct": true,
            "load": true
          },
          "qx.bom.client.Engine": {
            "construct": true
          },
          "qx.util.ResourceManager": {
            "construct": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.html.Element",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "construct": true,
              "className": "qx.bom.client.Engine"
            }
          }
        }
      },
      "qx.ui.core.MResizable": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.Registration": {
            "construct": true
          },
          "qx.event.handler.DragDrop": {
            "construct": true
          },
          "qx.ui.core.Widget": {},
          "qx.core.Init": {},
          "qx.lang.Object": {},
          "qx.core.ObjectRegistry": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.core.MMovable": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.Widget": {},
          "qx.core.Init": {},
          "qx.Class": {},
          "qx.ui.window.IDesktop": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.window.Manager": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.ui.window.IWindowManager": {
            "load": true
          },
          "qx.ui.core.queue.Widget": {},
          "qx.lang.Array": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.ui.window.IWindowManager"
        ]
      },
      "qx.ui.window.IDesktop": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Interface": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.window.IWindowManager": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.layout.Grid": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.layout.Abstract": {
            "load": true,
            "construct": true
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.lang.Object": {},
          "qx.ui.layout.Util": {}
        },
        "extends": "qx.ui.layout.Abstract",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {
              "load": true
            }
          }
        }
      },
      "qx.event.Idle": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.event.Timer": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.core.IDisposable"
        ]
      },
      "qx.util.placement.Placement": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.util.placement.DirectAxis": {
            "construct": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.Assert": {},
          "qx.util.placement.KeepAlignAxis": {},
          "qx.util.placement.BestFitAxis": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {}
          }
        }
      },
      "qx.event.type.MouseWheel": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.type.Mouse": {
            "load": true
          },
          "qx.util.Wheel": {}
        },
        "extends": "qx.event.type.Mouse",
        "include": [],
        "implement": []
      },
      "qx.event.handler.Orientation": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.event.IEventHandler": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.event.Registration": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.lang.Function": {},
          "qx.bom.Event": {},
          "qx.event.GlobalError": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.bom.client.OperatingSystem": {},
          "qx.bom.Viewport": {},
          "qx.event.type.Orientation": {},
          "qx.core.ObjectRegistry": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.event.IEventHandler",
          "qx.core.IDisposable"
        ],
        "environment": {
          "provided": [],
          "required": {
            "os.name": {
              "className": "qx.bom.client.OperatingSystem"
            }
          }
        },
        "hasDefer": true
      },
      "qx.event.handler.TouchCore": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.OperatingSystem": {
            "load": true
          },
          "qx.lang.Function": {},
          "qx.bom.client.Event": {},
          "qx.bom.client.Engine": {},
          "qx.bom.Event": {},
          "qx.bom.element.Style": {}
        },
        "extends": "Object",
        "include": [],
        "implement": [
          "qx.core.IDisposable"
        ],
        "environment": {
          "provided": [],
          "required": {
            "os.name": {
              "load": true,
              "className": "qx.bom.client.OperatingSystem"
            },
            "event.mspointer": {
              "className": "qx.bom.client.Event"
            },
            "engine.version": {
              "className": "qx.bom.client.Engine"
            },
            "engine.name": {
              "className": "qx.bom.client.Engine"
            }
          }
        }
      },
      "qx.event.type.Touch": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.type.Dom": {
            "load": true
          }
        },
        "extends": "qx.event.type.Dom",
        "include": [],
        "implement": []
      },
      "qx.bom.client.Plugin": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.Engine": {},
          "qx.bom.client.Browser": {},
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [
            "plugin.gears",
            "plugin.quicktime",
            "plugin.quicktime.version",
            "plugin.windowsmedia",
            "plugin.windowsmedia.version",
            "plugin.divx",
            "plugin.divx.version",
            "plugin.silverlight",
            "plugin.silverlight.version",
            "plugin.pdf",
            "plugin.pdf.version",
            "plugin.activex",
            "plugin.skype"
          ],
          "required": {}
        },
        "hasDefer": true
      },
      "qx.bom.client.Xml": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.xml.Document": {},
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [
            "xml.implementation",
            "xml.domparser",
            "xml.selectsinglenode",
            "xml.selectnodes",
            "xml.getelementsbytagnamens",
            "xml.domproperties",
            "xml.attributens",
            "xml.createelementns",
            "xml.createnode",
            "xml.getqualifieditem"
          ],
          "required": {}
        },
        "hasDefer": true
      },
      "qx.ui.form.HoverButton": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.basic.Atom": {
            "load": true,
            "construct": true
          },
          "qx.ui.core.MExecutable": {
            "load": true
          },
          "qx.ui.form.IExecutable": {
            "load": true
          },
          "qx.event.AcceleratingTimer": {
            "construct": true
          },
          "qx.ui.core.Widget": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.ui.layout.Atom": {
            "load": true
          },
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.basic.Atom",
        "include": [
          "qx.ui.core.MExecutable"
        ],
        "implement": [
          "qx.ui.form.IExecutable"
        ]
      },
      "qx.ui.core.Spacer": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.LayoutItem": {
            "load": true,
            "construct": true
          },
          "qx.ui.core.queue.Dispose": {},
          "qx.core.Object": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.core.LayoutItem",
        "include": [],
        "implement": []
      },
      "qx.ui.toolbar.Separator": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.Widget": {
            "load": true
          },
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.core.Widget",
        "include": [],
        "implement": []
      },
      "qx.ui.toolbar.Part": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.Widget": {
            "load": true,
            "construct": true
          },
          "qx.ui.core.MRemoteChildrenHandling": {
            "load": true
          },
          "qx.ui.layout.HBox": {
            "construct": true
          },
          "qx.ui.basic.Image": {},
          "qx.ui.toolbar.PartContainer": {},
          "qx.ui.toolbar.Separator": {},
          "qx.ui.menubar.Button": {},
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.core.Widget",
        "include": [
          "qx.ui.core.MRemoteChildrenHandling"
        ],
        "implement": []
      },
      "qx.ui.core.scroll.MScrollBarFactory": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.scroll.NativeScrollBar": {},
          "qx.ui.core.scroll.ScrollBar": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [
            "qx.nativeScrollBars"
          ],
          "required": {
            "qx.nativeScrollBars": {}
          }
        }
      },
      "qx.ui.core.scroll.MRoll": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.core.MDragDropScrolling": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.DragDropScrolling": {
            "construct": true
          },
          "qx.Class": {},
          "qx.ui.core.scroll.MScrollBarFactory": {},
          "qx.ui.core.Widget": {},
          "qx.event.Timer": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.bom.client.Scroll": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.element.Scroll": {},
          "qx.bom.client.OperatingSystem": {},
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.bom.client.Browser": {},
          "qx.bom.client.Event": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [
            "os.scrollBarOverlayed",
            "qx.mobile.nativescroll"
          ],
          "required": {
            "qx.nativeScrollBars": {},
            "os.name": {
              "className": "qx.bom.client.OperatingSystem"
            },
            "browser.version": {
              "className": "qx.bom.client.Browser"
            },
            "browser.name": {
              "className": "qx.bom.client.Browser"
            },
            "os.version": {
              "className": "qx.bom.client.OperatingSystem"
            },
            "event.mspointer": {
              "className": "qx.bom.client.Event"
            }
          }
        },
        "hasDefer": true
      },
      "qx.event.AcceleratingTimer": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.event.Timer": {
            "construct": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [
          "qx.core.IDisposable"
        ]
      },
      "qx.ui.core.SingleSelectionManager": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.core.Environment": {
            "construct": true,
            "load": true
          },
          "qx.core.Assert": {
            "construct": true
          },
          "qx.ui.core.ISingleSelectionProvider": {
            "construct": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {
              "construct": true
            }
          }
        }
      },
      "qx.module.Polyfill": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.lang.normalize.Function": {
            "require": true
          },
          "qx.lang.normalize.String": {
            "require": true
          },
          "qx.lang.normalize.Date": {
            "require": true
          },
          "qx.lang.normalize.Array": {
            "require": true
          },
          "qx.lang.normalize.Error": {
            "require": true
          },
          "qx.lang.normalize.Object": {
            "require": true
          },
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.module.event.PointerHandler": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.module.Event": {
            "require": true
          },
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {},
          "qx.bom.client.Event": {},
          "qx.event.Emitter": {},
          "qx.event.handler.PointerCore": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "event.dispatchevent": {
              "className": "qx.bom.client.Event"
            }
          }
        },
        "hasDefer": true
      },
      "qx.bom.element.AnimationCss": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic",
            "defer": "load"
          },
          "qx.bom.client.CssAnimation": {
            "load": true
          },
          "qx.bom.Stylesheet": {},
          "qx.bom.Event": {},
          "qx.bom.element.Style": {},
          "qx.log.Logger": {},
          "qx.lang.String": {},
          "qx.bom.element.AnimationHandle": {},
          "qx.bom.element.Transform": {},
          "qx.bom.Style": {},
          "qx.bom.client.OperatingSystem": {
            "load": true,
            "defer": "load"
          }
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "css.animation": {
              "load": true,
              "className": "qx.bom.client.CssAnimation"
            },
            "qx.debug": {
              "load": true
            },
            "os.name": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.OperatingSystem"
            },
            "os.version": {
              "load": true,
              "defer": true,
              "className": "qx.bom.client.OperatingSystem"
            }
          }
        },
        "hasDefer": true
      },
      "qx.bom.element.AnimationJs": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.lang.Object": {},
          "qx.bom.element.AnimationHandle": {},
          "qx.bom.Style": {},
          "qx.bom.element.Transform": {},
          "qx.util.ColorUtil": {},
          "qx.bom.AnimationFrame": {},
          "qx.bom.element.Style": {},
          "qx.lang.String": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.type.BaseArray": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.bom.client.Engine": {
            "require": true
          },
          "qx.lang.normalize.Array": {
            "require": true
          },
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {}
        },
        "extends": "Array",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "className": "qx.bom.client.Engine"
            }
          }
        }
      },
      "qx.bom.Selector": {
        "mtime": "2017-05-26T11:07:45.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.decoration.MSingleBorder": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {},
          "qx.theme.manager.Color": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.theme": {},
            "qx.debug": {}
          }
        }
      },
      "qx.ui.decoration.MBackgroundImage": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Mixin": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.lang.Type": {},
          "qx.util.AliasManager": {},
          "qx.util.ResourceManager": {},
          "qx.core.Environment": {},
          "qx.bom.client.Engine": {},
          "qx.bom.client.Browser": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "qx.debug": {},
            "engine.name": {
              "className": "qx.bom.client.Engine"
            },
            "browser.documentmode": {
              "className": "qx.bom.client.Browser"
            }
          }
        }
      },
      "qx.ui.window.IWindowManager": {
        "mtime": "2017-03-03T10:00:43.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Interface": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.window.IDesktop": {},
          "qx.ui.window.Window": {}
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.util.placement.DirectAxis": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.util.placement.AbstractAxis": {
            "load": true
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.util.placement.KeepAlignAxis": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.util.placement.AbstractAxis": {
            "load": true
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.util.placement.BestFitAxis": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.util.placement.AbstractAxis": {
            "load": true
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.event.type.Orientation": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.type.Event": {
            "load": true
          }
        },
        "extends": "qx.event.type.Event",
        "include": [],
        "implement": []
      },
      "qx.ui.toolbar.PartContainer": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.container.Composite": {
            "load": true,
            "construct": true
          },
          "qx.ui.layout.HBox": {
            "construct": true
          },
          "qx.ui.core.Widget": {
            "load": true
          },
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.container.Composite",
        "include": [],
        "implement": []
      },
      "qx.ui.core.scroll.NativeScrollBar": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.Widget": {
            "load": true,
            "construct": true
          },
          "qx.ui.core.scroll.IScrollBar": {
            "load": true
          },
          "qx.html.Element": {},
          "qx.bom.element.Scroll": {},
          "qx.ui.core.queue.Layout": {},
          "qx.core.Environment": {
            "load": true
          },
          "qx.bom.client.Engine": {},
          "qx.bom.client.Browser": {},
          "qx.bom.AnimationFrame": {},
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.core.Widget",
        "include": [],
        "implement": [
          "qx.ui.core.scroll.IScrollBar"
        ],
        "environment": {
          "provided": [],
          "required": {
            "engine.name": {
              "className": "qx.bom.client.Engine"
            },
            "browser.name": {
              "className": "qx.bom.client.Browser"
            }
          }
        }
      },
      "qx.ui.core.scroll.ScrollBar": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.Widget": {
            "load": true,
            "construct": true
          },
          "qx.ui.core.scroll.IScrollBar": {
            "load": true
          },
          "qx.ui.core.scroll.ScrollSlider": {},
          "qx.ui.form.RepeatButton": {},
          "qx.ui.layout.HBox": {},
          "qx.ui.layout.VBox": {},
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.core.Widget",
        "include": [],
        "implement": [
          "qx.ui.core.scroll.IScrollBar"
        ]
      },
      "qx.ui.core.DragDropScrolling": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Object": {
            "load": true,
            "construct": true
          },
          "qx.ui.core.MDragDropScrolling": {
            "load": true
          },
          "qx.core.Init": {},
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          },
          "qx.ui.core.DragDropScrolling": {
            "load": true
          }
        },
        "extends": "qx.core.Object",
        "include": [
          "qx.ui.core.MDragDropScrolling"
        ],
        "implement": []
      },
      "qx.ui.core.ISingleSelectionProvider": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Interface": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.bom.element.AnimationHandle": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.event.Emitter": {
            "load": true
          },
          "qx.core.Environment": {
            "construct": true
          },
          "qx.bom.client.CssAnimation": {
            "construct": true
          },
          "qx.bom.element.AnimationJs": {}
        },
        "extends": "qx.event.Emitter",
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "css.animation": {
              "construct": true,
              "className": "qx.bom.client.CssAnimation"
            }
          }
        }
      },
      "qx.bom.element.Transform": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.core.Environment": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.bom.client.CssTransform": {
            "load": true
          },
          "qx.bom.Style": {}
        },
        "extends": null,
        "include": [],
        "implement": [],
        "environment": {
          "provided": [],
          "required": {
            "css.transform": {
              "load": true,
              "className": "qx.bom.client.CssTransform"
            },
            "css.transform.3d": {
              "className": "qx.bom.client.CssTransform"
            }
          }
        }
      },
      "qx.util.placement.AbstractAxis": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Bootstrap": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": "Object",
        "include": [],
        "implement": []
      },
      "qx.ui.core.scroll.IScrollBar": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Interface": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.core.scroll.ScrollSlider": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.form.Slider": {
            "load": true,
            "construct": true
          },
          "qx.ui.core.Widget": {
            "load": true
          },
          "qx.ui.layout.Canvas": {
            "load": true
          },
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.form.Slider",
        "include": [],
        "implement": []
      },
      "qx.ui.form.Slider": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Class": {
            "load": true,
            "usage": "dynamic"
          },
          "qx.ui.core.Widget": {
            "load": true,
            "construct": true
          },
          "qx.ui.form.IForm": {
            "load": true
          },
          "qx.ui.form.INumberForm": {
            "load": true
          },
          "qx.ui.form.IRange": {
            "load": true
          },
          "qx.ui.form.MForm": {
            "load": true
          },
          "qx.ui.layout.Canvas": {
            "construct": true
          },
          "qx.theme.manager.Decoration": {},
          "qx.bom.element.Location": {},
          "qx.event.Timer": {},
          "qx.bom.AnimationFrame": {},
          "qx.event.type.Data": {},
          "qx.ui.core.LayoutItem": {
            "load": true
          },
          "qx.core.Environment": {
            "load": true
          },
          "qx.locale.Manager": {
            "load": true
          },
          "qx.core.Object": {
            "load": true
          },
          "qx.theme.manager.Meta": {
            "load": true
          },
          "qx.core.ObjectRegistry": {
            "load": true
          },
          "qx.core.IDisposable": {
            "load": true
          }
        },
        "extends": "qx.ui.core.Widget",
        "include": [
          "qx.ui.form.MForm"
        ],
        "implement": [
          "qx.ui.form.IForm",
          "qx.ui.form.INumberForm",
          "qx.ui.form.IRange"
        ]
      },
      "qx.ui.form.INumberForm": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Interface": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      },
      "qx.ui.form.IRange": {
        "mtime": "2016-08-31T11:40:33.000Z",
        "libraryName": "qx",
        "dependsOn": {
          "qx.Interface": {
            "load": true,
            "usage": "dynamic"
          }
        },
        "extends": null,
        "include": [],
        "implement": []
      }
    }
  }