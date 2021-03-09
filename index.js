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
const birdsAmount = 40;
const birdX = canvasSize.width / 8;
const netLearningDelta = 0.0001;
const birdsToLeave = birdsAmount / 2;
let isCollision = false;
let isInTube = false;
let score = 0;
let tubeWindowTop;
context.fillStyle = 'red';
context.fillRect(0, 0, canvasSize.width, floorThickness);
context.fillRect(0, floorLevel, canvasSize.width, floorThickness);
let generation = 0;

let birds = [];
let deadBirds = [];
let tube;
let distanceToTube;
let bestScore = 0;
let bestNet;
const originalNet = JSON.parse('{"inputLayer":{"neurons":[{"weights":[1]},{"weights":[1]},{"weights":[1]},{"weights":[1]},{"weights":[1]}],"amountOfNeuronInputs":5,"isInputLayer":true},"hiddenLayers":[{"neurons":[{"weights":[0.5771143219439696,0.14517765025465268,0.055774178736009095,-0.9352206904584492,-0.13118723001324017]},{"weights":[0.6093100705260928,0.23419815227310492,-0.589275266431688,-0.26151085651486206,0.9188119466997904]},{"weights":[-0.7754016596496736,0.13044940828294482,0.23923374951942256,0.30330220702755195,0.632599570514524]},{"weights":[0.7099193753275439,-0.024904378776039238,0.4187774840233729,0.33887037840418843,0.9051654163299703]},{"weights":[-0.32231496459960773,0.8319874546608328,0.0769420164636001,-0.5739595096678776,0.5139456974353265]},{"weights":[-0.14872488778779402,-0.7291346643267458,-0.7050756405912773,-0.7314183367006675,0.5925344940946906]}],"amountOfNeuronInputs":5,"isInputLayer":false}],"outputLayer":{"neurons":[{"weights":[-0.5768456761094498,-0.36981971809289105,0.9931768417593005,-0.8786955773270391,0.5467691918401596,0.5659801978908963]}],"amountOfNeuronInputs":6,"isInputLayer":false}}');
// windowHeight = 250
// const originalNet = JSON.parse('{"inputLayer":{"neurons":[{"weights":[1]},{"weights":[1]},{"weights":[1]},{"weights":[1]},{"weights":[1]}],"amountOfNeuronInputs":5,"isInputLayer":true},"hiddenLayers":[{"neurons":[{"weights":[0.36134220442038867,-0.7377075077074857,0.6872835654421654,-0.9549712589521295,-0.3603119317069179]},{"weights":[0.9827525535527482,0.09513969630111772,-0.30496233482218016,-0.904231892080477,-0.1363217246019215]},{"weights":[-0.8310857757642989,-0.0020414621906989882,-0.09340992005964793,-0.49691390947691993,-0.08791774437960953]},{"weights":[-0.9874214990267773,0.9779070769263876,0.3214467327631054,-0.33518221893749955,-0.17422443426367829]},{"weights":[-0.94456779776612,0.257668008696992,-0.18508642487253435,-0.46300118689045844,0.18388292445576648]},{"weights":[-0.6764353036193516,0.024087145044122005,0.24362537936896755,-0.5699207741971086,-0.06429610674828261]}],"amountOfNeuronInputs":5,"isInputLayer":false}],"outputLayer":{"neurons":[{"weights":[-0.32246904492526496,-0.9855149120667666,0.23603107398243917,0.8292241198155039,0.014449120885982238,-0.6010116038375974]}],"amountOfNeuronInputs":6,"isInputLayer":false}}');
const results = [];

document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    birds.forEach(bird => bird.jump());
  }

  if (e.code === 'Enter' && isCollision) {
    init();
  }
});

function init() {
  isCollision = false;
  createBirds()
  tube = new Tube();
  isInTube = false;
  console.log('Generation: ' + ++generation, 'score: ' + score);
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
  birds.forEach(bird => bird.decreseSpeed());
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
  birds.forEach(bird => {
    context.fillStyle = bird.color;
    context.fillRect(bird.x, bird.y, bird.width, bird.height);
  });
}

function setBirdParams() {
  birds.forEach((bird) => {
    bird.y -= bird.speed / 10;
    const hasCellTouched = checkBirdCeilCollision(bird);
    const hasFloorTouched = checkBirdFloorCollision(bird);
    const hasTubeTouched = checkBirdTubeCollision(bird);
    if (hasCellTouched || hasFloorTouched || hasTubeTouched) {
      // if (hasFloorTouched) {
      //   bird.y = canvasSize.height - floorThickness - birdSize;
      // }
      //
      // if (hasCellTouched) {
      //   bird.y = floorThickness;
      // }
      // gameOver();
      deadBirds.push(bird);
    } else {
      bird.decreseSpeed();
    }

    birds = birds.filter(bird => !deadBirds.includes(bird));
    if (birds.length === 0) {
      gameOver();
    }

    birds.forEach(bird => {
      /*
      Net input - vertical speed, distance to floor, distance to ceil, distance to tube,  tube window top, tube window bottom
      net output - jump if rounded to 1;
       */
      const distanceToFloor = canvasSize.height - bird.y - birdSize - floorThickness;
      const distanceToCeil = bird.y - floorThickness;
      const distanceToWindowTop = bird.y - tubeWindowTop;
      const distanceToWindowBottom = distanceToWindowTop + tube.windowSize - bird.y - birdSize;
      if (Math.round(bird.net.input([
        distanceToFloor,
        distanceToCeil,
        distanceToTube,
        distanceToWindowTop,
        distanceToWindowBottom]))) {
        bird.jump();
      }
    })
  });
}

function gameOver() {
  isCollision = true;
  if (score > bestScore) {
    bestScore = score;
    bestNet = JSON.stringify(deadBirds[deadBirds.length - 1].net);
  }
  results.push(score);
  setTimeout(() => {
    init();
  }, 100);
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
  context.fillText(score + ', best ' + bestScore + ', ' + birds.length + ' birds left', scorePosition.x, scorePosition.y);
}

function createBirds() {
  let oldNets = [];
  if (deadBirds.length) {
    oldNets = deadBirds.reverse().map(bird => Net.copyNet(bird.net))
  } else if (originalNet) {
   for (let i = 0; i < birdsAmount; i++) {
     oldNets[i] = Net.copyNet(originalNet);
   }
  }
  for (let i = 0; i < birdsAmount; i++) {
      const birdPosition = canvasSize.height / 2;
      const bird = new Bird(birdX, birdPosition, birdSize, birdSize, birdJumpSpeed);
      if (i <= birdsToLeave) {
        bird.net = oldNets[i] || getNewNet();
        // bird.net.learn(netLearningDelta);
      } else {
        bird.net = getNewNet();
      }
      birds[i] = bird;
  }
  deadBirds = [];
}


function getNewNet() {
  return new Net(5, [6], 1);
}
init();
