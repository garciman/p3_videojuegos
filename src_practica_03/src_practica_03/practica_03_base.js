/*
* 
* Practica_02_base.js
* Videojuegos (30262) - Curso 2019-2020
* 
* Parte adaptada de: Alex Clarke, 2016, y Ed Angel, 2015.
* 
*/

// Variable to store the WebGL rendering context
var gl;

//----------------------------------------------------------------------------
// OTHER DATA 
//----------------------------------------------------------------------------

var model = new mat4();   		// create a model matrix and set it to the identity matrix
var view = new mat4();   		// create a view matrix and set it to the identity matrix
var projection = new mat4();	// create a projection matrix and set it to the identity matrix

var keys = {};
var forceMagnitude = 20.0;   // Fuerza aplicada
var maxSpeed = 10.0;        // Velocidad máxima de movimiento

var eye, target, up;			// for view matrix

var planeProgramInfo = {
	program: {},
	uniformLocations: {},
	attribLocations: {},
};

var sphereProgramInfo = {
	program: {},
	uniformLocations: {},
	attribLocations: {},
};

// List of objects to draw
var objectsToDraw = [
	{
		programInfo: planeProgramInfo,
		pointsArray: pointsPlane, 
		uniforms: {
			u_color: [1.0, 1.0, 1.0, 1.0],
			u_model: new mat4(),
		},
		primType: "triangles",
	},
	{
		programInfo: sphereProgramInfo,
		pointsArray: pointsSphere, 
		uniforms: {
			u_color: [1.0, 1.0, 1.0, 1.0],
			u_model: new mat4(),
		},
		primType: "triangles",
	},
	{
		programInfo: sphereProgramInfo,
		pointsArray: pointsSphere, 
		uniforms: {
			u_color: [1.0, 0.5, 0.5, 1.0],
			u_model: new mat4(),
		},
		primType: "triangles",
	},
	{
		programInfo: sphereProgramInfo,
		pointsArray: pointsSphere, 
		uniforms: {
			u_color: [0.5, 1.0, 0.5, 1.0],
			u_model: new mat4(),
		},
		primType: "triangles",
	},
	{
		programInfo: sphereProgramInfo,
		pointsArray: pointsSphere, 
		uniforms: {
			u_color: [0.5, 0.5, 1.0, 1.0],
			u_model: new mat4(),
		},
		primType: "triangles",
	},
	{
		programInfo: sphereProgramInfo,
		pointsArray: pointsSphere, 
		uniforms: {
			u_color: [1.0, 1.0, 0.5, 1.0],
			u_model: new mat4(),
		},
		primType: "triangles",
	},
	{
		programInfo: sphereProgramInfo,
		pointsArray: pointsSphere, 
		uniforms: {
			u_color: [1.0, 0.5, 1.0, 1.0],
			u_model: new mat4(),
		},
		primType: "triangles",
	},
	{
		programInfo: sphereProgramInfo,
		pointsArray: pointsSphere, 
		uniforms: {
			u_color: [0.5, 1.0, 1.0, 1.0],
			u_model: new mat4(),
		},
		primType: "triangles",
	},
];


// 2.1. GRAVEDAD, añadimos vector velocidad a cada esfera
// List of spheres with their current state
var spheres = [
	{
		position: [0.0, 0.0, 0.0],
		velocity: [0.0, 0.0, 0.0],
		rotation: [0.0, 0.0, 0.0],
		radius: 1.5,
	},
	{
		position: [0.0, 0.0, 0.0],
		velocity: [0.0, 0.0, 0.0],
		rotation: [0.0, 0.0, 0.0],
		radius: 1.5,
	},
	{
		position: [0.0, 0.0, 0.0],
		velocity: [0.0, 0.0, 0.0],
		rotation: [0.0, 0.0, 0.0],
		radius: 1.5,
	},
	{
		position: [0.0, 0.0, 0.0],
		velocity: [0.0, 0.0, 0.0],
		rotation: [0.0, 0.0, 0.0],
		radius: 1.5,
	},
	{
		position: [0.0, 0.0, 0.0],
		velocity: [0.0, 0.0, 0.0],
		rotation: [0.0, 0.0, 0.0],
		radius: 1.5,
	},
	{
		position: [0.0, 0.0, 0.0],
		velocity: [0.0, 0.0, 0.0],
		rotation: [0.0, 0.0, 0.0],
		radius: 1.5,
	},
	{
		position: [0.0, 0.0, 0.0],
		velocity: [0.0, 0.0, 0.0],
		rotation: [0.0, 0.0, 0.0],
		radius: 1.5,
	},
]

