window.States = function () {

  var self = this
  var stator = new window.StateMan()

  var timeline = ['input', 'sentence']
  var currentStep = 0

  var inputState = new window.InputState()
  var sentenceState = new window.SentenceState()

  self.go = function (state, params) {
    console.log(state, params)
    debounceNav()
    var options = {
      encode: false
    }
    if (params) options.params = params
    stator.go(state, options)
  }

  self.start = function (options) {
    stator.start(options)
  }

  self.init = function () {
    stator.go(timeline[0], {
      encode: false
    })
  }

  self.moveForward = function () {
    if (currentStep < timeline.length - 1) {
      currentStep++
      self.go(timeline[currentStep], timeline[currentStep])
    }
    //console.log("forward, "+currentStep)
  }

  self.moveBackward = function () {
    if (currentStep >= 1) {
      currentStep--
      self.go(timeline[currentStep], timeline[currentStep])
    }
    //console.log("backward, "+currentStep)
  }

  //prevents users to change state before animations complete
  function debounceNav() {
    $('.view#ui #nav-buttons #back').css('pointer-events', 'none')
    $('.view#ui #nav-buttons #next').css('pointer-events', 'none')
    setTimeout(function () {
      $('.view#ui #nav-buttons #back').css('pointer-events', 'all')
      $('.view#ui #nav-buttons #next').css('pointer-events', 'all')
    }, 1500)
  }

  stator.state({
    'input': inputState,
    'sentence': sentenceState
  })

  return self
}