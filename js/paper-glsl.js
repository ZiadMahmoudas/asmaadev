(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduced || !finePointer) return;

  const host = document.querySelector('[data-paper-glsl]');
  if (!host) return;

  const img = host.querySelector('img');
  if (!img) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'paper-glsl-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);

  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: true,
    premultipliedAlpha: false,
    powerPreference: 'high-performance'
  });

  if (!gl) {
    canvas.remove();
    host.classList.add('paper-css-fallback');
    return;
  }

  const vertexSource = `
    precision mediump float;

    attribute vec2 a_position;
    attribute vec2 a_uv;

    uniform vec2 u_mouse;
    uniform float u_hover;
    uniform float u_time;

    varying vec2 v_uv;
    varying float v_light;

    void main() {
      vec2 p = a_position;
      vec2 delta = a_uv - u_mouse;
      float d = length(delta);

      // Localized paper response around the pointer.
      float local = exp(-d * 4.15) * u_hover;

      // Fine waves in the "paper" plus a slight diagonal lift.
      float wave = sin((a_uv.y - u_mouse.y) * 10.0 + u_time * 1.15);
      float ripple = cos(d * 17.0 - u_time * 1.55);

      p.x += wave * 0.026 * local * (0.52 + abs(a_uv.y - 0.5));
      p.y += ripple * 0.011 * local;
      p.y += (a_uv.x - 0.5) * (u_mouse.y - 0.5) * 0.022 * u_hover;

      // Soft page-curl bias toward the side nearest the pointer.
      float side = mix(1.0, -1.0, step(0.5, u_mouse.x));
      float edgeCoord = mix(a_uv.x, 1.0 - a_uv.x, step(0.5, u_mouse.x));
      float curl = pow(1.0 - edgeCoord, 4.0) * 0.024 * u_hover;
      p.y += curl * side * (0.35 + abs(a_uv.y - 0.5));

      v_uv = a_uv;
      v_light = (wave * 0.55 + ripple * 0.25) * local;

      gl_Position = vec4(p, 0.0, 1.0);
    }
  `;

  const fragmentSource = `
    precision mediump float;

    uniform sampler2D u_texture;
    uniform vec2 u_mouse;
    uniform vec2 u_resolution;
    uniform vec2 u_imageSize;
    uniform float u_hover;
    uniform float u_time;

    varying vec2 v_uv;
    varying float v_light;

    vec2 coverUV(vec2 uv) {
      float viewportAspect = u_resolution.x / max(u_resolution.y, 1.0);
      float imageAspect = u_imageSize.x / max(u_imageSize.y, 1.0);

      vec2 p = uv - 0.5;

      if (viewportAspect > imageAspect) {
        p.y *= imageAspect / viewportAspect;
      } else {
        p.x *= viewportAspect / imageAspect;
      }

      return p + 0.5;
    }

    void main() {
      vec2 uv = v_uv;
      vec2 delta = uv - u_mouse;
      float d = length(delta);
      float local = exp(-d * 4.4) * u_hover;

      // Tiny refraction makes printed ink feel like it is flexing with paper.
      vec2 safeDir = delta / max(d, 0.001);
      uv += safeDir * sin(d * 18.0 - u_time * 1.55) * 0.0045 * local;

      vec2 texUV = clamp(coverUV(uv), 0.001, 0.999);
      vec4 color = texture2D(u_texture, texUV);

      // Crease highlight / shadow pair.
      float crease = sin((v_uv.y - u_mouse.y) * 10.0 + u_time * 1.15) * local;
      color.rgb *= 1.0 + crease * 0.085 + v_light * 0.045;

      // Warm paper glint.
      color.rgb += vec3(0.045, 0.026, 0.010) * max(v_light, 0.0) * u_hover;

      // Slightly darker physical edges.
      float edge = min(min(v_uv.x, 1.0 - v_uv.x), min(v_uv.y, 1.0 - v_uv.y));
      float edgeShade = smoothstep(0.0, 0.055, edge);
      color.rgb *= mix(0.88, 1.0, edgeShade);

      gl_FragColor = color;
    }
  `;

  function shader(type, source) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s) || 'Shader compile failed');
    }
    return s;
  }

  function program(vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, shader(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(p) || 'Program link failed');
    }
    return p;
  }

  let prog;
  try {
    prog = program(vertexSource, fragmentSource);
  } catch (error) {
    console.warn('[Tigress paper GLSL]', error);
    canvas.remove();
    host.classList.add('paper-css-fallback');
    return;
  }

  gl.useProgram(prog);

  // Subdivided mesh so the vertex shader can physically flex the frame.
  const cols = 34;
  const rows = 42;
  const vertices = [];
  const indices = [];

  for (let y = 0; y <= rows; y++) {
    for (let x = 0; x <= cols; x++) {
      const u = x / cols;
      const v = y / rows;
      vertices.push(u * 2 - 1, v * 2 - 1, u, v);
    }
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * (cols + 1) + x;
      indices.push(i, i + 1, i + cols + 1);
      indices.push(i + 1, i + cols + 2, i + cols + 1);
    }
  }

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  const stride = 4 * Float32Array.BYTES_PER_ELEMENT;
  const aPosition = gl.getAttribLocation(prog, 'a_position');
  const aUV = gl.getAttribLocation(prog, 'a_uv');

  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, stride, 0);

  gl.enableVertexAttribArray(aUV);
  gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);

  const uniforms = {
    mouse: gl.getUniformLocation(prog, 'u_mouse'),
    hover: gl.getUniformLocation(prog, 'u_hover'),
    time: gl.getUniformLocation(prog, 'u_time'),
    resolution: gl.getUniformLocation(prog, 'u_resolution'),
    imageSize: gl.getUniformLocation(prog, 'u_imageSize'),
    texture: gl.getUniformLocation(prog, 'u_texture')
  };

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  let imageWidth = 1;
  let imageHeight = 1;
  let textureReady = false;

  function uploadTexture() {
    try {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      imageWidth = img.naturalWidth || 1;
      imageHeight = img.naturalHeight || 1;
      textureReady = true;
      host.classList.add('paper-glsl-ready');
    } catch (error) {
      console.warn('[Tigress paper GLSL texture]', error);
      host.classList.add('paper-css-fallback');
    }
  }

  if (img.complete && img.naturalWidth) uploadTexture();
  else img.addEventListener('load', uploadTexture, { once: true });

  const pointer = { x: 0.5, y: 0.5 };
  const smoothPointer = { x: 0.5, y: 0.5 };
  let hoverTarget = 0;
  let hover = 0;
  let visible = true;
  let frame = 0;

  function resize() {
    const rect = host.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  }

  function pointerMove(event) {
    const rect = host.getBoundingClientRect();
    pointer.x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    pointer.y = Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height));

    const tiltY = ((pointer.x - 0.5) * 5.2).toFixed(2);
    const tiltX = ((0.5 - pointer.y) * 4.0).toFixed(2);
    host.style.setProperty('--paper-tilt-x', tiltX + 'deg');
    host.style.setProperty('--paper-tilt-y', tiltY + 'deg');
  }

  host.addEventListener('pointerenter', () => {
    hoverTarget = 1;
    host.classList.add('paper-is-hovered');
  });
  host.addEventListener('pointermove', pointerMove, { passive: true });
  host.addEventListener('pointerleave', () => {
    hoverTarget = 0;
    host.classList.remove('paper-is-hovered');
    host.style.setProperty('--paper-tilt-x', '0deg');
    host.style.setProperty('--paper-tilt-y', '0deg');
  });

  const observer = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
  }, { threshold: 0.01 });
  observer.observe(host);

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();

  const start = performance.now();

  function render(now) {
    frame = requestAnimationFrame(render);
    if (!visible || !textureReady) return;

    hover += (hoverTarget - hover) * 0.095;
    smoothPointer.x += (pointer.x - smoothPointer.x) * 0.105;
    smoothPointer.y += (pointer.y - smoothPointer.y) * 0.105;

    resize();

    gl.useProgram(prog);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.uniform1i(uniforms.texture, 0);
    gl.uniform2f(uniforms.mouse, smoothPointer.x, smoothPointer.y);
    gl.uniform1f(uniforms.hover, hover);
    gl.uniform1f(uniforms.time, (now - start) / 1000);
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform2f(uniforms.imageSize, imageWidth, imageHeight);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  }

  frame = requestAnimationFrame(render);

  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    resizeObserver.disconnect();
  }, { once: true });
})();
