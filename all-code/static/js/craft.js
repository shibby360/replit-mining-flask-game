var craftables = {
  'Animal trap':[5, 5, 0],
  'Sword':[0, 15, 0]
}
/* [grass, dirt, wood] */
var crafting
$('.craftable').children().on('click', (ev) => {
  var selected = $(ev.target)
  $('.craftable').children().css('border-color', 'black')
  selected.parent().children().css('border-color', 'blue')
  crafting = selected.parent().find('.name').text()
})
$('#craftscreen>#craft').on('click', (ev) => {
  var item = craftables[crafting]
  if(p.amntblcks.grass >= item[0] && p.amntblcks.dirt >= item[1] && p.amntblcks.wood >= item[2]) {
    p.amntblcks.grass -= item[0]
    p.amntblcks.dirt -= item[1]
    p.amntblcks.wood -= item[2]
    p.items.push(crafting)
  } else {
    alert('You don\'t have the necessary materials!')
  }
  $('.craftable').children().css('border-color', 'black')
  p.updateAll()
})