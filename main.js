import * as THREE from "./libs/three/build/three.module.js";

// Canvas
const canvas = document.querySelector("#webgl");

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 0, 10);
const cameraWrapper = new THREE.Object3D();
cameraWrapper.add(camera);
scene.add(cameraWrapper);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const starDust = geneStarDust(100, 30, 0.07);
scene.add(starDust);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight.position.set(0, 0, 1);
scene.add(dirLight);

//オブジェクトの追加
const geometry = new THREE.BoxGeometry(5, 5, 5, 10);
const material = new THREE.MeshNormalMaterial();

const box = new THREE.Mesh(geometry, material);
box.position.set(0, 0.5, -15);
box.rotation.set(1, 1, 0);
scene.add(box);

function lerp(min, max, ratio) {
  return (max - min) * ratio + min;
}

function inverseLerp(min, max, value) {
  return (value - min) / (max - min);
}

/**
 * スクロールアニメーション関数定義
 */
const scrollAnims = [
  {
    start: 0,
    end: 0.4,
    function() {
      const scrollProgressInThisStep = inverseLerp(this.start, this.end, scrollProgress());
      box.position.z = lerp(-15, 0, scrollProgressInThisStep);

      camera.lookAt(box.position);
    }
  },
  {
    start: 0.4,
    end: 0.6,
    function() {
      const scrollProgressInThisStep = inverseLerp(this.start, this.end, scrollProgress());
      const rad = lerp(0, 0.5, scrollProgressInThisStep) * Math.PI;
      cameraWrapper.rotation.y = rad;

      camera.lookAt(box.position);
    }
  },
  {
    start: 0.6,
    end: 0.8,
    function() {
      const scrollProgressInThisStep = inverseLerp(this.start, this.end, scrollProgress());
      const dist = lerp(0, 30, scrollProgressInThisStep);
      camera.position.x = dist;
      camera.position.y = dist;

      camera.lookAt(box.position);
    }
  },
  {
    start: 0.8,
    end: 1,
    function() {
      const scrollProgressInThisStep = inverseLerp(this.start, this.end, scrollProgress());
      const speedScale = lerp(0.1, 1, scrollProgressInThisStep);
      box.rotateX(0.01 * speedScale);
      box.rotateY(0.01 * speedScale);

      camera.lookAt(box.position);
    }
  }
];

/**
 * ブラウザのスクロール率を導出
 */
function scrollProgress() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  return scrollTop / scrollHeight;
}

//アニメーション
const tick = () => {
  window.requestAnimationFrame(tick);
  /**
   * スクロールアニメーション開始
   */
  playScrollAnim();

  renderer.render(scene, camera);
};

tick();

function playScrollAnim() {
  const anim = scrollAnims.find(({start, end}) => start <= scrollProgress() && scrollProgress() <= end)
  anim?.function();
}

//ブラウザのリサイズ操作
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.scrollTo({ top: 0, behavior: "smooth" });

function geneStarDust(num, spreadRadius, size) {
  // 点の位置をランダムに決定する
  // 3次元空間の位置を表すデータなのでxyzで1点につき配列の要素が3つずつ必要
  let vertices = new Float32Array(num * 3);
  for (let i = 0; i < num; i++) {
    for (let j = 0; j < 3; j++) {
      vertices[i * 3 + j] = THREE.Math.randFloatSpread(spreadRadius);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

  const material = new THREE.PointsMaterial({
    size: size
  });

  return new THREE.Points(geometry, material);
}