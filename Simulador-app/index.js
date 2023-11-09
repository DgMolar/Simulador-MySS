const {app, BrowserWindow} = require('electron') // Import the electron module.

function CreateWindow(){
let win = new BrowserWindow({
    width: 800,
     height: 600
    }) // Create a window.

    win.loadFile('index.html') // Load the index.html of the app.
}

app.whenReady().then(CreateWindow) // When the app is ready, create the window.