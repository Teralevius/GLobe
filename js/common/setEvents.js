import THREE from 'THREE';
import { debounce } from './utils';

let raycaster = new THREE.Raycaster();

export function setEvents(camera, items, type, wait) {

  let listener = function(event) {

    let mouse = {
      x: ((event.clientX - document.getElementById("GLOBE").offsetLeft - 1) / document.getElementById("GLOBE").width ) * 2 - 1,
      y: -((event.clientY - document.getElementById("GLOBE").offsetTop - 1) / document.getElementById("GLOBE").height) * 2 + 1
    };

    let vector = new THREE.Vector3();
    //console.log(mouse.x, mouse.y);
    vector.set(mouse.x, mouse.y, 0.5);
    vector.unproject(camera);

    raycaster.ray.set(camera.position, vector.sub(camera.position).normalize());

    let target = raycaster.intersectObjects(items);
      //console.log(target.length);
    if(target.length > 0) {
        if(document.body.style.cursor != 'url("../img/test1.png"),pointer')
        document.getElementById("Main").style.cssText = 'cursor: url("../img/test1.png"), pointer';
    } else {
        if( document.getElementById("Main").style.cssText != "cursor: default"  )
        document.getElementById("Main").style.cssText = "cursor: default";
    }
    if (target.length) {
      target[0].type = type;
      target[0].object.dispatchEvent(target[0]);
    }

  };

  if (!wait) {
    document.addEventListener(type, listener, false);
  } else {
    document.addEventListener(type, debounce(listener, wait), false);
  }
}
