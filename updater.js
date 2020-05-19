const { app, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');

// configure log debugging
const log = require('electron-log');
autoUpdater.logger = log;
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
		dialog
			.showMessageBox({
				type: 'info',
				title: 'Update available',
				message:
					'A new version of Bookmarker is available. Do you want to update now?',
				buttons: ['Update', 'No']
			})
			.then(result => {
				// if buttonIndex is 0 (Update), start downloading the update
				if (result.response === 0) {
					autoUpdater.downloadUpdate();
				}
			})
			.catch(err => {
				console.log(err);
				log.error(err);
			});
	});

	// listen for update downloaded
	autoUpdater.on('update-downloaded', () => {
		// prompt user to install update
		dialog
			.showMessageBox({
				type: 'info',
				title: 'Update ready',
				message: 'Install and restart now?',
				buttons: ['Yes', 'Later']
			})
			.then(result => {
				// install and restart if button 0 (Yes)
				if (result.response === 0) {
					autoUpdater.quitAndInstall(false, true);
				}
			})
			.catch(err => {
				console.log(err);
				log.error(err);
			});
	});
};
