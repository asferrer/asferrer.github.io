/* ==============================
   LIVE DEMOS — Client-side CV
   Libraries loaded on-demand only
   ============================== */

/* COCO-SSD class groups for filtering */
const CLASS_GROUPS = {
  person: ["person"],
  vehicle: ["bicycle","car","motorcycle","airplane","bus","train","truck","boat"],
  animal: ["bird","cat","dog","horse","sheep","cow","elephant","bear","zebra","giraffe"],
  furniture: ["chair","couch","bed","dining table","toilet","tv","laptop","desk"],
  food: ["banana","apple","sandwich","orange","broccoli","carrot","hot dog","pizza","donut","cake"]
};

/* Colormap LUTs (256 entries each) */
function buildColormap(name) {
  const lut = new Uint8Array(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let r, g, b;
    if (name === "inferno") {
      r = Math.round(255 * Math.min(1, 1.56 * t - 0.20 + 0.5 * Math.sin(3.14 * t)));
      g = Math.round(255 * Math.max(0, t * t * 1.2 - 0.1));
      b = Math.round(255 * Math.max(0, 0.6 * Math.sin(3.14 * t * 0.8)));
      // Simplified inferno approximation
      r = Math.round(255 * Math.min(1, Math.max(0, -0.027780558 + 1.228188 * t + 0.998 * t * t - 2.139 * t * t * t + 1.94 * t * t * t * t)));
      g = Math.round(255 * Math.min(1, Math.max(0, -0.006 + 0.13 * t + 2.85 * t * t - 5.65 * t * t * t + 3.69 * t * t * t * t)));
      b = Math.round(255 * Math.min(1, Math.max(0, 0.009 + 1.59 * t - 4.26 * t * t + 6.68 * t * t * t - 4.02 * t * t * t * t)));
    } else if (name === "viridis") {
      r = Math.round(255 * Math.min(1, Math.max(0, 0.267 + 0.004 * t + 1.63 * t * t - 1.90 * t * t * t)));
      g = Math.round(255 * Math.min(1, Math.max(0, 0.004 + 1.42 * t - 0.46 * t * t)));
      b = Math.round(255 * Math.min(1, Math.max(0, 0.329 + 0.42 * t - 1.77 * t * t + 1.02 * t * t * t)));
    } else if (name === "turbo") {
      r = Math.round(255 * Math.min(1, Math.max(0, 0.13 + 4.26 * t - 12.0 * t * t + 15.1 * t * t * t - 7.5 * t * t * t * t)));
      g = Math.round(255 * Math.min(1, Math.max(0, 0.09 + 2.87 * t - 3.84 * t * t + 1.88 * t * t * t)));
      b = Math.round(255 * Math.min(1, Math.max(0, 0.47 + 2.13 * t - 8.88 * t * t + 13.0 * t * t * t - 6.72 * t * t * t * t)));
    } else { // grayscale
      r = g = b = i;
    }
    lut[i * 3] = Math.min(255, Math.max(0, r));
    lut[i * 3 + 1] = Math.min(255, Math.max(0, g));
    lut[i * 3 + 2] = Math.min(255, Math.max(0, b));
  }
  return lut;
}

