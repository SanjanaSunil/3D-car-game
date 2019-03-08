var scene, camera, renderer, stats;
var ambientLight, light;

var scoreText;

var track = [], trackGeometry, trackMaterial, trackTexture, trackLen, trackFlag = false;
var rightWall = [], leftWall = [], wallTexture, wallGeometry, wallMaterial, wallLen, wallFlag = false;
var roof = [], roofTexture, roofGeometry, roofMaterial, roofLen, roofFlag = false;

var coins = [], coinGeometry, coinMaterial, coinTexture;

var keyboard = {};
var player = {
				speed:0.1,
				rightPosition:-1.8,
				leftPosition:1.8,
				jumpSpeed:0.2,
				maxHeight:2.5,
				jumping: false,
				score: 0
			};

var loadingScreen = {
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.1, 100),
};
var loadingManager = null;
var RESOURCES_LOADED = false;

var models = {
	car: {
		obj:"assets/models/car.obj",
		mtl:"assets/models/car.mtl",
		mesh: null
	}
};
var meshes = {};

function init() {

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.1, 100);
	var textureLoader = new THREE.TextureLoader();
	var startZ = 0;

	scoreText = document.createElement('div');
	scoreText.setAttribute('id', 'score-text');
	scoreText.innerHTML = "";
	scoreText.style.top = window.innerHeight / 14 + "px";
	document.body.appendChild(scoreText);

	var loadingText = document.createElement('div');
	loadingText.setAttribute('id', 'loading-text');
	loadingText.innerHTML = "Loading game...";
	loadingText.style.top = window.innerHeight / 2.4 + "px";
	document.body.appendChild(loadingText);

	loadingManager = new THREE.LoadingManager();
	loadingManager.onProgress = function(item, loaded, total){
		console.log(item, loaded, total);
	};
	loadingManager.onLoad = function(){
		console.log("Loaded all resources");
		RESOURCES_LOADED = true;
		onResourcesLoaded();
		document.getElementById("loading-text").remove();
	};


	/*********** ROAD ***********/

	trackTexture = textureLoader.load("assets/textures/track.jpg");
	trackLen = 50;
	trackGeometry = new THREE.PlaneGeometry(14, trackLen, 10, 10);
	trackMaterial = new THREE.MeshPhongMaterial({color:0xffffff, map:trackTexture});
	startZ = 0;
	for(var i=0; i<4; ++i) {
		var trackObj = new THREE.Mesh(
			trackGeometry,
			trackMaterial
		);
		trackObj.rotation.x -= Math.PI / 2;
		trackObj.position.y -= 1.5;
		trackObj.position.z += startZ;
		startZ += trackLen; 
		track.push(trackObj);
		// track.receiveShadow = true;
		scene.add(trackObj);
	}

	/*********** WALL ***********/
	
	wallTexture = textureLoader.load("assets/textures/wall.png");
	wallLen = 51;
	wallGeometry = new THREE.PlaneGeometry(23, wallLen, 10, 10);
	wallMaterial = new THREE.MeshPhongMaterial({color:0xffffff, map:wallTexture});
	startZ = 0;
	for(var i=0; i<4; ++i) {
		var rightWallObj = new THREE.Mesh(
			wallGeometry,
			wallMaterial
		);
		rightWallObj.rotation.x -= Math.PI / 2;
		rightWallObj.rotation.y += Math.PI / 2;
		rightWallObj.position.x -= 8;
		// rightWallObj.position.y += 4;
		rightWallObj.position.z += startZ;
		startZ += wallLen;
		rightWall.push(rightWallObj);
		// rightWall.receiveShadow = true;
		scene.add(rightWallObj);
	}

	startZ = 0;
	for(var i=0; i<4; ++i) {
		var leftWallObj = new THREE.Mesh(
			wallGeometry,
			wallMaterial
		);
		leftWallObj.rotation.x -= Math.PI / 2;
		leftWallObj.rotation.y -= Math.PI / 2;
		leftWallObj.position.x += 8;
		// leftWallObj.position.y += 4;
		leftWallObj.position.z += startZ;
		startZ += wallLen;
		leftWall.push(leftWallObj);
		// leftWall.receiveShadow = true;
		scene.add(leftWallObj);
	}

	/*********** Roof ***********/

	roofLen = 50;
	roofGeometry = new THREE.PlaneGeometry(14, roofLen, 10, 10);
	roofMaterial = new THREE.MeshPhongMaterial({color:0xffffff, map:roofTexture});
	startZ = 0;
	for(var i=0; i<4; ++i) {
		var roofObj = new THREE.Mesh(
			roofGeometry,
			wallMaterial
		);
		roofObj.rotation.x += Math.PI / 2;
		roofObj.position.y += 10.2;
		roofObj.position.z += startZ;
		startZ += roofLen;
		// roof.receiveShadow = true;
		roof.push(roofObj);
		scene.add(roofObj);
	}

	/*********** COINS ***********/

	coinTexture = textureLoader.load("assets/textures/coin.png");
	coinGeometry = new THREE.CircleGeometry(7, 32);
	coinMaterial = new THREE.MeshBasicMaterial({color:0xffffff, map:coinTexture});
	for(var i=0; i<20; i++) {
		var coin = new THREE.Mesh(coinGeometry, coinMaterial);

		coin.rotation.x += Math.PI;
		coin.rotation.z -= Math.PI;
		coin.scale.set(0.04, 0.04, 0.04);
		coin.position.x = Math.random() < 0.5 ? (player.rightPosition-0.3) : (player.leftPosition + 0.3);
		coin.position.z = parseFloat((Math.random() * (200.00 - 0.00) + 0.00));

		coins.push(coin);
		scene.add(coin);
	}

	/*********** MODELS ***********/

	for(var _key in models) {
		(function(key){

			var mtlLoader = new THREE.MTLLoader(loadingManager);
			mtlLoader.load(models[key].mtl, function(materials) {

				materials.preload();
				var objLoader = new THREE.OBJLoader(loadingManager);
				objLoader.setMaterials(materials);
				objLoader.load(models[key].obj, function(mesh){

					mesh.traverse(function(node) {
						if( node instanceof THREE.Mesh) {
							if( 'castShadow' in models[key] ) node.castShadow = models[key].castShadow;
							else node.castShadow = true;

							if( 'receiveShadow' in models[key] ) node.receiveShadow = models[key].castShadow;
							else node.receiveShadow = true;
						}
					});
					models[key].mesh = mesh;
				});
			});
		})(_key);
	}

	/*********** LIGHT ***********/

	ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
	scene.add(ambientLight);

	light = new THREE.PointLight(0xffffff, 1, 18);
	light.position.set(0, 6, -6);
	light.castShadow = true;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 25;
	scene.add(light);

	camera.position.set(0, 2, -10);
	camera.lookAt(new THREE.Vector3(0, 1.8, 0));

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth/2, window.innerHeight/1.2);
	renderer.setClearColor(0x000000, 1);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;

	stats = new Stats();
	stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
	document.body.appendChild( stats.dom );
	document.body.appendChild(renderer.domElement);

	animate();
}


