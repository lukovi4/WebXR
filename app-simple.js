// SIMPLE WebXR Panel - NO BULLSHIT
const CONFIG = {
    distance: 2.5,
    width: 2.5,
    height: 1.406,  // Updated for 2048x1152 aspect ratio (16:9)
    curved: false
};

let xrSession = null;
let xrRefSpace = null;
let gl = null;
let shaderProgram = null;
let lineShaderProgram = null;
let panelBuffers = null;
let panelTexture = null;
let initialViewerTransform = null;
let controlPanelBuffers = null;
let controlPanelTexture = null;
let inputSources = [];
let rayBuffers = null;
let cursorBuffers = null;
let controlPanelBounds = null; // World space bounds for interaction

const vrButton = document.getElementById('vr-button');
const distanceSlider = document.getElementById('distance-slider');
const distanceValue = document.getElementById('distance-value');
const widthSlider = document.getElementById('width-slider');
const widthValue = document.getElementById('width-value');
const curvedToggle = document.getElementById('curved-toggle');

// Setup controls
distanceSlider.addEventListener('input', (e) => {
    CONFIG.distance = parseFloat(e.target.value);
    distanceValue.textContent = CONFIG.distance.toFixed(1);
    if (xrSession && initialViewerTransform) {
        createPanelAtPose(initialViewerTransform);
    }
});

widthSlider.addEventListener('input', (e) => {
    CONFIG.width = parseFloat(e.target.value);
    widthValue.textContent = CONFIG.width.toFixed(1);
    CONFIG.height = CONFIG.width * (1152 / 2048);  // 16:9 aspect ratio
    if (xrSession && initialViewerTransform) {
        createPanelAtPose(initialViewerTransform);
    }
});

curvedToggle.addEventListener('change', (e) => {
    CONFIG.curved = e.target.checked;
    if (xrSession && initialViewerTransform) {
        createPanelAtPose(initialViewerTransform);
    }
});

// Check WebXR support
if (navigator.xr) {
    navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
        if (supported) {
            vrButton.addEventListener('click', onVRButtonClick);
        } else {
            vrButton.textContent = 'VR Not Supported';
        }
    });
}

async function onVRButtonClick() {
    if (!xrSession) {
        xrSession = await navigator.xr.requestSession('immersive-vr');
        xrSession.addEventListener('end', () => {
            xrSession = null;
            initialViewerTransform = null;
            vrButton.textContent = 'Enter VR';
        });
        vrButton.textContent = 'Exit VR';
        await startXR();
    } else {
        xrSession.end();
    }
}

async function startXR() {
    try {
        // Create WebGL 2 context with antialiasing
        const canvas = document.createElement('canvas');
        gl = canvas.getContext('webgl2', {
            xrCompatible: true,
            antialias: true,
            powerPreference: 'high-performance'
        });

        // Fallback to WebGL 1 if WebGL 2 not available
        if (!gl) {
            gl = canvas.getContext('webgl', {
                xrCompatible: true,
                antialias: true,
                powerPreference: 'high-performance'
            });
        }

        // Setup WebXR layer with supersampling for better quality
        const layer = new XRWebGLLayer(xrSession, gl, {
            framebufferScaleFactor: 1.8  // 1.8x supersampling for better quality
        });
        xrSession.updateRenderState({ baseLayer: layer });

        // Get reference space - LOCAL (fixed in space, not head-locked)
        xrRefSpace = await xrSession.requestReferenceSpace('local');
    } catch (error) {
        console.error('Error in startXR:', error);
        alert('Error starting XR: ' + error.message);
        return;
    }

    try {
        // Create shader program
        createShaders();

        // Wait for tracking to stabilize (skip first frame, use second)
        await new Promise(resolve => {
            let frameCount = 0;
            const waitForStableFrame = (time, frame) => {
                frameCount++;
                if (frameCount < 2) {
                    xrSession.requestAnimationFrame(waitForStableFrame);
                    return;
                }
                const pose = frame.getViewerPose(xrRefSpace);
                if (pose) {
                    initialViewerTransform = pose.transform;
                    createPanelAtPose(initialViewerTransform);
                }
                resolve();
            };
            xrSession.requestAnimationFrame(waitForStableFrame);
        });

        // Create texture
        createTexture();

        // Create ray visualization
        createRayBuffers();
        createCursorBuffers();

        // Setup input sources (controllers)
        xrSession.addEventListener('inputsourceschange', (event) => {
            inputSources = Array.from(xrSession.inputSources);
        });
        xrSession.addEventListener('selectstart', onSelectStart);
        xrSession.addEventListener('select', onSelect);

        // Start rendering
        xrSession.requestAnimationFrame(onXRFrame);
    } catch (error) {
        console.error('Error in startXR setup:', error);
        alert('Setup error: ' + error.message);
    }
}

