<!--
 * @Description: 
 * @Author: Southern Wind
 * @Date: 2024-03-04 19:09:14
 * @LastEditTime: 2024-03-05 16:30:42
 * @FilePath: \docs\docs\column\map\map.vue
-->

<template>
    <div class="three" ref="container"></div>
</template>

<script setup>
import * as THREE from "three";
import * as d3 from "d3";
// 轨道
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
    CSS2DRenderer,
    CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer";

import { ref, reactive, onMounted } from "vue";
// 三个必备的参数
let scene, camera, renderer, controls;
let container = ref(null);

const lines = []
const geometry = new THREE.BufferGeometry()
let positions = null
let opacitys = null
// 以北京为中心 修改坐标
const projection = d3.geoMercator().center([104.0, 37.5]).translate([0, 0])



onMounted(() => {
    const init = () => {
        container = container.value;
        const { clientWidth, clientHeight } = container;
        console.log(clientWidth, clientHeight);

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);
        camera = new THREE.PerspectiveCamera(
            75,
            clientWidth / clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 0, 100);
        renderer = new THREE.WebGLRenderer();
        // 渲染多大的地方
        renderer.setSize(clientWidth, clientHeight);
        container.appendChild(renderer.domElement);
        controls = new OrbitControls(camera, renderer.domElement);

    }
    init();
    addBox()

});
let indexBol = true
/**
 * 边框 图形绘制
 * @param polygon 多边形 点数组
 * @param color 材质颜色
 * */
function lineDraw(polygon, color) {
    const lineGeometry = new THREE.BufferGeometry()
    const pointsArray = new Array()
    polygon.forEach((row) => {
        const [x, y] = projection(row)
        // 创建三维点
        pointsArray.push(new THREE.Vector3(x, -y, 0))

        if (indexBol) {
            lines.push([x, -y, 0])
        }
    })
    indexBol = false
    // 放入多个点
    lineGeometry.setFromPoints(pointsArray)

    const lineMaterial = new THREE.LineBasicMaterial({
        color: color
    })
    return new THREE.Line(lineGeometry, lineMaterial)
}

function addBox() {
    const loader = new THREE.FileLoader()
    loader.load('https://geo.datav.aliyun.com/areas_v3/bound/100000.json', (data) => {

        // 如果获取不到数组jsondata.features[0]为地图边界则可使用下面方法遍历所有省直辖市
        /*          const jsondata = JSON.parse(data)
                 console.log(jsondata);
                 // 中国边界
                 const feature = jsondata.features;
                 console.log(feature);
                 const province = new THREE.Object3D();
                 feature.forEach(item=>{
                     province.properties = item.properties.name;
                     const coordinates = item.geometry.coordinates;
                     coordinates.forEach((coordinate) => {
                     // coordinate 多边形数据
                     coordinate.forEach((rows) => {
                         console.log(rows);
                         const line = lineDraw(rows, 0xffffff)
                         province.add(line)
                     })
                 })
                 }) */
        const province = new THREE.Object3D()

        const jsondata = JSON.parse(data)

        // 中国边界
        const feature = jsondata.features[0]

        province.properties = feature.properties.name
        // 点数据
        const coordinates = feature.geometry.coordinates

        coordinates.forEach((coordinate) => {
            // coordinate 多边形数据
            coordinate.forEach((rows) => {

                const line = lineDraw(rows, 0xa61b29)
                province.add(line)
            })
        })

        positions = new Float32Array(lines.flat(1))
        // 设置顶点
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        // 设置 粒子透明度为 0
        opacitys = new Float32Array(positions.length).map(() => 0)
        geometry.setAttribute('aOpacity', new THREE.BufferAttribute(opacitys, 1))
        scene.add(province)
    })
    const params = {
        pointSize: 2.0,
        pointColor: '#e2d849'
    }
    const vertexShader = `
    attribute float aOpacity;
    uniform float uSize;
    varying float vOpacity;

    void main(){
        gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);
        gl_PointSize = uSize;

        vOpacity=aOpacity;
    }
    `
    const fragmentShader = `
    varying float vOpacity;
    uniform vec3 uColor;

    float invert(float n){
        return 1.-n;
    }

    void main(){
      if(vOpacity <=0.2){
          discard;
      }
      vec2 uv=vec2(gl_PointCoord.x,invert(gl_PointCoord.y));
      vec2 cUv=2.*uv-1.;
      vec4 color=vec4(1./length(cUv));
      color*=vOpacity;
      color.rgb*=uColor;
      
      gl_FragColor=color;
    }
    `
    const material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true, // 设置透明
        uniforms: {
            uSize: {
                value: params.pointSize
            },
            uColor: {
                value: new THREE.Color(params.pointColor)
            }
        }
    })
    const points = new THREE.Points(geometry, material)
    scene.add(points);
    let currentPos = 0
    let pointSpeed = 20 // 速度
    function animate() {
        if (points && geometry.attributes.position) {
            currentPos += pointSpeed
            for (let i = 0; i < pointSpeed; i++) {
                opacitys[(currentPos - i) % lines.length] = 0
            }

            for (let i = 0; i < 200; i++) {
                opacitys[(currentPos + i) % lines.length] = i / 50 > 2 ? 2 : i / 50
            }
            geometry.attributes.aOpacity.needsUpdate = true
        }
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate()
}





</script>

<style>
.three {
    width: 100%;
    height: 80vh;

}
</style>