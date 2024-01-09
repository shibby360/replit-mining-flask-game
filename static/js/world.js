var size = 150
var smallsize = 30
var gbord = $('#gameboard')
var gborddom = document.getElementById('gameboard')
var craftopentime = 4
var squares = (size/smallsize)**2
var usermap = JSON.parse(localStorage.getItem('map'))
var preblocks = []
var preanims = []
var preothers = []
for(var i of usermap) {
  if('kind' in i) {
    if(i.kind == 'block') {
      preblocks.push(i)
    } else if(i.kind == 'animal') {
      preanims.push(i)
    }
  } else {
    preothers.push(i)
  }
}
function searchForArray(haystack, needle) {
  var i, j, current;
  for (i = 0; i < haystack.length; ++i) {
    if (needle.length === haystack[i].length) {
      current = haystack[i];
      for (j = 0; j < needle.length && needle[j] === current[j]; ++j);
      if (j === needle.length)
        return i;
    }
  }
  return -1;
}
function randCoords() {
  var x = (Math.floor(Math.random() * size / smallsize) * smallsize)
  var y = (Math.floor(Math.random() * size / smallsize) * smallsize)
  while ([x, y].join() === [p.x, p.y].join() || searchForArray(blkcords(), [x, y]) !== -1 || searchForArray(animcords(), [x, y]) !== -1 || searchForArray(otherItemCords(), [x,y]) !== -1) {
    x = (Math.floor(Math.random() * size / smallsize) * smallsize)
    y = (Math.floor(Math.random() * size / smallsize) * smallsize)
  }
  return [x, y]
}
function makeSVGel(tag, attrs) {
  var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (var k in attrs)
    el.setAttribute(k, attrs[k]);
  return el;
}
function useItem(ev) {
  var usedItemBtn = $(ev.target)
  var usedItem = usedItemBtn.text()
  if(usedItem == 'Animal trap') {
    var trap = new AnimalTrap(p.x, p.y)
    otherItems.push(trap)
    trap.draw()
  }
  p.items.splice(usedItemBtn.attr('id'), 1)
  p.updateAll()
}
function drawAll() {
  for(var i in animals) {
    animals[i].draw()
  }
  for(var i in otherItems) {
    otherItems[i].draw()
  }
}
function listForRequest(arr, kind) {
  var arr1 = []
  for(var i in arr) {
    var el = arr[i]
    arr1.push({x:el.x,y:el.y,health:el.health,type:el.type,kind:kind})
  }
  return arr1
}
function othersForRequest(arr) {
  var arr1 = []
  for(var i in arr) {
    var el = arr[i]
    arr1.push({x:el.x,y:el.y,name:el.name})
  }
  return arr1
}
function savedata() {
  $.post('/save', {
    userid:localStorage.getItem('uid'),
    blocks:JSON.stringify(p.amntblcks),
    meat:JSON.stringify(p.amntmeat),
    items:p.items.length>0 ? JSON.stringify(p.items) : 'empty',
    xp:p.xp,
    level:p.level,
    pos:`${p.x},${p.y}`,
    map:JSON.stringify(othersForRequest(otherItems).concat(listForRequest(animals, 'animal')).concat(listForRequest(blocks, 'block')))
  }, function(data) {
    saveLocalStorage(data)
  })
}
function Player() {
  if(localStorage.getItem('pos') == null) {
    this.x = 0
    this.y = 0
  } else {
    var pos = JSON.parse(localStorage.getItem('pos'))
    this.x = pos[0]
    this.y = pos[1]
  }
  this.size = smallsize
  this.level = 1
  if(localStorage.getItem('level') != null) {
    this.level = Number(localStorage.getItem('level'))
  }
  this.xp = 0
  if(localStorage.getItem('xp') != null) {
    this.xp = Number(localStorage.getItem('xp'))
  }
  this.health = this.level * 100
  this.facing = ''
  this.buildwith = 'grass'
  this.amntblcks = { 'grass': 0, 'dirt': 0, 'wood': 0 }
  if(localStorage.getItem('blocks')) {
    this.amntblcks = JSON.parse(localStorage.getItem('blocks'))
  }
  this.amntmeat = {'cow':0,'panda':0}
  if(localStorage.getItem('meat')) {
    this.amntmeat = JSON.parse(localStorage.getItem('meat'))
  }
  this.items = []
  if(localStorage.getItem('items')) {
    this.items = JSON.parse(localStorage.getItem('items'))
  }
  this.action = function(key) {
    if (key === 'ArrowUp') {
      this.y -= this.size
      if (this.y < 0) {
        this.y = 0
      }
    } else if (key === 'ArrowDown') {
      this.y += this.size
      if (this.y > size - this.size) {
        this.y = size - this.size
      }
    } else if (key === 'ArrowLeft') {
      this.x -= this.size
      if (this.x < 0) {
        this.x = 0
      }
    } else if (key === 'ArrowRight') {
      this.x += this.size
      if (this.x > size - this.size) {
        this.x = size - this.size
      }
    } else if (key === 'b') {
      if (this.amntblcks[this.buildwith] === 0) { return }
      var x = this.x
      var y = this.y
      /*if(this.facing === 'Right') {
        x += smallsize
      } else if(this.facing === 'Left') {
        x -= smallsize
      } else if(this.facing === 'Up') {
        y -= smallsize
      } else if(this.facing === 'Down') {
        y += smallsize
      }*/
      blocks.push(new Block(x, y, this.buildwith))
      blocks[blocks.length - 1].draw()
      this.amntblcks[this.buildwith] -= 1
      this.updateAll()
    }
    if (key.startsWith('Arrow')) {
      this.facing = key.substring(5)
      this.checkCollision(key)
    }
  }
  this.draw = function() {
    $('#player').attr('width', this.size)
    $('#player').attr('height', this.size)
    $('#player').attr('x', this.x)
    $('#player').attr('y', this.y)
  }
  this.checkCollision = function(key) {
    var reverse = false
    if (searchForArray(blkcords(), [this.x, this.y]) !== -1) {
      var block = blocks[searchForArray(blkcords(), [this.x, this.y])]
      block.takehit(this.level * 10)
      reverse = true
    } else if (searchForArray(animcords(), [this.x, this.y]) !== -1) {
      var animal = animals[searchForArray(animcords(), [this.x, this.y])]
      animal.takehit(this.level * 10)
      reverse = true
    }
    if (reverse) {
      if (key === 'ArrowDown') {
        this.y -= this.size
      } else if (key === 'ArrowUp') {
        this.y += this.size
      } else if (key === 'ArrowRight') {
        this.x -= this.size
      } else if (key === 'ArrowLeft') {
        this.x += this.size
      }
    }
  }
  this.updateBlocks = function() {
    localStorage.setItem('blocks', JSON.stringify(this.amntblcks))
  localStorage.setItem('items', JSON.stringify(this.items))
    for (var i in this.amntblcks) {
      $(`#amnt${i}`).text(this.amntblcks[i])
    }
    $(`div.showingblocks > img`).css('border-color', 'black')
    $(`div#${this.buildwith} > img`).css('border-color', 'red')
  }
  this.updateItems = function() {
    var itemListEl = $('#itemslist')
    itemListEl.html('')
    var index = 0
    for(var item of this.items) {
      var itemEl = $(`<li><button id='${index}'>${item}</button></li>`)
      itemListEl.append(itemEl)
      itemEl.click(useItem)
      index += 1
    }
  }
  this.updateAll = function() {
    this.updateBlocks()
    this.updateItems()
  }
}
var p = new Player()
p.draw()
p.updateAll()
var blocks = []
function blkcords() {
  var end = []
  for (var i in blocks) {
    var blok = blocks[i];
    end.push([blok.x, blok.y]);
  }
  return end
}
function Block(x, y, type, health) {
  if (x === undefined && y === undefined) {
    var coords = randCoords()
    this.x = coords[0]
    this.y = coords[1]
  } else {
    this.x = x
    this.y = y
  }
  this.el = null
  var types = ['grass', 'dirt', 'wood']
  if (type === undefined) {
    this.type = types[Math.floor(Math.random() * types.length)]
  } else {
    this.type = type
  }
  if (this.type === 'grass') {
    this.maxhealth = 50
  } else if (this.type === 'dirt') {
    this.maxhealth = 100
  } else if (this.type === 'wood') {
    this.maxhealth = 150
  }
  if(health == undefined) {
    this.health = this.maxhealth
  } else {
    this.health = health
  }
  this.draw = function() {
    var attrs = { x: this.x, y: this.y, width: smallsize, height: smallsize, opacity: (this.health / this.maxhealth) }
    if (this.el) {
      for (var i in attrs) {
        this.el.setAttribute(i, attrs[i])
      }
    } else {
      this.el = makeSVGel('image', attrs)
      this.el.setAttribute('href', `/static/imgs/${this.type}block.svg`)
      gborddom.appendChild(this.el)
    }
  }
  this.delete = function() {
    blocks.splice(blocks.indexOf(this), 1)
    this.el.remove()
  }
  this.takehit = function(dmg) {
    this.health -= dmg
    this.draw()
    if (this.health <= 0) {
      p.amntblcks[this.type] += 1
      p.updateAll()
      this.delete()
    }
  }
}
if(preblocks.length != 0) {
  for(var i in preblocks) {
    var preblk = preblocks[i]
    blocks.push(new Block(preblk.x, preblk.y, preblk.type, preblk.health))
    blocks[i].draw()
  }
} else {
  for (var i = 0; i <= size/smallsize; i++) {
    blocks.push(new Block())
    blocks[i].draw()
  }
}
var animals = []
function Animal(x, y, type, health) {
  if (x === undefined && y === undefined) {
    var coords = randCoords()
    this.x = coords[0]
    this.y = coords[1]
  } else {
    this.x = x
    this.y = y
  }
  this.el = null
  this.sheet = null
  this.stunned = false
  var types = ['cow', 'panda']
  if (type === undefined) {
    this.type = types[Math.floor(Math.random() * types.length)]
  } else {
    this.type = type
  }
  if (this.type === 'cow') {
    this.maxhealth = 50
  } else if (this.type === 'panda') {
    this.maxhealth = 100
  }
  if(health == undefined) {
    this.health = this.maxhealth
  } else {
    this.health = health
  }
  this.draw = function() {
    var attrs = { x: this.x, y: this.y, width: smallsize, height: smallsize }
    if (this.el) {
      for (var i in attrs) {
        this.el.setAttribute(i, attrs[i])
        this.sheet.setAttribute(i, attrs[i])
      }
      this.sheet.setAttribute('opacity', 1 - (this.health / this.maxhealth))
      this.sheet.setAttribute('fill', 'red')
    } else {
      this.el = makeSVGel('image', attrs)
      this.el.setAttribute('href',`/static/imgs/animal${this.type}.svg`)
      this.sheet = makeSVGel('rect', attrs)
      this.sheet.setAttribute('opacity', 1 - (this.health / this.maxhealth))
      gborddom.appendChild(this.el)
      gborddom.appendChild(this.sheet)
    }
  }
  this.delete = function() {
    animals.splice(animals.indexOf(this), 1)
    this.el.remove()
    this.sheet.remove()
  }
  this.takehit = function(dmg) {
    this.health -= dmg
    this.draw()
    if (this.health <= 0) {
      p.amntmeat[this.type] += 1
      this.delete()
    }
  }
  this.move = function() {
    if(this.health/this.maxhealth < 0.5 || this.stunned) { return }
    var which = ['x', 'y'][Math.floor(Math.random() * 2)]
    function add(x) {
      return x + smallsize
    }
    function sub(x) {
      return x - smallsize
    }
    function regulate(x) {
      if(x < 0) {
        return 0
      }
      if(x > size-smallsize) {
        return size-smallsize
      }
      return x
    }
    var which2 = [add, sub][Math.floor(Math.random() * 2)]
    this[which] = regulate(which2(this[which]))
    this.checkCollision(which, which2)
  }
  this.checkCollision = function(co, dir) {
    var reverse = false
    if (searchForArray(blkcords(), [this.x, this.y]) !== -1) {
      reverse = true
    } else if (searchForArray(animcords(this), [this.x, this.y]) !== -1) {
      reverse = true
    } else if([this.x, this.y].join() === [p.x, p.y].join()) {
      reverse = true
    } else if (searchForArray(otherItemCords(), [this.x, this.y]) !== -1) {
      var index = searchForArray(otherItemCords(), [this.x, this.y])
      this.stunned = $(otherItems[index].el).hasClass('animaltrap')
    }
    if (reverse) {
      if (co == 'y' && dir.name == 'add') {
        this.y -= smallsize
      } else if (co == 'y' && dir.name == 'sub') {
        this.y += smallsize
      } else if (co == 'x' && dir.name == 'add') {
        this.x -= smallsize
      } else if (co == 'x' && dir.name == 'sub') {
        this.x += smallsize
      }
    }
  }
}
if(preanims.length != 0) {
  for(var i in preanims) {
    var preanm = preanims[i]
    animals.push(new Animal(preanm.x, preanm.y, preanm.type, preanm.health))
    animals[i].draw()
  }
} else { 
  for (var i = 0; i <= (size/smallsize)/5; i++) {
    animals.push(new Animal())
    animals[i].draw()
  }
}
function animcords(exc) {
  var end = []
  for (var i in animals) {
    var blok = animals[i];
    if(blok == exc) {
      continue
    }
    end.push([blok.x, blok.y]);
  }
  return end
}
function AnimalTrap(x, y) {
  this.x = x
  this.y = y
  this.name = 'animal trap'
  this.draw = function() {
    var attrs = {x: this.x, y: this.y, width: smallsize, height: smallsize}
    if (this.el) {
      for (var i in attrs) {
        this.el.setAttribute(i, attrs[i])
      }
    } else {
      this.el = makeSVGel('image', attrs)
      this.el.setAttribute('href', `/static/imgs/animaltrap.svg`)
      this.el.setAttribute('class', 'animaltrap')
      gborddom.appendChild(this.el)
    }
  }
}
var otherItemsKeys = {
  'animal trap':AnimalTrap
}
var otherItems = []
function otherItemCords(exc) {
  var end = []
  for (var i in otherItems) {
    var blok = otherItems[i];
    if(blok == exc) {
      continue
    }
    end.push([blok.x, blok.y]);
  }
  return end
}
if(preothers.length != 0) {
   for(var i in preothers) {
     var preitm = preothers[i]
     var itmobj = new otherItemsKeys[preitm.name](preitm.x, preitm.y)
     otherItems.push(itmobj)
     otherItems[i].draw()
   }
}
$(window).on('keydown', function(ev) {
  if(ev.key == 'Control' || ev.key == 's') { return }
  ev.preventDefault()
  p.action(ev.key)
  p.draw()
  for(var i in animals) {
    animals[i].move()
  }
  drawAll()
})
var hammertime = new Hammer(document.body)
hammertime.on('swipe', function(ev) {
  if (ev.direction === 4) {
    p.action('ArrowRight')
  } else if (ev.direction === 2) {
    p.action('ArrowLeft')
  } else if (ev.direction === 16) {
    p.action('ArrowDown')
  } else if (ev.direction === 8) {
    p.action('ArrowUp')
  }
  p.draw()
  for(var i in animals) {
    animals[i].move()
  }
  drawAll()
})
hammertime.get('swipe').set({ direction: Hammer.DIRECTION_ALL })
$('#blockshower > div').on('click', (ev) => {
  p.buildwith = ev.target.parentElement.id
  p.updateAll()
})
var spawns = setInterval(function() {
  var spawns = ['block', 'animal']
  var spawn = spawns[Math.floor(Math.random() * spawns.length)]
  var totalitems = (otherItems.length + blocks.length + animals.length)+1
  if(totalitems >= (size/smallsize)**2) { return }
  if(spawn === 'block') { 
    blocks.push(new Block())
    blocks[blocks.length - 1].draw()
  } else if(spawn === 'animal') {
    animals.push(new Animal())
    animals[animals.length - 1].draw()
  }
  savedata()
}, 10 * 1000)
$('#tocraft').on('click', function(ev) {
  if(ev.target.getAttribute('state') == 'open') {
    $('#craftscreen').css('display', 'none')
    $(ev.target).text('Craft ↓')
    ev.target.setAttribute('state', 'closed')
    return
  } 
  // $('#craftscreen').addClass('craftanimate')
  $('#craftscreen').css('display', 'block')
  $(ev.target).text('Craft ↑')
  /*setTimeout(function() {
    $('#craftscreen').removeClass('craftanimate')
  }, craftopentime * 1000)*/
  ev.target.setAttribute('state', 'open')
})
$('#savebtn').on('click', function(ev) {
  savedata()
})
var ctrldown = false
$(window).on('keydown', function(ev) {
  ev.preventDefault()
  if (ev.key == 'Control') {
    ctrldown = true
  }
})
$(window).on('keyup', function(ev) {
  if(ev.key == 's' && ctrldown) {
    ev.preventDefault()
    savedata()
  } else if(ev.key == 'Control') {
    ctrldown = false
  }
})
$(window).on('blur', function(ev) {
  savedata()
})