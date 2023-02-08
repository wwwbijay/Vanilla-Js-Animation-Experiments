window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 1200;
  canvas.height = 580;

  //Keeps track of specified user inputs, Eg. arrow keys.
  class InputHandler {
    constructor(game) {
      this.game = game;
      window.addEventListener("keydown", (e) => {
        if (
          (e.key === "ArrowUp" || e.key === "ArrowDown") &&
          this.game.keys.indexOf(e.key) === -1
        ) {
          this.game.keys.push(e.key);
        } else if (e.key === " ") {
          this.game.player.shootTop();
        }
      });

      window.addEventListener("keyup", (e) => {
        if (this.game.keys.indexOf(e.key) > -1) {
          this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
        }
      });
    }
  }
  //Handles player lasers
  class Projectile {
    constructor(game, x, y) {
      this.game = game;
      this.width = 20;
      this.height = 10;
      this.x = x;
      this.y = y;
      this.speed = 3;
      this.markedForDeletion = false;
    }

    update() {
      this.x += this.speed;
      if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
    }

    draw(context) {
      context.fillStyle = "DarkCyan";
      context.fillRect(this.x, this.y, this.width, this.height);
    }
  }
  //handle falling particles (Eg. corks, screws, bolts etc. that comes from damaged enemies.)
  class Particle {}
  //Handle functions of main characters
  class Player {
    constructor(game) {
      this.game = game;
      this.width = 80;
      this.height = 190;
      this.x = 20;
      this.y = 100;
      this.speedY = 0;
      this.maxSpeed = 8;
      this.projectiles = [];
    }

    update() {
      if (this.game.keys.includes("ArrowUp")) this.speedY = -this.maxSpeed;
      else if (this.game.keys.includes("ArrowDown"))
        this.speedY = this.maxSpeed;
      else this.speedY = 0;
      this.y += this.speedY;
      this.projectiles.forEach((projectile) => {
        projectile.update();
      });
      this.projectiles = this.projectiles.filter(
        (projectile) => !projectile.markedForDeletion
      );
    }
    draw(context) {
      context.fillStyle = "LightCoral";
      context.fillRect(this.x, this.y, this.width, this.height);
      this.projectiles.forEach((projectile) => {
        projectile.draw(context);
      });
    }
    shootTop() {
      if (this.game.ammo > 0) {
        this.projectiles.push(new Projectile(this.game, this.x + 80, this.y));
        this.game.ammo--;
      }
    }
  }
  //Main bluprint to handle functions of different enemy characters
  class Enemy {
    constructor(game) {
      this.game = game;
      this.x = this.game.width;
      this.speedX = Math.random() * -1.5 - 0.5;
      this.markedForDeletion = false;
      this.lives = 5;
      this.score = this.lives;
    }
    update() {
      if(!this.game.gameOver) this.x += this.speedX;
      if (this.x + this.width < 0) this.markedForDeletion = true;
    }
    draw(context) {
      context.fillStyle = "red";
      context.fillRect(this.x, this.y, this.width, this.height);
      context.fillStyle = "black";
      context.font = "20px Helvetica";
      context.fillText(this.lives, this.x, this.y);
    }
  }

  class Angler1 extends Enemy {
    constructor(game) {
      super(game);
      this.width = 228 * 0.4;
      this.height = 169 * 0.4;
      this.y = Math.random() * (this.game.height * 0.9 - this.height);
    }
  }
  //Handle individual background layers using parallax, seamlessly scrolling multilayer background.
  class Layer {}
  //pulls all layer objects together to animate entire game world.
  class Background {}
  //handle score, timer, that needs to be displayed for user.
  class UI {
    constructor(game) {
      this.game = game;
      this.fontSize = 25;
      this.fontFamily = "Helvetica";
      this.color = "Orange";
    }

    draw(context) {
      context.save();
      //score UI
      context.fillStyle = "black";
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;
      context.shadowColor = "rgba(0,0,0,0.1)";
      context.font = "20px Helvetica";
      context.fillText("Score:" + this.game.score, 20, 40);
      // aummo UI background
      context.fillStyle = "OldLace";
      context.fillRect(10, 50, 8 * this.game.maxAmmo + 15, 30);

      context.fillStyle = this.color;
      //ammo
      for (let i = 0; i < this.game.ammo; i++) {
        context.fillRect(20 + 8 * i, 55, 4, 20);
      }

      //game Time
      context.fillStyle = "black";
      context.font = "12px" + this.fontFamily;
      context.fillText(
        "Timer: " + parseInt(this.game.gameTime / 1000).toFixed(1),
        this.game.width - 180,
        40
      );

      if (this.game.gameOver) {

        context.textAlign = 'center';
        //game over messages
        let message1;
        let message2;
   

        if (this.game.score > this.game.winningScore) {
          message1 = "You Win!";
          message2 = "Well done!";
          
        } else {
          message1 = "You Lose!";
          message2 = "Try again next time!";
        }
     context.font = "50px " + this.fontFamily;
        context.fillText( message1, this.game.width * 0.5, this.game.height * 0.5 - 50);
        context.font = "25px " + this.fontFamily;
        context.fillText(
          message2,
          this.game.width * 0.5,
          this.game.height * 0.5  + 50
        );
      }

      context.restore();
    }
  }
  //All Logic of the game comes in this class
  //This will be the brain of the project
  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.player = new Player(this);
      this.input = new InputHandler(this);
      this.ui = new UI(this);
      this.enemyTimer = 0;
      this.enemyInterval = 1000;
      this.enemies = [];
      this.keys = [];
      this.ammo = 20;
      this.maxAmmo = 40;
      this.ammoTimer = 0;
      this.ammoInterval = 500;
      this.gameOver = false;
      this.score = 0;
      this.winningScore = 20;
      this.gameTime = 0;
      this.timeLimit = 5000000;
    }

    update(deltaTime) {
      if (!this.gameOver) this.gameTime += deltaTime;

      if (this.gameTime > this.timeLimit) this.gameOver = true;

      this.player.update();
      if (this.ammoTimer > this.ammoInterval) {
        if (this.ammo < this.maxAmmo) this.ammo++;
        this.ammoTimer = 0;
      } else {
        this.ammoTimer += deltaTime;
      }

      this.enemies.forEach((enemy) => {
        enemy.update();
        if (this.checkCollision(this.player, enemy)) {
          enemy.markedForDeletion = true;
        }

        this.player.projectiles.forEach((projectile) => {
          if (this.checkCollision(projectile, enemy)) {
            projectile.markedForDeletion = true;
            enemy.lives--;
            if (enemy.lives <= 0) {
              enemy.markedForDeletion = true;
              console.log(this.gameOver);

              if (!this.gameOver) this.score += enemy.score;

              if (this.score > this.winningScore) this.gameOver = true;
            }
          }
        });

      });

      this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);

      if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
        this.addEnemy();
        this.enemyTimer = 0;
      } else {
        this.enemyTimer += deltaTime;
      }
    }
    draw(context) {
      this.player.draw(context);
      this.ui.draw(context);
      //draw all enemies
      this.enemies.forEach((enemy) => {
        enemy.draw(context);
      });
    }
    addEnemy() {
      this.enemies.push(new Angler1(this));
    }
    checkCollision(rect1, rect2) {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      );
    }
  }

  const game = new Game(canvas.width, canvas.height);
  let lastTime = 0;
  //animation loop
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.update(deltaTime);
    game.draw(ctx);
    requestAnimationFrame(animate);
  }

  animate(0);
});