const DemoEngine = {
  activeDemo: null,
  stream: null,
  animId: null,
  models: { detection: null, pose: null, depth: null },
  _visionModule: null,

  /* ---------- Script loader ---------- */
  loadScript(src) {
    if (document.querySelector(`script[src="${src}"]`)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(s);
    });
  },

  /* ---------- Webcam helpers ---------- */
  async startWebcam(video) {
    if (this.stream) this.stopWebcam(video);
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }
    });
    video.srcObject = this.stream;
    return new Promise(r => { video.onloadedmetadata = () => { video.play(); r(); }; });
  },

  stopWebcam(video) {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    if (video) video.srcObject = null;
    if (this.animId) { cancelAnimationFrame(this.animId); this.animId = null; }
  },

  setStatus(id, text, type) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = "demo-status" + (type ? ` demo-status-${type}` : "");
  },

  hidePlaceholder(panelId) {
    const ph = document.querySelector(`#${panelId} .demo-placeholder`);
    if (ph) ph.style.display = "none";
  },

  resetButton(btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.classList.remove("running");
    const span = btn.querySelector("[data-i18n]");
    if (span) span.textContent = translations[currentLang]["demos.start"] || "Start Webcam";
  },

  /* ---------- FPS counter ---------- */
  createFpsCounter() {
    let frames = 0, lastTime = performance.now();
    return {
      tick() { frames++; },
      get() {
        const now = performance.now();
        const elapsed = now - lastTime;
        if (elapsed >= 1000) {
          const fps = Math.round(frames * 1000 / elapsed);
          frames = 0;
          lastTime = now;
          return fps;
        }
        return null;
      }
    };
  },

  /* ---------- Detection options ---------- */
  getDetectionOpts() {
    const conf = (parseInt(document.getElementById("detConfidence")?.value || "50", 10)) / 100;
    const maxResults = parseInt(document.getElementById("detMaxResults")?.value || "20", 10);
    const sel = document.getElementById("detClassFilter");
    let allowedClasses = null;
    if (sel) {
      const vals = Array.from(sel.selectedOptions).map(o => o.value);
      if (!vals.includes("all")) {
        allowedClasses = new Set();
        vals.forEach(g => (CLASS_GROUPS[g] || [g]).forEach(c => allowedClasses.add(c)));
      }
    }
    return { conf, maxResults, allowedClasses };
  },

  /* ====================================
     DEMO 1: Object Detection (TF.js COCO-SSD)
     ==================================== */
  async initDetection() {
    const status = "detectionStatus";
    const video = document.getElementById("detectionVideo");
    const canvas = document.getElementById("detectionCanvas");
    const ctx = canvas.getContext("2d");
    const fpsEl = document.getElementById("detectionFps");

    this.hidePlaceholder("demo-detection");

    try {
      this.setStatus(status, translations[currentLang]["demos.loading_lib"] || "Loading TensorFlow.js...", "loading");
      await this.loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs");
      await this.loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd");

      this.setStatus(status, translations[currentLang]["demos.loading_model"] || "Loading COCO-SSD model (~2MB)...", "loading");
      if (!this.models.detection) {
        this.models.detection = await cocoSsd.load({ base: "lite_mobilenet_v2" });
      }

      this.setStatus(status, translations[currentLang]["demos.starting_cam"] || "Starting camera...", "loading");
      await this.startWebcam(video);
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      this.setStatus(status, translations[currentLang]["demos.running"] || "Running — detecting objects in real time", "success");
      const fps = this.createFpsCounter();

      const detect = async () => {
        if (!this.stream) return;
        const { conf, maxResults, allowedClasses } = this.getDetectionOpts();
        let preds = await this.models.detection.detect(video, maxResults);
        preds = preds.filter(p => p.score >= conf);
        if (allowedClasses) preds = preds.filter(p => allowedClasses.has(p.class));

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0);

        preds.forEach(p => {
          const [x, y, w, h] = p.bbox;
          ctx.strokeStyle = "#f63366";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, w, h);
          ctx.fillStyle = "#f63366";
          ctx.font = "bold 14px Inter, sans-serif";
          const label = `${p.class} ${Math.round(p.score * 100)}%`;
          const tw = ctx.measureText(label).width;
          ctx.fillRect(x, y - 20, tw + 8, 20);
          ctx.fillStyle = "#fff";
          ctx.fillText(label, x + 4, y - 5);
        });

        fps.tick();
        const f = fps.get();
        if (f !== null) fpsEl.textContent = `${f} FPS`;
        this.animId = requestAnimationFrame(detect);
      };
      detect();
    } catch (e) {
      this.setStatus(status, e.message || "Error loading demo", "error");
      this.resetButton("startDetection");
    }
  },

  async detectImage(file) {
    const status = "detectionStatus";
    const canvas = document.getElementById("detectionCanvas");
    const ctx = canvas.getContext("2d");

    this.hidePlaceholder("demo-detection");

    try {
      if (!this.models.detection) {
        this.setStatus(status, translations[currentLang]["demos.loading_lib"] || "Loading model...", "loading");
        await this.loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs");
        await this.loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd");
        this.models.detection = await cocoSsd.load({ base: "lite_mobilenet_v2" });
      }

      const img = new Image();
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        this.setStatus(status, translations[currentLang]["demos.detecting"] || "Detecting...", "loading");

        const { conf, maxResults, allowedClasses } = this.getDetectionOpts();
        let preds = await this.models.detection.detect(img, maxResults);
        preds = preds.filter(p => p.score >= conf);
        if (allowedClasses) preds = preds.filter(p => allowedClasses.has(p.class));

        preds.forEach(p => {
          const [x, y, w, h] = p.bbox;
          ctx.strokeStyle = "#f63366";
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, w, h);
          ctx.fillStyle = "#f63366";
          ctx.font = "bold 16px Inter, sans-serif";
          const label = `${p.class} ${Math.round(p.score * 100)}%`;
          const tw = ctx.measureText(label).width;
          ctx.fillRect(x, y - 24, tw + 10, 24);
          ctx.fillStyle = "#fff";
          ctx.fillText(label, x + 5, y - 6);
        });
        this.setStatus(status, `${preds.length} objects detected`, "success");
      };
      img.src = URL.createObjectURL(file);
    } catch (e) {
      this.setStatus(status, e.message || "Error", "error");
    }
  },

  /* ====================================
     DEMO 2: Pose Estimation (MediaPipe)
     ==================================== */
  async loadVisionModule() {
    if (this._visionModule) return this._visionModule;
    this._visionModule = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.mjs");
    return this._visionModule;
  },

  getPoseOpts() {
    const minConf = (parseInt(document.getElementById("poseConfidence")?.value || "50", 10)) / 100;
    const showSkeleton = document.getElementById("poseShowSkeleton")?.checked !== false;
    const showPoints = document.getElementById("poseShowPoints")?.checked !== false;
    return { minConf, showSkeleton, showPoints };
  },

  async initPose() {
    const status = "poseStatus";
    const video = document.getElementById("poseVideo");
    const canvas = document.getElementById("poseCanvas");
    const ctx = canvas.getContext("2d");
    const fpsEl = document.getElementById("poseFps");

    this.hidePlaceholder("demo-pose");

    try {
      this.setStatus(status, translations[currentLang]["demos.loading_lib"] || "Loading MediaPipe (~16MB)...", "loading");
      const vision = await this.loadVisionModule();

      this.setStatus(status, translations[currentLang]["demos.loading_model"] || "Loading Pose Landmarker model...", "loading");

      const numPoses = parseInt(document.getElementById("poseNumPoses")?.value || "2", 10);

      const fileset = await vision.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      // Recreate model if numPoses changed
      if (this.models.pose) {
        this.models.pose.close();
        this.models.pose = null;
      }
      this.models.pose = await vision.PoseLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numPoses
      });

      this.setStatus(status, translations[currentLang]["demos.starting_cam"] || "Starting camera...", "loading");
      await this.startWebcam(video);
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      this.setStatus(status, translations[currentLang]["demos.running"] || "Running — detecting body pose in real time", "success");
      const fps = this.createFpsCounter();
      const connections = vision.PoseLandmarker.POSE_CONNECTIONS;

      const detect = () => {
        if (!this.stream) return;
        const results = this.models.pose.detectForVideo(video, performance.now());
        const { minConf, showSkeleton, showPoints } = this.getPoseOpts();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0);

        if (results.landmarks) {
          results.landmarks.forEach(landmarks => {
            if (showSkeleton) {
              ctx.strokeStyle = "#007bff";
              ctx.lineWidth = 2;
              connections.forEach(conn => {
                const a = landmarks[conn.start], b = landmarks[conn.end];
                if (a.visibility > minConf && b.visibility > minConf) {
                  ctx.beginPath();
                  ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
                  ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
                  ctx.stroke();
                }
              });
            }
            if (showPoints) {
              landmarks.forEach(lm => {
                if (lm.visibility > minConf) {
                  ctx.beginPath();
                  ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 4, 0, Math.PI * 2);
                  ctx.fillStyle = "#f63366";
                  ctx.fill();
                }
              });
            }
          });
        }

        fps.tick();
        const f = fps.get();
        if (f !== null) fpsEl.textContent = `${f} FPS`;
        this.animId = requestAnimationFrame(detect);
      };
      detect();
    } catch (e) {
      this.setStatus(status, e.message || "Error loading demo", "error");
      this.resetButton("startPose");
    }
  },

  /* ====================================
     DEMO 3: Depth Estimation (Transformers.js)
     ==================================== */
  getDepthOpts() {
    const colormap = document.getElementById("depthColormap")?.value || "inferno";
    const sideBySide = document.getElementById("depthSideBySide")?.checked !== false;
    return { colormap, sideBySide };
  },

  async initDepth(file) {
    const status = "depthStatus";
    const canvas = document.getElementById("depthCanvas");
    const ctx = canvas.getContext("2d");

    this.hidePlaceholder("demo-depth");

    try {
      this.setStatus(status, translations[currentLang]["demos.loading_depth"] || "Loading Depth Anything model (~27MB, first time only)...", "loading");

      const { pipeline, env } = await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers");
      env.allowLocalModels = false;

      if (!this.models.depth) {
        this.models.depth = await pipeline("depth-estimation", "Xenova/depth-anything-small-hf");
      }

      this.setStatus(status, translations[currentLang]["demos.processing"] || "Processing depth map...", "loading");
      const img = new Image();
      img.onload = async () => {
        const { colormap, sideBySide } = this.getDepthOpts();
        const lut = buildColormap(colormap);

        const result = await this.models.depth(img.src);
        const depthMap = result.depth;

        if (sideBySide) {
          canvas.width = img.width * 2;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        // Render depth map with colormap
        const depthCanvas = document.createElement("canvas");
        depthCanvas.width = depthMap.width;
        depthCanvas.height = depthMap.height;
        const depthCtx = depthCanvas.getContext("2d");
        const imageData = depthCtx.createImageData(depthMap.width, depthMap.height);

        for (let i = 0; i < depthMap.data.length; i++) {
          const v = Math.min(255, Math.max(0, Math.round(depthMap.data[i])));
          imageData.data[i * 4]     = lut[v * 3];
          imageData.data[i * 4 + 1] = lut[v * 3 + 1];
          imageData.data[i * 4 + 2] = lut[v * 3 + 2];
          imageData.data[i * 4 + 3] = 255;
        }
        depthCtx.putImageData(imageData, 0, 0);

        if (sideBySide) {
          ctx.drawImage(depthCanvas, img.width, 0, img.width, img.height);
          ctx.fillStyle = "rgba(0,0,0,0.5)";
          ctx.fillRect(0, 0, 100, 28);
          ctx.fillRect(img.width, 0, 110, 28);
          ctx.fillStyle = "#fff";
          ctx.font = "bold 14px Inter, sans-serif";
          ctx.fillText("Original", 8, 19);
          ctx.fillText("Depth Map", img.width + 8, 19);
        } else {
          ctx.drawImage(depthCanvas, 0, 0, img.width, img.height);
        }

        this.setStatus(status, translations[currentLang]["demos.depth_done"] || "Depth estimation complete", "success");
      };
      img.crossOrigin = "anonymous";
      img.src = URL.createObjectURL(file);
    } catch (e) {
      this.setStatus(status, e.message || "Error loading demo", "error");
    }
  },

  /* ---------- Cleanup ---------- */
  stopAll() {
    const detVideo = document.getElementById("detectionVideo");
    const poseVideo = document.getElementById("poseVideo");
    this.stopWebcam(detVideo || poseVideo);
    document.querySelectorAll(".demo-fps").forEach(el => el.textContent = "");
    document.querySelectorAll(".demo-status").forEach(el => { el.textContent = ""; el.className = "demo-status"; });
    document.querySelectorAll(".demo-start-btn").forEach(btn => {
      btn.disabled = false;
      btn.classList.remove("running");
      const span = btn.querySelector("[data-i18n]");
      if (span) span.textContent = translations[currentLang]["demos.start"] || "Start Webcam";
    });
    document.querySelectorAll(".demo-placeholder").forEach(ph => ph.style.display = "");
  }
};

