class Tube {
  windowSize = 200;
  windowTop = 0;
  position = 0;
  windowTopPx = 0;
  windowBottomPx = 0;

  constructor() {
    this.windowTop = Math.round(Math.random() * 10) * 10;
  }
}
