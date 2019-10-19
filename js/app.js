;(function(window, undefined) {

  window.APP = window.APP || {}
  let charRNN
  let textInput
  let lengthSlider
  let tempSlider
  let button
  let runningInference = false

  function modelReady() {
    //document.getElementById('#status').html('Model Loaded');
  }
    
  APP.init = function() {

    // Grab the DOM elements
    textInput = document.getElementById('#textInput')
    lengthSlider = document.getElementById('#lenSlider')
    tempSlider = document.getElementById('#tempSlider')
    button = document.getElementById('#generate')

    // DOM element events
    // button.mousePressed(generate)
    // lengthSlider.input(updateSliders)
    // tempSlider.input(updateSliders)

    // Create the LSTM Generator passing it the model directory
    // charRNN = ml5.charRNN('./models/woolf/', modelReady)
    charRNN = ml5.charRNN('./models/grimm/', modelReady)

    APP.stator = new window.States()
    APP.stator.init()

  }
  
  document.addEventListener("DOMContentLoaded", function(e) { 
      console.log('ready')
      APP.init()
  })

})(window)