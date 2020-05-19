const fs = require('fs');
const { shell } = require('electron');

let items = document.getElementById('items');

// get readerJS contents
let readerJS;
fs.readFile(`${__dirname}/reader.js`, (err, data) => {
	readerJS = data.toString();
});

// track items in storage
exports.storage = JSON.parse(localStorage.getItem('bookmarker-items')) || [];

// listen for 'done' message from reader window
window.addEventListener('message', e => {
	// check for correct message
	if (e.data.action === 'delete-reader-item') {
		// delete item at given index
		this.delete(e.data.itemIndex);

		// close the reader window
		e.source.close();
	}
});

// delete item
exports.delete = itemIndex => {
	// remove item from dom
	items.removeChild(items.childNodes[itemIndex]);

	// remove from storage
	this.storage.splice(itemIndex, 1);

	// persist storage
	this.save();

	// select previous or new first item if first was removed
	if (this.storage.length) {
		// get new selected item index
		let newSelectedItemIndex = itemIndex === 0 ? 0 : itemIndex - 1;

		// set item at new index as selected
		items.childNodes[newSelectedItemIndex].classList.add('is-selected');
	}
};

// get selected item index
exports.getSelectedItem = () => {
	// get selected node
	let currentItem = document.querySelector('.read-item.is-selected');

	// get item index
	let itemIndex = 0;
	let child = currentItem;
	while ((child = child.previousSibling) != null) itemIndex++;

	// return selected item and index
	return {
		node: currentItem,
		index: itemIndex
	};
};

// persist storage
exports.save = () => {
	localStorage.setItem('bookmarker-items', JSON.stringify(this.storage));
};

// set item as selected
exports.select = e => {
	// remove currently selected item class
	this.getSelectedItem().node.classList.remove('is-selected');

	// add to clicked item
	e.currentTarget.classList.add('is-selected');
};

// move to newly selected item
exports.changeSelection = direction => {
	// get selected item
	let currentItem = this.getSelectedItem();

	// handle up/down
	if (direction === 'ArrowUp' && currentItem.node.previousSibling) {
		currentItem.node.classList.remove('is-selected');
		currentItem.node.previousSibling.classList.add('is-selected');
	} else if (direction === 'ArrowDown' && currentItem.node.nextSibling) {
		currentItem.node.classList.remove('is-selected');
		currentItem.node.nextSibling.classList.add('is-selected');
	}
};

// opent item in native browser
exports.openNative = () => {
	// only if we have items
	if (!this.storage.length) return;

	// get selected item
	let selectedItem = this.getSelectedItem();

	// open in system browser
	shell.openExternal(selectedItem.node.dataset.url);
};

// open selected item
exports.open = () => {
	// only if we have items (in case of open menu)
	if (!this.storage.length) return;

	let selectedItem = this.getSelectedItem();

	// get items url
	let contentURL = selectedItem.node.dataset.url;

	// open item in proxy BrowserWindow
	let readerWin = window.open(
		contentURL,
		'',
		`
		maxWidth=2000,
		maxHeight=2000,
		width=1200,
		height=800,
		backgroundColor=#dedede,
		nodeIntegration=0,
		contextIsolation=1
	`
	);

	// inject js with specitic item index (selectedItem)
	readerWin.eval(readerJS.replace('{{index}}', selectedItem.index));
};

// add new item
exports.addItem = (item, isNew = false) => {
	// create new html elem
	let itemNode = document.createElement('div');

	// assign read-item class
	itemNode.setAttribute('class', 'read-item');

	// set item url as data attr
	itemNode.setAttribute('data-url', item.url);

	// add content
	itemNode.innerHTML = `
		<img src="${item.screenshot}" alt="" />
		<h2>${item.title}</h2>
	`;

	// append to items
	items.appendChild(itemNode);

	// attach click handler to select (alternative to listener on parent)
	itemNode.addEventListener('click', this.select);

	// attach open doubleclick handler
	itemNode.addEventListener('dblclick', this.open);

	// preselecting the first item
	if (document.querySelectorAll('.read-item').length === 1) {
		itemNode.classList.add('is-selected');
	}

	// add to storage and persist
	if (isNew) {
		this.storage.push(item);
		this.save();
	}
};

// add items from storage when app loads
this.storage.map(item => {
	this.addItem(item);
});
