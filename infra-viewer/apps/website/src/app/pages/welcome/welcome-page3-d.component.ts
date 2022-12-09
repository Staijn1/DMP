import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import * as THREE from 'three';
import {Mesh, MeshStandardMaterial, PerspectiveCamera, SphereGeometry, WebGLRenderer} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GUI} from 'dat.gui'

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
  private ball!: Mesh<SphereGeometry, MeshStandardMaterial>;
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
    const geometry = new THREE.SphereGeometry(0.5, 64, 64)
    const lambertMaterial = new THREE.MeshStandardMaterial({
      color: '#ff0000',
      metalness: 0.7,
      roughness: 0.2,
    })
    this.ball = new THREE.Mesh(geometry, lambertMaterial)
    this.ball.position.set(0, 0, 0)
    this.scene.add(this.ball)
  }

  private initialiseLights() {
    // Lights
    const spotLight = new THREE.SpotLight('#ffffff', 2.1)
    spotLight.castShadow = true
    spotLight.position.set(0, 0, 0)
    spotLight.lookAt(this.ball.position)

    this.gui.add(spotLight.position, 'x', 0, 100, 1)
    this.gui.add(spotLight.position, 'y', 0, 100, 1)
    this.gui.add(spotLight.position, 'z', 0, 100, 1)
    // General light
    const ambientLight = new THREE.AmbientLight("#ffffff", 1);
    this.scene.add(ambientLight)
    this.scene.add(spotLight)
  }

  private render() {
    this.renderer.render(this.scene, this.camera)
    window.requestAnimationFrame(this.render.bind(this))
  }
}