/* ==============================
   DEMO UI INITIALIZATION
   ============================== */
function initDemos() {
  // Tab switching
  document.querySelectorAll(".demo-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      DemoEngine.stopAll();
      document.querySelectorAll(".demo-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      document.querySelectorAll(".demo-content").forEach(d => d.classList.add("hidden"));
      const target = document.getElementById(`demo-${tab.dataset.demo}`);
      if (target) target.classList.remove("hidden");
    });
  });

  // Object Detection — webcam
  const detBtn = document.getElementById("startDetection");
  if (detBtn) {
    detBtn.addEventListener("click", function () {
      if (this.classList.contains("running")) {
        DemoEngine.stopWebcam(document.getElementById("detectionVideo"));
        this.classList.remove("running");
        this.querySelector("[data-i18n]").textContent = translations[currentLang]["demos.start"] || "Start Webcam";
        DemoEngine.setStatus("detectionStatus", "", "");
      } else {
        this.classList.add("running");
        this.querySelector("[data-i18n]").textContent = translations[currentLang]["demos.stop"] || "Stop";
        DemoEngine.initDetection();
      }
    });
  }

  // Object Detection — image upload
  const detUpload = document.getElementById("detectionUpload");
  if (detUpload) {
    detUpload.addEventListener("change", e => {
      if (e.target.files[0]) {
        DemoEngine.stopWebcam(document.getElementById("detectionVideo"));
        const btn = document.getElementById("startDetection");
        if (btn) { btn.classList.remove("running"); btn.querySelector("[data-i18n]").textContent = translations[currentLang]["demos.start"] || "Start Webcam"; }
        DemoEngine.detectImage(e.target.files[0]);
      }
    });
  }

  // Pose Estimation — webcam
  const poseBtn = document.getElementById("startPose");
  if (poseBtn) {
    poseBtn.addEventListener("click", function () {
      if (this.classList.contains("running")) {
        DemoEngine.stopWebcam(document.getElementById("poseVideo"));
        this.classList.remove("running");
        this.querySelector("[data-i18n]").textContent = translations[currentLang]["demos.start"] || "Start Webcam";
        DemoEngine.setStatus("poseStatus", "", "");
      } else {
        this.classList.add("running");
        this.querySelector("[data-i18n]").textContent = translations[currentLang]["demos.stop"] || "Stop";
        DemoEngine.initPose();
      }
    });
  }

  // Depth Estimation — image upload only
  const depthUpload = document.getElementById("depthUpload");
  if (depthUpload) {
    depthUpload.addEventListener("change", e => {
      if (e.target.files[0]) DemoEngine.initDepth(e.target.files[0]);
    });
  }

  // Range slider live value display
  const rangeBindings = [
    ["detConfidence", "detConfVal", v => `${v}%`],
    ["detMaxResults", "detMaxVal", v => v],
    ["poseNumPoses", "poseNumVal", v => v],
    ["poseConfidence", "poseConfVal", v => `${v}%`],
  ];
  rangeBindings.forEach(([inputId, displayId, fmt]) => {
    const input = document.getElementById(inputId);
    const display = document.getElementById(displayId);
    if (input && display) {
      input.addEventListener("input", () => { display.textContent = fmt(input.value); });
    }
  });
}
