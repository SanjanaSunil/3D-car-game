var scene, camera, renderer, stats, clock;
var ambientLight, light;

var scoreText, gameOverText;

var track = [], trackGeometry, trackMaterial, trackTexture, trackLen, trackFlag = false;
var rightWall = [], leftWall = [], wallTexture, wallGeometry, wallMaterial, wallLen, wallFlag = false;
var roof = [], roofTexture, roofGeometry, roofLen, roofFlag = false;

var coins = [], coinGeometry, coinMaterial, coinTexture;
var flyBoost, flyBoostGeometry, flyBoostMaterial, flyBoostTexture, flyBoostActivated = 0;
var crate, crateGeometry, crateMaterial, crateTexture, crateNormalMap, crateBumpMap;

var gameOver = false, hitObstacle = 0;

var keyboard = {};
var player = {
				speed:0.4,
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
var loaded = false;

var models = {
	car: {
		obj:"assets/models/car.obj",
		mtl:"assets/models/car.mtl",
		mesh: null
	},
	police: {
		obj:"assets/models/police.obj",
		mtl:"assets/models/police.mtl",
		mesh: null
	},
	gate: {
		obj:"assets/models/gate.obj",
		mtl:"assets/models/gate.mtl",
		mesh: null
	},
	fence: {
		obj:"assets/models/fence.obj",
		mtl:"assets/models/fence.mtl",
		mesh: null
	}
};
var meshes = {};

function init() {

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.1, 100);
	clock = new THREE.Clock();

	var textureLoader = new THREE.TextureLoader();
	var startZ = 0;

	scoreText = document.createElement('div');
	scoreText.setAttribute('id', 'score-text');
	scoreText.innerHTML = "";
	scoreText.style.top = window.innerHeight / 14 + "px";
	document.body.appendChild(scoreText);

	gameOverText = document.createElement('div');
	gameOverText.setAttribute('id', 'game-over-text');
	gameOverText.innerHTML = "";
	gameOverText.style.top = window.innerHeight / 2.4 + "px";
	document.body.appendChild(gameOverText);

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
		loaded = true;
		createObjects();
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
	wallMaterial = new THREE.MeshPhongMaterial({color:0xffffff, map:wallTexture, transparent:true});
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
	for(var i=0; i<10; i++) {
		var coin = new THREE.Mesh(coinGeometry, coinMaterial);

		coin.rotation.x += Math.PI;
		coin.rotation.z -= Math.PI;
		coin.scale.set(0.04, 0.04, 0.04);
		coin.position.x = Math.random() < 0.5 ? (player.rightPosition-0.3) : (player.leftPosition + 0.3);
		coin.position.z = parseFloat((Math.random() * (200.00 - 0.00) + 0.00));

		coins.push(coin);
		scene.add(coin);
	}

	/*********** CRATE  ***********/

	crateGeometry = new THREE.BoxGeometry(5, 6.5, 5);
	crateTexture = textureLoader.load("assets/textures/crate0_diffuse.png");
	crateBumpMap = textureLoader.load("assets/textures/crate0_bump.png"); 
	crateNormalMap = textureLoader.load("assets/textures/crate0_normal.png");
	crateMaterial = new THREE.MeshPhongMaterial({
						color:0xffffff,
						map:crateTexture,
						bumpMap:crateBumpMap,
						normalMap:crateNormalMap,
					});
	
	crate = new THREE.Mesh(crateGeometry, crateMaterial);
	crate.receiveShadow = true;
	crate.castShadow = true;
	crate.position.set(3, -0.5, 20);
	scene.add(crate);

	/*********** FLY BOOST **********/

	flyBoostGeometry = new THREE.CircleGeometry(10, 32);
	flyBoostTexture = textureLoader.load("assets/textures/jump.png");
	flyBoostMaterial = new THREE.MeshBasicMaterial({color:0xffffff, map:flyBoostTexture});
	flyBoost = new THREE.Mesh(flyBoostGeometry, flyBoostMaterial);
	flyBoost.position.set(-2, -0.2, 20);
	flyBoost.rotation.x += Math.PI;
	flyBoost.rotation.z += Math.PI;
	flyBoost.scale.set(0.05, 0.05, 0.05);
	scene.add(flyBoost);

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


function createObjects() {
	
	meshes["player"] = models.car.mesh.clone();
	meshes["player"].position.set(player.rightPosition, 0, -7);
	meshes["player"].rotation.y += Math.PI;
	meshes["player"].scale.set(2, 2, 1);
	scene.add(meshes["player"]);

	meshes["police"] = models.police.mesh.clone();
	meshes["police"].position.set(player.rightPosition, 0, -8);
	meshes["police"].scale.set(2, 2, 1);
	meshes["police"].rotation.y += Math.PI;
	scene.add(meshes["police"]);

	for(var i=0; i<5; ++i) {	
		var gateNo = "gate" + i.toString();
		meshes[gateNo] = models.gate.mesh.clone();

		meshes[gateNo].position.set(-0.6, -1, 0);
		if(Math.random() < 0.5) meshes[gateNo].position.x = 4.8;
		meshes[gateNo].position.z = parseFloat((Math.random() * (200.00 - 0.00) + 0.00))
		meshes[gateNo].scale.set(4, 2, 2);
		scene.add(meshes[gateNo]);
	}

	meshes["fence"] = models.fence.mesh.clone();
	meshes["fence"].rotation.y += Math.PI / 2;
	meshes["fence"].position.set(0, -0.8, 35);
	meshes["fence"].scale.set(3, 8, 5);
	scene.add(meshes["fence"]);
}


function animate() {
	
	if(gameOver) return;

	if(loaded == false) {
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

	var time = Date.now() * 0.0005;

	// if(keyboard[67]) colorToGray();
	// else grayToColor();

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
	meshes["player"].position.z += player.speed;

	if(!hitObstacle) meshes["police"].position.z += player.speed / 1.05;
	else meshes["police"].position.z += player.speed;
	meshes["police"].position.x = meshes["player"].position.x;

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
			coins[i].position.z = parseFloat((Math.random() * (camera.position.z + 200 - camera.position.z - 50) + camera.position.z + 50));
		}
	}

	/******************** GATE *******************/
	
	for(var i=0; i<5; ++i) {
		var gateNo = "gate" + i.toString();

		if(meshes[gateNo].position.z < camera.position.z - 5) {
			meshes[gateNo].position.x = (meshes[gateNo].position.x==4.8) ? -0.6 : 4.8;
			meshes[gateNo].position.z += parseFloat((Math.random() * (camera.position.z + 100 - camera.position.z - 7) + camera.position.z + 7));
		}
	}

	/******************** FENCE ******************/

	if(meshes["fence"].position.z < camera.position.z - 2) {
		meshes["fence"].position.x = (meshes["fence"].position.x == 0) ? 5 : 0;
		meshes["fence"].position.z = camera.position.z + 70;
	}
	
	/******************** CRATE ******************/

	if(crate.position.z < camera.position.z - 5) {
		crate.position.x = (crate.position.x == 3) ? (-3) : (3);
		crate.position.z += camera.position.z + 200;
	}

	/*************** FLY POWERUP *************/

	if(detectCollision(meshes["player"], flyBoost)) {
		flyBoostActivated = 1;
		flyBoost.position.z = camera.position.z + 200;
	}
	if(flyBoost.position.z < camera.position.z - 2) flyBoost.position.z = camera.position.z + 100;

	if(flyBoostActivated) {
		meshes["player"].position.y = 3;
		flyBoostActivated += 1;
	}
	if(flyBoostActivated > 250) {
		var color = new THREE.Color(0xff0000);
		if(wallMaterial.color.equals(color)) color.set(0xffffff);
		wallMaterial.color.set(color);
		trackMaterial.color.set(color);
	}
	if(flyBoostActivated > 300) {
		flyBoostActivated = 0;
		wallMaterial.color.set(0xffffff);
		trackMaterial.color.set(0xffffff);
		meshes["player"].position.y -= 3;
	}

	scoreText.innerHTML = "Score: " + player.score;

	// Flashing walls
	if(Math.floor(time)%15==0) wallMaterial.opacity = (wallMaterial.opacity==1) ? 0.5:1;
	else wallMaterial.opacity = 1;


	/****************** GAME END ***************/

	if(camera.position.z > 1000) endGame("You won!");
	if(detectCollision(meshes["player"], crate)) endGame("You lost!");

	for(var i=0; i<5; i++) {
		var gateNo = "gate" + i.toString();
		if(detectCollision(meshes[gateNo], meshes["player"])) endGame("You lost!");
	}

	if(detectCollision(meshes["player"], meshes["fence"])) {
		if(!hitObstacle) {
			hitObstacle = time;
			player.speed -= 0.15;
			meshes["police"].position.z = meshes["player"].position.z - 1.5;
		}
		else if(hitObstacle + 4 < time) endGame("You lost!");
	}

	renderer.render(scene, camera);
	stats.end();
}

