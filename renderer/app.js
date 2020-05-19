const { ipcRenderer } = require('electron');
const items = require('./items');

// Dom Nodes
let showModal = document.getElementById('show-modal'),
	closeModal = document.getElementById('close-modal'),
	modal = document.getElementById('modal'),
	addItem = document.getElementById('add-item'),
	itemUrl = document.getElementById('url'),
	search = document.getElementById('search');

// open new item modal via menu
window.newItem = () => {
	showModal.click();
};

// Ref items.open globally for menu
window.openItem = items.open;

// Ref items.delete globally for menu
window.deleteItem = () => {
	let selectedItem = items.getSelectedItem();
	items.delete(selectedItem.index);
};

// open item in native browser
window.openItemNative = items.openNative;

// focus to search items
window.searchItems = () => {
	search.focus();
};

// filter items with search
search.addEventListener('keyup', e => {
	// iterate over items
	[...document.querySelectorAll('.read-item')].map(item => {
		// hide items that dont match value
		let hasMatch = item.innerText.toLowerCase().includes(search.value);
		item.style.display = hasMatch ? 'flex' : 'none';
	});
});

// navigate item selection with up/down arrows
document.addEventListener('keydown', e => {
	if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
		items.changeSelection(e.key);
	}
	if (e.key === 'Escape') {
		closeModal.click();
	}
});

// disable/enable modal buttons
const toggleModalButtons = () => {
	// check state
	if (addItem.disabled === true) {
		addItem.disabled = false;
		addItem.style.opacity = 1;
		addItem.style.cursor = 'pointer';
		addItem.innerText = 'Add Item';
		closeModal.style.display = 'inline';
	} else {
		addItem.disabled = true;
		addItem.style.opacity = 0.5;
		addItem.style.cursor = 'progress';
		addItem.innerText = 'Adding...';
		closeModal.style.display = 'none';
	}
};

// Show modal
showModal.addEventListener('click', e => {
	modal.style.display = 'flex';
	// focus input
	itemUrl.focus();
});

// Hide modal
closeModal.addEventListener('click', e => {
	modal.style.display = 'none';
});

// Handle new item
addItem.addEventListener('click', e => {
	// check if url exists
	if (itemUrl.value) {
		// console.log(itemUrl.value);
		// send new item url to main process
		ipcRenderer.send('new-item', itemUrl.value);

		// disable buttons
		toggleModalButtons();
	}
});

// listen for new item from main process
ipcRenderer.on('new-item-success', (e, newItem) => {
	// add new item to items node
	items.addItem(newItem, true);

	// enable buttons
	toggleModalButtons();

	// hide modal, clear value
	modal.style.display = 'none';
	itemUrl.value = '';
});

// Handle new item via keys
itemUrl.addEventListener('keyup', e => {
	if (e.key === 'Enter') addItem.click();
});
