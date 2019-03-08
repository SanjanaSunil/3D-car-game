var scene, camera, renderer, stats;
var ambientLight, light;

var track = [], trackGeometry, trackMaterial, trackTexture;
var rightWall = [], leftWall = [], wallTexture, wallGeometry, wallMaterial;
var roof = [], roofTexture, roofGeometry, roofMaterial;

var keyboard = {};
var player = {speed:0.02};

function init() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.1, 100);
	var textureLoader = new THREE.TextureLoader();
	var startZ = 0;

	/*********** ROAD ***********/

	trackTexture = textureLoader.load("assets/textures/track.jpg");
	trackGeometry = new THREE.PlaneGeometry(8, 20, 10, 10);
	trackMaterial = new THREE.MeshPhongMaterial({color:0xffffff, map:trackTexture});
	startZ = 0;
	for(var i=0; i<3; ++i) {
		var trackObj = new THREE.Mesh(
			trackGeometry,
			trackMaterial
		);
		trackObj.rotation.x -= Math.PI / 2;
		trackObj.position.z += startZ;
		startZ += 20; 
		track.push(trackObj);
		// track.receiveShadow = true;
		scene.add(trackObj);
	}

	/*********** WALL ***********/
	
	wallTexture = textureLoader.load("assets/textures/wall.png");
	wallGeometry = new THREE.PlaneGeometry(12, 50, 10, 10);
	wallMaterial = new THREE.MeshPhongMaterial({color:0xffffff, map:wallTexture});
	startZ = 0;
	for(var i=0; i<3; ++i) {
		var rightWallObj = new THREE.Mesh(
			wallGeometry,
			wallMaterial
		);
		rightWallObj.rotation.x -= Math.PI / 2;
		rightWallObj.rotation.y += Math.PI / 2;
		rightWallObj.position.x -= 8;
		rightWallObj.position.y += 4;
		rightWallObj.position.z += startZ;
		startZ += 50;
		rightWall.push(rightWallObj);
		// rightWall.receiveShadow = true;
		scene.add(rightWallObj);
	}

	startZ = 0;
	for(var i=0; i<3; ++i) {
		var leftWallObj = new THREE.Mesh(
			wallGeometry,
			wallMaterial
		);
		leftWallObj.rotation.x -= Math.PI / 2;
		leftWallObj.rotation.y -= Math.PI / 2;
		leftWallObj.position.x += 8;
		leftWallObj.position.y += 4;
		leftWallObj.position.z += startZ;
		startZ += 50;
		leftWall.push(leftWallObj);
		// leftWall.receiveShadow = true;
		scene.add(leftWallObj);
	}

	/*********** Roof ***********/

	roofGeometry = new THREE.PlaneGeometry(8, 30, 10, 10);
	roofMaterial = new THREE.MeshPhongMaterial({color:0xffffff, map:roofTexture});
	startZ = 0;
	for(var i=0; i<2; ++i) {
		var roofObj = new THREE.Mesh(
			roofGeometry,
			wallMaterial
		);
		roofObj.rotation.x += Math.PI / 2;
		roofObj.position.y += 5.9;
		roofObj.position.z += startZ;
		startZ += 30;
		// roof.receiveShadow = true;
		roof.push(roofObj);
		scene.add(roofObj);
	}

	/*********** LIGHT ***********/

	ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
	scene.add(ambientLight);

	light = new THREE.PointLight(0xffffff, 0.8, 18);
	light.position.set(-3, 6, -3);
	light.castShadow = true;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 25;
	scene.add(light);

	camera.position.set(0, 1.8, -10);
	camera.lookAt(new THREE.Vector3(0, 1.8, 0));

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth/3, window.innerHeight/1.5);
	renderer.setClearColor(0x00bfff, 1);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;

	stats = new Stats();
	stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
	document.body.appendChild( stats.dom );
	document.body.appendChild(renderer.domElement);

	animate();
}

function animate() {
	
	requestAnimationFrame(animate);

	// if(keyboard[67]) {
	// 	wallMaterial.color.set(0x181818);
	// 	trackMaterial.color.set(0x282828);
	// }
	// else {
	// 	wallMaterial.color.set(0xffffff);
	// 	trackMaterial.color.set(0xffffff);
	// }

	// camera.position.z += player.speed;
	// light.position.z += player.speed;
	stats.begin();
	renderer.render(scene, camera);
	stats.end();
}

function keyDown(event) {
	keyboard[event.keyCode] = true;
}

function keyUp(event) {
	keyboard[event.keyCode] = false;
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

window.onload = init;