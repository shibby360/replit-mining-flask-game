function saveLocalStorage(stats) {
  localStorage.setItem('username', stats.username)
  localStorage.setItem('blocks', JSON.stringify(stats.blocks))
  localStorage.setItem('meat', JSON.stringify(stats.meat))
  localStorage.setItem('items', JSON.stringify(stats.items))
  localStorage.setItem('xp', stats.xp)
  localStorage.setItem('level', stats.level)
  localStorage.setItem('map', JSON.stringify(stats.map))
  localStorage.setItem('pos', JSON.stringify(stats.pos))
}