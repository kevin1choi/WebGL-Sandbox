import { buildQueries } from "@testing-library/react";
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

        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();

        function onMouseMove( event ) {
            // calculate mouse position in normalized device coordinates
            // (-1 to +1) for both components
            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        }
        window.addEventListener( 'mousemove', onMouseMove, false );

        // Objects & Camera position setup
        var geometry = new THREE.BoxGeometry();   // contains vertices and faces of a cube
        var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );   // material with color parameter
        var cube = new THREE.Mesh( geometry, material );    // mesh with geometry and material parameters
        cube.position.x = 3;
        scene.add( cube );    // adds mesh to scene at (0, 0, 0)

        camera.position.z = 5;  // move camera 5 units in z direction
        
        // Render Loops
        function animate() {
            requestAnimationFrame(animate);   // pauses render when browser inactive, and does other things too

            // Simple Rotations
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;

            renderer.render(scene, camera);   // render scene every time screen is refreshed
        }

        function raycast() {
            requestAnimationFrame(raycast);

            raycaster.setFromCamera(mouse, camera);  // update the picking ray with the camera and mouse position
            var intersects = raycaster.intersectObjects(scene.children);  // calculate objects intersecting the picking ray
        
            if (intersects.length > 0) {  // if there are intersects
                for (var i = 0; i < intersects.length; i++) {
                    intersects[i].object.material.color.set(0xff0000);   // make all intersects red
                }
            } else {
                cube.material.color.set(0x00ff00);  // else make them green
            }
        
            renderer.render(scene, camera);
        }

        // call render loops
        animate();
        raycast();
    }

    render() {
        return (
            <div ref={ref => (this.mount = ref)} />
        )
    }
}

export default App;
