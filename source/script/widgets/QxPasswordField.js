function QxPasswordField(vText)
{
  QxTextField.call(this, vText);
  
  this.setHtmlProperty("type", "password");
};

QxPasswordField.extend(QxTextField, "QxPasswordField");
