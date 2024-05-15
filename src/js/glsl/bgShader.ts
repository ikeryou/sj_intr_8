const BgShader = {
  uniforms: {},

  vertexShader: /* glsl */ `
    varying vec2 vUv;

    void main(){
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float distortion;

    varying vec2 vUv;

    // 歪曲収差効果
    vec2 barrel(vec2 pos, float distortion) {
      pos -= vec2(0.5, 0.5);
      pos *= vec2(pow(length(pos), distortion));
      pos += vec2(0.5, 0.5);
    
      return pos;
    }

    void main(void) {
      vec2 uv = barrel(vUv, distortion);
      vec4 dest = texture2D(tDiffuse, uv);
      gl_FragColor = dest;
    }`,
}

export { BgShader }
