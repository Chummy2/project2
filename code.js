// create Phaser.Game object named "game"
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'my-game',
  { preload: preload, create: create, update: update });

// declare global variables for game
var player;
var arrowKey;
var fireKey;
var engineSound;
var space;
var asteroidGroup;
var maxSpeed = 100;
var score = 0;
var maxLives = 5;
var shipLives = 3;
var newLife = 10000;

var boomSound;
var explosion;
var laser;
var fireSound;
var asteroidParticles;
var healthBar;
var livesBar;
var livesCrop;
var teleportSound;
var lifeSound;

var healthText;
var livesText;
var gameTitle;
var startText;
var gameOverText;
var scoreText;

var enemy;
var enemyLaser
var enemyExplosion
var enemyFireSound
var enemyAlarmSound
// preload game assets - runs once at start
function preload() {
  game.load.spritesheet('ship', 'assets/images/spaceship.png', 64, 64);
  game.load.spritesheet('particle', 'assets/images/asteroid-particle.png', 20, 20);
  game.load.spritesheet('bullet', 'assets/images/laser.png', 36, 24);
  game.load.spritesheet('explosion', 'assets/images/explosion.png', 128, 128);
  game.load.audio('engine', 'assets/sounds/engine.mp3');
  game.load.audio('boom', 'assets/sounds/boom.wav');
  game.load.audio('fire', 'assets/sounds/fire.wav');
  game.load.audio('life', 'assets/sounds/extra-life.wav');
  game.load.audio('teleport', 'assets/sounds/teleport.mp3');
  game.load.spritesheet('asteroid', 'assets/images/asteroid.png', 40, 40);

  game.load.spritesheet('enemy-ship', 'assets/images/enemy-ship.png', 64, 64);
  game.load.image('enemy-bullet', 'assets/images/enemy-laser.png ');
  game.load.audio('enemy-fire', 'assets/sounds/enemy-fire.wav');
  game.load.audio('enemy-alarm', 'assets/sounds/alarm.mp3');

  game.load.image('space', 'assets/images/space-stars.jpg');
  game.load.image('title', 'assets/images/asteroids-2084-title.png');
  game.load.image('green-bar', 'assets/images/health-green.png');
  game.load.image('red-bar', 'assets/images/health-red.png');
  game.load.image('lives', 'assets/images/ship-lives.png');
}

