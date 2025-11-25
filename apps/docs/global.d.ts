declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      points: any;
      lineSegments: any;
      planeGeometry: any;
      sphereGeometry: any;
      torusGeometry: any;
      bufferGeometry: any;
      bufferAttribute: any;
      shaderMaterial: any;
      meshBasicMaterial: any;
      pointsMaterial: any;
      lineBasicMaterial: any;
    }
  }
}

export {};
