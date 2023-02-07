window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = this.innerWidth;
    canvas.height = this.innerHeight;

    
    //Keeps track of specified user inputs, Eg. arrow keys.
    class InputHandler{
        constructor(game){
            this.game = game;
            window.addEventListener('keydown', function(e){  
                if(e.key ==='ArrowUp'){
                    this.game.keys.push(e.key);
                }                                
                console.log(this.game.keys);
            });

            window.addEventListener('keyup', function(e){
                if(this.game.keys.indexOf(e.key) > -1){
                    this.game.keys.splice(this.game.keys.indexOf(e.key),1);
                }
                console.log(this.game.keys);
            });
        }
    }
    //Handles player lasers
    class Projectile{

    }
    //handle falling particles (Eg. corks, screws, bolts etc. that comes from damaged enemies.)
    class Particle{

    }
    //Handle functions of main characters
    class Player{
        constructor(game){
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 20;
            this.y = 100;
            this.speedY = 2;
        }

        update(){
            this.y += this.speedY;
        }
        draw(context){
            context.fillStyle = 'gold';
            context.fillRect(this.x, this.y, this.width, this.height);
        }

    }
    //Main bluprint to handle functions of different enemy characters
    class Enemy{

    }
    //Handle individual background layers using parallax, seamlessly scrolling multilayer background.
    class Layer{

    }
    //pulls all layer objects together to animate entire game world.
    class Background{

    }
    //handle score, timer, that needs to be displayed for user.
    class UI{

    }
    //All Logic of the game comes in this class
    //This will be the brain of the project
    class Game{
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.player = new Player(this);
            this.input = new InputHandler(this);
        }

        update(){
            this.player.update();
        }
        draw(context){
            this.player.draw(context);
        }
    }


    const game = new Game(canvas.width, canvas.height);

    //animation loop
    function animate(){
        ctx.clearRect(0,0,canvas.width, canvas.height);
        game.update();
        game.draw(ctx);
        requestAnimationFrame(animate);
    }

    animate();

});