// create game world - runs once after "preload" finished
function create() {
  space = game.add.tileSprite(0, 0, 800, 600, 'space');
  game.physics.startSystem(Phaser.Physics.ARCADE);
  scoreText = game.add.text(20, 20, 'Score: ' + score, { font: 'Arial', fontSize: '20px', fontStyle: 'bold', fill: '#ffffff' });
  healthText = game.add.text(210, 20, 'Shields', { font: 'Arial', fontSize: '20px', fontStyle: 'bold', fill: '#ffffff' });
  game.add.image(300, 20, 'red-bar');
  healthBar = game.add.image(300, 20, 'green-bar');
  livesBar = game.add.image(655, 20, 'lives');
  livesText = game.add.text(590, 20, 'Ships', { font: 'Arial', fontSize: '20px', fontStyle: 'bold', fill: '#ffffff' });
  livesCrop = new Phaser.Rectangle(0, 0, shipLives * 25, 25);
  livesBar.crop(livesCrop);
  laser = game.add.weapon(10, 'bullet');
  enemyLaser = game.add.weapon(10, 'enemy-bullet');
  laser.bulletKillType = Phaser.Weapon.KILL_CAMERA_BOUNDS;
  enemyLaser.bulletKillType = Phaser.Weapon.KILL_CAMERA_BOUNDS;
  laser.bulletSpeed = 600;
  enemyLaser.bulletSpeed = 600;
  laser.fireRate = 250;
  enemyLaser.fireRate = 750;
  enemyLaser.setBulletBodyOffset(16, 16, 4, 4);
  // set bullet collision area to match its visual size
  laser.setBulletBodyOffset(24, 12, 6, 6);
  player = game.add.sprite(game.world.centerX, game.world.centerY, 'ship');
  enemy = game.add.sprite(0, 0, 'enemy-ship');
  player.animations.add('moving', [0, 1, 2], 10, true);
  player.angle = -90;
  player.health = 100;
  player.maxHealth = 100;
  player.anchor.set(0.5, 0.5);
  enemy.anchor.set(0.5, 0.5);
  game.physics.arcade.enable(player);
  game.physics.arcade.enable(enemy);
  player.body.setCircle(20, 12, 12);
  enemy.body.setCircle(30, 2, 2);
  enemy.animations.add('moving', [0, 1, 2], 10, true);
  enemy.outOfBoundsKill = true;
  enemy.checkWorldBounds = true;
  enemy.animations.play('moving')
  enemy.exists = false;
  enemyLaser.trackSprite(enemy, 0, 0, false);
  player.body.maxVelocity.set(400);
  player.body.drag.set(20);
  player.exists = false;
  explosion = game.add.sprite(100, 100, 'explosion');
  explosion.anchor.set(.5,.5)
  explosion.animations.add('explosion', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], 30 ,false)
  explosion.visible = false; // hide until needed
  gameOverText = game.add.text(game.world.centerX - 150, 100, 'Game Over', { font: 'Arial', fontSize: '48px', fontStyle: 'bold', fill: '#ff0000' });
  gameOverText.visible = false;
  teleportSound = game.add.audio('teleport', 0.5);
  player.angle = -90;
  player.events.onKilled.add(function() {
    explosion.reset(player.x, player.y);
    explosion.animations.play('explosion', 30, false, true);
    shipLives = shipLives - 1;
    livesCrop.width = shipLives * 25;
    livesBar.crop(livesCrop);
    // respawn player if lives are left
    if (shipLives > 0) {
      player.x = game.world.centerX;
      player.y = game.world.centerY;
      player.angle = -90;
      player.body.velocity.set(0);
      player.body.acceleration.set(0);
      player.revive(player.maxHealth);
      player.alpha = 0; // start as transparent
      game.add.tween(player).to({ alpha: 1 }, 2000, Phaser.Easing.Cubic.Out, true);
      teleportSound.play()

    }
    else {
      // game over
      gameOverText.visible = true;
      game.add.tween(gameOverText).to({ alpha: 1 }, 1000, Phaser.Easing.Cubic.Out, true);
      game.add.tween(gameOverText.scale).to({ x: 1, y: 1 }, 1000, Phaser.Easing.Cubic.Out, true);
      game.add.tween(startText).to({ alpha: 1 }, 500, Phaser.Easing.Cubic.Out, true, 2000);
      fireKey.onDown.addOnce(restartGame, this);

    }
  });
  laser.trackSprite(player, 0, 0, true);
  asteroidGroup = game.add.group();
  asteroidGroup.enableBody = true;
  // add asteroids to group
  for (var i = 0; i < 10; i++) {
    // create individual asteroid in group
    var asteroid = asteroidGroup.create(game.world.randomX, game.world.randomY, 'asteroid');
    asteroid.anchor.set(0.5, 0.5);
    asteroid.body.setCircle(15, 5, 5);
    asteroid.animations.add('spin-clock', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 16, true);
    asteroid.animations.add('spin-counter', [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0], 16, true);
    if (Math.random() < 0.5) asteroid.animations.play('spin-clock');
    else asteroid.animations.play('spin-counter');
    // give asteroid random speed and direction
    asteroid.body.velocity.x = Math.random() * maxSpeed;
    if (Math.random() < 0.5) asteroid.body.velocity.x *= -1;

    asteroid.body.velocity.y = Math.random() * maxSpeed;
    if (Math.random() < 0.5) asteroid.body.velocity.y *= -1;

  }
  asteroidParticles = game.add.emitter(0, 0, 50);
  asteroidParticles.makeParticles('particle');
  asteroidParticles.gravity = 0;
  asteroidParticles.setAlpha(1, 0, 1000); // fade out after 1000 ms
  arrowKey = game.input.keyboard.createCursorKeys();
  fireKey = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
  engineSound = game.add.audio('engine', 0.3);
  engineSound.loop = true;
  engineSound.play();
  boomSound = game.add.audio('boom', 0.3);
  lifeSound = game.add.audio('life', 0.5);
  fireSound = game.add.audio('fire', 0.1);
  enemyAlarmSound = game.add.audio('enemy-alarm', 0.1);
  enemyFireSound = game.add.audio('enemy-fire', 0.5);
  explosion = game.add.sprite(100, 100, 'explosion')
  enemyExplosion = game.add.sprite(0, 0, 'explosion')
  explosion.animations.add('explosion', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 30, false);
  enemyExplosion.animations.add('explosion', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 30, false);
  explosion.visible = false; // hide until needed
  enemyExplosion.visible = false;
  laser.onFire.add(function() {
    fireSound.play();
  });
  enemyLaser.onFire.add(function() {
    enemyFireSound.play();
  });
  gameTitle = game.add.image(game.world.centerX - 225, 100, 'title');
  startText = game.add.text(game.world.centerX - 200, 300, 'Press Fire to Start Mission', { font: 'Arial', fontSize: '30px', fontStyle: 'bold', fill: '#00ff00' });
  fireKey.onDown.addOnce(startGame, this);
  game.time.events.loop(Phaser.Timer.SECOND * 30, spawnEnemy, this);
}

