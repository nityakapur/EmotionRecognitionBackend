document.addEventListener("DOMContentLoaded", async function() {
  const canvas = document.getElementById('background');
  const ctx = canvas.getContext('2d');

  // Set canvas dimensions
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Load TensorFlow model
  async function loadModel() {
    try {
      const model = await tf.loadLayersModel('D:/Nitya/WebDev_projects/practice/model/model.json');
      return model;
    } catch (error) {
      console.error('Error loading the model:', error);
    }
  }

  // Recognize emotion
  async function recognizeEmotion() {
    var inputText = document.getElementById('inputText').value;
    let tokensArray = [];
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(inputText);
    console.log(tokens); 

    const model = await loadModel();
    const stemmer = natural.PorterStemmer;
    const stemmedTokens = tokens.map(token => stemmer.stem(token));
    console.log(stemmedTokens); // Output: ['the', 'quick', 'brown', 'fox', 'jump', 'over', 'the', 'lazi', 'dog', '.']
    tokensArray.push(stemmedTokens);

    const length_of_longest_sentence = 66; 
    while (tokensArray.length < length_of_longest_sentence) {
      tokensArray.push(0);
    }

    const input = tf.tensor2d([tokensArray], [1, tokensArray.length]);

    const predictions = model.predict(input);
    const predictedClass = predictions.argMax(-1).dataSync()[0];
    const labels = ['sadness', 'joy', 'love', 'anger','fear','surprise']; // Define your emotion labels
    const predictedEmotion = labels[predictedClass];
   
    document.getElementById("result").innerText = "Predicted Emotion: " + predictedEmotion;
    displayResult(predictedEmotion); // Call displayResult here
  }

  // Reset input and result
  function resetInput() {
    document.getElementById("inputText").value = "";
    document.getElementById("result").innerText = "";
  }

  // Display result
  function displayResult(emotion) {
    var resultDiv = document.getElementById('result');
    resultDiv.innerHTML = "<h2>Recognized Emotion:</h2><p>" + emotion + "</p>";
  }

  // Event listeners
  document.getElementById('recognizeButton').addEventListener('click', recognizeEmotion);
  document.getElementById('resetButton').addEventListener('click', resetInput);

  // Mouse movement event
  let mouse = {
    x: null,
    y: null,
    radius: (canvas.height/80) * (canvas.width/80)
  };

  window.addEventListener('mousemove', function(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  // Create particle array
  let particlesArray = [];

  // Particle constructor function
  function Particle(x, y, directionX, directionY, size, color) {
    this.x = x;
    this.y = y;
    this.directionX = directionX;
    this.directionY = directionY;
    this.size = size;
    this.color = color;

    this.draw = function() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
      ctx.fillStyle = '#fff';
      ctx.fill();
    };

    this.update = function() {
      if (this.x > canvas.width || this.x < 0) {
        this.directionX = -this.directionX;
      }
      if (this.y > canvas.height || this.y < 0) {
        this.directionY = -this.directionY;
      }
      this.x += this.directionX;
      this.y += this.directionY;

      if (mouse.x - this.x < mouse.radius && mouse.x - this.x > -mouse.radius &&
          mouse.y - this.y < mouse.radius && mouse.y - this.y > -mouse.radius) {
        if (this.size < 3) {
          this.size += 0.3;
        }
      } else if (this.size > 1) {
        this.size -= 0.1;
      }

      this.size = Math.max(0, this.size);

      this.draw();
    };
  }

  // Create particles
  function init() {
    let numberOfParticles = (canvas.height * canvas.width) / 1500;
    for (let i = 0; i < numberOfParticles; i++) {
      let size = 0;
      let x = (Math.random() * ((innerWidth - size * 1) - (size * 1)) + size * 1);
      let y = (Math.random() * ((innerHeight - size * 1) - (size * 1)) + size * 1);
      let directionX = (Math.random() * 2) - 1.5;
      let directionY = (Math.random() * 2) - 1.5;
      let color = '#fff';

      particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
  }

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
    }
  }

  // Resize event
  window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    mouse.radius = ((canvas.height/80) * (canvas.height/80));
    init();
  });

  // Initiate animation
  init();
  animate();
});
