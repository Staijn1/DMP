import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import * as THREE from 'three';
import {
  Group,
  Mesh, MeshBasicMaterial,
  MeshStandardMaterial,
  MathUtils,
  PerspectiveCamera, PlaneGeometry,
  SphereGeometry,
  Texture,
  TextureLoader,
  WebGLRenderer
} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GUI} from 'dat.gui'
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import TWEEN from "@tweenjs/tween.js";

@Component({
  selector: 'app-welcome-page3-d',
  templateUrl: './welcome-page3-d.component.html',
  styleUrls: ['./welcome-page3-d.component.scss']
})
export class WelcomePage3DComponent implements AfterViewInit {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>

  private scene = new THREE.Scene();
  private renderer!: WebGLRenderer;
  private camera!: PerspectiveCamera;
  private gui: GUI = new GUI();

  get width(): number {
    return window.innerWidth
  }

  get height(): number {
    return window.innerHeight * 0.7
  }

  ngAfterViewInit(): void {
    this.setupScene();
  }

  onResize() {
    this.canvas.nativeElement.width = this.width
    this.canvas.nativeElement.height = this.height
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
  }

  private setupScene() {
    this.initialiseRenderer();
    this.initialiseCamera();
    this.initialiseGeometries();
    this.initialiseLights();

    const orbitControls = new OrbitControls(this.camera, this.renderer.domElement)
    orbitControls.autoRotate = true

    window.onresize = this.onResize.bind(this)
    this.render();
  }

  private initialiseCamera() {
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 400)
    this.camera.position.set(0, 2, 0)
    this.camera.lookAt(this.scene.position)
    this.scene.add(this.camera)
  }

  private initialiseRenderer() {
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas.nativeElement, antialias: true, alpha: false})
    this.renderer.setSize(this.width, this.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }


  private initialiseGeometries() {
    this.initialiseLogo();
    this.initialiseImageCarousel();
  }

  private initialiseLogo() {
    const loader = new GLTFLoader();
    loader.load('../../assets/3D/logo/Arnhemlogo3d.glb', (gltf) => {
      // Set the position of the object
      gltf.scene.position.set(0, 0, 0);

      // Add the object to the scene
      this.scene.add(gltf.scene);
    });
  }

  private initialiseLights() {
    // General light
    const ambientLight = new THREE.AmbientLight("#ffffff", 1);
    this.scene.add(ambientLight)
  }

  private render() {
    TWEEN.update();
    this.renderer.render(this.scene, this.camera)
    window.requestAnimationFrame(this.render.bind(this))
  }

  private initialiseImageCarousel() {
    const carousel = new Group();
    carousel.position.set(1, 0, 0);

    // Create a texture for each image in the carousel
    const textureLoader = new TextureLoader();
    const textures = [
      textureLoader.load('../../assets/johnfrost.jpg'),
      textureLoader.load('../../assets/station.jpg'),
      textureLoader.load('../../assets/musis.jpg'),
    ];

    // Create a plane geometry for each image
    const geometry = new PlaneGeometry(1, 1);

    // Use the Tween function to create an animation that moves each image from the right side of the scene to the left side.
    // then removes the image from the scene
    const animationDuration = 3000; // 3 seconds

    // Create a mesh for each image and add it to the carousel group
    for (let i = 0; i < textures.length; i++) {
      const material = new MeshBasicMaterial({map: textures[i]});
      const mesh = new Mesh(geometry, material);
      mesh.position.set(1 * i, 0, 1 * i);
      carousel.add(mesh);

      new TWEEN.Tween(mesh.position)
        .to({x: -1}, animationDuration)
        .delay(animationDuration * i)
        .onComplete(() => this.scene.remove(mesh))
        .start();
    }


    this.scene.add(carousel);
  }
}
