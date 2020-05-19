const { dialog } = require('electron');
const { autoUpdater } = require('electron-updater');

// configure log debugging
autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';

// disable auto downloading of updates
autoUpdater.autoDownload = false;

// single export to check for and apply any available updates
module.exports = () => {
	// check for updates (github releases)
	autoUpdater.checkForUpdates();

	// listen for update found
	autoUpdater.on('update-available', () => {
		// prompt user to start download
		dialog.showMessageBox(
			{
				type: 'info',
				title: 'Update available',
				message:
					'A new version of Bookmarker is available. Do you want to update now?',
				buttons: ['Update', 'No']
			},
			buttonIndex => {
				// if buttonIndex is 0 (Update), start downloading the update
				if (buttonIndex === 0) autoUpdater.downloadUpdate();
			}
		);
	});

	// listen for update downloaded
	autoUpdater.on('update-downloaded', () => {
		// prompt user to install update
		dialog.showMessageBox(
			{
				type: 'info',
				title: 'Update ready',
				message: 'Install and restart now?',
				buttons: ['Yes', 'Later']
			},
			buttonIndex => {
				// install and restart if button 0 (Yes)
				if (buttonIndex === 0) autoUpdater.quitAndInstall(false, true);
			}
		);
	});
};