function createRayBuffers() {
    // Ray line: bright white line from controller
    const vertices = new Float32Array([
        0, 0, 0,    1.0, 1.0, 1.0,  // Start (controller) - white
        0, 0, -3,   0.3, 0.3, 1.0   // End (3m forward) - blue
    ]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    rayBuffers = { vertexBuffer, vertexCount: 2 };
}

function createCursorBuffers() {
    // Small circle for cursor (8 segments)
    const segments = 8;
    const radius = 0.02; // 2cm radius
    const verts = [];

    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        verts.push(x, y, 0, 1.0, 0.0, 0.0); // Red cursor
    }

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    cursorBuffers = { vertexBuffer, vertexCount: segments + 1 };
}

function createControlPanel(cx, cy, cz, rx, ry, rz, ux, uy, uz, mainPanelWidth, mainPanelHeight) {
    // Create control panel directly under main panel
    // Same width as main panel, positioned below it

    const w = mainPanelWidth; // Same width as main panel
    const h = 0.15; // 15cm tall (fixed height)

    // Position: same horizontal center, but below main panel
    const panelCenterX = cx;
    const panelCenterY = cy - mainPanelHeight - h - 0.05; // Below main panel with 5cm gap
    const panelCenterZ = cz;

    const vertices = new Float32Array([
        panelCenterX - rx*w + ux*h, panelCenterY - ry*w + uy*h, panelCenterZ - rz*w + uz*h,   0, 0,  // Top-left
        panelCenterX - rx*w - ux*h, panelCenterY - ry*w - uy*h, panelCenterZ - rz*w - uz*h,   0, 1,  // Bottom-left
        panelCenterX + rx*w - ux*h, panelCenterY + ry*w - uy*h, panelCenterZ + rz*w - uz*h,   1, 1,  // Bottom-right
        panelCenterX + rx*w + ux*h, panelCenterY + ry*w + uy*h, panelCenterZ + rz*w + uz*h,   1, 0   // Top-right
    ]);

    const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    controlPanelBuffers = { vertexBuffer, indexBuffer, indexCount: 6 };

    // Calculate forward vector (up cross right)
    const fx = uy * rz - uz * ry;
    const fy = uz * rx - ux * rz;
    const fz = ux * ry - uy * rx;

    // Save panel bounds for interaction
    controlPanelBounds = {
        center: { x: panelCenterX, y: panelCenterY, z: panelCenterZ },
        right: { x: rx, y: ry, z: rz },
        up: { x: ux, y: uy, z: uz },
        forward: { x: fx, y: fy, z: fz },
        width: w * 2,
        height: h * 2
    };

    // Create control panel texture
    updateControlPanelTexture();
}

function updateControlPanelTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, 2048, 300);

    // Dividers (4 sections of 512px each)
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(512, 0);
    ctx.lineTo(512, 300);
    ctx.moveTo(1024, 0);
    ctx.lineTo(1024, 300);
    ctx.moveTo(1536, 0);
    ctx.lineTo(1536, 300);
    ctx.stroke();

    // --- DISTANCE (section 1: 0-512) ---
    ctx.textAlign = 'center';
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('DISTANCE', 256, 50);

    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#4CAF50';
    ctx.fillText(CONFIG.distance.toFixed(1) + 'm', 256, 120);

    // Minus button
    ctx.fillStyle = '#555555';
    ctx.fillRect(45, 165, 180, 90);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px Arial';
    ctx.fillText('-', 135, 230);

    // Plus button
    ctx.fillStyle = '#555555';
    ctx.fillRect(285, 165, 180, 90);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('+', 375, 230);

    // --- WIDTH (section 2: 512-1024) ---
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.fillText('WIDTH', 768, 50);

    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#2196F3';
    ctx.fillText(CONFIG.width.toFixed(1) + 'm', 768, 120);

    // Minus button
    ctx.fillStyle = '#555555';
    ctx.fillRect(557, 165, 180, 90);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px Arial';
    ctx.fillText('-', 647, 230);

    // Plus button
    ctx.fillStyle = '#555555';
    ctx.fillRect(797, 165, 180, 90);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('+', 887, 230);

    // --- CURVED (section 3: 1024-1536) ---
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.fillText('CURVED', 1280, 50);

    ctx.fillStyle = CONFIG.curved ? '#4CAF50' : '#555555';
    ctx.fillRect(1130, 120, 300, 135);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.fillText(CONFIG.curved ? 'ON' : 'OFF', 1280, 202);

    // --- RECENTER (section 4: 1536-2048) ---
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.fillText('RECENTER', 1792, 50);

    ctx.fillStyle = '#FF9800';
    ctx.fillRect(1642, 120, 300, 135);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.fillText('CENTER', 1792, 202);

    // Create/update WebGL texture
    if (!controlPanelTexture) {
        controlPanelTexture = gl.createTexture();
    }

    gl.bindTexture(gl.TEXTURE_2D, controlPanelTexture);

    // Upload texture data
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

    // Set texture parameters (WebGL 2 supports mipmaps for non-POT!)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Generate mipmaps
    gl.generateMipmap(gl.TEXTURE_2D);

    // Enable anisotropic filtering if available
    const ext = gl.getExtension('EXT_texture_filter_anisotropic');
    if (ext) {
        const maxAnisotropy = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
        gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(16, maxAnisotropy));
    }
}

function recenterPanel() {
    // Get current viewer pose and recenter panel
    if (!xrSession || !xrRefSpace) return;

    // We'll update this in the next render frame
    // Set a flag to recenter on next frame
    window.needsRecenter = true;
}

function onSelectStart(event) {
    // Controller pressed trigger
}

let lastIntersection = null;

function onSelect(event) {
    // Controller released trigger - handle click
    const inputSource = event.inputSource;

    // Get ray pose and check intersection
    if (inputSource.targetRayMode === 'tracked-pointer' && xrRefSpace) {
        // We need to get the intersection from the last frame
        if (!lastIntersection) {
            return;
        }

        const u = lastIntersection.u;
        const v = lastIntersection.v;

        // Button layout (2048x300 texture)
        // Distance: section 1 (0-512)
        //   - minus: x 45-225, y 165-255 (u 0.022-0.110, v 0.55-0.85)
        //   - plus: x 285-465, y 165-255 (u 0.139-0.227, v 0.55-0.85)
        // Width: section 2 (512-1024)
        //   - minus: x 557-737, y 165-255 (u 0.272-0.360, v 0.55-0.85)
        //   - plus: x 797-977, y 165-255 (u 0.389-0.477, v 0.55-0.85)
        // Curved: section 3 (1024-1536)
        //   - toggle: x 1130-1430, y 120-255 (u 0.552-0.698, v 0.40-0.85)
        // Recenter: section 4 (1536-2048)
        //   - button: x 1642-1942, y 120-255 (u 0.802-0.948, v 0.40-0.85)

        if (u < 0.25) {
            // Distance buttons (section 1)
            if (v > 0.55 && v < 0.85) {
                if (u > 0.022 && u < 0.110) {
                    CONFIG.distance = Math.max(1.0, CONFIG.distance - 0.1);
                } else if (u > 0.139 && u < 0.227) {
                    CONFIG.distance = Math.min(5.0, CONFIG.distance + 0.1);
                }
            }
        } else if (u >= 0.25 && u < 0.50) {
            // Width buttons (section 2)
            if (v > 0.55 && v < 0.85) {
                if (u > 0.272 && u < 0.360) {
                    CONFIG.width = Math.max(1.0, CONFIG.width - 0.1);
                    CONFIG.height = CONFIG.width * (1152 / 2048);
                } else if (u > 0.389 && u < 0.477) {
                    CONFIG.width = Math.min(5.0, CONFIG.width + 0.1);
                    CONFIG.height = CONFIG.width * (1152 / 2048);
                }
            }
        } else if (u >= 0.50 && u < 0.75) {
            // Curved toggle button (section 3)
            if (u > 0.552 && u < 0.698 && v > 0.40 && v < 0.85) {
                CONFIG.curved = !CONFIG.curved;
            }
        } else if (u >= 0.75) {
            // Recenter button (section 4)
            if (u > 0.802 && u < 0.948 && v > 0.40 && v < 0.85) {
                recenterPanel();
            }
        }

        updateControlPanelTexture();
        createPanelAtPose(initialViewerTransform);
    }
}

