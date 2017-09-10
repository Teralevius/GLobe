import THREE from 'THREE';
import d3 from 'd3';

export var canvas= d3.select("div#Main").data([0]).append("canvas")
  .attr("width", 1000)
  .attr("id", "GLOBE")
  .attr("ondblclick", "redirect()" )
  .attr("height", 500);

canvas.node().getContext("webgl");

export var renderer = new THREE.WebGLRenderer({canvas: canvas.node(), antialias: true});

renderer.setSize(1000, 500);
document.body.appendChild(renderer.domElement);

export var camera = new THREE.PerspectiveCamera(70, 1000 / 500, 1, 5000);
camera.position.z = 1000;

export var scene = new THREE.Scene();

export var light = new THREE.HemisphereLight('#ffffff', '#666666', 1.5);
light.position.set(0, 1000, 0);
scene.add(light);

/*window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  //camera.aspect = window.innerWidth / window.innerHeight;
  //camera.updateProjectionMatrix();
  //renderer.setSize(window.innerWidth, window.innerHeight);
}*/
