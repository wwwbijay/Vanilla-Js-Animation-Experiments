let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
canvas.width = 800;
  canvas.height = 500;

class Button {
  constructor(x, y, r, type) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.id = null;
    this.type = type;

    this.dx = 0;
    this.dy = 0;
    this.distance = 0;

    if (type === undefined) this.type = "analog";
    this.fillColorOpacity = 0.3;
    this.pressed = false;
    //ourter circle
    this.X = this.x;
    this.Y = this.y;
    this.R = this.r * 2;
  }

  draw() {
    if (this.type == "analog") {
      let X = this.X - this.x;
      let Y = this.Y - this.y;

      let active_dist = Math.sqrt(X * X + Y * Y);

      if (active_dist > this.R) {
        this.dx = X / active_dist;
        this.dy = Y / active_dist;

        let overlap = Math.abs(active_dist - this.R);

        let overlapX = overlap * this.dx;
        let overlapY = overlap * this.dy;

        this.x += overlapX;
        this.y += overlapY;
      }

      
      //inner arc
      ctx.beginPath();
      ctx.save();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${this.fillColorOpacity})`;
      ctx.fill();
      ctx.closePath();
      ctx.restore();

      //outer arc
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${this.fillColorOpacity/3})`;
      ctx.arc(this.X, this.Y, this.R, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();

    } else if (this.type == "button") {
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${this.fillColorOpacity})`;
      ctx.arc(this.X, this.Y, this.R, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
  }

  addEvent() {
    canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      for (let i = 0; i < e.touches.length; i++) {
        switch (this.type) {
          case "analog":
            if (this.type === "analog") {
              if (e.touches[i].clientX < canvas.width / 2) {
                this.x = e.touches[i].clientX;
                this.y = e.touches[i].clientY;

                this.id = e.touches[i].identifer;
                this.pressed = true;
              }
            }
            break;
          case "button":
            if (
              e.touches[i].clientX <= this.x + this.r &&
              e.touches[i].clientX >= this.x - this.r &&
              e.touches[i].clientY <= this.y + this.r &&
              e.touches[i].clientY >= this.y - this.r
            ) {
              this.x = e.touches[i].clientX;
              this.y = e.touches[i].clientY;

              this.id = e.touches[i].identifer;
              this.pressed = true;
            }
            break;
        }
      }
    });

    canvas.addEventListener("touchmove", (e) => {
      for (let i = 0; i < e.touches.length; i++) {
        if (this.type == "analog" && e.touches[i].clientX < canvas.width / 2) {
          this.x = e.touches[i].clientX;
          this.y = e.touches[i].clientY;
        }
      }
    });

    canvas.addEventListener("touchend", (e) => {
      // this.id=changedtouches[0].identifer;
      for (let i = 0; i < e.changedTouches.length; i++) {
        this.x = e.changedTouches[i].clientX;
        this.y = e.changedTouches[i].clientY;

        if (this.id == e.changedTouches[i].identifer) {
          this.pressed = false;
          if (this.type == "analog") {
            this.x = this.X;
            this.y = this.Y;
          }
        }
      }
    });
  }

  drawText() {
    ctx.fillStyle = `rgba(255,255,255,1)`;
    ctx.fillText("x " + this.dx, 22, 22);
    ctx.fillText("y " + this.dy, 22, 44);
    ctx.fillText("pressed " + this.pressed, 22, 66);
    this.distance = Math.sqrt(this.dx*this.dx, this.dy* this.dy);
   
    ctx.fillText("Speed " + this.distance, 22, 88);
  }
}

let analog = new Button(90, canvas.height - 90, 30);

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  analog.draw();
  analog.drawText();

  requestAnimationFrame(animate);
}

analog.addEvent();
animate();