function createShaders() {
    // Texture shader
    const vs = `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 projectionMatrix;
        uniform mat4 viewMatrix;
        varying vec2 vUV;

        void main() {
            vUV = uv;
            gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
        }
    `;

    const fs = `
        precision mediump float;
        uniform sampler2D tex;
        varying vec2 vUV;

        void main() {
            gl_FragColor = texture2D(tex, vUV);
        }
    `;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vs);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fs);
    gl.compileShader(fragmentShader);

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // Line shader
    const lineVS = `
        attribute vec3 position;
        attribute vec3 color;
        uniform mat4 projectionMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 modelMatrix;
        varying vec3 vColor;

        void main() {
            vColor = color;
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
        }
    `;

    const lineFS = `
        precision mediump float;
        varying vec3 vColor;

        void main() {
            gl_FragColor = vec4(vColor, 0.8);
        }
    `;

    const lineVertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(lineVertexShader, lineVS);
    gl.compileShader(lineVertexShader);

    const lineFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(lineFragmentShader, lineFS);
    gl.compileShader(lineFragmentShader);

    lineShaderProgram = gl.createProgram();
    gl.attachShader(lineShaderProgram, lineVertexShader);
    gl.attachShader(lineShaderProgram, lineFragmentShader);
    gl.linkProgram(lineShaderProgram);
}

function rayIntersectPanel(rayMatrix, panelBounds) {
    // Ray origin and direction from matrix
    const rayOrigin = { x: rayMatrix[12], y: rayMatrix[13], z: rayMatrix[14] };
    const rayDir = { x: -rayMatrix[8], y: -rayMatrix[9], z: -rayMatrix[10] };

    // Panel normal (facing user)
    const normal = panelBounds.forward;

    // Plane intersection: t = (plane_point - ray_origin) dot normal / (ray_dir dot normal)
    const centerToRay = {
        x: panelBounds.center.x - rayOrigin.x,
        y: panelBounds.center.y - rayOrigin.y,
        z: panelBounds.center.z - rayOrigin.z
    };

    const dotNormal = rayDir.x * normal.x + rayDir.y * normal.y + rayDir.z * normal.z;
    if (Math.abs(dotNormal) < 0.0001) return null; // Parallel

    const t = (centerToRay.x * normal.x + centerToRay.y * normal.y + centerToRay.z * normal.z) / dotNormal;
    if (t < 0) return null; // Behind ray

    // Intersection point
    const hitPoint = {
        x: rayOrigin.x + rayDir.x * t,
        y: rayOrigin.y + rayDir.y * t,
        z: rayOrigin.z + rayDir.z * t
    };

    // Check if within panel bounds
    const toHit = {
        x: hitPoint.x - panelBounds.center.x,
        y: hitPoint.y - panelBounds.center.y,
        z: hitPoint.z - panelBounds.center.z
    };

    const rightDist = Math.abs(toHit.x * panelBounds.right.x + toHit.y * panelBounds.right.y + toHit.z * panelBounds.right.z);
    const upDist = Math.abs(toHit.x * panelBounds.up.x + toHit.y * panelBounds.up.y + toHit.z * panelBounds.up.z);

    // Panel goes from -width/2 to +width/2, so max distance from center is width/2
    if (rightDist > panelBounds.width / 2 || upDist > panelBounds.height / 2) {
        return null; // Outside bounds
    }

    // Calculate UV coordinates (0-1)
    // Projection gives -width/2 to +width/2, divide by width to get -0.5 to +0.5, add 0.5 to get 0 to 1
    const u = (toHit.x * panelBounds.right.x + toHit.y * panelBounds.right.y + toHit.z * panelBounds.right.z) / panelBounds.width + 0.5;
    // V needs to be inverted: top of panel (up direction) should be v=0, bottom should be v=1
    const v = 0.5 - (toHit.x * panelBounds.up.x + toHit.y * panelBounds.up.y + toHit.z * panelBounds.up.z) / panelBounds.height;

    return { point: hitPoint, u, v, distance: t };
}

