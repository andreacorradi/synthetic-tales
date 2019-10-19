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
"long", "little", "important", "political", "bad", "white", "real", "best", "right", "social", "only"
26.    public
27.    sure
28.    low
29.    early
30.    able
31.    human
32.    local
33.    late
34.    hard
35.    major
36.    better
37.    economic
38.    strong
39.    possible
40.    whole
41.    free
42.    military
43.    true
44.    federal
45.    international
46.    full
47.    special
48.    easy
49.    clear
50.    recent
51.    certain
52.    personal
53.    open
54.    red
55.    difficult
56.    available
57.    likely
58.    short
59.    single
60.    medical
61.    current
62.    wrong
63.    private
64.    past
65.    foreign
66.    fine
67.    common
68.    poor
69.    natural
70.    significant
71.    similar
72.    hot
73.    dead
74.    central
75.    happy
76.    serious
77.    ready
78.    simple
79.    left
80.    physical
81.    general
82.    environmental
83.    financial
84.    blue
85.    democratic
86.    dark
87.    various
88.    entire
89.    close
90.    legal
91.    religious
92.    cold
93.    final
94.    main
95.    green
96.    nice
97.    huge
98.    popular
99.    traditional
100.  cultural
]

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
        if(step === 1) {
          taleTitle.html(tempResult)
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