// function colorToGray() {
// 	wallMaterial.color.set(0x181818);
// 	trackMaterial.color.set(0x181818);
// 	coinMaterial.color.set(0x181818);
// 	crateMaterial.color.set(0x181818);
// }

// function grayToColor() {
// 	wallMaterial.color.set(0xffffff);
// 	trackMaterial.color.set(0xffffff);
// 	coinMaterial.color.set(0xffffff);
// 	crateMaterial.color.set(0xffffff);
// }

function detectCollision(obj1, obj2) {
	var bbox1 = new THREE.Box3().setFromObject(obj1);
	var bbox2 = new THREE.Box3().setFromObject(obj2);
	
	return bbox1.isIntersectionBox(bbox2);
}

function endGame(message) {
	// for(var i=0; i<leftWall.length; i++) scene.remove(leftWall[i]);
	// for(var i=0; i<rightWall.length; i++) scene.remove(rightWall[i]);
	// for(var i=0; i<track.length; i++) scene.remove(track[i]);
	// for(var i=0; i<roof.length; i++) scene.remove(roof[i]);
	
	scene.remove(meshes["player"]);
	scene.remove(meshes["fence"]);
	scene.remove(meshes["police"]);
	scene.remove(flyBoost);
	for(var i=0; i<coins.length; i++) scene.remove(coins[i]);
	scene.remove(crate);

	for(var i=0; i<5; i++) {
		var gateNo = "gate" + i.toString();
		scene.remove(meshes[gateNo]);
	}

	gameOver = true;
	gameOverText.innerHTML = "GAME OVER. " + message;
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