
const canvas = document.querySelector('#glCanvas');
const gl = canvas.getContext('webgl');


function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
}

const vertices = new Float32Array([
    // Position     Color
    -0.5, 0.5, 0.5, 1, 0, 0,
    0.5, 0.5, 0.5, 0, 1, 0,
    0.5, -0.5, 0.5, 0, 0, 1
])

const vertexShaderSource = `
attribute vec3 aPosition;
attribute vec3 aColor;
uniform float uRotation;

varying vec3 vColor;

void main() {
    float cosTheta = cos(uRotation);
    float sinTheta = sin(uRotation);
    mat2 rotationMatrix = mat2(cosTheta, -sinTheta, sinTheta, cosTheta);

    vec2 rotatedPosition = rotationMatrix * aPosition.xy;
    gl_Position = vec4(rotatedPosition, aPosition.z, 1);
    vColor = aColor;
}
`

const fragmentShaderSource = `
precision mediump float;
varying vec3 vColor;

void main() {
    gl_FragColor = vec4(vColor, 1);
}
`


const program = gl.createProgram();
const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const aPosition = gl.getAttribLocation(program, 'aPosition');
const aColor = gl.getAttribLocation(program, 'aColor');
const uRotation = gl.getUniformLocation(program, 'uRotation')
gl.enableVertexAttribArray(aPosition);
gl.enableVertexAttribArray(aColor);


gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);


gl.clearColor(0, 0, 0, 1);
let angle = 0.2;
function animate() {
    angle += 0.01;
    gl.uniform1f(uRotation, angle);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(animate);
}
animate();