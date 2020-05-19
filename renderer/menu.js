const { remote, shell } = require('electron');

// menu template
const template = [
	{
		label: 'Items',
		submenu: [
			{
				label: 'Add new',
				accelerator: 'CmdOrCtrl+O',
				click: () => {
					window.newItem();
				}
			},
			{
				label: 'Read Item',
				accelerator: 'CmdOrCtrl+Enter',
				click: window.openItem
			},
			{
				label: 'Delete Item',
				accelerator: 'CmdOrCtrl+Backspace',
				click: () => {
					window.deleteItem();
				}
			},
			{
				label: 'Open in Browser',
				accelerator: 'CmdOrCtrl+Shift+O',
				click: window.openItemNative
			},
			{
				label: 'Search Items',
				accelerator: 'CmdOrCtrl+F',
				click: window.searchItems
			}
		]
	},
	{
		role: 'editMenu'
	},
	{
		role: 'windowMenu'
	},
	{
		role: 'help',
		submenu: [
			{
				label: 'Learn more',
				click: () => {
					shell.openExternal('https://google.com');
				}
			}
		]
	}
];

// set mac specific first menu item
if (process.platform === 'darwin') {
	template.unshift({
		label: remote.app.getName(),
		submenu: [
			{
				role: 'about'
			},
			{
				type: 'separator'
			},
			{
				role: 'services'
			},
			{
				role: 'hide'
			},
			{
				role: 'hideothers'
			},
			{
				role: 'unhide'
			},
			{
				role: 'separator'
			},
			{
				role: 'quit'
			}
		]
	});
}

// build menu
const menu = remote.Menu.buildFromTemplate(template);

// set as main app menu
remote.Menu.setApplicationMenu(menu);
