class Keyboard {
	key: boolean[];

	constructor() {
		this.key = Array.from({ length: 222 }, () => false);

		window.addEventListener('keydown', (event) => {
			this.key[event.keyCode] = true;
		});

		window.addEventListener('keyup', (event) => {
			this.key[event.keyCode] = false;
		});
	}
}

var keyboard = new Keyboard();

export { keyboard };

