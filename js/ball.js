
/**
 * Class for enemy balls
 */

var POWER_MULTIPLIER = 1;

function Ball (power) {
  this.ball_el = false;
  this.power = power;
  this.dy = (Math.random() * 0.5) + 0.25;
  this.dx = 1 - this.dy;
}

/**
 * Renders the ball into the given parent element
 */
Ball.prototype.render = function (parent) {
  this.ball_el = $('<div class="ball enemy"></div>');
  parent.append(this.ball_el);
}

/**
 * Starts the ball's movement, calls the callback function once the ball is
 * ready
 */
Ball.prototype.start = function (cb) {
  if (!this.ball_el) return console.error('Start failed: ball not rendered.');

  var self = this;
  this.ball_el.fadeIn('slow', function () {
    cb();
    self.next_move();
  });
}

/**
 * Moves the ball to a location and schedules the next move
 */
Ball.prototype.next_move = function () {
  var size   = this.ball_el.width(),
      parent = this.ball_el.parent();

  var xb = this.dx > 0 ? parent.width() - size : 0,
      yb = this.dy > 0 ? parent.height() - size : 0;

  // Calculate when ball passes x bound and y bound, choose sooner
  var x_hit = xb,
      is_xh = true;
  var y_hit = (this.dy / this.dx) * (xb - this.get_x()) + this.get_y();
  var y_out = this.dy > 0 ? y_hit > yb : y_hit < yb;
  if (y_out) {
    // Y coord for x bound is out, so use y
    y_hit = yb;
    x_hit = (this.dx / this.dy) * (yb - this.get_y()) + this.get_x();
    is_xh = false;
  }

  var self = this;
  var d = self.compute_duration(this.power, x_hit, y_hit);
  this.ball_el.animate({
    top: y_hit,
    left: x_hit
  }, {
    easing: 'linear',
    duration: d,
    complete: function () {
      // Ball bounce
      if (is_xh) self.dx *= -1;
      else       self.dy *= -1;
      self.next_move();
    }
  });
}

/**
 * Gets the x position of the ball
 */
Ball.prototype.get_x = function () {
  return this.ball_el.position().left;
}

/**
 * Gets the y position of the ball
 */
Ball.prototype.get_y = function () {
  return this.ball_el.position().top;
}

/**
 * Computes duration of a movement from current position to (x2, y2) with
 * `power` speed
 */
Ball.prototype.compute_duration = function (power, x1, y1) {
  power = (11 - power) * POWER_MULTIPLIER;
  var x2 = this.get_x(), y2 = this.get_y();
  return power * Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}
