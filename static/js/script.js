if(window.location.pathname == '/battle') {
  $('body').removeClass('dark')
}
$('#themetoggle').click(function() {
  if($('body').hasClass('dark')) {
    $('body').removeClass('dark')
  } else {
    $('body').addClass('dark')
  }
})