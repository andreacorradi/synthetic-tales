var fs = require('fs')

fs.readFile('data/andersengrimm.txt', 'utf8', function(err, data) {
  if (err) throw err
  //console.log(data)

  const newdata = data.replace(/^\s*[\r\n]/gm, '')
  //const newdata = data.replace(/\r?\n|\r/g, '')

  fs.writeFile("data/andersengrimm-ws.txt", newdata, function(err) {
    if(err) return console.log(err)
    console.log("The file was saved!");
  })
})