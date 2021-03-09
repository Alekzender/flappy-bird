class Neuron {
  weights = [];
  constructor(inputCount) {
    if (inputCount > 1) {
      for(let i = 0; i < inputCount; i++) {
        this.weights[i] = Math.random() * 2 - 1; // -1 - 1
      }
    } else {
      this.weights = [1];
    }
  }

  input(input) {
    if (this.weights.length === 1 && typeof input === 'number') {
      return input;
    }

    if (!Array.isArray(input) || input.length === this.weights) {
      throw Error('Invalid input');
    }

    const transformedValues = this.weights.map((weight, index) => weight * input[index]);
    const sum = transformedValues.reduce((acc, el) => { return acc + el }, 0);

    return this.activator(sum);
  }

  activator(value) {
    return 1 / (1 + Math.exp(-value));
  }

  correctWeights(delta) {
    this.weights.forEach((weight, index) => {
      const shouldChange = Math.round(Math.random()) === 0;
      const isNegative = Math.round(Math.random()) === 0;
      isNegative && (delta = -delta);
      this.weights[index] = shouldChange ? weight + delta : weight;
    });
  }
}

class Layer {
  neurons = [];
  amountOfNeuronInputs;
  isInputLayer = true;

  constructor(amountOfNeurons, amountOfNeuronInputs, isInputLayer) {
    this.amountOfNeuronInputs = amountOfNeuronInputs;
    this.isInputLayer = !!isInputLayer;

    if (this.isInputLayer) {
      for(let i = 0; i < amountOfNeurons; i++) {
        this.neurons[i] = new Neuron(1);
      }
    } else {
      for(let i = 0; i < amountOfNeurons; i++) {
        this.neurons[i] = new Neuron(amountOfNeuronInputs);
      }
    }
  }

  input(inputs) {
    if (this.isInputLayer) {
      if (inputs.length !== this.neurons.length) {
        throw Error('Invalid input for input layer')
      }
      return this.neurons.map((neuron, index) => {
        const res = this.neurons[index].input(inputs[index])
        return res;
      });
    }

    if (!Array.isArray(inputs) || inputs.length !== this.amountOfNeuronInputs) {
      throw Error('Invalid input for layer');
    }

    return this.neurons.map(neuron => {
      return neuron.input(inputs);
    });
  }

  learn(delta) {
    this.neurons.forEach(neuron => neuron.correctWeights(delta));
  }
}

class Net {
  inputLayer;
  hiddenLayers = [];
  outputLayer;

  static copyNet(net) {
    const copy = Net.copyObject(net, Net.getNetPrototype(net));

    copy.inputLayer = Net.copyObject(copy.inputLayer, Net.getLayerPrototype(copy.inputLayer));
    copy.outputLayer = Net.copyObject(copy.outputLayer, Net.getLayerPrototype(copy.outputLayer));
    copy.inputLayer.neurons.forEach((neuron, index) => (copy.inputLayer.neurons[index] = Net.copyObject(neuron, Net.getNeuronPrototype(neuron))));
    copy.outputLayer.neurons.forEach((neuron, index) => (copy.outputLayer.neurons[index] = Net.copyObject(neuron, Net.getNeuronPrototype(neuron))));

    for (let i = 0; i < copy.hiddenLayers.length; i++) {
      copy.hiddenLayers[i] = Net.copyObject(copy.hiddenLayers[i], Net.getLayerPrototype(copy.hiddenLayers[i]));
      copy.hiddenLayers[i].neurons.forEach((neuron, index) => copy.hiddenLayers[i].neurons[index] = Net.copyObject(neuron, Net.getNeuronPrototype(neuron)));
    }

    return copy;
  }

  static copyObject(object, prototype) {
    return Object.assign(Object.create(prototype), object);
  }

  static getNetPrototype(net) {
    const hiddenLayersConfig = net.hiddenLayers.reduce((acc, layer) => {
      acc.push(layer.neurons.length);
      return acc
    }, []);
    const netInstance = new Net(net.inputLayer.neurons.length, hiddenLayersConfig, net.outputLayer.neurons.length);

    return Object.getPrototypeOf(netInstance);
  }

  static getLayerPrototype(layer, isInputLayer) {
    const layerInstance = new Layer(layer.neurons.length, layer.amountOfNeuronInputs, isInputLayer);

    return Object.getPrototypeOf(layerInstance);
  }

  static getNeuronPrototype(neuron) {
    const neuronInstance = new Neuron(neuron.weights.length);

    return Object.getPrototypeOf(neuronInstance);
  }

  constructor(amountOfInputNeyrons, amountOfHiddenlayersNeyrons, amountOfOutputNeyrons) {
    this.inputLayer = new Layer(amountOfInputNeyrons, amountOfInputNeyrons,  true);

    if (!Array.isArray(amountOfHiddenlayersNeyrons) || amountOfHiddenlayersNeyrons.length < 1) {
      throw Error('Invalid hidden layers configuration');
    }

    for(let i = 0; i < amountOfHiddenlayersNeyrons.length; i++) {
      const amountOfInputs = i > 0 ? amountOfHiddenlayersNeyrons[i - 1] : this.inputLayer.neurons.length;
      this.hiddenLayers[i] = new Layer(amountOfHiddenlayersNeyrons[i], amountOfInputs);
    }

    const lastHiddenLayer = this.hiddenLayers[amountOfHiddenlayersNeyrons.length - 1];
    this.outputLayer = new Layer(amountOfOutputNeyrons, lastHiddenLayer.neurons.length);
  }

  input(input) {
    if (!Array.isArray(input) || input.length !== this.inputLayer.neurons.length) {
      throw Error('Invalid input for Net')
    }

    const inputResult = this.inputLayer.input(input);
    let lastHiddenLayerResult = inputResult;
    this.hiddenLayers.forEach(hiddenLayer => lastHiddenLayerResult = hiddenLayer.input(lastHiddenLayerResult));
    return this.outputLayer.input(lastHiddenLayerResult);
  }

  learn(delta) {
    this.hiddenLayers.forEach(hidden => hidden.learn(delta));
    this.outputLayer.learn(delta);
  }
}
