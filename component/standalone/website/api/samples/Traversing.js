addSample(".find", function() {
  if (this.dontShowGroupId) {
    q('#app-list').find('.groupid').addClass('hidden');
    q('#app-list').find('.separator').addClass('hidden');
  } else {
    q('#app-list').find('.groupid').removeClass('hidden');
    q('#app-list').find('.separator').removeClass('hidden');
  }
});

addSample(".getChildren", function() {
  q('#app-details').getChildren().remove();
});
