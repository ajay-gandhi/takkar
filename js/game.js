
/**
 * Class for the entire game itself
 */

function Takkar () {
  this.game_el = false;
  this.player = new Player();
  this.balls = [];
}

/**
 * Renders the game into the given parent element
 */
Takkar.prototype.render = function (parent) {
  this.game_el = $('<div class="takkar"></div>');
  this.player.render(this.game_el);
  parent.append(this.game_el);
}

/**
 * Starts the game
 */
Takkar.prototype.start = function () {
  if (!this.game_el) return console.error('Start failed: Takkar not rendered.');
  this.player.bind();

  // Start with one ball
  var ball = new Ball();
  ball.render(this.game_el);
  ball.start();
  this.balls.push(ball);
}
