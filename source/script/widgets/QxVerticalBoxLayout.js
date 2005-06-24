function QxVerticalBoxLayout(vBlockAlign, vChildrenAlign) {
  QxBoxLayout.call(this, "vertical", vBlockAlign, vChildrenAlign);
};

QxVerticalBoxLayout.extend(QxBoxLayout, "QxVerticalBoxLayout");

proto._checkOrientation = function(propValue, propOldValue, propData, uniqModIds) 
{
  if (propValue != "vertical") {
    throw new Error("Orientation is not configurable in QxVerticalBoxLayout!");
  };
  
  return propValue;
};
