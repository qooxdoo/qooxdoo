function QxBarSelectorButton(vText, vIcon, vIconWidth, vIconHeight, vChecked)
{
  QxTab.call(this, vText, vIcon, vIconWidth, vIconHeight, vChecked);

  this.setIconPosition("top");
};

QxBarSelectorButton.extend(QxTab, "QxBarSelectorButton");



/*
------------------------------------------------------------------------------------
  EVENT HANDLER
------------------------------------------------------------------------------------
*/

proto._onkeyup = function(e)
{
  switch(this.getParent().getState())
  {
    case "top":
    case "bottom":
      switch(e.getKeyCode())
      {
        case QxKeyEvent.keys.left:
          var vPrevious = true;
          break;
    
        case QxKeyEvent.keys.right:
          var vPrevious = false;
          break;
    
        default:
          return;
      };
      
      break;
    
    case "left":
    case "right":
      switch(e.getKeyCode())
      {
        case QxKeyEvent.keys.up:
          var vPrevious = true;
          break;
    
        case QxKeyEvent.keys.down:
          var vPrevious = false;
          break;
    
        default:
          return;
      };
      
      break;    
      
    default:
      return;    
  };
  
  var vChild = vPrevious ? this.isFirstChild() ? this.getParent().getLastChild() : this.getPreviousSibling() : this.isLastChild() ? this.getParent().getFirstChild() : this.getNextSibling();
  
  vChild.setFocused(true);
  vChild.setChecked(true);
};
