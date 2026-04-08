/* ==============================
   LIVE DEMOS — Client-side CV
   Libraries loaded on-demand only
   ============================== */

const DemoEngine = {
  activeDemo: null,
  stream: null,
  animId: null,
  models: { detection: null, pose: null, depth: null },

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

  showPlaceholder(panelId) {
    const ph = document.querySelector(`#${panelId} .demo-placeholder`);
    if (ph) ph.style.display = "";
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
        const preds = await this.models.detection.detect(video);
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
      const preds = await this.models.detection.detect(img);
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
  },

  /* ====================================
     DEMO 2: Pose Estimation (MediaPipe)
     ==================================== */
  async initPose() {
    const status = "poseStatus";
    const video = document.getElementById("poseVideo");
    const canvas = document.getElementById("poseCanvas");
    const ctx = canvas.getContext("2d");
    const fpsEl = document.getElementById("poseFps");

    this.hidePlaceholder("demo-pose");

    try {
      this.setStatus(status, translations[currentLang]["demos.loading_lib"] || "Loading MediaPipe (~16MB)...", "loading");
      const vision = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.mjs");

      this.setStatus(status, translations[currentLang]["demos.loading_model"] || "Loading Pose Landmarker model...", "loading");

      const fileset = await vision.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      if (!this.models.pose) {
        this.models.pose = await vision.PoseLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 2
        });
      }

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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0);

        if (results.landmarks) {
          results.landmarks.forEach(landmarks => {
            // Draw connections
            ctx.strokeStyle = "#007bff";
            ctx.lineWidth = 2;
            connections.forEach(([i, j]) => {
              const a = landmarks[i], b = landmarks[j];
              if (a.visibility > 0.5 && b.visibility > 0.5) {
                ctx.beginPath();
                ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
                ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
                ctx.stroke();
              }
            });
            // Draw keypoints
            landmarks.forEach(lm => {
              if (lm.visibility > 0.5) {
                ctx.beginPath();
                ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 4, 0, Math.PI * 2);
                ctx.fillStyle = "#f63366";
                ctx.fill();
              }
            });
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
        canvas.width = img.width;
        canvas.height = img.height;

        const result = await this.models.depth(img.src);
        const depthMap = result.depth;

        // Draw original on left, depth on right (side by side)
        const outW = img.width * 2;
        canvas.width = outW;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Draw depth map
        const depthCanvas = document.createElement("canvas");
        depthCanvas.width = depthMap.width;
        depthCanvas.height = depthMap.height;
        const depthCtx = depthCanvas.getContext("2d");
        const imageData = depthCtx.createImageData(depthMap.width, depthMap.height);

        for (let i = 0; i < depthMap.data.length; i++) {
          const v = depthMap.data[i];
          imageData.data[i * 4] = v;
          imageData.data[i * 4 + 1] = v;
          imageData.data[i * 4 + 2] = v;
          imageData.data[i * 4 + 3] = 255;
        }
        depthCtx.putImageData(imageData, 0, 0);
        ctx.drawImage(depthCanvas, img.width, 0, img.width, img.height);

        // Labels
        ctx.fillStyle = "#f63366";
        ctx.font = "bold 16px Inter, sans-serif";
        ctx.fillText("Original", 10, 24);
        ctx.fillText("Depth Map", img.width + 10, 24);

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
    // Restore placeholders
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
}
