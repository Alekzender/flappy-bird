const canvas = document.getElementById('canvas');
const canvasSize = {
  width: 800,
  height: 600
};
canvas.width = canvasSize.width;
canvas.height = canvasSize.height;
const floorThickness = 50;
const context = canvas.getContext('2d');
const birdJumpSpeed = 100;
const birdSize = 50;
const floorLevel = canvasSize.height - floorThickness;
const tubeWidth = 150;
const tubeSpeed = 80;
const birdX = canvasSize.width / 8;
let isCollision = false;
let isInTube = false;
let score = 0;
let tubeWindowTop;
context.fillStyle = 'red';
context.fillRect(0, 0, canvasSize.width, floorThickness);
context.fillRect(0, floorLevel, canvasSize.width, floorThickness);

let bird;
let tube;
let distanceToTube;
let bestScore = 0;
const results = [];

document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    bird.jump();
  }

  if (e.code === 'Enter' && isCollision) {
    init();
  }
});

function init() {
  isCollision = false;
  bird = new Bird(birdX, birdX, birdSize, birdSize, birdJumpSpeed);
  tube = new Tube();
  isInTube = false;
  score = 0;
  window.requestAnimationFrame(draw);
}

function draw() {
  setTubeParams();
  resetScene();
  drawTube();
  setBirdParams();
  drawBird();
  drawScore();
  bird.decreseSpeed();
  !isCollision && window.requestAnimationFrame(draw);
}

function checkBirdFloorCollision(bird) {
  return bird.y >= (floorLevel - birdSize);
}

function checkBirdCeilCollision(bird) {
  return bird.y <= floorThickness;
}

function checkBirdTubeCollision(bird) {
  const tubePxPosition = canvasSize.width - tube.position;
  if ((bird.x + birdSize < tubePxPosition) || (bird.x > tubePxPosition + tubeWidth)) {
    if (isInTube) {
      isInTube = false;
      score++;
    }

    return false;
  }

  if (bird.y < tube.windowTopPx || bird.y + birdSize > tube.windowBottomPx) {
    return true;
  }

  isInTube = true;

  return false;
}

function resetScene() {
  context.clearRect(0, floorThickness, canvasSize.width, canvasSize.height - floorThickness * 2);
  context.fillStyle = 'black';
  context.fillRect(0, floorThickness, canvasSize.width, canvasSize.height - floorThickness * 2);
}

function drawBird() {
  context.fillStyle = bird.color;
  context.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function setBirdParams() {
  bird.y -= bird.speed / 10;
  const hasCellTouched = checkBirdCeilCollision(bird);
  const hasFloorTouched = checkBirdFloorCollision(bird);
  const hasTubeTouched = checkBirdTubeCollision(bird);
  if (hasCellTouched || hasFloorTouched || hasTubeTouched) {
    if (hasFloorTouched) {
      bird.y = canvasSize.height - floorThickness - birdSize;
    }

    if (hasCellTouched) {
      bird.y = floorThickness;
    }
    gameOver();
  } else {
    bird.decreseSpeed();
  }
}

function gameOver() {
  isCollision = true;
  if (score > bestScore) {
    bestScore = score;
  }
}

function setTubeParams() {
  tube.position += tubeSpeed / 10;
  if (tube.position > (tubeWidth + canvasSize.width)) {
    tube = new Tube();
  }
}

function drawTube() {
  context.fillStyle = 'red';
  const tubePosition = canvasSize.width - tube.position;
  const topTubeHeight = ((canvasSize.height - tube.windowSize - floorThickness * 2) / 100) * tube.windowTop;
  tubeWindowTop = topTubeHeight + floorThickness;
  tube.windowTopPx = topTubeHeight + floorThickness;
  tube.windowBottomPx = tube.windowTopPx + tube.windowSize;
  context.fillRect(tubePosition, floorThickness, tubeWidth, topTubeHeight);
  const bottomTubeHeight = canvasSize.height - floorThickness * 2 - tube.windowSize - topTubeHeight;
  const bottomTubePosition = canvasSize.height - floorThickness - bottomTubeHeight;
  context.fillRect(tubePosition, bottomTubePosition, tubeWidth, bottomTubeHeight);
  distanceToTube = tubePosition - birdX - birdSize;
}

function drawScore() {
  const scorePosition = {
    x: canvasSize.width /  2,
    y: floorThickness * .75,
  }
  context.fillStyle = 'red';
  context.fillRect(scorePosition.x / 2, 0, scorePosition.x, floorThickness);
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.font = '35px Arial';
  context.fillText(score, scorePosition.x, scorePosition.y);
}
init();