var plane = {
	position:	[0, 0, 0],
	dimensions: [20, 20, 0],
}

//----------------------------------------------------------------------------
// Initialization function
//----------------------------------------------------------------------------

window.onload = function init() {
	// Set up a WebGL Rendering Context in an HTML5 Canvas
	var canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {
		alert("WebGL isn't available");
	}

	//  Configure WebGL
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.disable(gl.CULL_FACE);

	setPrimitive(objectsToDraw);

	// Set up a WebGL program for the plane
	// Load shaders and initialize attribute buffers
	planeProgramInfo.program = initShaders(gl, "plane-vertex-shader", "plane-fragment-shader");
	  
	// Save the attribute and uniform locations
	planeProgramInfo.uniformLocations.model = gl.getUniformLocation(planeProgramInfo.program, "model");
	planeProgramInfo.uniformLocations.view = gl.getUniformLocation(planeProgramInfo.program, "view");
	planeProgramInfo.uniformLocations.projection = gl.getUniformLocation(planeProgramInfo.program, "projection");
	planeProgramInfo.uniformLocations.baseColor = gl.getUniformLocation(planeProgramInfo.program, "baseColor");
	planeProgramInfo.attribLocations.vPosition = gl.getAttribLocation(planeProgramInfo.program, "vPosition");

	// Set up a WebGL program for spheres
	// Load shaders and initialize attribute buffers
	sphereProgramInfo.program = initShaders(gl, "sphere-vertex-shader", "sphere-fragment-shader");
	  
	// Save the attribute and uniform locations
	sphereProgramInfo.uniformLocations.model = gl.getUniformLocation(sphereProgramInfo.program, "model");
	sphereProgramInfo.uniformLocations.view = gl.getUniformLocation(sphereProgramInfo.program, "view");
	sphereProgramInfo.uniformLocations.projection = gl.getUniformLocation(sphereProgramInfo.program, "projection");
	sphereProgramInfo.uniformLocations.baseColor = gl.getUniformLocation(sphereProgramInfo.program, "baseColor");
	sphereProgramInfo.attribLocations.vPosition = gl.getAttribLocation(sphereProgramInfo.program, "vPosition");

	// Set up viewport 
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

	// Set initial positions, velocities and rotation matrices
	spheres.forEach(function(sphere, index) {
		sphere.position = [5*(2*Math.random() - 1), 5*(2*Math.random() - 1), 5*(2*Math.random() + 1)];
		sphere.velocity = [4*(2*Math.random()-1), 4*(2*Math.random()-1), 0.0];
		sphere.rotation = [Math.random()*360, Math.random()*360, Math.random()*360];
		sphere.rotationMatrix = mat4(); // 2.5 ROTACIÓN: matriz de rotación acumulada
	});

	// 2.3 CÁMARA Y MOVIMIENTO: Inicializamos y definimos el hecho de que va a haber triggers para las teclas
	window.addEventListener("keydown", function(e) {
		keys[e.key] = true;
	});

	window.addEventListener("keyup", function(e) {
		keys[e.key] = false;
	});

	spheres[0].position = [0.0, 0.0, 1.5];
	
	lastTick = Date.now();
	requestAnimFrame(tick);
};

//----------------------------------------------------------------------------
// Tick Event Function
//----------------------------------------------------------------------------

var lastTick;

function tick(nowish) {
	var now = Date.now();

    var dt = now - lastTick;
    lastTick = now;
	update(dt)
	render(dt)

	window.requestAnimationFrame(tick)
}

//----------------------------------------------------------------------------
// Update Event Function
//----------------------------------------------------------------------------

// 2.1. GRAVEDAD, definimos constante gravedad
var gravity = -9.8;

