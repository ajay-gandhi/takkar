
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
 * Starts the game, including collision detection
 */
Takkar.prototype.start = function () {
  if (!this.game_el) return console.error('Start failed: Takkar not rendered.');
  this.player.bind();

  // Start with one ball
  var ball = new Ball();
  ball.render(this.game_el);
  ball.start();
  this.balls.push(ball);

  var self = this;
  this.timeoutId = window.setInterval(check_collision, 100, self);
}

/**
 * Stops the game (pause)
 */
Takkar.prototype.stop = function () {
  window.clearTimeout(this.timeoutId);
  this.balls.forEach(function (b) { b.ball_el.stop(); });
}

/**
 * Called when the player loses
 */
Takkar.prototype.game_over = function () {
  this.stop();
  console.log('GAME OVER');
}

/**
 * Checks for collisions between all entities in the game
 */
var check_collision = function (self) {
  // Convert each object to a SAT.js object
  var r = self.balls[0].ball_el.width() / 2;
  var objects = self.balls.map(function (b) {
    var c = new SAT.Circle(new SAT.Vector(b.get_x(), b.get_y()), r);
    return {
      is_p: false,
      ball: b,
      sat:  c
    }
  });

  // Add player
  var p = self.player;
  objects.push({
    is_p: true,
    ball: p,
    sat: new SAT.Circle(new SAT.Vector(p.get_x(), p.get_y()), r)
  });

  // Perform collision detection
  for (var i = 0; i < objects.length; i++) {
    // Check with all j > i
    for (var j = i + 1; j < objects.length; j++) {
      var did_collide = SAT.testCircleCircle(objects[i].sat, objects[j].sat);

      if (did_collide) {
        // If player collided, game over
        if (objects[i].is_p || objects[j].is_p) self.game_over();

        // Reverse both ball directions
        objects[i].ball.dx *= -1;
        objects[i].ball.dy *= -1;
        objects[j].ball.dx *= -1;
        objects[j].ball.dy *= -1;

        // Choose new power level for both balls
        var total_power = objects[i].ball.power + objects[j].ball.power;
        objects[i].ball.power = (Math.random() * (total_power - 1)) + 1;
        objects[j].ball.power = total_power - objects[i].ball.power;

        // Both balls should move again
        objects[i].ball.next_move();
        objects[j].ball.next_move();
      }
    }
  }
}
