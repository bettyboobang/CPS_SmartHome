export class FirstPersonControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.controls = new THREE.PointerLockControls(camera, domElement);

        this.moveState = { forward: false, backward: false, left: false, right: false };
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();

        this.initListeners();
    }

    initListeners() {
        window.addEventListener('keydown', (e) => this.onKeyChange(e.code, true));
        window.addEventListener('keyup', (e) => this.onKeyChange(e.code, false));
    }

    onKeyChange(code, isPressed) {
        switch (code) {
            case 'KeyW':
            case 'ArrowUp':
                this.moveState.forward = isPressed;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.moveState.backward = isPressed;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.moveState.left = isPressed;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.moveState.right = isPressed;
                break;
        }
    }

    update(delta) {
        if (!this.controls.isLocked) return;

        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;

        this.direction.z = Number(this.moveState.forward) - Number(this.moveState.backward);
        this.direction.x = Number(this.moveState.right) - Number(this.moveState.left);
        this.direction.normalize();

        const speed = 36.0;
        if (this.moveState.forward || this.moveState.backward) {
            this.velocity.z -= this.direction.z * speed * delta;
        }
        if (this.moveState.left || this.moveState.right) {
            this.velocity.x -= this.direction.x * speed * delta;
        }

        this.controls.moveRight(-this.velocity.x * delta);
        this.controls.moveForward(-this.velocity.z * delta);

        // Обмеження межами кімнати
        this.camera.position.x = Math.max(-5.8, Math.min(5.8, this.camera.position.x));
        this.camera.position.z = Math.max(-5.8, Math.min(5.8, this.camera.position.z));
        this.camera.position.y = 2.0; // Висота очей
    }
}