// update gameplay - runs in continuous loop after "create" finished
function update() {
  // keep player onscreen (instead of collideWorldBounds)
  // will allow space tilesprite to keep scrolling
  if (player.left <= 50) player.left = 50;
  else if (player.right >= game.world.width - 50) player.right = game.world.width - 50;
  game.physics.arcade.collide(player, asteroidGroup, collideAsteroid, null, this);
  game.physics.arcade.collide(laser.bullets, asteroidGroup, shootAsteroid, null, this);
  game.physics.arcade.collide(player, enemy, collideEnemy, null, this);
  game.physics.arcade.collide(laser.bullets, enemy, shootEnemy, null, this);
  game.physics.arcade.overlap(player, enemyLaser.bullets, shootPlayer, null, this);
  game.physics.arcade.collide(enemyLaser.bullets, asteroidGroup, removeAsteroid, null, this);
  checkNewLife();
  if (player.top <= 50) player.top = 50;
  else if (player.bottom >= game.world.height - 50) player.bottom = game.world.height - 50;
  if (arrowKey.left.isDown) {
    // rotate player counter-clockwise (negative value)
    player.body.angularVelocity = -400;
  }
  else if (arrowKey.right.isDown) {
    // rotate player clockwise (positive value)
    player.body.angularVelocity = 400;
  }
  else {
    // stop rotating player
    player.body.angularVelocity = 0;
  }

  if (arrowKey.up.isDown && player.exists) {
    // accelerate player forward
    // scroll space tilesprite in opposite direction of player velocity
    space.tilePosition.x = space.tilePosition.x - player.body.velocity.x / 40;
    space.tilePosition.y = space.tilePosition.y - player.body.velocity.y / 40;
    game.physics.arcade.accelerationFromRotation(player.rotation, 200, player.body.acceleration);
    player.animations.play('moving');
    engineSound.volume = 1;
  }
  else {
    // stop accelerating player
    player.body.acceleration.set(0);
    player.animations.stop();
    player.frame = 1;
    engineSound.volume = .3;
  }
  player.body.collideWorldBounds = true;
  if (fireKey.isDown && player.exists) {
    laser.fire();
  }
  asteroidGroup.forEach(function(asteroid) {
      game.world.wrap(asteroid, 20);
    });
  // randomly add new asteroid if dead asteroid available
  if (Math.random() < 0.02) {
    var asteroid = asteroidGroup.getFirstDead();
    if (asteroid) {
      // reset asteroid at random position in game
      asteroid.reset(game.world.randomX, game.world.randomY)

      // give asteroid random speed and direction
      asteroid.body.velocity.x = Math.random() * maxSpeed;
      asteroid.body.velocity.y = Math.random() * maxSpeed;

      // make asteroid fade into view
      asteroid.alpha = 0; // start as transparent
      game.add.tween(asteroid).to({ alpha: 1 }, 500, Phaser.Easing.Cubic.Out, true);
    }
  }
  if (enemy.exists) {
    enemy.rotation = game.physics.arcade.angleBetween(enemy, player); // rotate enemy towards player
    var fireError = Math.floor(Math.random() * 20) - 10; // random number between -10 and 10
    enemyLaser.fireAngle = enemy.angle + fireError; // add error so enemy not perfect shot
    enemyLaser.fire();
  }
}


