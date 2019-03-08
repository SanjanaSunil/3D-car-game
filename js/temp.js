var scene, camera, renderer, mesh, clock;
var meshFloor, ambientLight, light;

var crate, crateTexture, crateNormalMap, crateBumpMap;

var keyboard = {};
var player = { height:1.8, speed:0.2, turnSpeed:Math.PI*0.02, canShoot:0 };
var USE_WIREFRAME = false;

var loadingScreen = {
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.1, 100),
	box: new THREE.Mesh(
		new THREE.BoxGeometry(0.5,0.5,0.5),
		new THREE.MeshBasicMaterial({ color:0x4444ff })
	)
};
var LOADING_MANAGER = null;
var RESOURCES_LOADED = false;

var models = {
	ground: {
		obj:"assets/models/naturePack_001.obj",
		mtl:"assets/models/naturePack_001.mtl",
		mesh: null
	},
	gun: {
		obj:"assets/models/uziGold.obj",
		mtl:"assets/models/uziGold.mtl",
		mesh: null,
		castShadow: false
	}
};

var meshes = {};

var bullets = [];

function init() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.1, 1000);
	clock = new THREE.Clock();

	loadingScreen.box.position.set(0,0,5);
	loadingScreen.camera.lookAt(loadingScreen.box.position);
	loadingScreen.scene.add(loadingScreen.box);

	loadingManager = new THREE.LoadingManager();
	loadingManager.onProgress = function(item, loaded, total){
		console.log(item, loaded, total);
	};
	loadingManager.onLoad = function(){
		console.log("Loaded all resources");
		RESOURCES_LOADED = true;
		onResourcesLoaded();
	};

	mesh = new THREE.Mesh(
		new THREE.BoxGeometry(1,1,1),
		new THREE.MeshPhongMaterial({color:0xff9999, wireframe:USE_WIREFRAME})
	);
	mesh.position.y += 1;
	mesh.receiveShadow = true;
	mesh.castShadow = true;
	scene.add(mesh);

	meshFloor = new THREE.Mesh(
		new THREE.PlaneGeometry(20,20,10,10),
		new THREE.MeshPhongMaterial({color:0xffffff, wireframe:USE_WIREFRAME})
	);
	meshFloor.rotation.x -= Math.PI / 2;
	meshFloor.receiveShadow = true;
	scene.add(meshFloor);

	ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
	scene.add(ambientLight);

	light = new THREE.PointLight(0xffffff, 0.8, 18);
	light.position.set(-3,6,-3);
	light.castShadow = true;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 25;
	scene.add(light);

	var textureLoader = new THREE.TextureLoader(loadingManager);
	crateTexture = textureLoader.load("assets/textures/crate0_diffuse.png");
	crateBumpMap = textureLoader.load("assets/textures/crate0_bump.png"); 
	crateNormalMap = textureLoader.load("assets/textures/crate0_normal.png");

	crate = new THREE.Mesh(
		new THREE.BoxGeometry(3,3,3),
		new THREE.MeshPhongMaterial({
			color:0xffffff,
			map:crateTexture,
			bumpMap:crateBumpMap,
			normalMap:crateNormalMap,
		})
	);
	scene.add(crate);
	crate.position.set(2.5,3/2,2.5);
	crate.receiveShadow = true;
	crate.castShadow = true;

	// Model material loading
	// var mtlLoader = new THREE.MTLLoader(loadingManager);
	// mtlLoader.load("assets/models/naturePack_001.mtl", function(materials){

	// 	materials.preload();
	// 	var objLoader = new THREE.OBJLoader(loadingManager);
	// 	objLoader.setMaterials(materials);

	// 	objLoader.load("assets/models/naturePack_001.obj", function(mesh){
			
	// 		mesh.traverse(function(node){
	// 			if( node instanceof THREE.Mesh ) {
	// 				node.castShadow = true;
	// 				node.receiveShadow = true;
	// 			}
	// 		});
			
	// 		scene.add(mesh);
	// 		mesh.position.set(-5,0,4);
	// 		mesh.rotation.y = -Math.PI/4;
	// 	});
	// });
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

	camera.position.set(0,player.height,-5);
	camera.lookAt(new THREE.Vector3(0,player.height,0));

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(1200, 720);

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;
	
	document.body.appendChild(renderer.domElement);

	animate();
}

function onResourcesLoaded() {

	meshes["ground1"] = models.ground.mesh.clone();
	meshes["ground2"] = models.ground.mesh.clone();

	meshes["ground1"].position.set(-5,0,4);
	// meshes["ground1"].rotation.y = -Math.PI/4;
	scene.add(meshes["ground1"]);

	meshes["ground2"].position.set(-8,0,4);
	scene.add(meshes["ground2"]);

	meshes["gun"] = models.gun.mesh.clone();
	meshes["gun"].position.set(0,2,0);
	meshes["gun"].scale.set(10,10,10);
	scene.add(meshes["gun"]);
}

function animate() {

	if( RESOURCES_LOADED == false) {
		requestAnimationFrame(animate);

		loadingScreen.box.position.x -= 0.05;
		if( loadingScreen.box.position.x < -10 ) loadingScreen.box.position.x = 10;
		loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x);
		renderer.render(loadingScreen.scene, loadingScreen.camera);
		return;
	}

	requestAnimationFrame(animate);

	var time = Date.now() * 0.0005;
	var delta = clock.getDelta();

	mesh.rotation.x += 0.01;
	mesh.rotation.y += 0.02;
	crate.rotation.y += 0.01;

	for(var index = 0; index<bullets.length; index++) {
		if(bullets[index] === undefined) continue;
		if(bullets[index].alive == false) {
			bullets.splice(index, 1);
			continue;
		}

		bullets[index].position.add(bullets[index].velocity);
	}

	if(keyboard[87]) {
		camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
		camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[83]) {
		camera.position.x += Math.sin(camera.rotation.y) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[65]) {
		camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
	}
	if(keyboard[68]) {
		camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
	}
	if(keyboard[37]) {
		camera.rotation.y -= player.turnSpeed;
	}
	if(keyboard[39]) {
		camera.rotation.y += player.turnSpeed;
	}
	if(keyboard[32] && player.canShoot<=0) {
		var bullet = new THREE.Mesh(
			new THREE.SphereGeometry(0.05,8,8),
			new THREE.MeshBasicMaterial({color:0xffffff})
		);

		bullet.position.set(
			meshes["gun"].position.x,
			meshes["gun"].position.y + 0.15,
			meshes["gun"].position.z
		);

		bullet.velocity = new THREE.Vector3(
			-Math.sin(camera.rotation.y),
			0,
			Math.cos(camera.rotation.y)
		);

		bullet.alive = true;
		setTimeout(function() {
			bullet.alive = false;
			scene.remove(bullet);
		}, 1000);

		bullets.push(bullet);
		scene.add(bullet);
		player.canShoot = 10;
	}
	if(player.canShoot > 0) player.canShoot = -1;

	meshes["gun"].position.set(
		camera.position.x - Math.sin(camera.rotation.y) * 0.6,
		camera.position.y - 0.5 + Math.sin(time*4 + camera.position.x + camera.position.z)*0.1,
		camera.position.z + Math.cos(camera.rotation.y) * 0.6
	);
	meshes["gun"].rotation.set(
		camera.rotation.x,
		camera.rotation.y - Math.PI,
		camera.rotation.z
	)

	renderer.render(scene, camera);
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