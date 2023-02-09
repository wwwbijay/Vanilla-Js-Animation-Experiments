window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 1100;
  canvas.height = 500;

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
          if (!this.game.player.powerUp) this.game.player.shootTop();
          else {
            this.game.player.shootTop();
            this.game.player.shootBottom();
          }
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
      this.image = document.getElementById("projectile");
    }

    update() {
      this.x += this.speed;
      if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
    }

    draw(context) {
      if (this.game.debug)
        context.strokeRect(this.x, this.y, this.width, this.height);
      context.drawImage(this.image, this.x, this.y);
    }
  }

  //handle falling particles (Eg. corks, screws, bolts etc. that comes from damaged enemies.)
  class Particle {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.image = document.getElementById("gears");
      this.frameX = Math.floor(Math.random() * 3);
      this.frameY = Math.floor(Math.random() * 3);
      this.spriteSize = 50;
      this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1);
      this.size = this.spriteSize * this.sizeModifier;
      this.speedX = Math.random() * 6 - 3;
      this.speedY = Math.random() * -15;
      this.gravity = 0.5;
      this.markedForDeletion = false;
      this.angle = 0;
      this.va = Math.random() * 0.2 - 0.1;
      this.bounced = 0;
      this.bottomBounceBoundary = Math.random()* 80 + 60;
    }
    update() {
      this.angle += this.va;
      this.speedY += this.gravity;
      this.x -= this.speedX;
      this.y += this.speedY;
      if (this.y > this.game.height + this.size || this.x < 0 - this.size) {
        this.markedForDeletion = true;
      }

      //bounce
      if(this.y > this.game.height - this.bottomBounceBoundary && this.bounced < 2){
        this.bounced++;
        this.speedY *= -0.5; 
      }


    }
    draw(context) {
      context.save();
      context.translate(this.x, this.y);
      context.rotate(this.angle);

      //draw Particle
      context.drawImage(
        this.image,
        this.frameX * this.spriteSize,
        this.frameY * this.spriteSize,
        this.spriteSize,
        this.spriteSize,
        this.size * -0.5,
        this.size * -0.5,
        this.size,
        this.size
      );

      context.restore();
    }
  }
  //Handle functions of main characters
  class Player {
    constructor(game) {
      this.game = game;
      this.width = 120;
      this.height = 190;
      this.x = 30;
      this.y = 100;
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 37;
      this.speedY = 0;
      this.maxSpeed = 8;
      this.projectiles = [];
      this.image = document.getElementById("player");
      this.powerUp = false;
      this.powerUpTimer = 0;
      this.powerUpLimit = 10000;
    }

    update(deltaTime) {
      if (this.game.keys.includes("ArrowUp")) this.speedY = -this.maxSpeed;
      else if (this.game.keys.includes("ArrowDown"))
        this.speedY = this.maxSpeed;
      else this.speedY = 0;
      this.y += this.speedY;

      //set vertical boundary
      if (this.y > this.game.height - this.height * 0.5)
        this.y = this.game.height - this.height * 0.5;
      else if (this.y < -this.height * 0.5) this.y = -this.height * 0.5;

      //add projectiles
      this.projectiles.forEach((projectile) => {
        projectile.update();
      });

      this.projectiles = this.projectiles.filter(
        (projectile) => !projectile.markedForDeletion
      );

      //sprite animation
      if (this.frameX < this.maxFrame) {
        this.frameX += 1;
      } else {
        this.frameX = 0;
      }

      //powerup
      if (this.powerUp) {
        if (this.powerUpTimer > this.powerUpLimit) {
          this.powerUpTimer = 0;
          this.powerUp = false;
          this.frameY = 0;
          this.game.ammo = this.game.maxAmmo;
        } else {
          this.powerUpTimer += deltaTime;
          this.frameX = 0;
          this.frameY = 1;
          this.game.ammo += 0.1;
        }
      }
    }

    draw(context) {
      if (this.game.debug)
        context.strokeRect(this.x, this.y, this.width, this.height);
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );

      this.projectiles.forEach((projectile) => {
        projectile.draw(context);
      });
    }

    shootTop() {
      if (this.game.ammo > 0) {
        this.projectiles.push(
          new Projectile(this.game, this.x + 90, this.y + 28)
        );
        this.game.ammo--;
      }
    }

    shootBottom() {
      if (this.game.ammo > 0) {
        this.projectiles.push(
          new Projectile(this.game, this.x + 90, this.y + 155)
        );
        this.game.ammo--;
      }
    }

    enterPowerUp() {
      this.powerUpTimer = 0;
      this.powerUp = true;
      this.game.ammo = this.game.maxAmmo;
    }
  }
  //Main bluprint to handle functions of different enemy characters
  class Enemy {
    constructor(game) {
      this.game = game;
      this.x = this.game.width;
      this.speedX = Math.random() * -1.5 - 0.5;
      this.markedForDeletion = false;
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 39;
    }
    update() {
      //move enemy if game is not over
      if (!this.game.gameOver) this.x += this.speedX - this.game.speed;
      //delete enemy if it goes out of screen.
      if (this.x + this.width < 0) this.markedForDeletion = true;

      //sprite animation
      if (this.frameX < this.maxFrame) {
        this.frameX += 1;
      } else {
        this.frameX = 0;
      }
    }
    draw(context) {
      if (this.game.debug)
        context.strokeRect(this.x, this.y, this.width, this.height);
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
      context.fillStyle = "black";
      context.font = "20px Helvetica";
      context.fillText(this.lives, this.x, this.y);
    }
  }

  class Angler1 extends Enemy {
    constructor(game) {
      super(game);
      this.lives = 2;
      this.score = this.lives;
      this.width = 228;
      this.height = 169;
      this.y = Math.random() * (this.game.height * 0.9 - this.height);
      this.image = document.getElementById("angler1");
      this.frameX = 0;
      this.frameY = Math.floor(Math.random() * 3);
    }
  }

  class Angler2 extends Enemy {
    constructor(game) {
      super(game);
      this.lives = 5;
      this.score = this.lives;
      this.width = 213;
      this.height = 165;
      this.y = Math.random() * (this.game.height * 0.9 - this.height);
      this.image = document.getElementById("angler2");
      this.frameX = 0;
      this.frameY = Math.floor(Math.random() * 2);
    }
  }

  class LuckyFish extends Enemy {
    constructor(game) {
      super(game);
      this.lives = 3;
      this.score = 10;
      this.width = 99;
      this.height = 95;
      this.y = Math.random() * (this.game.height * 0.9 - this.height);
      this.image = document.getElementById("lucky");
      this.frameX = 0;
      this.frameY = Math.floor(Math.random() * 2);
      this.type = "lucky";
    }
  }
  //Handle individual background layers using parallax, seamlessly scrolling multilayer background.
  class Layer {
    constructor(game, image, speedModifier) {
      this.game = game;
      this.image = image;
      this.speedModifier = speedModifier;
      this.x = 0;
      this.y = 0;
      this.width = 1768;
      this.height = 500;
    }

    update() {
      if (this.x <= -this.width) this.x = 0;
      this.x -= this.game.speed * this.speedModifier;
    }

    draw(context) {
      context.drawImage(this.image, this.x, this.y);
      context.drawImage(this.image, this.x + this.width, this.y);
    }
  }

  //pulls all layer objects together to animate entire game world.
  class Background {
    constructor(game) {
      this.game = game;
      this.image1 = document.getElementById("layer1");
      this.image2 = document.getElementById("layer2");
      this.image3 = document.getElementById("layer3");
      this.image4 = document.getElementById("layer4");
      this.layer1 = new Layer(this.game, this.image1, 0.2);
      this.layer2 = new Layer(this.game, this.image2, 0.4);
      this.layer3 = new Layer(this.game, this.image3, 1);
      this.layer4 = new Layer(this.game, this.image4, 1.8);
      this.layers = [this.layer1, this.layer2, this.layer3];
    }

    update() {
      this.layers.forEach((layer) => layer.update());
    }

    draw(context) {
      this.layers.forEach((layer) => layer.draw(context));
    }
  }

  //handle score, timer, that needs to be displayed for user.
  class UI {
    constructor(game) {
      this.game = game;
      this.fontSize = 25;
      this.fontFamily = "Rye";
      this.color = "white";
    }

    draw(context) {
      context.save();
      //score UI
      context.fillStyle = this.color;
      context.shadowOffsetX = 3;
      context.shadowOfFfsetY = 2;
      context.shadowColor = "rgba(0,0,0,0.1)";
      context.font = "20px " + this.fontFamily;
      context.fillText("Score:" + this.game.score, 20, 40);

      context.fillStyle = this.color;
      if (this.game.player.powerUp) context.fillStyle = "orange";
      //ammo
      for (let i = 0; i < this.game.ammo; i++) {
        context.fillRect(20 + 8 * i, 55, 4, 20);
      }

      //game Time
      context.fillStyle = this.color;
      context.font = "12px" + this.fontFamily;
      context.fillText(
        "Timer: " + parseInt(this.game.gameTime / 1000).toFixed(1),
        this.game.width - 180,
        40
      );

      if (this.game.gameOver) {
        context.textAlign = "center";
        //game over messages
        let message1;
        let message2;

        if (this.game.score > this.game.winningScore) {
          message1 = "Excellent Job!";
          message2 = "Well done explorer!";
        } else {
          message1 = "You Lose!";
          message2 = "Try again next time!";
        }
        context.font = "100px " + this.fontFamily;
        context.fillText(
          message1,
          this.game.width * 0.5,
          this.game.height * 0.5 - 50
        );
        context.font = "30px " + this.fontFamily;
        context.fillText(
          message2,
          this.game.width * 0.5,
          this.game.height * 0.5 + 50
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
      this.background = new Background(this);
      this.player = new Player(this);
      this.input = new InputHandler(this);
      this.ui = new UI(this);
      this.enemyTimer = 0;
      this.enemyInterval = 2000;
      this.particles = [];
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
      this.speed = 1;
      this.debug = false;
    }

    update(deltaTime) {
      if (!this.gameOver) this.gameTime += deltaTime;
      else this.speed = 0;
      if (this.gameTime > this.timeLimit) this.gameOver = true;
      this.background.update();
      this.background.layer4.update();
      this.player.update(deltaTime);
      if (this.ammoTimer > this.ammoInterval) {
        if (this.ammo < this.maxAmmo) this.ammo++;
        this.ammoTimer = 0;
      } else {
        this.ammoTimer += deltaTime;
      }

      //update particles;
      this.particles.forEach(particle=> particle.update());
      this.particles = this.particles.filter((particle) => !particle.markedForDeletion);
      
      //update enemies;
      this.enemies.forEach((enemy) => {
        enemy.update();
        if (this.checkCollision(this.player, enemy)) {
          enemy.markedForDeletion = true;
          for(let i=0; i<10; i++){
            this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
          }
          if (enemy.type == "lucky") this.player.enterPowerUp();
          else this.score -= enemy.score;
        }

        this.player.projectiles.forEach((projectile) => {
          if (this.checkCollision(projectile, enemy)) {
            projectile.markedForDeletion = true;
            enemy.lives--;
            this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
            if (enemy.lives <= 0) {
              enemy.markedForDeletion = true;
              
              for(let i=0; i<10; i++){
                this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
              }
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
      this.background.draw(context);
      this.ui.draw(context);
      this.player.draw(context);
      //draw all enemies
      this.enemies.forEach((enemy) => {
        enemy.draw(context);
      });
      //draw all particles
      this.particles.forEach((particle) => {
        particle.draw(context);
      });
      this.background.layer4.draw(context);
    }

    addEnemy() {
      const randomize = Math.random();
      if (randomize < 0.4) this.enemies.push(new Angler1(this));
      else if (randomize < 0.8) this.enemies.push(new Angler2(this));
      else this.enemies.push(new LuckyFish(this));
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
