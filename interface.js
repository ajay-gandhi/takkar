
var game = new Takkar();

$(document).ready(function () {
  game.render($('#game'));
  $('.quality').filter('#2').css('color', '#666666');

  // Start game on click
  $('.start-game').click(function () {
    $(this).fadeOut();
    $('#game').fadeTo('fast', 1);
    game.start();

    // Interactions of options
    $('.quality').click(function () {
      $('.quality').css('color', '#c2c2c2');
      $(this).css('color', '#666666');

      // Adjust game quality (setInterval timeout)
      game.set_quality(parseInt($(this).attr('id')));
    });
  });
});
