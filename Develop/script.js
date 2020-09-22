
import * as THREE from 'three';

$(document).ready(function() {
    // Scene & Camera setup
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(
                    75,  // field of view
                    window.innerWidth / window.innerHeight,  // aspect ratio
                    0.1,   // near clipping plane
                    1000   // far clipping plane
                );   

    var renderer = new THREE.WebGLRenderer();
    renderer.sestSize(window.innerWidth, window.innerHeight);  // set renderer size
    document.body.appendChild(renderer.domElement);   // adds <canvas> element

    // Objects & Camera position setup
    var geometry = new THREE.BoxGeometry();   // contains vertices and faces of a cube
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );   // material with color parameter
    var cube = new THREE.Mesh( geometry, material );    // mesh with geometry and material parameters
    scene.add( cube );    // adds mesh to scene at (0, 0, 0)

    camera.position.z = 5;  // move camera 5 units in z direction
    
    // Render Loop
    function animate() {
        requestAnimationFrame( animate );   // pauses render when browser inactive, and does other things too
        renderer.render( scene, camera );   // render scene every time screen is refreshed
    }
    animate();  // call render loop

    // main();
});

function main() {
    const canvas = $("#glCanvas")[0];

    // Initialize the GL context
    const gl = canvas.getContext("webgl");

    // Only continue if WebGL is available and working
    if (gl === null) {
        console.log("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Vertex shader program - computes vertex positions
    // WebGL then uses said positions to rasterize primitives (points, line, triangles)
    // Calls fragment shader when rastering primitives
        // an attribute will receive data from a buffer
    const vsSource = `
        attribute vec4 aVertexPosition;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        void main() {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        }
    `; // all shaders have a main function
        // gl_Position is a special variable a vertex shader is responsible for setting


    // Fragment shader program
    // Computes a color for each pixel of the primitive currently being drawn
    // Ray tracing will be done here (potentially) ?
        // Fragment shaders don't have a default precision so we need to pick one
        // mediump is a good default
    const fsSource = `
        precision mediump float;

        void main() {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
    `; // all shaders have a main function
        // gl_FragColor is a special variable a fragment shader is responsible for setting

    // For handling purposes
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);  // create GLSL program on GPU
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'), // get location of vs attribute
        },
        uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        },
    };

    // Here's where we call the routine that builds all the objects we'll be drawing.
    const buffers = initBuffers(gl);

    // Draw the scene
    drawScene(gl, programInfo, buffers);
}

// Creates a shader of the given type, uploads the GLSL source and compiles the shader
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
  
    // upload the GLSL source to the shader object
    gl.shaderSource(shader, source);
  
    // Compile the shader program
    gl.compileShader(shader);
  
    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
  
    return shader;
}

// Creates a GLSL program on the GPU
// Initialize a shader program, so WebGL knows how to draw our data
    // pass vertex shader & fragment shader and create shaders
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  
    // Create the shader program & link shaders to the program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
  
    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }
  
    return shaderProgram;
}

// Initialize 2d square buffer
function initBuffers(gl) {

    // Attributes get their data from buffers so we need to create a buffer
    // Create a buffer for the square's positions.
    const positionBuffer = gl.createBuffer();
  
    // WebGl lets us manipute many WebGL resources on global bind points.
    // You can think of bind points as internal global variables inside WebGL.
    // First bind a resource to a bind point, then all other function refer to the resource via the bind point
    // Select the positionBuffer to bind to the ARRAY_BUFFER.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
    // Now we can put data in that buffer by referencing it through the bind point
    // Create an array of positions for the square.
    const positions = [
      -1.0,  1.0,
       1.0,  1.0,
      -1.0, -1.0,
       1.0, -1.0,
    ];
  
    // Now pass the list of positions into WebGL to build the shape. We do this by creating
    // a Float32Array from the JavaScript array, then use it to fill the current buffer.
    // gl.bufferData copies Float32Array positions data to the positionsBuffer(ARRAY_BUFFER) on the GPU.
    // last argument tells WebGL how we'll use this data. gl.STATIC_DRAW indicates data will not change much.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  
    return {
      position: positionBuffer,
    };
}

function drawScene(gl, programInfo, buffers) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  
    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
    // Create a perspective matrix, a special matrix that is used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units and 100 units away from the camera.
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
  
    // note: glmatrix.js always has the first argument as the destination to receive the result.
    mat4.perspective(
        projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar
    );
  
    // Set the drawing position to the "identity" point, which is the center of the scene.
    const modelViewMatrix = mat4.create();
  
    // Now move the drawing position a bit to where we want to start drawing the square.
    mat4.translate(
        modelViewMatrix,     // destination matrix
        modelViewMatrix,     // matrix to translate
        [-0.0, 0.0, -6.0]    // amount to translate
    );

    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);

    // Turn on the attribute
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    // Bind the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    {
        const numComponents = 2;  // pull out 2 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next
                                // 0 = use type and numComponents above
        const offset = 0;         // how many bytes inside the buffer to start from
        // gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset
        );  // now this attribute is bound to the positionBuffer
            // and we're free to bind something else to the ARRAY_BUFFER bind point

        // // Turn on the attribute
        // gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }
  
    // Set the shader uniforms
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
    );
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix
    );
  
    {
        const offset = 0;
        const vertexCount = 4;  // executes vertex shader 4 times
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
}

