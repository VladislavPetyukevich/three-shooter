class KeyboardControls {
	constructor() {
		this.key = [];

		window.addEventListener('keydown', (event) => {
			event.preventDefault();
			this.key[event.keyCode] = true;
		});

		window.addEventListener('keyup', (event) => {
			event.preventDefault();
			this.key[event.keyCode] = false;
		});
	}
}

var keyboardControls = new KeyboardControls();

export default keyboardControls;