function renderCursor(view, intersection) {
    if (!cursorBuffers) return;

    gl.useProgram(lineShaderProgram);

    const posLoc = gl.getAttribLocation(lineShaderProgram, 'position');
    const colorLoc = gl.getAttribLocation(lineShaderProgram, 'color');
    const projLoc = gl.getUniformLocation(lineShaderProgram, 'projectionMatrix');
    const viewLoc = gl.getUniformLocation(lineShaderProgram, 'viewMatrix');
    const modelLoc = gl.getUniformLocation(lineShaderProgram, 'modelMatrix');

    // Set uniforms
    gl.uniformMatrix4fv(projLoc, false, view.projectionMatrix);

    const viewMatrix = new Float32Array(16);
    invertMatrix(viewMatrix, view.transform.matrix);
    gl.uniformMatrix4fv(viewLoc, false, viewMatrix);

    // Cursor transform (at intersection point, facing camera)
    const cursorMatrix = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        intersection.point.x, intersection.point.y, intersection.point.z, 1
    ]);
    gl.uniformMatrix4fv(modelLoc, false, cursorMatrix);

    // Bind cursor buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, cursorBuffers.vertexBuffer);

    if (posLoc >= 0) {
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 24, 0);
        gl.enableVertexAttribArray(posLoc);
    }

    if (colorLoc >= 0) {
        gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 24, 12);
        gl.enableVertexAttribArray(colorLoc);
    }

    gl.disable(gl.DEPTH_TEST);
    gl.drawArrays(gl.LINE_LOOP, 0, cursorBuffers.vertexCount);
    gl.enable(gl.DEPTH_TEST);
}

function renderRay(view, rayMatrix, length) {
    if (!rayBuffers) return;

    // Create dynamic ray buffer with correct length
    const vertices = new Float32Array([
        0, 0, 0,    1.0, 1.0, 1.0,  // Start (controller) - white
        0, 0, -length,   0.3, 0.3, 1.0   // End (variable length) - blue
    ]);

    const tempBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tempBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

    gl.useProgram(lineShaderProgram);

    const posLoc = gl.getAttribLocation(lineShaderProgram, 'position');
    const colorLoc = gl.getAttribLocation(lineShaderProgram, 'color');
    const projLoc = gl.getUniformLocation(lineShaderProgram, 'projectionMatrix');
    const viewLoc = gl.getUniformLocation(lineShaderProgram, 'viewMatrix');
    const modelLoc = gl.getUniformLocation(lineShaderProgram, 'modelMatrix');

    // Set uniforms
    gl.uniformMatrix4fv(projLoc, false, view.projectionMatrix);

    const viewMatrix = new Float32Array(16);
    invertMatrix(viewMatrix, view.transform.matrix);
    gl.uniformMatrix4fv(viewLoc, false, viewMatrix);

    // Ray transform (from controller)
    gl.uniformMatrix4fv(modelLoc, false, rayMatrix);

    // Bind temp buffer
    if (posLoc >= 0) {
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 24, 0);
        gl.enableVertexAttribArray(posLoc);
    }

    if (colorLoc >= 0) {
        gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 24, 12);
        gl.enableVertexAttribArray(colorLoc);
    }

    gl.disable(gl.DEPTH_TEST); // Draw over everything
    gl.drawArrays(gl.LINES, 0, 2);
    gl.enable(gl.DEPTH_TEST);

    // Clean up
    gl.deleteBuffer(tempBuffer);
}

