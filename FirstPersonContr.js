export class FirstPersonController {//керує рухом камери від першої особи, використовуючи PointerLockControls для обробки введення користувача та обмежуючи рух камери в межах кімнати
    constructor(camera, domElement, instructionsElement) {//ініціалізує контролер від першої особи з заданою камерою, елементом DOM та елементом інструкцій
        this.controls = new THREE.PointerLockControls(camera, domElement);//створює екземпляр PointerLockControls для обробки введення користувача та керування камерою
        this.camera = camera;
        this.instructionsElement = instructionsElement;
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.velocity = new THREE.Vector3();//зберігає швидкість руху камери
        this.direction = new THREE.Vector3();//зберігає напрямок руху камери
        this.initEvents();
    }

    initEvents() {//додає обробники подій для елементу інструкцій та введення користувача, щоб керувати блокуванням вказівника та рухом камери
        this.instructionsElement.addEventListener('click', () => this.controls.lock());//додає обробник події кліку на елемент інструкцій, щоб заблокувати вказівник та активувати режим від першої особи
        this.controls.addEventListener('lock', () => {//додає обробник події блокування вказівника, щоб приховати елемент інструкцій
            this.instructionsElement.style.display = 'none';
        });
        this.controls.addEventListener('unlock', () => {//додає обробник події розблокування вказівника, щоб показати елемент інструкцій
            this.instructionsElement.style.display = 'block';
        });
        document.addEventListener('keydown', (e) => this.OnKey(e, true));//додає обробник події натискання клавіші, щоб встановити відповідний стан руху камери
        document.addEventListener('keyup', (e) => this.OnKey(e, false));//додає обробник події відпускання клавіші, щоб скинути відповідний стан руху камери
    }

    OnKey(event, isDown) {//обробляє натискання та відпускання клавіш, щоб встановити відповідний стан руху камери
        switch (event.code) {//перевіряє код натиснутої клавіші та встановлює відповідний стан руху камери
            case 'KeyW' : case 'ArrowUp':
                this.moveForward = isDown;
                break;  
            case 'KeyA' : case 'ArrowLeft':
                this.moveLeft = isDown;
                break;
            case 'KeyS' : case 'ArrowDown':
                this.moveBackward = isDown;
                break;
            case 'KeyD' : case 'ArrowRight':
                this.moveRight = isDown;
                break;
        }
    }

    update(deltaTime) {//оновлює позицію камери на основі поточного стану руху та швидкості, обмежуючи рух камери в межах кімнати
        if(!this.controls.isLocked) return;//перевіряє, чи заблокований вказівник, щоб визначити, чи слід оновлювати позицію камери
        this.velocity.x -= this.velocity.x * 10.0 * deltaTime;//зменшує швидкість руху камери по осі X на основі часу, що пройшов, щоб створити ефект інерції
        this.velocity.z -= this.velocity.z * 10.0 * deltaTime;
        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);//визначає напрямок руху камери по осі Z на основі поточного стану руху
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize();//нормалізує напрямок руху камери, щоб уникнути збільшення швидкості при одночасному русі по обох осях
        if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 35.0 * deltaTime;//збільшує швидкість руху камери по осі Z на основі напрямку руху та часу, що пройшов
        if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * 35.0 * deltaTime;
        this.controls.moveRight(-this.velocity.x * deltaTime);//переміщує камеру по осі X на основі поточної швидкості та часу, що пройшов
        this.controls.moveForward(-this.velocity.z * deltaTime);
        this.camera.position.x = Math.max(-4.5, Math.min(4.5, this.camera.position.x));//обмежує позицію камери по осі X в межах кімнати
        this.camera.position.z = Math.max(-4.5, Math.min(4.5, this.camera.position.z));
        this.camera.position.y = 1.6;//обмежує позицію камери по осі Y, щоб вона залишалася на рівні очей користувача
    }
}