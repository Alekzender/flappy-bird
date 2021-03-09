function loadResources() {
  return Promise.all([loadImage('./floor.jpg')])
}

function loadImage(src) {
  const image = new Image();
  image.src = src;
  return new Promise((resolve) => {
    image.onload = function () {
      resolve(image);
    }
  });
}
