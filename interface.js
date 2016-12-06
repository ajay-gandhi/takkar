
var game = new Takkar();
var quality_map = [-1, 200, 50, 25];

$(document).ready(function () {
  game.render($('#game'));
  game.start();

  // Interactions of options
  $('.quality').filter('#2').css('color', '#666666');
  $('.quality').click(function () {
    $('.quality').css('color', '#c2c2c2');
    $(this).css('color', '#666666');

    // Adjust game quality (setInterval timeout)
    game.speed = quality_map[parseInt($(this).attr('id'))];
  });
});
