//import { scene, camera, renderer } from './common/scene';
import { setEvents } from './common/setEvents';
import { convertToXYZ, getEventCenter, geodecoder } from './common/geoHelpers';
import { mapTexture } from './common/mapTexture';
import { getTween, memoize } from './common/utils';
import topojson from 'topojson';
import THREE from 'THREE';
import d3 from 'd3';
var renderer;
var camera;
var scene;
var light;
var russianLang = true;
var countrysNameData;
var countrysColor;
export var cursorChanged = false;

init();
//disableRuLang();

function init(){
    var canvas= d3.select("div#Main").data([0]).append("canvas")
      .attr("width", 500)
      .attr("id", "GLOBE")
      .attr("ondblclick", "redirect()" )
      .attr("height", 500);

    canvas.node().getContext("webgl");

    renderer = new THREE.WebGLRenderer({canvas: canvas.node(), antialias: true});
    
    renderer.setSize(500, 500);
    //document.body.div.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(70, 500 / 500, 1, 5000);
    camera.position.z = 1000;

    scene = new THREE.Scene();

    light = new THREE.HemisphereLight('#ffffff', '#666666', 1.5);
    light.position.set(0, 1000, 0);
    scene.add(light);

}


function disableRuLang(){
    russianLang = false;
    console.log(russianLang);
}


d3.json('countrysName.json',function(err,data){
     countrysNameData= data;
});

d3.json('contrysColor.json',function(err,data){
    countrysColor = data;
     
});

