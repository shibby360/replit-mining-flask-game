function login(e) {
  if(e.key != null) {
    if(e.key != 'Enter') { return }
  }
  var username = $('#username').val()
  var password = $('#password').val()
  if(username == '' || password == '') { return }
  $.post('/login', {
    username:username,
    password:password
  }, function(data) {
    if(data == 'incorrect') {
      alert('something was wrong')
      return
    }
    var stats = Object.values(data)[0]
    localStorage.setItem('uid', Object.keys(data)[0])
    saveLocalStorage(stats)
    window.location = '/user/'+Object.keys(data)[0]
  })
}
$('#loginbtn').on('click', login)
$(document).on('keypress', login)