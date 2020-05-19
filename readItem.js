const { BrowserWindow } = require('electron');

// offscreen BrowserWindow
let offscreenWindow;

module.exports = (url, cb) => {
	// create offscreen window
	offscreenWindow = new BrowserWindow({
		width: 500,
		height: 500,
		show: false,
		webPreferences: {
			offscreen: true,
			nodeIntegration: false // loading insecure remote content, no filesystem access via node, but false is default so we can leave commented out
		}
	});

	// load item url
	offscreenWindow.loadURL(url);

	// wait for content to finish loading
	offscreenWindow.webContents.on('did-finish-load', e => {
		// get title
		let title = offscreenWindow.getTitle();

		// screenshot/thumbnail
		offscreenWindow.webContents
			.capturePage()
			.then(image => {
				// get image as dataURL
				let screenshot = image.toDataURL();

				// execute cb with new item obj
				cb({
					title,
					screenshot,
					url
				});

				// clean up window
				offscreenWindow.close();
				offscreenWindow = null;
			})
			.catch(err => console.log(err));
	});
};
