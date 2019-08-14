class Keyboard {
	key: boolean[];

	constructor() {
		this.key = [];

		window.addEventListener('keydown', (event) => {
			this.key[event.keyCode] = true;
		});

		window.addEventListener('keyup', (event) => {
			this.key[event.keyCode] = false;
		});
	}
}

var keyboard = new Keyboard();

export default keyboard;