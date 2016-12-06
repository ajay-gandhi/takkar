
var game = new Takkar();

$(document).ready(function () {
  game.render($('#game'));
  game.start();

  // Interactions of options
  $('.quality').filter('#2').css('color', '#666666');
  $('.quality').click(function () {
    $('.quality').css('color', '#c2c2c2');
    $(this).css('color', '#666666');

    // Adjust game quality (setInterval timeout)
    game.set_quality(parseInt($(this).attr('id')));
  });
});
