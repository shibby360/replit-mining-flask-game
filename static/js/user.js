$('title').text(userdata.username)
$('#usernameheader').text(`User: ${userdata.username}`)
$('#userlevel').text(`Level ${userdata.level}`)
if(userdata.username == localStorage.getItem('username')) {
  $('.onlyifloggedin').show()
}
$('#logout').on('click', function(ev) {
  localStorage.removeItem('uid')
  localStorage.removeItem('password')
  window.location = '/'
})