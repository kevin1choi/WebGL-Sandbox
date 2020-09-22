import React, { Component } from "react";
import * as THREE from "three";

class App extends Component {
    componentDidMount() {
         // Scene & Camera setup
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(
                        75,  // field of view
                        window.innerWidth / window.innerHeight,  // aspect ratio
                        0.1,   // near clipping plane
                        1000   // far clipping plane
                    );   

        var renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);  // set renderer size
        this.mount.appendChild( renderer.domElement );   // adds <canvas> element to ref

        // Objects & Camera position setup
        var geometry = new THREE.BoxGeometry();   // contains vertices and faces of a cube
        var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );   // material with color parameter
        var cube = new THREE.Mesh( geometry, material );    // mesh with geometry and material parameters
        scene.add( cube );    // adds mesh to scene at (0, 0, 0)

        camera.position.z = 5;  // move camera 5 units in z direction
        
        // Render Loop
        function animate() {
            requestAnimationFrame( animate );   // pauses render when browser inactive, and does other things too

            // Simple Rotations
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;

            renderer.render( scene, camera );   // render scene every time screen is refreshed
        }

        animate();  // call render loop
    }

    render() {
        return (
            <div ref={ref => (this.mount = ref)} />
        )
    }
}

export default App;