d3.json('data/world.json', function (err, data) {

  d3.select("#loading").transition().duration(500)
    .style("opacity", 0).remove();

  var currentCountry, overlay;
 
  var segments = 100; // number of vertices. Higher = better mouse accuracy
  renderer.setClearColor( 0x000000, 0 );
  // Setup cache for country textures
  var countries = topojson.feature(data, data.objects.countries);
  var geo = geodecoder(countries.features);

  var textureCache = memoize(function (cntryID, color) {
    var country = geo.find(cntryID);
    return mapTexture(country, color);
  });

  // Base globe with blue "water"
  let blueMaterial = new THREE.MeshPhongMaterial({color: '#0b9aff', transparent: true});
  let sphere = new THREE.SphereGeometry(200, segments, segments);
  let baseGlobe = new THREE.Mesh(sphere, blueMaterial);
  baseGlobe.rotation.y = Math.PI;
  baseGlobe.addEventListener('click', onGlobeClick);
  baseGlobe.addEventListener('mousemove', onGlobeMousemove);

  // add base map layer with all countries
  let worldTexture = mapTexture(countries, '#647089');
  let mapMaterial  = new THREE.MeshPhongMaterial({map: worldTexture, transparent: true});
  var baseMap = new THREE.Mesh(new THREE.SphereGeometry(200, segments, segments), mapMaterial);
  baseMap.rotation.y = Math.PI;

  // create a container node and add the two meshes
  var root = new THREE.Object3D();
  root.scale.set(2.5, 2.5, 2.5);
  root.add(baseGlobe);
  root.add(baseMap);
  scene.add(root);
  fillCountrys();
    
    document.getElementById("Search").onclick = function searchCountry(){
      var countryName = document.getElementById('countryName').value;
      var countryGeoObject =geo.find(countryName);
      if(countryName !=''){
      var coordinate ;
      console.log(countryGeoObject.geometry.coordinates);
      console.log(geo.find(countryName).geometry.type);
     // console.log(geo.find("Russia").geometry.coordinates);
      //console.log(geo.find(countryName).geometry.coordinates);
      //console.log(coordinate +"     "+ geo.find("Belarus").geometry.coordinates[0][1]);
      if(countryGeoObject.geometry.type==='Polygon'){
          console.log('Poly');
          coordinate = countryGeoObject.geometry.coordinates[0][0];
          console.log(coordinate);
      }else{
          if(countryGeoObject.geometry.type==='MultiPolygon'){
              console.log('Multi');
              coordinate = countryGeoObject.geometry.coordinates[0][0][0];
              console.log(coordinate);
          }
      }  
      var temp = new THREE.Mesh();
      temp.position.copy(convertToXYZ([ coordinate[1],coordinate[0]],1200));
      temp.lookAt(root.position);
      temp.rotateY(Math.PI);
      for (let key in temp.rotation) {
      if (temp.rotation[key] - camera.rotation[key] > Math.PI) {
        temp.rotation[key] -= Math.PI * 2;
      } else if (camera.rotation[key] - temp.rotation[key] > Math.PI) {
        temp.rotation[key] += Math.PI * 2;
      }
    }
    var tweenPos = getTween.call(camera, 'position', temp.position);
    d3.timer(tweenPos);
    //console.log(temp.position);
    var tweenRot = getTween.call(camera, 'rotation', temp.rotation);
    d3.timer(tweenRot);
    }else{
        
    }
  }
  
 
  function onGlobeClick(event) {
     cursorChanged =true;
      console.log(getEventCenter.call(this, event));
    // Get pointc, convert to latitude/longitude
    var latlng = getEventCenter.call(this, event);
    console.log(latlng);
    document.getElementById("Main").style.cssText = 'cursor: url("../img/test1.png"), pointer';
    // Get new camera position
    var temp = new THREE.Mesh();
    temp.position.copy(convertToXYZ(latlng, 1200));
    //console.log(convertToXYZ(latlng, 900));
    temp.lookAt(root.position);
    //console.log(root.position);
    temp.rotateY(Math.PI);
    //console.log(getEventCenter.call(this,event));
    //console.log(geo.find("Belarus").geometry.coordinates[0][1]);
    for (let key in temp.rotation) {
      if (temp.rotation[key] - camera.rotation[key] > Math.PI) {
        temp.rotation[key] -= Math.PI * 2;
      } else if (camera.rotation[key] - temp.rotation[key] > Math.PI) {
        temp.rotation[key] += Math.PI * 2;
      }
    }

    var tweenPos = getTween.call(camera, 'position', temp.position);
    //console.log(tweenPos);
    d3.timer(tweenPos);
    //console.log(d3.timer(tweenPos));
    var tweenRot = getTween.call(camera, 'rotation', temp.rotation);
    d3.timer(tweenRot);
    
    /*if(cursorChanged == true){
        document.getElementById("Main").style.cssText = 'cursor: url("../img/test1.png"), pointer';
    }  */
    //setTimeout(cursorChanged = false, 1000);  
  }
  function redirect(){
      window.location.replace("http://stackoverflow.com");
  }
  function translateCountryName(englName){
      let translatedCountry;
      for(var i = 0; i<countrysNameData.countrys.length;i++){
          if(englName == countrysNameData.countrys[i].enName){
              translatedCountry = countrysNameData.countrys[i].ruName;
          }
      }
         return translatedCountry;
  }
  
  function fillCountrys(){
      for(var i =0;i <countrysColor.countrys.length;i++){
         var map = textureCache(countrysColor.countrys[i].enName, countrysColor.countrys[i].color);
        var  material = new THREE.MeshPhongMaterial({map: map, transparent: true});
          overlay = new THREE.Mesh(new THREE.SphereGeometry(201, 40, 40), material);
          overlay.rotation.y = Math.PI;
          root.add(overlay);
        }
  }
  function onGlobeMousemove(event) {
    var map, material;
      //console.log(countrysNameData);
    // Get pointc, convert to latitude/longitude
    var latlng = getEventCenter.call(this, event);
    //console.log(latlng);
    // Look for country at that latitude/longitude
    var country = geo.search(latlng[0], latlng[1]);
    //console.log(geo.search('99.92799279927999', '78.86941135313529'));
    

    if (country !== null && country.code !== currentCountry) {

      // Track the current country displayed
      currentCountry = country.code;
      // Update the html
      if(russianLang==true && translateCountryName(country.code)!=null){
      d3.select("#msg").html(translateCountryName(country.code));
      }else{d3.select("#msg").html(country.code)}
       // Overlay the selected country
      map = textureCache(country.code, '#CDC290');
      
      material = new THREE.MeshPhongMaterial({map: map, transparent: true});
      
      if (!overlay) {
        overlay = new THREE.Mesh(new THREE.SphereGeometry(201, 40, 40), material);
        overlay.rotation.y = Math.PI;
        root.add(overlay);
      } else {
        overlay.material = material;
      }
    }
  }

  setEvents(camera, [baseGlobe], 'click');
  setEvents(camera, [baseGlobe], 'mousemove', 10);
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
