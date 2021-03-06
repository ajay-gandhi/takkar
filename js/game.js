
/**
 * Class for the entire game itself
 */

var next_power = 6;
var quality_map = [-1, 70, 40, 20];

function Takkar () {
  this.game_el = false;
  this.player = new Player();
  this.balls = [];
  this.speed = quality_map[2];
  this.is_low_q = false;
  this.new_ball = false;
}

/**
 * Renders the game into the given parent element
 */
Takkar.prototype.render = function (parent) {
  this.game_el = $('<div class="takkar"><div class="score">0</div></div>');
  this.player.render(this.game_el);
  this.player.player_el.addClass('blue-grad');
  parent.append(this.game_el);
}

/**
 * Sets the quality of the game
 */
Takkar.prototype.set_quality = function (q) {
  var self = this;
  this.is_low_q = q == 1;
  this.speed = quality_map[q];
  window.clearTimeout(this.timeoutId);
  this.timeoutId = window.setInterval(clock_tick, self.speed, self);

  // Toggle gradient on current balls
  this.player.player_el.toggleClass('blue-grad', !this.is_low_q);
  this.balls.forEach(function (b) {
    b.ball_el.toggleClass('gray-grad', !self.is_low_q);
  });
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
  ball.ball_el.addClass('gray-grad');
  self.new_ball = ball;
  ball.start(function () {
    ball.ball_el.toggleClass('gray-grad', !self.is_low_q);
    self.balls.push(ball);
    self.new_ball = false;

    // Add "avoid me" helper
    self.game_el.append($('<div class="avoid-instr">avoid me</div>'));
    var x = ball.ball_el.position().left - 10,
        y = ball.ball_el.position().top + 4;
    self.game_el
      .find('.avoid-instr')
      .css({
        top:  y,
        left: x
      })
      .animate({
        top:     y + (ball.dy * 350),
        left:    x + (ball.dx * 350),
        opacity: 0
      }, {
        specialEasing: {
          top:     'linear',
          left:    'linear',
          opacity: 'avoidInstr'
        },
        duration: ball.compute_duration(ball.power, x + (ball.dx * 350), y + (ball.dy * 350)),
        complete: function () {
          $(this).remove();
        }
      });
  });

  this.start_time = Date.now();
  this.timeoutId = window.setInterval(clock_tick, self.speed, self);
}

/**
 * Stops the game (pause)
 */
Takkar.prototype.stop = function () {
  window.clearTimeout(this.timeoutId);
  this.player.stop();
  this.balls.forEach(function (b) { b.ball_el.stop(); });
  this.game_el.find('.avoid-instr').remove();
  if (this.new_ball) this.new_ball.ball_el.stop();
}

/**
 * Called when the player loses
 */
Takkar.prototype.game_over = function () {
  var self = this;
  this.stop();

  // Animate player exploding
  var d = this.player.player_el.width();
  this.player.player_el
    .css({
      'border-radius': (d / 2 * 1.5) + 'px'
    })
    .animate({
      top: '-=' + (d / 4),
      left: '-=' + (d / 4),
      width: d * 1.5,
      height: d * 1.5
    }, {
      duration: 'fast',
      complete: function () {
        $(this)
          .delay(500)
          .animate({
            opacity: 0.2,
            top: '+=' + (d / 2),
            left: '+=' + (d / 2),
            width: d / 2,
            height: d / 2
          });

        var over = $('<div class="final-score"></div>');
        over.html('Game over!<br />You survived for ' + score + 's.');
        self.game_el.append($('<div class="cover"></div>'));
        self.game_el.append(over);
        self.game_el.find('.cover').delay(800).fadeTo('normal', 0.75);
        self.game_el.find('.final-score').delay(800).fadeIn();
        self.game_el.css('cursor', 'auto');

        // Play again
        self.game_el.click(function () {
          self.game_el.off('click');

          // Reset everything pretty much
          self.game_el.children(':not(.score)').remove();
          next_power = 6;
          self.player = new Player();
          self.player.render(self.game_el);
          self.player.player_el.toggleClass('blue-grad', !self.is_low_q);
          self.balls = [];
          self.new_ball = false;

          score = 0;

          // Start the new game
          self.start();
        });
      }
    });
}

/**
 * This function gets run on every clock tick
 */
var score = 0,
    next;
var clock_tick = function (self) {
  next = Date.now() - self.start_time > (score + 1) * 1000;
  if (next) {
    score++;
    self.game_el.find('.score').text(score);
    if (score % 20 == 0) next_power++;
    if (score % 10 == 0) {
      // Add another ball
      var ball = new Ball(next_power);
      ball.render(self.game_el);
      ball.ball_el.toggleClass('gray-grad', !self.is_low_q);
      self.new_ball = ball;
      ball.start(function () {
        ball.ball_el.toggleClass('gray-grad', !self.is_low_q);
        self.balls.push(ball);
        self.new_ball = false;
      });
    }
    next = false;
  }
  check_collisions(self);
}

/**
 * Checks for collisions between all entities in the game
 */
var check_collisions = function (self) {
  if (self.balls.length < 1) return;

  // Collect all objects
  var objects = self.balls.concat(self.player);
  var diameter = self.balls[0].ball_el.width();

  // Perform collision detection
  for (var i = 0; i < objects.length; i++) {
    // Check with all j > i
    for (var j = i + 1; j < objects.length; j++) {
      var did_collide = test_collision(objects[i], objects[j], diameter);

      if (did_collide) {
        // If player collided, game over
        if (objects[i].player_el || objects[j].player_el)
          return self.game_over();

        // Trade ball directions
        var jx = objects[j].dx, jy = objects[j].dy;
        objects[j].dx = objects[i].dx;
        objects[j].dy = objects[i].dy;
        objects[i].dx = jx;
        objects[i].dy = jy;

        // Trade power level
        var jp = objects[j].power;
        objects[j].power = objects[i].power;
        objects[i].power = jp;

        // Move balls until they aren't touching
        var b = objects[i];
        b.ball_el.css('left', b.get_x() + (b.dx * b.power));
        b.ball_el.css('top', b.get_y() + (b.dy * b.power));
        b = objects[j];
        b.ball_el.css('left', b.get_x() + (b.dx * b.power));
        b.ball_el.css('top', b.get_y() + (b.dy * b.power));

        // Stop initial movement and start again
        objects[i].ball_el.stop();
        objects[j].ball_el.stop();
        objects[i].next_move();
        objects[j].next_move();
      }
    }
  }
}

/**
 * Checks collision between a single pair of balls
 */
var test_collision = function (b1, b2, diam) {
  var dx = b1.get_x() - b2.get_x();
  var dy = b1.get_y() - b2.get_y();
  var dist = Math.sqrt(dx * dx + dy * dy);
  return dist < diam;
}

/**
 * New easing function for avoid instructions
 */
$.extend(jQuery.easing, {
  avoidInstr: function (x, t, b, c, d) {
    return x * x * x;
  }
});
