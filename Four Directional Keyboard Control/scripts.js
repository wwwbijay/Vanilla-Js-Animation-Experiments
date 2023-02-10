window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
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
        this.game.lastKey = 'P' + e.key;
      });

      window.addEventListener("keyup", (e) => {
        this.game.lastKey = 'R' + e.key;
      });
    }
  }

  class Player{
    constructor(game) {
        this.game = game;
        this.width = 200;
        this.height = 200;
        this.x = 200;
        this.y = 200;
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 37;
        this.speedX = 0;
        this.speedY = 0;
        this.maxSpeed = 3;
        this.projectiles = [];
        this.image = document.getElementById("player");
        this.powerUp = false;
        this.powerUpTimer = 0;
        this.powerUpLimit = 10000;
        this.image = document.getElementById('owlbear');
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

      setSpeed(speedX, speedY){
        this.speedX = speedX;
        this.speedY = speedY;
      }

      update(){
 
        if(this.game.lastKey == 'PArrowLeft') this.setSpeed(-this.maxSpeed,0);
        else if(this.game.lastKey == 'PArrowRight') this.setSpeed(this.maxSpeed,0);
        else if(this.game.lastKey == 'PArrowUp') this.setSpeed(0,-this.maxSpeed);
        else if(this.game.lastKey == 'PArrowDown') this.setSpeed(0,this.maxSpeed);
        else this.setSpeed(0,0);

        this.x += this.speedX;
        this.y += this.speedY;

        //Set Horizontal boundaries
        if(this.x < 0) this.x = 0;
        else if(this.x > this.game.width - this.width) this.x = this.game.width-this.width;

        //Set Vertical boundaries
        if(this.y < this.game.topMargin) this.y = this.game.topMargin;
        else if(this.y > this.game.height - this.height-10) this.y = this.game.height-this.height-10;
       
      }
  }

  class Object{

  }

  class Game{
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
        this.topMargin = 200;
      }

      render(context){
        this.player.draw(context);
        this.player.update();
      }
  }

  const game = new Game(canvas.width, canvas.height);
  game.render(ctx);

      let lastTime = 0;
      //animation loop
      function animate(timeStamp) {
        // const deltaTime = timeStamp - lastTime;
        // lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // game.update(deltaTime);
        game.render(ctx);
        requestAnimationFrame(animate);
      }

      animate();

});