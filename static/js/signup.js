function signup(e) {
  if(e.key != null) {
    if(e.key != 'Enter') { return }
  }
  var username = $('#username').val()
  var password = $('#password').val()
  if(username == '' || password == '') { return }
  $.post('/signup', {
    username:username,
    password:password
  }, function(data) {
    if(data == 'Username already exists') {
      alert('Username taken')
      return
    }
    var stats = Object.values(data)[0]
    localStorage.setItem('uid', Object.keys(data)[0])
    saveLocalStorage(stats)
    window.location = '/user/'+Object.keys(data)[0]
  })
}
$('#signupbtn').on('click', signup)
$(document).on('keypress', login)