class Bird {
  width = 50;
  height = 50;
  speed = 0;
  x = 0;
  y = 0;
  jumpSpeed = 0;
  color;
  net;

  constructor(x, y, width, height, jumpSpeed) {
    this.x = x;
    this.y = y;
    width && (this.width = width);
    height && (this.height = height);
    this.color = this.getRandomColor();
    this.jumpSpeed = jumpSpeed;
  }

  decreseSpeed() {
    this.speed = this.speed - 2;
  }

  jump() {
    this.speed = this.jumpSpeed;
  }

  getRandomColor() {
    var letters = '123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 15)];
    }
    return color;
  }
}
