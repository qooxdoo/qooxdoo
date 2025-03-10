var currentYear = new Date().getFullYear(); 
$(".current-year").text(currentYear);

$(function () {
  $('[data-toggle="tooltip"]').tooltip();
})
var scroll = (function (event) {
  var scroll = $(window).scrollTop();
  if (scroll < 250) {
    $(navigatopnBar).css('background-color', 'transparent');
    $(navigationLogo).css('width', '0');
    $(navigationLogo).addClass('invisible');
  } else {
    $(navigatopnBar).css('background-color', 'rgba(0, 40, 56, 0.9)');
    $(navigationLogo).css('width', '');
    $(navigationLogo).removeClass('invisible');
  }
});
$(window).scroll(scroll);
scroll();