function InputState() {

    self.enter = function(option) {
      console.log("input:: enter")
      button.onclick(generate)
      
    }

    self.leave = function(option) {
      
    }

    return self
}