function createPanelAtPose(viewerTransform) {
    const w = CONFIG.width / 2;
    const h = CONFIG.height / 2;

    // Extract viewer position and forward direction from transform matrix
    const m = viewerTransform.matrix;
    const px = m[12], py = m[13], pz = m[14];

    // Get forward direction (ignore pitch, only use horizontal direction)
    let fx = -m[8], fy = -m[9], fz = -m[10];

    // Project forward onto horizontal plane (ignore vertical component)
    fx = fx;
    fy = 0; // Force horizontal
    fz = fz;

    // Normalize forward
    const fLen = Math.sqrt(fx*fx + fy*fy + fz*fz);
    if (fLen > 0.001) {
        fx /= fLen;
        fy /= fLen;
        fz /= fLen;
    }

    // Up is always world up
    const ux = 0, uy = 1, uz = 0;

    // Right = forward cross up (perpendicular to both)
    const rx = fy * uz - fz * uy;
    const ry = fz * ux - fx * uz;
    const rz = fx * uy - fy * ux;

    // Panel center: viewer position + forward * distance
    const cx = px + fx * CONFIG.distance;
    const cy = py + fy * CONFIG.distance;
    const cz = pz + fz * CONFIG.distance;

    let vertices, indices;

    if (CONFIG.curved) {
        // Create curved (cylindrical) panel wrapping around user
        const segments = 40;
        const radius = CONFIG.distance;
        // Calculate arc angle so that arc length = panel width
        // Arc length = radius * angle, so angle = width / radius
        const arc = CONFIG.width / radius;  // Arc in radians
        const angleStep = arc / segments;
        const startAngle = -arc / 2;

        const verts = [];
        const inds = [];

        for (let i = 0; i <= segments; i++) {
            const angle = startAngle + i * angleStep;
            // Create cylinder centered at viewer, wrapping around forward direction
            const localX = Math.sin(angle) * radius;
            const localZ = Math.cos(angle) * radius;

            // Transform local coordinates to world space
            // Center cylinder at viewer position (px, py, pz)
            const worldX = px + rx * localX + fx * localZ;
            const worldY = py + ry * localX + fy * localZ;
            const worldZ = pz + rz * localX + fz * localZ;

            // Top vertex
            verts.push(worldX + ux * h, worldY + uy * h, worldZ + uz * h, i / segments, 0);
            // Bottom vertex
            verts.push(worldX - ux * h, worldY - uy * h, worldZ - uz * h, i / segments, 1);

            if (i < segments) {
                const base = i * 2;
                inds.push(base, base + 1, base + 2);
                inds.push(base + 1, base + 3, base + 2);
            }
        }

        vertices = new Float32Array(verts);
        indices = new Uint16Array(inds);
    } else {
        // Create flat quad in world space
        vertices = new Float32Array([
            cx - rx*w + ux*h, cy - ry*w + uy*h, cz - rz*w + uz*h,   0, 0,  // Top-left
            cx - rx*w - ux*h, cy - ry*w - uy*h, cz - rz*w - uz*h,   0, 1,  // Bottom-left
            cx + rx*w - ux*h, cy + ry*w - uy*h, cz + rz*w - uz*h,   1, 1,  // Bottom-right
            cx + rx*w + ux*h, cy + ry*w + uy*h, cz + rz*w + uz*h,   1, 0   // Top-right
        ]);

        indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
    }

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    panelBuffers = { vertexBuffer, indexBuffer, indexCount: indices.length };

    // Create control panel below main panel
    createControlPanel(cx, cy, cz, rx, ry, rz, ux, uy, uz, w, h);
}

function createTexture() {
    // Load HTML prototype using iframe and html2canvas
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.width = '2048px';
    iframe.style.height = '1152px';
    iframe.style.border = 'none';
    iframe.src = 'ui-prototype.html';

    document.body.appendChild(iframe);

    iframe.onload = () => {
        // Wait for styles and fonts to load
        setTimeout(() => {
            try {
                const iframeWin = iframe.contentWindow;
                const iframeDoc = iframe.contentDocument || iframeWin.document;

                // Use html2canvas to render iframe content at 2x resolution for VR clarity
                iframeWin.html2canvas(iframeDoc.body, {
                    width: 2048,
                    height: 1152,
                    scale: 2,  // 2x for sharp text in VR (renders at 4096×2304)
                    backgroundColor: '#1a1a1a',
                    logging: false,
                    allowTaint: true,
                    useCORS: true
                }).then(canvas => {
                    // Create WebGL texture from canvas
                    panelTexture = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, panelTexture);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.generateMipmap(gl.TEXTURE_2D);

                    const ext = gl.getExtension('EXT_texture_filter_anisotropic');
                    if (ext) {
                        const maxAnisotropy = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
                        gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(16, maxAnisotropy));
                    }

                    // Cleanup
                    document.body.removeChild(iframe);
                }).catch(error => {
                    console.error('html2canvas error:', error);
                    alert('Failed to render HTML: ' + error.message);
                    document.body.removeChild(iframe);
                });

            } catch (error) {
                console.error('Error rendering HTML:', error);
                alert('Error: ' + error.message);
                document.body.removeChild(iframe);
            }
        }, 1000);
    };

    iframe.onerror = () => {
        console.error('Failed to load ui-prototype.html');
        alert('Failed to load HTML prototype');
    };
}

