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

let textLength = 200
let textTemp = 0.5

let classifier
let video
let resultsP
let tempResult = ""
let timer = 0
const timeTh = 10

let step = 0

const verbs = ["was", "gad", "did", "said", "went", "got", "made", "knew", "thought", "took", "saw", "came", "wanted", "looked", "used",
"found", "gave", "told", "worked", "called", "tried", "asked", "needed", "felt", "became", "left", "put", "meant", "kept", "let", "began",
"seemed", "helped", "talked", "turned", "started", "showed", "heard", "played", "ran", "moved", "liked", "lived", "believed", "held", "brough", 
"happened", "wrote", "provided", "sat", "stood", "lost", "paid", "met", "included", "continued", "set", "learnt", "changed", "led", "understood",
"watched", "followed", "stopped", "created", "spoke", "read", "allowed", "added", "spent", "grew", "opened", "walked", "won", "offered", "remembered",
"loved", "considered", "appeared", "bought", "waited", "served", "died", "sent", "expected", "built", "stayed", "fell", "cut", "reached", "killed",
"remained", "suggested", "raised", "passed", "sold", "required", "reported", "decided", "pulled"]

const adj = ["other", "new", "good", "high", "old", "great", "big", "American", "small", "large", "national", "young", "different", "black",
"long", "little", "important", "political", "bad", "white", "real", "best", "right", "social", "only", "public", "sure", "low", "early", "able",
"human", "local", "late", "hard", "major", "better", "economic", "strong", "possible", "whole", "free", "military", "true", "federal", "international",
"full", "special", "easy", "clear", "recent"]

// certain
// personal
// open
// red
// difficult
// available
// likely
// short
// single
// medical
// current
// wrong
// private
// past
// foreign
// fine
// common
// poor
// natural
// significant
// similar
// hot
// dead
// central
// happy
// serious
// ready
// simple
// left
// physical
// general
// environmental
// financial
// blue
// democratic
// dark
// various
// entire
// close
// legal
// religious
// cold
// final
// main
// green
// nice
// huge
// popular
// traditional
// cultural

function setup() {
  noCanvas()

  video = createCapture(VIDEO)
  video.hide()
  // Initialize the Image Classifier method with MobileNet and the video as the second argument
  classifier = ml5.imageClassifier('MobileNet', video, videoModelReady)
  // resultsP = createP('Loading model and video...')

  // Create the LSTM Generator passing it the model directory
  // charRNN = ml5.charRNN('./models/woolf/', textModelReady);
  charRNN = ml5.charRNN('./models/andersengrimm/', textModelReady)

  // Grab the DOM elements
  // textInput = select('#textInput')
  // lengthSlider = select('#lenSlider')
  // tempSlider = select('#tempSlider')
  // button = select('#generate')
  resultsP = select('#footer-message')
  next = select('.next')
  next.hide()

  // DOM element events
  // button.mousePressed(generate)
  // lengthSlider.input(updateSliders)
  // tempSlider.input(updateSliders)
  next = select('.next')
  taleTitle = select('#tale-title')
  next.mousePressed(start)
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
function gotResult(err, results, step) {
  if (tempResult !== results[0].label) { timer = 0 } else timer++
  
  tempResult = results[0].label
  console.log(tempResult)
  // The results are in an array ordered by confidence.
  if (nf(results[0].confidence, 0, 2) > 0.2 && timer >= timeTh) {
    // console.log("YES! I saw a " + results[0].label)
    resultsP.html('I saw something!')
    const randomNum = Math.floor(Math.random() * verbs.length)
    generate("The " + results[0].label + " " + verbs[randomNum] + " ")
  } else {
    resultsP.html('I\'m not able to understand what I\'m seeing :(')
    classifyVideo()
  }
  if (timer >= timeTh) timer = 0
  // resultsP.html('I\'m seeing a' + results[0].label + ' ' + nf(results[0].confidence, 0, 2))
}

function start() {
  next.hide()
  classifyVideo()
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
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
      data = {
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
        console.log(result.sample)
        console.log(result.sample.split(/[!?.]/g))
        const sentence = result.sample.split(/[!?.]/g)[0]
        //select('.result').html(capitalizeFirstLetter(txt) + sentence + ".")
        step++
        const randomNum = Math.floor(Math.random() * adj.length)
        const titleAdj = adj[randomNum]
        if(step === 1) {
          taleTitle.html("The " + titleAdj + " " + tempResult)
        }
        var o = document.createElement("p")
        o.classList.add("pre-result")
        var ot = document.createTextNode("Oh! I saw a " + tempResult)
        o.appendChild(ot)
        document.querySelector('main #tale').appendChild(o)
        var p = document.createElement("p")
        p.classList.add("result")
        var t = document.createTextNode(capitalizeFirstLetter(txt) + sentence + ".")
        p.appendChild(t)
        document.querySelector('main #tale').appendChild(p)
        // createP(capitalizeFirstLetter(txt) + sentence + ".").addClass('result')
        next.show()
        runningInference = false
      }
    }
  }
}
