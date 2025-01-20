class KeyboardController {
  forward = false;
  backward = false;
  left = false;
  right = false;
  sprint = false;

  constructor() {
    window.addEventListener('keydown', (event) => {
      switch (event.key.toLowerCase()) {
        case 'w':
          this.forward = true;
          break;
        case 's':
          this.backward = true;
          break;
        case 'a':
          this.left = true;
          break;
        case 'd':
          this.right = true;
          break;
        case 'shift':
          this.sprint = true;
          break;
      }
    });

    window.addEventListener('keyup', (event) => {
      switch (event.key.toLowerCase()) {
        case 'w':
          this.forward = false;
          break;
        case 's':
          this.backward = false;
          break;
        case 'a':
          this.left = false;
          break;
        case 'd':
          this.right = false;
          break;
        case 'shift':
          this.sprint = false;
          break;
      }
    });
  }
}

export default KeyboardController;