function update(dt) {
	// Update state
	dt = dt / 1000.0;
	spheres.forEach(function(sphere, index) {

		// 2.4 COLISIÓN ESFERA-ESFERA: Respawn de esferas de color que salen del plano
		// if (index > 0 && sphere.position[2] < -10) {
		// 	respawnSphere(sphere);
		// }

		// 2.1 GRAVEDAD: Definimos aceleración
		let acceleration = [0.0, 0.0, gravity];

		// 2.3 CÁMARA Y MOVIMIENTO: Rutina de movimiento de la bola blanca
		if (index === 0) {

			// En caso de que se salga del plano, lo recolocamos en la posición inicial
			if (sphere.position[2] < -10) {
				sphere.position = [0.0, 0.0, sphere.radius / 2];
				sphere.velocity = [0.0, 0.0, 0.0];
			}

			let force = [0.0, 0.0, 0.0];

			// Flechas
			if (keys["ArrowRight"]) force[1] += forceMagnitude;
			if (keys["ArrowLeft"])  force[1] -= forceMagnitude;
			if (keys["ArrowUp"])    force[0] -= forceMagnitude;
			if (keys["ArrowDown"])  force[0] += forceMagnitude;

			// Sumamos la fuerza a la aceleración (masa = 1)
			acceleration[0] += force[0];
			acceleration[1] += force[1];
			
		}

		// 2.5 ROTACIÓN: basada en física
		let onGround = (sphere.position[2] <= sphere.radius / 2 + 0.01);

		if (onGround) {
			// Rodadura sobre el plano: eje perpendicular a la dirección de movimiento XY
			let vx = sphere.velocity[0];
			let vy = sphere.velocity[1];
			let speed = Math.sqrt(vx*vx + vy*vy);
			if (speed > 0.001) {
				// cross(vel_dir, Z) = (vy/speed, -vx/speed, 0)
				let rollAxis = vec3(vy / speed, -vx / speed, 0.0);
				// θ = v / (2π * r) vuelta completa → en grados
				let angleDeg = speed / (2 * Math.PI * sphere.radius) * 360 * dt;
				sphere.rotationMatrix = mult(rotate(angleDeg, rollAxis), sphere.rotationMatrix);
			}
		} else {
			// En el aire: rotación libre constante acumulada en la misma matriz
			sphere.rotationMatrix = mult(rotate(60*dt, vec3(1,0,0)), sphere.rotationMatrix);
			sphere.rotationMatrix = mult(rotate(60*dt, vec3(0,1,0)), sphere.rotationMatrix);
		}

		// 2.1 GRAVEDAD: Usamos Euler simplético
		// v_(t+1) = v_t + a * dt
		// x_(t+1) = x_t + v_(t+1) * dt

		// 2.1 GRAVEDAD: Actualizamos velocidad
		sphere.velocity[0] += acceleration[0] * dt;
		sphere.velocity[1] += acceleration[1] * dt;
		sphere.velocity[2] += acceleration[2] * dt;

		// Y ponemos velocidad máxima
		if (index === 0) {
			let speed = Math.sqrt(
				sphere.velocity[0]**2 + sphere.velocity[1]**2
			);

			if (speed > maxSpeed) {
				sphere.velocity[0] *= maxSpeed / speed;
				sphere.velocity[1] *= maxSpeed / speed;
			}
			
		}
		
		// Detectar colisión con el plano
		let nextX = sphere.position[0] + sphere.velocity[0] * dt;
		let nextY = sphere.position[1] + sphere.velocity[1] * dt;
		let nextZ = sphere.position[2] + sphere.velocity[2] * dt;

		// 2.1 GRAVEDAD: Para que las bolas no se caigan, ponemos un suelo simple
		if (nextZ <= sphere.radius/2) {
			//2.3/2.4 Comprobar si cae fuera del plano
			if (nextX < plane.position[0] - plane.dimensions[0]/2
				|| nextX > plane.position[0] + plane.dimensions[0]/2
				|| nextY < plane.position[1] - plane.dimensions[1]/2
				|| nextY > plane.position[1] + plane.dimensions[1]/2
			) {
				if (index == 0) {
					respawnMainSphere()
				} else {
					respawnSphere(sphere)
				}
			} else {
				// 2.2 REBOTES: Definimos vector normal al suelo
				let n = [0.0, 0.0, 1.0];
				
				// 2.2 REBOTES: Calculamos la componente paralela al plano
				// v_|| = (n * v) * n
				// Con esto calculamos dot --> producto escalar
				// 					   v_parallel --> componente paralela
				
				let dot = sphere.velocity[0]*n[0] + sphere.velocity[1]*n[1] + sphere.velocity[2]*n[2];

				let v_parallel = [dot * n[0], dot * n[1], dot * n[2]];

				// 2.2 REBOTES: Buscamos un choque perfectamente elástico, es decir, no se pierde energía cinética en la colisión de partículas (nuestras esferas)
				// Seguimos la formula: v' = v - 2v_||

				// Si quisieramos que simplemente fuera un choque elástico, podemos añadir una constante sobre la velocidad resultante que reduzca el rebote
				sphere.velocity[0] = sphere.velocity[0] - 2 * v_parallel[0];
				sphere.velocity[1] = sphere.velocity[1] - 2 * v_parallel[1];
				sphere.velocity[2] = sphere.velocity[2] - 2 * v_parallel[2];

				// 2.2 REBOTES: Corregimos posición Z para que no quede bajo el plano
				sphere.position[2] = sphere.radius / 2;
			}
		} else {
			// 2.1 GRAVEDAD: Actualizamos posicion
			sphere.position[0] += sphere.velocity[0] * dt;
			sphere.position[1] += sphere.velocity[1] * dt;
			sphere.position[2] += sphere.velocity[2] * dt;
		}

		

		// Update graphical representation
		let transform = scale(sphere.radius, sphere.radius, sphere.radius);
		// 2.5 ROTACIÓN: siempre usar la matriz acumulada (evita parpadeos al cambiar sistema)
		transform = mult(sphere.rotationMatrix, transform);
		transform = mult(translate(sphere.position[0], sphere.position[1], sphere.position[2]), transform);

		// Skip the plane
		index += 1;

		objectsToDraw[index].uniforms.u_model = transform;
	});

	// 2.4 COLISIÓN ESFERA-ESFERA: Resolver colisiones entre todas las esferas
	resolveSphereCollisions();
}