function onResourcesLoaded() {
	
	meshes["player"] = models.car.mesh.clone();
	meshes["player"].position.set(player.rightPosition, 0, -7.3);
	meshes["player"].rotation.y += Math.PI;
	meshes["player"].scale.set(2, 2, 1);
	scene.add(meshes["player"]);
}


function animate() {
	
	if( RESOURCES_LOADED == false) {
		requestAnimationFrame(animate);
		renderer.render(loadingScreen.scene, loadingScreen.camera);
		return;
	}

	requestAnimationFrame(animate);

	// if(keyboard[67]) {
	// 	wallMaterial.color.set(0x181818);
	// 	trackMaterial.color.set(0x282828);
	// }
	// else {
	// 	wallMaterial.color.set(0xffffff);
	// 	trackMaterial.color.set(0xffffff);
	// }

	stats.begin();

	if(keyboard[39] || keyboard[68]) meshes["player"].position.x = player.rightPosition;
	if(keyboard[37] || keyboard[65]) meshes["player"].position.x = player.leftPosition;
	if(keyboard[32] && !player.jumping) player.jumping = true;

	if(meshes["player"].position.y >= player.maxHeight) {
		if(player.jumpSpeed > 0) player.jumpSpeed *= -1;
		meshes["player"].position.y = player.maxHeight;
	}
	if(player.jumping) {
		meshes["player"].position.y += player.jumpSpeed;
	}
	if(meshes["player"].position.y<=0 && player.jumping) {
		meshes["player"].position.y = 0;
		if(player.jumpSpeed < 0) player.jumpSpeed *= -1;
		player.jumping = false;
	}

	camera.position.z += player.speed;
	camera.lookAt.z += player.speed;
	light.position.z += player.speed;
	// light.position.x = meshes["player"].position.x;
	meshes["player"].position.z += player.speed;

	/******** Rerendering to create infinite illusion ********/

	if(Math.floor(camera.position.z)%wallLen==0 && !wallFlag && Math.floor(camera.position.z)>0) {

		leftWall[0].position.z += (wallLen * leftWall.length);
		var beginningLeftWall = leftWall.shift();
		leftWall.push(beginningLeftWall);

		rightWall[0].position.z += (wallLen * rightWall.length);
		var beginningRightWall = rightWall.shift();
		rightWall.push(beginningRightWall);

		wallFlag = true;
	}
	if(Math.floor(camera.position.z)%wallLen == 1) wallFlag = false;

	if(Math.floor(camera.position.z)%trackLen==0 && !trackFlag && Math.floor(camera.position.z)>0) {

		track[0].position.z += (trackLen * track.length);
		var beginningTrack = track.shift();
		track.push(beginningTrack);

		trackFlag = true;
	}
	if(Math.floor(camera.position.z)%trackLen == 1) trackFlag = false;

	if(Math.floor(camera.position.z)%roofLen==0 && !roofFlag && Math.floor(camera.position.z)>0) {

		roof[0].position.z += (roofLen * roof.length);
		var beginningRoof = roof.shift();
		roof.push(beginningRoof);

		roofFlag = true;
	}
	if(Math.floor(camera.position.z)%roofLen == 1) roofFlag = false;


	/******************* COINS ******************/

	for(var i=0; i<coins.length; i++) {

		if(detectCollision(meshes["player"], coins[i]) || coins[i].position.z < camera.position.z + 1) {

			if(detectCollision(meshes["player"], coins[i])) player.score += 1;

			coins[i].position.x = Math.random() < 0.5 ? (player.rightPosition-0.3) : (player.leftPosition + 0.3);
			coins[i].position.z = parseFloat((Math.random() * (camera.position.z + 200 - camera.position.z + 50) + camera.position.z + 50));
		}
	}

	scoreText.innerHTML = "Score: " + player.score;

	renderer.render(scene, camera);
	stats.end();
}


function detectCollision(obj1, obj2) {
	var bbox1 = new THREE.Box3().setFromObject(obj1);
	var bbox2 = new THREE.Box3().setFromObject(obj2);
	
	return bbox1.isIntersectionBox(bbox2);
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