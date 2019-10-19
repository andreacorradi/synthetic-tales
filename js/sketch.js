// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
LSTM Generator example with p5.js
This uses a pre-trained model on a corpus of Virginia Woolf
For more models see: https://github.com/ml5js/ml5-data-and-training/tree/master/models/charRNN
=== */

let charRNN
let textInput
let lengthSlider
let tempSlider
let button
let runningInference = false

let textLength = 100
let textTemp = 0.5

let classifier
let video
let resultsP
let tempResult = ""
let timer = 0
const timeTh = 10

function setup() {
  noCanvas()

  video = createCapture(VIDEO)
  video.hide()
  // Initialize the Image Classifier method with MobileNet and the video as the second argument
  classifier = ml5.imageClassifier('MobileNet', video, videoModelReady)
  resultsP = createP('Loading model and video...')

  // Create the LSTM Generator passing it the model directory
  // charRNN = ml5.charRNN('./models/woolf/', textModelReady);
  charRNN = ml5.charRNN('./models/grimm/', textModelReady)

  // Grab the DOM elements
  textInput = select('#textInput')
  lengthSlider = select('#lenSlider')
  tempSlider = select('#tempSlider')
  button = select('#generate')

  // DOM element events
  // button.mousePressed(generate)
  // lengthSlider.input(updateSliders)
  // tempSlider.input(updateSliders)
}

// Update the slider values
function updateSliders() {
  select('#length').html(lengthSlider.value())
  select('#temperature').html(tempSlider.value())
}

function textModelReady() {
  console.log('Text Model Ready')
  //select('#status').html('Model Loaded')
}

function videoModelReady() {
  console.log('Video Model Ready')
  classifyVideo()
}

// Get a prediction for the current video frame
function classifyVideo() {
  classifier.classify(gotResult)
}

// When we get a result
function gotResult(err, results) {
  if (tempResult !== results[0].label) { timer = 0 } else timer++
  
  tempResult = results[0].label
  console.log(tempResult)
  // The results are in an array ordered by confidence.
  if (nf(results[0].confidence, 0, 2) > 0.1 && timer >= timeTh) {
    console.log("YES! I saw a " + results[0].label)
    resultsP.html('I\'m seeing a ' + results[0].label)
    generate(results[0].label)
  } else {
    resultsP.html('I\'m not able to understand what I\'m seeing :(')
    classifyVideo()
  }

  if (timer >= timeTh) timer = 0
  // resultsP.html('I\'m seeing a' + results[0].label + ' ' + nf(results[0].confidence, 0, 2))
}

// Generate new text
function generate(prompt) {
  // prevent starting inference if we've already started another instance
  // TODO: is there better JS way of doing this?
 if(!runningInference) {
    runningInference = true

    // Update the status log
    //select('#status').html('Generating...')

    // Grab the original text
    // let original = textInput.value()
    let original = prompt

    // Make it to lower case
    let txt = original.toLowerCase()

    // Check if there's something to send
    if (txt.length > 0) {
      // This is what the LSTM generator needs
      // Seed text, temperature, length to outputs
      // TODO: What are the defaults?
      // let data = {
      //   seed: txt,
      //   temperature: tempSlider.value(),
      //   length: lengthSlider.value()
      // }
      let data = {
        seed: txt,
        temperature: textTemp,
        length: textLength
      }

      // Generate text with the charRNN
      charRNN.generate(data, gotData)

      // When it's done
      function gotData(err, result) {
        // Update the status log
        //select('#status').html('Ready!')
        select('#result').html(txt + result.sample)
        runningInference = false
      }
    }
  }
}
