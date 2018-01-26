class Controls {
	constructor() {
		this.keyboard = [];

		window.addEventListener('keydown', (event) => {
			event.preventDefault();
			this.keyboard[event.keyCode] = true;
		});

		window.addEventListener('keyup', (event) => {
			event.preventDefault();
			this.keyboard[event.keyCode] = false;
		});
	}
}

var controls = new Controls();

export default controls;