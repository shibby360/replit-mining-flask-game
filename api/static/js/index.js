if(localStorage.getItem('uid') != null) {
  window.location = '/user/' + localStorage.getItem('uid')
}