//----------------------------------------------------------------------------
// 2.4 Sphere-sphere collision functions
//----------------------------------------------------------------------------

function resolveSphereCollisions() {
	for (let i = 0; i < spheres.length; i++) {
		for (let j = i + 1; j < spheres.length; j++) {
			let a = spheres[i];
			let b = spheres[j];

			let dx = b.position[0] - a.position[0];
			let dy = b.position[1] - a.position[1];
			let dz = b.position[2] - a.position[2];
			let dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
			let minDist = a.radius + b.radius;

			if (dist < minDist && dist > 0.0001) {
				// Normal de colisión (de a hacia b)
				let nx = dx / dist;
				let ny = dy / dist;
				let nz = dz / dist;

				// Velocidad relativa proyectada sobre la normal
				let vRel = (a.velocity[0] - b.velocity[0]) * nx
				         + (a.velocity[1] - b.velocity[1]) * ny
				         + (a.velocity[2] - b.velocity[2]) * nz;

				// Solo resolver si se están aproximando
				if (vRel > 0) {
					// Choque elástico masas iguales: intercambiar componente normal
					a.velocity[0] -= vRel * nx;
					a.velocity[1] -= vRel * ny;
					a.velocity[2] -= vRel * nz;
					b.velocity[0] += vRel * nx;
					b.velocity[1] += vRel * ny;
					b.velocity[2] += vRel * nz;
				}

				// Corrección de penetración: separar las esferas
				let overlap = (minDist - dist) / 2;
				a.position[0] -= overlap * nx;
				a.position[1] -= overlap * ny;
				a.position[2] -= overlap * nz;
				b.position[0] += overlap * nx;
				b.position[1] += overlap * ny;
				b.position[2] += overlap * nz;
			}
		}
	}
}

function respawnMainSphere() {
	spheres[0].position = [0.0, 0.0, 1.5];
	spheres[0].velocity = [4*(2*Math.random()-1), 4*(2*Math.random()-1), 0.0];
	spheres[0].rotationMatrix = mat4();
}