function onXRFrame(time, frame) {
    const session = frame.session;
    session.requestAnimationFrame(onXRFrame);

    try {
        const pose = frame.getViewerPose(xrRefSpace);
        if (!pose) return;

        // Check if we need to recenter panel
        if (window.needsRecenter) {
            window.needsRecenter = false;
            initialViewerTransform = pose.transform;
            createPanelAtPose(initialViewerTransform);
        }

        const layer = session.renderState.baseLayer;
        gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer);

        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        for (const view of pose.views) {
            const viewport = layer.getViewport(view);
            gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

            // Render main panel
            if (panelBuffers && panelTexture) {
                renderPanel(view, panelBuffers, panelTexture);
            }

            // Render control panel with transparency
            if (controlPanelBuffers && controlPanelTexture) {
                gl.depthMask(false); // Don't write to depth buffer for transparent panel
                renderPanel(view, controlPanelBuffers, controlPanelTexture);
                gl.depthMask(true);
            }

            // Render controller rays and cursor
            lastIntersection = null; // Reset
            for (const inputSource of session.inputSources) {
                if (inputSource.targetRayMode === 'tracked-pointer') {
                    const rayPose = frame.getPose(inputSource.targetRaySpace, xrRefSpace);
                    if (rayPose) {
                        // Check ray intersection with control panel FIRST
                        let intersection = null;
                        let rayLength = 3.0; // Default ray length

                        if (controlPanelBounds) {
                            intersection = rayIntersectPanel(rayPose.transform.matrix, controlPanelBounds);
                            if (intersection) {
                                lastIntersection = intersection; // Save for click handler
                                rayLength = intersection.distance; // Shorten ray to intersection
                                renderCursor(view, intersection);
                            }
                        }

                        // Render ray (shortened if hit panel)
                        renderRay(view, rayPose.transform.matrix, rayLength);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Render error:', error);
    }
}

function renderPanel(view, buffers, texture) {
    gl.useProgram(shaderProgram);

    // Get attribute/uniform locations
    const posLoc = gl.getAttribLocation(shaderProgram, 'position');
    const uvLoc = gl.getAttribLocation(shaderProgram, 'uv');
    const projLoc = gl.getUniformLocation(shaderProgram, 'projectionMatrix');
    const viewLoc = gl.getUniformLocation(shaderProgram, 'viewMatrix');
    const texLoc = gl.getUniformLocation(shaderProgram, 'tex');

    // Set uniforms
    gl.uniformMatrix4fv(projLoc, false, view.projectionMatrix);

    // Invert view transform
    const viewMatrix = new Float32Array(16);
    invertMatrix(viewMatrix, view.transform.matrix);
    gl.uniformMatrix4fv(viewLoc, false, viewMatrix);

    gl.uniform1i(texLoc, 0);

    // Bind buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 20, 12);
    gl.enableVertexAttribArray(uvLoc);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indexBuffer);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.drawElements(gl.TRIANGLES, buffers.indexCount, gl.UNSIGNED_SHORT, 0);
}

function invertMatrix(out, m) {
    const a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3];
    const a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
    const a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11];
    const a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];

    const b00 = a00 * a11 - a01 * a10;
    const b01 = a00 * a12 - a02 * a10;
    const b02 = a00 * a13 - a03 * a10;
    const b03 = a01 * a12 - a02 * a11;
    const b04 = a01 * a13 - a03 * a11;
    const b05 = a02 * a13 - a03 * a12;
    const b06 = a20 * a31 - a21 * a30;
    const b07 = a20 * a32 - a22 * a30;
    const b08 = a20 * a33 - a23 * a30;
    const b09 = a21 * a32 - a22 * a31;
    const b10 = a21 * a33 - a23 * a31;
    const b11 = a22 * a33 - a23 * a32;

    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) return null;
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
}
