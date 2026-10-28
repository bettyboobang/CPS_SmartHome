export class SceneManager {//керує сценою, камерою та рендерером, створюючи базову 3D-сцену з кімнатою та обробляючи зміну розміру вікна
    constructor() {//ініціалізує сцену, камеру та рендерер, а також створює кімнату та обробляє зміну розміру вікна
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x121216);//встановлює колір фону сцени
        this.scene.fog = new THREE.FogExp2(0x121216, 0.04);//встановлює туман для сцени, щоб створити ефект глибини

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);//створює перспективну камеру з кутом огляду 75 градусів, співвідношенням сторін вікна та ближньою та дальньою площинами відсікання
        this.camera.position.set(0, 1.6, 3);//встановлює початкову позицію камери в сцені

        this.renderer = new THREE.WebGLRenderer({ antialias: true });//створює рендерер WebGL з увімкненим згладжуванням
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);//додає елемент рендерера до документа, щоб відобразити сцену на веб-сторінці

        this.initRoom();
        this.handleResize();
    }

    initRoom() {//створює базову кімнату з підлогою, стінами та стелею, а також додає амбієнтне освітлення
        const floorGeo = new THREE.PlaneGeometry(10, 10);//створює геометрію підлоги з розмірами
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8 });//створює матеріал підлоги з темно-сірим кольором та високою шорсткістю
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;//обертає підлогу, щоб вона лежала горизонтально
        floor.receiveShadow = true;
        this.scene.add(floor);//додає підлогу до сцени
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.6 });//створює матеріал стін з сірим кольором та середньою шорсткістю
        const wallGeo = new THREE.PlaneGeometry(10, 3.5);//створює геометрію стін з розмірами
        const backWall = new THREE.Mesh(wallGeo, wallMat);//створює задню стіну з геометрією та матеріалом
        backWall.position.set(0, 1.75, -5);
        backWall.receiveShadow = true;
        this.scene.add(backWall);//додає задню стіну до сцени

        const frontWall = new THREE.Mesh(wallGeo, wallMat);//створює передню стіну з геометрією та матеріалом
        frontWall.position.set(0, 1.75, 5);//встановлює позицію передньої стіни в сцені
        frontWall.rotation.y = Math.PI;
        this.scene.add(frontWall);

        const leftWall = new THREE.Mesh(wallGeo, wallMat);//створює ліву стіну з геометрією та матеріалом
        leftWall.position.set(-5, 1.75, 0);
        leftWall.rotation.y = Math.PI / 2;//обертає ліву стіну на 90 градусів, щоб вона була перпендикулярною до підлоги
        this.scene.add(leftWall);

        const rightWall = new THREE.Mesh(wallGeo, wallMat);//створює праву стіну з геометрією та матеріалом
        rightWall.position.set(5, 1.75, 0);
        rightWall.rotation.y = -Math.PI / 2;
        this.scene.add(rightWall);

        const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x222222 });//створює матеріал стелі з темно-сірим кольором
        const ceiling = new THREE.Mesh(floorGeo, ceilingMat);
        ceiling.position.y = 3.5;//встановлює позицію стелі в сцені
        ceiling.rotation.x = Math.PI / 2;//обертає стелю, щоб вона лежала горизонтально
        this.scene.add(ceiling);
        const ambient = new THREE.AmbientLight(0xffffff, 0.12);//створює амбієнтне освітлення з білим кольором та низькою інтенсивністю
        this.scene.add(ambient);
    }

    handleResize() {//додає обробник події зміни розміру вікна, щоб оновлювати камеру та рендерер відповідно до нового розміру вікна
        window.addEventListener('resize', () => {//додає обробник події зміни розміру вікна
            this.camera.aspect = window.innerWidth / window.innerHeight;//оновлює співвідношення сторін камери відповідно до нового розміру вікна
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);//оновлює розмір рендерера відповідно до нового розміру вікна
        });
    }

    render() {//рендерить сцену з поточною камерою
        this.renderer.render(this.scene, this.camera);
    }
}