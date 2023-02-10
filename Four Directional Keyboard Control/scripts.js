window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 1280;
  canvas.height = 720;

  //Keeps track of specified user inputs, Eg. arrow keys.
  class InputHandler {
    constructor(game) {
      this.game = game;
      /* Arrow functions dont bind their own this, 
      but they inherit the one from parent scope. 
      This is called lexical scoping.
      */
      window.addEventListener("keydown", (e) => {
        this.game.lastKey = "P" + e.key;
      });

      window.addEventListener("keyup", (e) => {
        this.game.lastKey = "R" + e.key;
      });
    }
  }

  class Player {
    constructor(game) {
      this.game = game;
      this.width = 200;
      this.height = 200;
      this.x = 200;
      this.y = 200;
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 30;
      this.speedX = 0;
      this.speedY = 0;
      this.maxSpeed = 1.5;
      this.projectiles = [];
      this.image = document.getElementById("player");
      this.powerUp = false;
      this.powerUpTimer = 0;
      this.powerUpLimit = 10000;
      this.image = document.getElementById("owlbear");
      this.fps = 60;
      this.frameInterval = 1000 / this.fps;
      this.frameTimer = 0;
    }

    draw(context) {
      if (!this.game.debug)
        context.fillRect(this.x, this.y, this.width, this.height);

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
    }

    setSpeed(speedX, speedY) {
      this.speedX = speedX;
      this.speedY = speedY;
    }

    update(deltaTime = 0) {
      if (this.game.lastKey == "PArrowLeft") {
        this.setSpeed(-this.maxSpeed, 0);
        this.frameY = 3;
      } else if (this.game.lastKey == "RArrowLeft" && this.speedX < 0) {
        this.setSpeed(0, 0);
        this.frameY = 2;
      } else if (this.game.lastKey == "PArrowRight") {
        this.setSpeed(this.maxSpeed, 0);
        this.frameY = 5;
      } else if (this.game.lastKey == "RArrowRight" && this.speedX > 0) {
        this.setSpeed(0, 0);
        this.frameY = 4;
      } else if (this.game.lastKey == "PArrowUp") {
        this.setSpeed(0, -this.maxSpeed * 0.5);
        this.frameY = 7;
      } else if (this.game.lastKey == "RArrowUp" && this.speedY < 0) {
        this.setSpeed(0, 0);
        this.frameY = 6;
      } else if (this.game.lastKey == "PArrowDown") {
        this.setSpeed(0, this.maxSpeed * 0.5);
        this.frameY = 1;
      } else if (this.game.lastKey == "RArrowDown" && this.speedY > 0) {
        this.setSpeed(0, 0);
        this.frameY = 0;
      }

      this.x += this.speedX;
      this.y += this.speedY;

      //Set Horizontal boundaries
      if (this.x < 0) this.x = 0;
      else if (this.x > this.game.width - this.width)
        this.x = this.game.width - this.width;

      //Set Vertical boundaries
      if (this.y < this.game.topMargin) this.y = this.game.topMargin;
      else if (this.y > this.game.height - this.height - 10)
        this.y = this.game.height - this.height - 10;

      //sprite animation
      if (this.frameTimer > this.frameInterval) {
        this.frameX < this.maxFrame ? (this.frameX += 1) : (this.frameX = 0);
        this.frameTimer = 0;
      } else {
        this.frameTimer += deltaTime;
      }
    }
  }

  class Object {
    constructor(game) {
      this.game = game;
    }
    draw(context) {
      context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
    update(deltaTime) {}
  }

  class Bush extends Object {
    constructor(game) {
      super(game);
      this.image = document.getElementById("bush");
      this.width = 216;
      this.height = 100;
      this.x = Math.random() * this.game.width - this.width;
      this.y =
        this.game.topMargin +
        Math.random() * (this.game.height - this.height - this.game.topMargin);
    }
  }
  class Plant extends Object {
    constructor(game) {
      super(game);
      this.image = document.getElementById("plant");
      this.width = 212;
      this.height = 118;
      this.x = Math.random() * this.game.width - this.width;
      this.y =
        this.game.topMargin +
        Math.random() * (this.game.height - this.height - this.game.topMargin);
    }
  }
  class Grass extends Object {
    constructor(game) {
      super(game);
      this.image = document.getElementById("grass");
      this.width = 103;
      this.height = 183;
      this.x = Math.random() * this.game.width - this.width;
      this.y =
        this.game.topMargin +
        Math.random() * (this.game.height - this.height - this.game.topMargin);
    }
  }

  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.player = new Player(this);
      this.input = new InputHandler(this);
      this.gameOver = false;
      this.score = 0;
      this.winningScore = 100;
      this.gameTime = 0;
      this.timeLimit = 5000000;
      this.speed = 1;
      this.debug = true;
      this.topMargin = 130;
      this.numberOfPlants = 10;
      this.plants = [];
      this.gameObjects = [];
    }

    render(context, deltaTime) {
      this.gameObjects = [this.player, ...this.plants];
      this.gameObjects.sort((a, b) => {
        return a.y + a.height - (b.y + b.height);
      });
      this.gameObjects.forEach((gameObject) => {
        gameObject.draw(context);
        gameObject.update(deltaTime);
      });
    }

    init() {
      for (let i = 0; i < this.numberOfPlants; i++) {
        const randomize = Math.random();
        if (randomize < 0.3) this.plants.push(new Bush(this));
        else if (randomize < 0.6) this.plants.push(new Plant(this));
        else this.plants.push(new Grass(this));
      }
    }
  }

  const game = new Game(canvas.width, canvas.height);
  game.init(ctx);

  let lastTime = 0;
  //animation loop
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(ctx, deltaTime);
    requestAnimationFrame(animate);
  }
  animate(0);
});
