function inc(pa) { document.write("<script type=\"text/javascript\" src=\"../../script/" + pa + ".js\"></script>"); };

// Core
inc("core/QxExtend");
inc("core/QxObject");
inc("core/QxClient");
inc("core/QxDom");
inc("core/QxDebug");
inc("core/QxTarget");
inc("core/QxApplication");
inc("core/QxClientWindow");

// Basic Types
inc("types/QxVariable");
inc("types/QxString");
inc("types/QxNumber");
inc("types/QxInteger");
inc("types/QxColor");
inc("types/QxTextile");

// Basic Events
inc("events/QxEvent");
inc("events/QxMouseEvent");
inc("events/QxKeyEvent");
inc("events/QxFocusEvent");
inc("events/QxDataEvent");

// Basic Widgets
inc("widgets/QxWidget");
inc("widgets/QxClientDocument");
inc("widgets/QxInline");
inc("widgets/QxTerminator");

// Core Managers
inc("managers/QxManager");
inc("managers/QxDataManager");

// Event Handling
inc("managers/QxEventManager");
inc("managers/QxFocusManager");

// Border Handling
inc("core/QxBorder");

// Text Fields
inc("widgets/QxTextField");
inc("widgets/QxPasswordField");
inc("widgets/QxTextArea");

// Other Widgets
inc("widgets/QxForm");
inc("widgets/QxListView");
inc("widgets/QxFieldSet");
inc("widgets/QxIframe");

// Timer Support
inc("managers/QxTimerManager");
inc("core/QxTimer");

// Data Loading
inc("core/QxXmlHttpLoader");
inc("core/QxData");

// Image Support
inc("managers/QxImagePreloaderManager");
inc("widgets/QxImagePreloader");
inc("widgets/QxImage");

// Drag&Drop Support
inc("events/QxDragEvent");
inc("managers/QxDragAndDropManager");

// Most used Widgets
inc("widgets/QxContainer");
inc("widgets/QxAtom");
inc("widgets/QxButton");

// Radio/Checkbox Support
inc("managers/QxRadioButtonManager");
inc("widgets/QxInputCheckIcon");
inc("widgets/QxCheckBox");
inc("widgets/QxRadioButton");

// Popup Support
inc("managers/QxPopupManager");
inc("widgets/QxPopup");

// Tooltip Support
inc("managers/QxToolTipManager");
inc("widgets/QxToolTip");

// ToolBar Support
inc("widgets/QxToolBar");
inc("widgets/QxToolBarPart");
inc("widgets/QxToolBarPartHandle");
inc("widgets/QxToolBarButton");
inc("widgets/QxToolBarSeparator");
inc("widgets/QxToolBarCheckBox");
inc("widgets/QxToolBarRadioButton");

// List Support
inc("core/QxSelectionStorage");
inc("managers/QxSelectionManager");
inc("widgets/QxList");
inc("widgets/QxListItem");

// Combo Box
inc("widgets/QxComboBox");

// Tabbar Support
inc("widgets/QxTabFrame");
inc("widgets/QxTabBar");
inc("widgets/QxTabPane");
inc("widgets/QxTabPage");
inc("widgets/QxTab");

// Bar Selector
inc("widgets/QxBarSelectorFrame");
inc("widgets/QxBarSelectorBar");
inc("widgets/QxBarSelectorPane");
inc("widgets/QxBarSelectorPage");
inc("widgets/QxBarSelectorButton");

// Menu Support
inc("widgets/QxMenu");
inc("widgets/QxMenuButton");
inc("widgets/QxMenuSeparator");
inc("widgets/QxMenuBar");
inc("widgets/QxMenuBarButton");

// Tree Support
inc("widgets/QxTreeElement");
inc("widgets/QxTreeFile");
inc("widgets/QxTreeFolder");
inc("widgets/QxTree");
