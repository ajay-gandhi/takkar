
/**
 * Class for the entire game itself
 */

var next_power = 6;

function Takkar () {
  this.game_el = false;
  this.player = new Player();
  this.balls = [];
  this.speed = 50;
}

/**
 * Renders the game into the given parent element
 */
Takkar.prototype.render = function (parent) {
  this.game_el = $('<div class="takkar"><div class="score">0</div></div>');
  this.player.render(this.game_el);
  parent.append(this.game_el);
}

/**
 * Starts the game, including collision detection
 */
Takkar.prototype.start = function () {
  if (!this.game_el) return console.error('Start failed: Takkar not rendered.');
  this.player.bind();
  var self = this;

  // Start with one ball
  var ball = new Ball(next_power);
  ball.render(this.game_el);
  ball.start(function () {
    self.balls.push(ball);
  });

  mod = 1000 / self.speed;
  this.timeoutId = window.setInterval(clock_tick, self.speed, self);
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
 * This function gets run on every clock tick
 */
var ticks = 0,
    score = 0,
    mod;
var clock_tick = function (self) {
  ticks++;
  if (ticks % mod == 0) {
    score++;
    self.game_el.find('.score').text(score);
    if (score % 20 == 0) next_power++;
    if (score % 10 == 0) {
      // Add another ball
      var ball = new Ball(next_power);
      ball.render(self.game_el);
      ball.start(function () {
        self.balls.push(ball);
      });
    }
  }
  check_collisions(self);
}

/**
 * Checks for collisions between all entities in the game
 */
var check_collisions = function (self) {
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

        // Reverse ball directions depending on bounce
        if (objects[i].ball.dx * objects[j].ball.dx > 0) {

        }
        var jx = objects[j].ball.dx, jy = objects[j].ball.dy;
        objects[j].ball.dx = objects[i].ball.dx;
        objects[j].ball.dy = objects[i].ball.dy;
        objects[i].ball.dx = jx;
        objects[i].ball.dy = jy;

        // Trade power level
        var jp = objects[j].ball.power;
        objects[j].ball.power = objects[i].ball.power;
        objects[i].ball.power = jp;

        // Move balls until they aren't touching
        var b;
        while (are_touching(objects[i].ball, objects[j].ball)) {
          b = objects[i].ball;
          b.ball_el.css('left', b.get_x() + (b.dx * b.power));
          b.ball_el.css('top', b.get_y() + (b.dy * b.power));
          b = objects[j].ball;
          b.ball_el.css('left', b.get_x() + (b.dx * b.power));
          b.ball_el.css('top', b.get_y() + (b.dy * b.power));
        }

        // Both balls should move again
        objects[i].ball.ball_el.stop();
        objects[j].ball.ball_el.stop();
        objects[i].ball.next_move();
        objects[j].ball.next_move();
      }
    }
  }
}

/**
 * Checks collisions between a single pair of balls
 */
var are_touching = function (b1, b2) {
  var r = b1.ball_el.width() / 2;
  var c1 = new SAT.Circle(new SAT.Vector(b1.get_x(), b1.get_y()), r);
  var c2 = new SAT.Circle(new SAT.Vector(b2.get_x(), b2.get_y()), r);
  return SAT.testCircleCircle(c1, c2);
}
