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
let runningInference = false

// Text generator parameters
let textLength = 250
let textTemp = 0.5

let classifier
let video

let resultsP
let next
let intro

let tempResult = ""
let titleAdj = ""
let timer = 0
const timeTh = 10
const confidenceTh = 0.2

let step = 0


const verbs = [
  {
    key: "static",
    values: ["was", "had", "did", "said", "got", "made", "knew", "thought", "saw", "came", "looked", "felt", "told", "began",
    "seemed", "started", "believed", "held", "brought", "happened", "watched", "appeared", "asked"]
  },
  {
    key: "dynamic",
    values: ["needed", "became", "found", "gave", "used", "worked", "called", "tried", "asked", "need", "kept", "let", "helped", "talked",
    "turned", "heard", "played", "ran", "moved", "liked", "wrote", "provided", "sat", "stood", "lost", "paid", "met", "included", "continued", "set", "learnt",
    "changed", "understood", "followed", "stopped", "created", "spoke", "read", "allowed", "added", "spent", "opened", "walked", "won", "offered", "remembered",
    "considered ","appeared", "bought", "waited", "served", "sent", "expected", "built", "stayed", "suggested", "raised", "sold", "required", "decided", "pulled", "meant"]
  },
  {
    key: "final",
    values: ["loved", "died", "fell", "cut", "reached", "killed", "remained", "passed", "reported", "lived", "ended", "showed", "lived"]
  }
]

const adj = ["other", "new", "good", "high", "old", "great", "big", "American", "small", "large", "national", "young", "different", "black",
"long", "little", "important", "political", "bad", "white", "real", "best", "right", "social", "only", "public", "sure", "low", "early", "able",
"human", "local", "late", "hard", "major", "better", "economic", "strong", "possible", "whole", "free", "military", "true", "federal", "international",
"full", "special", "easy", "clear", "recent", "certain", "personal", "open", "red", "difficult", "available", "likely", "short", "single", "medical",
"current", "wrong", "private", "past", "foreign", "fine", "common", "poor", "natural", "significant", "similar", "hot", "dead", "central", "happy",
"serious", "ready", "simple", "left", "physical", "general", "environmental", "financial", "blue", "democratic", "dark", "various", "entire", "close",
"legal", "religious", "cold", "final", "main", "green", "nice", "huge", "popular", "traditional", "cultural"]

function setup() {
  noCanvas()

  video = createCapture(VIDEO)
  video.hide()
  // Initialize the Image Classifier method with MobileNet and the video as the second argument
  classifier = ml5.imageClassifier('MobileNet', video, videoModelReady)

  // Create the LSTM Generator passing it the model directory
  charRNN = ml5.charRNN('./models/andersengrimm/', textModelReady)

  // Grab the DOM elements
  intro = select('#intro')
  resultsP = select('#footer-message')
  taleTitle = select('#tale-title')
  next = select('.next')
  next.hide()

  // DOM element events
  next.mousePressed(lookForInput)
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function textModelReady() {
  console.log('Text Model Ready')
  //select('#status').html('Model Loaded')
}

function videoModelReady() {
  console.log('Video Model Ready')
  classifyVideo()
}

function lookForInput() {
  next.hide()
  classifyVideo()
}

// Get a prediction for the current video frame
function classifyVideo() {
  classifier.classify(gotInputObj)
}

// When we get a result
function gotInputObj(err, results) {
  const foundObj = results[0].label.split(",")[0]
  // console.log("foundObj: ", foundObj, timer)
  tempResult !== foundObj ? timer = 0 : timer++
  tempResult = foundObj
  
  // Validate the obj recognition only if the same obj is seen for timeTh consecutive times with a confidence greater than confidenceTh
  if (nf(results[0].confidence, 0, 2) > confidenceTh && timer >= timeTh) {
    timer = 0 // resets the confidence counter
    console.log("YES! I saw a " + foundObj)
    resultsP.html('I saw something!')
    const verbSet = verbs[step].values
    step++
    if (step > 2) step = 0
    const randomNumVerb = Math.floor(Math.random() * verbSet.length)
    const randomNumAdj = Math.floor(Math.random() * adj.length)
    titleAdj = adj[randomNumAdj]
    generate("The " + adj[randomNumAdj] + " " + foundObj + " " + verbSet[randomNumVerb] + " ")
  } else {
    resultsP.html('I\'m not able to understand what I\'m seeing :(')
    classifyVideo()
  }
}

// Generate new text
function generate(prompt) {
  // prevent starting inference if we've already started another instance
  // TODO: is there better JS way of doing this?
 if(!runningInference) {
    runningInference = true
    // Grab the prompt text
    let txt = prompt
    // Check if there's something to send
    if (txt.length > 0) {
      // This is what the LSTM generator needs
      // Seed text, temperature, length to outputs
      // TODO: What are the defaults?
      data = {
        seed: txt,
        temperature: textTemp,
        length: textLength
      }
      // Generate text with the charRNN
      charRNN.generate(data, gotData)

      // When it's done
      function gotData(err, result) {
        console.log("Whole generated text: ", result.sample)
        const firstSentence = result.sample.split(/[!?.]/g)[0]
        console.log("Generated text's first first sentence: ", firstSentence)
        intro.hide()
        if(step === 1) { taleTitle.html("The " + titleAdj + " " + tempResult) }
        var o = document.createElement("p")
        o.classList.add("pre-result")
        var ot = document.createTextNode("Oh! I saw a " + tempResult)
        o.appendChild(ot)
        document.querySelector('main #tale').appendChild(o)
        var p = document.createElement("p")
        p.classList.add("result")
        var t = document.createTextNode(capitalizeFirstLetter(txt) + firstSentence + ".")
        p.appendChild(t)
        document.querySelector('main #tale').appendChild(p)
        next.show()
        runningInference = false
      }
    }
  }
}
