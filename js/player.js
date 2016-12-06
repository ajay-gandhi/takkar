
/**
 * Class for player
 */

var DRAG_SPEED = 0.8;

function Player () {
  this.player_el = false;
}

/**
 * Renders the player into the given parent element
 */
Player.prototype.render = function (parent) {
  this.player_el = $('<div class="ball player"></div>');
  parent.append(this.player_el);
}

/**
 * Binds listeners for this player
 */
Player.prototype.bind = function () {
  if (!this.player_el) return console.error('Bind failed: player not rendered.');

  var self = this;
  var size = this.player_el.width() / 2;

  var parent = this.player_el.parent(),
      max_w  = parent.width() - (size * 2),
      max_h  = parent.height() - (size * 2);

  $(document).on('mousemove', function (e) {
    var y = e.pageY - parent.offset().top - size;
    var x = e.pageX - parent.offset().left - size;

    // Bounds
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x > max_w) x = max_w;
    if (y > max_h) y = max_h;

    // Move player
    self.player_el.css({
      left: x,
      top:  y
    });
  });

  $('html, body').bind('touchstart touchmove', function (e) {
    e.preventDefault();
    var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
    var y = touch.pageY - parent.offset().top - size;
    var x = touch.pageX - parent.offset().left - size;

    // Bounds
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x > max_w) x = max_w;
    if (y > max_h) y = max_h;

    var x2 = self.get_x(),
        y2 = self.get_y(),
        d  = Math.sqrt(((x - x2) * (x - x2)) + ((y - y2) * (y - y2)));

    if (d > size * 2) {
      // Animate move player
      self.player_el.stop().animate({
        left: x,
        top:  y
      }, {
        easing:  'linear',
        duration: d * DRAG_SPEED
      });

    } else {
      // Just move player
      self.player_el.stop().css({
        left: x,
        top:  y
      });
    }
  });
}

/**
 * Unbinds listeners for this player
 */
Player.prototype.stop = function () {
  this.player_el.stop();
  $(document).off('mousemove');
  $('html, body').off('touchstart touchmove');
}

/**
 * Gets the x position of the player
 */
Player.prototype.get_x = function () {
  return this.player_el.position().left;
}

/**
 * Gets the y position of the player
 */
Player.prototype.get_y = function () {
  return this.player_el.position().top;
}
