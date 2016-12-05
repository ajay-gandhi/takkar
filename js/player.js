
/**
 * Class for player
 */

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
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x > max_w) x = max_w;
    if (y > max_h) y = max_h;

    self.player_el.css({
      left: x,
      top:  y
    });
  });
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