function respawnSphere(sphere) {
	// Intentar encontrar una posición libre (hasta 10 intentos)
	for (let intento = 0; intento < 10; intento++) {
		let px = 8 * (2 * Math.random() - 1);
		let py = 8 * (2 * Math.random() - 1);
		let pz = 5 + 10 * Math.random();

		// Comprobar que no solapa ninguna otra esfera
		let libre = true;
		for (let k = 0; k < spheres.length; k++) {
			if (spheres[k] === sphere) continue;
			let dx = spheres[k].position[0] - px;
			let dy = spheres[k].position[1] - py;
			let dz = spheres[k].position[2] - pz;
			let dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
			if (dist < sphere.radius + spheres[k].radius) {
				libre = false;
				break;
			}
		}

		if (libre) {
			sphere.position = [px, py, pz];
			sphere.velocity = [4*(2*Math.random()-1), 4*(2*Math.random()-1), 0.0];
			sphere.rotationMatrix = mat4();
			return;
		}
	}
	// Si no se encontró posición libre, spawnar arriba en el centro
	sphere.position = [0.0, 0.0, 10.0];
	sphere.velocity = [4*(2*Math.random()-1), 4*(2*Math.random()-1), 0.0];
	sphere.rotationMatrix = mat4();
}

//----------------------------------------------------------------------------
// Rendering Event Function
//----------------------------------------------------------------------------

function render(dt) {
	// Clear the buffer and draw everything
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

	objectsToDraw.forEach(function(object) {
		gl.useProgram(object.programInfo.program);

		// Setup buffers and attributes
		setBuffersAndAttributes(object.programInfo, object);

		// Set the uniforms
		setUniforms(object.programInfo, object.uniforms);

		// Draw
		gl.drawArrays(object.primitive, 0, object.pointsArray.length);
	});
}

//----------------------------------------------------------------------------
// Utils functions
//----------------------------------------------------------------------------

function setPrimitive(objectsToDraw) {	
	objectsToDraw.forEach(function(object) {
		switch(object.primType) {
		  case "lines":
			object.primitive = gl.LINES;
			break;
		  case "line_strip":
			object.primitive = gl.LINE_STRIP;
			break;
		  case "triangles":
			object.primitive = gl.TRIANGLES;
			break;
		  default:
			object.primitive = gl.TRIANGLES;
		}
	});	
}	

function setUniforms(pInfo, uniforms) {
	var canvas = document.getElementById("gl-canvas");

	// Set up camera
	// Projection matrix
	projection = perspective( 45.0, canvas.width/canvas.height, 0.1, 100.0 );
	gl.uniformMatrix4fv( pInfo.uniformLocations.projection, gl.FALSE, projection ); // copy projection to uniform value in shader
	
	// 2.3 CÁMARA Y MOVIMIENTO: Definimos el objetivo de la camara
	let player = spheres[0];

	eye = vec3(
		player.position[0] + 10.0,
		player.position[1] + 10.0,
		player.position[2] + 10.0
	);

	target = vec3(
		player.position[0],
		player.position[1],
		player.position[2]
	);
	up = vec3(0.0, 0.0, 1.0);
	view = lookAt(eye,target,up);
	
	gl.uniformMatrix4fv(pInfo.uniformLocations.view, gl.FALSE, view); // copy view to uniform value in shader

	// Copy uniform model values to corresponding values in shaders
	if (pInfo.uniformLocations.baseColor != null) {
		gl.uniform4f(pInfo.uniformLocations.baseColor, uniforms.u_color[0], uniforms.u_color[1], uniforms.u_color[2], uniforms.u_color[3]);
	}
	gl.uniformMatrix4fv(pInfo.uniformLocations.model, gl.FALSE, uniforms.u_model);
}

function setBuffersAndAttributes(pInfo, object) {
	// Load the data into GPU data buffers
	// Vertices
	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
	gl.bufferData( gl.ARRAY_BUFFER,  flatten(object.pointsArray), gl.STATIC_DRAW );
	gl.vertexAttribPointer( pInfo.attribLocations.vPosition, 4, gl.FLOAT, gl.FALSE, 0, 0 );
	gl.enableVertexAttribArray( pInfo.attribLocations.vPosition );
}