// add custom functions (for collisions, etc.)
function collideAsteroid(player, asteroid) {
  asteroidParticles.x = asteroid.x;
  asteroidParticles.y = asteroid.y;
  asteroidParticles.explode(1000, 5);
  asteroid.kill();
  player.damage(25);
  healthBar.scale.setTo(player.health / player.maxHealth, 1);
  boomSound.play()
  game.camera.shake(0.02, 250);
}
function shootAsteroid(bullet, asteroid) {
  asteroidParticles.x = asteroid.x;
  asteroidParticles.y = asteroid.y;
  asteroidParticles.explode(1000, 5);
  asteroid.kill();
  bullet.kill();
  boomSound.play()
  maxSpeed = maxSpeed + 1;
  score = score + 250
  scoreText.text = 'Score: ' + score
}
function checkNewLife() {
  if (score >= newLife) {
    if (shipLives < maxLives) {
      // award extra life
      shipLives = shipLives + 1
      livesCrop.width = shipLives * 25;
      livesBar.crop(livesCrop);
      lifeSound.play()
      game.camera.flash(0x00ff00, 500);

    }
    // maxLives already reached
    else if (player.health < player.maxHealth) {
      // replenish health instead
      player.health = player.maxHealth
      healthBar.scale.setTo(player.health / player.maxHealth, 1);
      lifeSound.play()

    }
    // increase score needed for next new life
    newLife = newLife + 10000;
  }

}
function startGame() {
  // fade out start text
  game.add.tween(startText).to({ alpha: 0 }, 250, Phaser.Easing.Cubic.Out, true);

  // fade out and zoom out game title (after slight delay)
  game.add.tween(gameTitle).to({ alpha: 0 }, 3000, Phaser.Easing.Cubic.Out, true, 250);
  game.add.tween(gameTitle.scale).to({ x: 3, y: 3 }, 3000, Phaser.Easing.Cubic.Out, true, 250);

  // fade in player
  teleportSound.play()
  player.exists = true;
  game.add.tween(player).to({ alpha: 1 }, 2000, Phaser.Easing.Cubic.Out, true);
}
function restartGame() {
  score = 0;
  shipLives = 3;
  newLife = 10000;
  maxSpeed = 100;
  game.state.restart();
}
function spawnEnemy() {
  if (player.exists == false || score < 4999) return; // don't spawn enemy if game over or not started

  // generate random location (1-4) for enemy spawn site
  // 1 = top, 2 = right, 3 = bottom, 4 = left
  var spawnSite = Math.floor(Math.random() * 4) + 1;

  // generate random starting position and velocity to move enemy across screen
  if (spawnSite == 1) {
    enemy.x = Math.random() * 400 + 200; // 200 to 600
    enemy.y = 0; // top edge
    enemy.body.velocity.x = Math.random() * 100 - 50; // -50 to 50
    enemy.body.velocity.y = Math.random() * 50 + 100; // 100 to 150
  } else if (spawnSite == 2) {
    enemy.x = game.world.width; // right edge
    enemy.y = Math.random() * 200 + 200; // 200 to 400
    enemy.body.velocity.x = Math.random() * 50 - 150; // -150 to -100
    enemy.body.velocity.y = Math.random() * 100 - 50; // -50 to 50
  } else if (spawnSite == 3) {
    enemy.x = Math.random() * 400 + 200; // 200 to 600
    enemy.y = game.world.height; // bottom edge
    enemy.body.velocity.x = Math.random() * 100 - 50; // -50 to 50
    enemy.body.velocity.y = Math.random() * 50 - 150; // -150 to -100
  } else {
    enemy.x = 0; // left edge
    enemy.y = Math.random() * 200 + 200; // 200 to 400
    enemy.body.velocity.x = Math.random() * 50 + 100; // 100 to 150
    enemy.body.velocity.y = Math.random() * 100 - 50; // -50 to 50
  }

  enemy.revive();
}
function collideEnemy(player, enemy) {
  enemyExplosion.reset(enemy.x, enemy.y);
  enemyExplosion.animations.play('explosion', 30, false, true);
  enemy.kill();
  player.damage(25);
  healthBar.scale.setTo(player.health / player.maxHealth, 1);
  boomSound.play()
  game.camera.shake(0.02, 250);

}
function shootEnemy(bullet, enemy) {
  bullet.kill();
  enemy.kill();
  enemyExplosion.reset(enemy.x, enemy.y);
  enemyExplosion.animations.play('explosion', 30, false, true);
  boomSound.play();
  score = score + 2500
  scoreText.text = 'Score: ' + score
}
function shootPlayer(player, bullet) {
  bullet.kill();
  boomSound.play();
  game.camera.shake(0.02, 250);
  player.damage(25);
  healthBar.scale.setTo(player.health / player.maxHealth, 1);
}
function removeAsteroid(bullet, asteroid) {
  asteroidParticles.x = asteroid.x;
  asteroidParticles.y = asteroid.y;
  asteroidParticles.explode(1000, 5);
  asteroid.kill();
  bullet.kill();
  boomSound.play()
}