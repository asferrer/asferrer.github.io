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

/* Per-class bounding box colors */
const CLASS_COLORS = {
  person: "#f63366",
  vehicle: "#007bff",
  animal: "#4ade80",
  furniture: "#fb923c",
  food: "#facc15"
};
function getClassColor(className) {
  for (const [group, classes] of Object.entries(CLASS_GROUPS)) {
    if (classes.includes(className)) return CLASS_COLORS[group] || "#a855f7";
  }
  return "#a855f7";
}

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
  _vlmWorker: null,
  _vlmReady: false,
  _vlmImageBase64: null,
  _vlmWebcamActive: false,
  _vlmPendingText: "",
  _vlmTypewriterId: null,

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
  _facingMode: "user",
  _isFlipping: false,

  async startWebcam(video) {
    if (this.stream) this.stopWebcam(video);
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: this._facingMode, width: { ideal: 640 }, height: { ideal: 480 } }
    });
    video.srcObject = this.stream;
    return new Promise(r => { video.onloadedmetadata = () => { video.play(); r(); }; });
  },

  async flipCamera() {
    if (this._isFlipping) return;
    const activeVideo = document.querySelector(".demo-content:not(.hidden) video");
    if (!activeVideo || !this.stream) return;
    this._isFlipping = true;

    try {
      const newFacing = this._facingMode === "user" ? "environment" : "user";

      // Step 1: Stop old tracks to release camera hardware FIRST
      // Mobile browsers cannot open two cameras simultaneously (WebKit #238492)
      this.stream.getTracks().forEach(t => t.stop());

      // Step 2: Request new stream (camera hardware now free)
      let newStream;
      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: newFacing }, width: { ideal: 640 }, height: { ideal: 480 } }
        });
      } catch {
        try {
          // Fallback: facingMode as preference (not exact)
          newStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: newFacing, width: { ideal: 640 }, height: { ideal: 480 } }
          });
        } catch {
          // Last resort: deviceId cycling
          const devices = (await navigator.mediaDevices.enumerateDevices())
            .filter(d => d.kind === "videoinput" && d.deviceId);
          if (devices.length < 2) throw new Error("No alternate camera");
          newStream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: devices[0].deviceId }, width: { ideal: 640 }, height: { ideal: 480 } }
          });
        }
      }

      // Step 3: Apply new stream
      const facing = newStream.getVideoTracks()[0]?.getSettings()?.facingMode;
      this._facingMode = facing || newFacing;
      this._updateCameraIcons();

      this.stream = newStream;
      activeVideo.srcObject = newStream;

      await new Promise(r => {
        if (activeVideo.readyState >= 1) { activeVideo.play(); r(); return; }
        activeVideo.onloadedmetadata = () => { activeVideo.play(); r(); };
      });

      const canvas = activeVideo.parentElement?.querySelector("canvas");
      if (canvas) { canvas.width = activeVideo.videoWidth; canvas.height = activeVideo.videoHeight; }
    } catch {
      // Recovery: restart with any available camera
      try {
        const recovery = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } }
        });
        this.stream = recovery;
        activeVideo.srcObject = recovery;
        await activeVideo.play();
        const facing = recovery.getVideoTracks()[0]?.getSettings()?.facingMode;
        this._facingMode = facing || this._facingMode;
      } catch { /* total failure — user must restart demo */ }
      this._updateCameraIcons();
    } finally {
      this._isFlipping = false;
    }
  },

  _updateCameraIcons() {
    const icon = this._facingMode === "environment" ? "fa-camera" : "fa-camera-rotate";
    document.querySelectorAll(".camera-flip-btn i").forEach(i => {
      i.className = "fas " + icon;
    });
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
    const pills = document.querySelectorAll("#detClassFilter .det-pill.active");
    let allowedClasses = null;
    const groups = Array.from(pills).map(p => p.dataset.group);
    if (!groups.includes("all")) {
      allowedClasses = new Set();
      groups.forEach(g => (CLASS_GROUPS[g] || []).forEach(c => allowedClasses.add(c)));
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

      this.setStatus(status, translations[currentLang]["demos.loading_model"] || "Loading model...", "loading");
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
        if (!video.videoWidth) { this.animId = requestAnimationFrame(detect); return; }
        const { conf, maxResults, allowedClasses } = this.getDetectionOpts();
        let preds = await this.models.detection.detect(video, maxResults);
        preds = preds.filter(p => p.score >= conf);
        if (allowedClasses) preds = preds.filter(p => allowedClasses.has(p.class));

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0);

        preds.forEach(p => {
          const [x, y, w, h] = p.bbox;
          const color = getClassColor(p.class);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, w, h);
          ctx.fillStyle = color;
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
          const color = getClassColor(p.class);
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, w, h);
          ctx.fillStyle = color;
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
        if (!video.videoWidth) { this.animId = requestAnimationFrame(detect); return; }
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
    const sideBySide = document.getElementById("depthSideBySide")?.checked !== false;
    return { sideBySide };
  },

  async initDepth(file) {
    const status = "depthStatus";
    const canvas = document.getElementById("depthCanvas");
    const ctx = canvas.getContext("2d");

    this.hidePlaceholder("demo-depth");

    try {
      this.setStatus(status, translations[currentLang]["demos.loading_depth"] || "Loading model (~27MB, first time only)...", "loading");

      const { pipeline, env } = await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1");
      env.allowLocalModels = false;

      if (!this.models.depth) {
        this.models.depth = await pipeline("depth-estimation", "Xenova/depth-anything-small-hf");
      }

      this.setStatus(status, translations[currentLang]["demos.processing"] || "Processing depth map...", "loading");
      const img = new Image();
      img.onload = async () => {
        const { sideBySide } = this.getDepthOpts();
        const lut = buildColormap("inferno");

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

  async initDepthWebcam() {
    const status = "depthStatus";
    const canvas = document.getElementById("depthCanvas");
    const ctx = canvas.getContext("2d");
    const video = document.getElementById("depthVideo");
    const fpsEl = document.getElementById("depthFps");

    this.hidePlaceholder("demo-depth");

    try {
      this.setStatus(status, translations[currentLang]["demos.loading_depth"] || "Loading model (~27MB)...", "loading");
      const { pipeline, env } = await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1");
      env.allowLocalModels = false;
      if (!this.models.depth) {
        this.models.depth = await pipeline("depth-estimation", "Xenova/depth-anything-small-hf");
      }

      this.setStatus(status, translations[currentLang]["demos.starting_cam"] || "Starting camera...", "loading");
      await this.startWebcam(video);

      this.setStatus(status, translations[currentLang]["demos.running"] || "Running depth estimation on webcam", "success");
      const fps = this.createFpsCounter();
      const lut = buildColormap("inferno");
      let processing = false;

      const processFrame = async () => {
        if (!this.stream) return;
        if (!processing) {
          processing = true;
          try {
            const off = document.createElement("canvas");
            off.width = video.videoWidth;
            off.height = video.videoHeight;
            off.getContext("2d").drawImage(video, 0, 0);
            const blob = await new Promise(r => off.toBlob(r, "image/jpeg", 0.7));
            const url = URL.createObjectURL(blob);

            const result = await this.models.depth(url);
            URL.revokeObjectURL(url);
            const depthMap = result.depth;

            const { sideBySide } = this.getDepthOpts();
            const vw = video.videoWidth, vh = video.videoHeight;
            canvas.width = sideBySide ? vw * 2 : vw;
            canvas.height = vh;
            if (sideBySide) ctx.drawImage(video, 0, 0, vw, vh);

            const dc = document.createElement("canvas");
            dc.width = depthMap.width;
            dc.height = depthMap.height;
            const dctx = dc.getContext("2d");
            const imgData = dctx.createImageData(depthMap.width, depthMap.height);
            for (let i = 0; i < depthMap.data.length; i++) {
              const v = Math.min(255, Math.max(0, Math.round(depthMap.data[i])));
              imgData.data[i * 4]     = lut[v * 3];
              imgData.data[i * 4 + 1] = lut[v * 3 + 1];
              imgData.data[i * 4 + 2] = lut[v * 3 + 2];
              imgData.data[i * 4 + 3] = 255;
            }
            dctx.putImageData(imgData, 0, 0);
            ctx.drawImage(dc, sideBySide ? vw : 0, 0, vw, vh);

            fps.tick();
            const f = fps.get();
            if (f !== null && fpsEl) fpsEl.textContent = `${f} FPS`;
          } catch { /* skip frame on error */ }
          processing = false;
        }
        this.animId = requestAnimationFrame(processFrame);
      };
      processFrame();
    } catch (e) {
      this.setStatus(status, e.message || "Error", "error");
      this.resetButton("startDepth");
    }
  },

  /* ====================================
     DEMO 4: Vision Language Model (SmolVLM)
     ==================================== */
  getVlmOpts() {
    const maxTokens = parseInt(document.getElementById("vlmMaxTokens")?.value || "200", 10);
    const tempRaw = parseInt(document.getElementById("vlmTemperature")?.value || "3", 10);
    return { maxTokens, temperature: tempRaw / 10 };
  },

  unloadOtherModels(except) {
    for (const key of Object.keys(this.models)) {
      if (key !== except && this.models[key]) {
        if (this.models[key].close) this.models[key].close();
        this.models[key] = null;
      }
    }
    if (except !== "pose") this._visionModule = null;
  },

  _vlmLog(msg) {
    const el = document.getElementById("vlmDebugLog");
    if (el) {
      const ts = new Date().toLocaleTimeString();
      el.textContent += `[${ts}] ${msg}\n`;
      el.scrollTop = el.scrollHeight;
    }
  },

  async initVlm() {
    const status = "vlmStatus";
    const progress = document.getElementById("vlmProgress");
    const progressFill = document.getElementById("vlmProgressFill");
    const progressText = document.getElementById("vlmProgressText");

    if (this._vlmReady) {
      const readyKey = this._vlmDevice === "wasm" ? "demos.vlm_ready_wasm" : "demos.vlm_ready";
      this.setStatus(status, translations[currentLang][readyKey] || "Model ready", "success");
      return;
    }

    this.unloadOtherModels("vlm");

    this.setStatus(status, translations[currentLang]["demos.vlm_loading"] || "Downloading model...", "loading");
    if (progress) progress.style.display = "";

    if (this._vlmWorker) { this._vlmWorker.terminate(); this._vlmWorker = null; }
    try {
      this._vlmWorker = new Worker("js/vlm-worker.js", { type: "module" });
    } catch (e) {
      this.setStatus(status, e.message || "Failed to start VLM worker", "error");
      if (progress) progress.style.display = "none";
      return;
    }

    this._vlmWorker.onerror = (e) => {
      this._vlmLog(`WORKER ERROR: ${e.message || e}`);
      if (progress) progress.style.display = "none";
      this.setStatus(status, e.message || "VLM worker error", "error");
    };

    this._vlmLog("Worker created, sending load...");
    this._vlmWorker.onmessage = ({ data: msg }) => {
      if (msg.type === "log") {
        this._vlmLog(`[W] ${msg.data}`);
        return;
      }
      if (msg.type === "load:device") {
        this._vlmDevice = msg.data.device;
        this._vlmLog(`Device: ${msg.data.device}`);
        const key = msg.data.device === "wasm" ? "demos.vlm_loading_wasm" : "demos.vlm_loading";
        this.setStatus(status, translations[currentLang][key] || "Downloading model...", "loading");
      } else if (msg.type === "load:progress") {
        const p = msg.data.progress;
        if (progressFill) progressFill.style.width = `${p}%`;
        if (progressText) progressText.textContent = `${p}%`;
      } else if (msg.type === "load:ready") {
        this._vlmReady = true;
        this._vlmDevice = msg.data?.device || this._vlmDevice || "webgpu";
        this._vlmLog(`Model ready (device=${this._vlmDevice})`);
        if (progress) progress.style.display = "none";
        const readyKey = this._vlmDevice === "wasm" ? "demos.vlm_ready_wasm" : "demos.vlm_ready";
        this.setStatus(status, translations[currentLang][readyKey] || "Model ready", "success");
        const btn = document.getElementById("vlmGenerate");
        if (btn && this._vlmImageBase64) btn.disabled = false;
      } else if (msg.type === "load:error") {
        this._vlmLog(`LOAD ERROR: ${msg.data.message}`);
        if (progress) progress.style.display = "none";
        this.setStatus(status, msg.data.message, "error");
      } else if (msg.type === "generate:token") {
        this._vlmPendingText += msg.data.token;
        this._vlmTokenCount = (this._vlmTokenCount || 0) + 1;
        if (this._vlmTokenCount <= 3) this._vlmLog(`Token ${this._vlmTokenCount}: "${msg.data.token}"`);
        if (!this._vlmWebcamActive) {
          const output = document.getElementById("vlmOutput");
          if (output) {
            const cursor = output.querySelector(".cursor");
            const node = document.createTextNode(msg.data.token);
            cursor ? output.insertBefore(node, cursor) : output.appendChild(node);
          }
        }
        // Show token progress on WASM so mobile users know it's working
        if (this._vlmDevice === "wasm") {
          this.setStatus(status, `Generating... (${this._vlmTokenCount} tokens)`, "loading");
        }
      } else if (msg.type === "generate:done") {
        this._vlmLog(`Done: ${this._vlmTokenCount} tokens, text="${this._vlmPendingText.slice(0, 80)}"`);
        const output = document.getElementById("vlmOutput");
        if (this._vlmWebcamActive) {
          // Typewriter reveal in webcam mode
          const captionText = this._vlmPendingText.trim();
          this._vlmPendingText = "";
          if (output && captionText) {
            this._typewriterReveal(output, captionText, () => {
              setTimeout(() => this._captionLoop(), 800);
            });
          } else {
            setTimeout(() => this._captionLoop(), 300);
          }
        } else {
          if (output) {
            const cursor = output.querySelector(".cursor");
            if (cursor) cursor.remove();
          }
          this.setStatus(status, translations[currentLang]["demos.vlm_done"] || "Generation complete", "success");
          const btn = document.getElementById("vlmGenerate");
          if (btn) {
            btn.disabled = false;
            const span = btn.querySelector("[data-i18n]");
            if (span) span.textContent = translations[currentLang]["demos.vlm_generate"] || "Generate";
          }
        }
      } else if (msg.type === "generate:error") {
        this._vlmLog(`GEN ERROR: ${msg.data.message}`);
        if (this._vlmWebcamActive) {
          // Retry caption loop on generation error
          this._vlmPendingText = "";
          setTimeout(() => this._captionLoop(), 1000);
        } else {
          this.setStatus(status, msg.data.message, "error");
        }
        const btn = document.getElementById("vlmGenerate");
        if (btn) {
          btn.disabled = false;
          const span = btn.querySelector("[data-i18n]");
          if (span) span.textContent = translations[currentLang]["demos.vlm_generate"] || "Generate";
        }
      }
    };

    this._vlmWorker.postMessage({ type: "load" });
  },

  generateVlm() {
    const status = "vlmStatus";
    let prompt = document.getElementById("vlmPrompt")?.value?.trim();
    // In webcam mode use a default prompt if empty
    if (!prompt && this._vlmWebcamActive) {
      prompt = "Describe what you see in this image in one short sentence.";
    }
    if (!this._vlmImageBase64 || !prompt) {
      this._vlmLog(`generateVlm skip: img=${!!this._vlmImageBase64} prompt=${!!prompt}`);
      // Keep caption loop alive in webcam mode
      if (this._vlmWebcamActive) setTimeout(() => this._captionLoop(), 1000);
      return;
    }
    if (!this._vlmWorker) {
      this._vlmLog("generateVlm: worker is null!");
      return;
    }

    const output = document.getElementById("vlmOutput");
    if (this._vlmWebcamActive) {
      // Webcam mode: keep existing text, accumulate new silently
      if (output) output.style.display = "";
      this._vlmPendingText = "";
    } else {
      // Manual mode: clear and stream tokens
      if (output) {
        output.style.display = "";
        output.textContent = "";
        const c = document.createElement("span");
        c.className = "cursor";
        output.appendChild(c);
      }
      const btn = document.getElementById("vlmGenerate");
      if (btn) {
        btn.disabled = true;
        const span = btn.querySelector("[data-i18n]");
        if (span) span.textContent = translations[currentLang]["demos.vlm_stop_gen"] || "Stop";
      }
    }

    this._vlmTokenCount = 0;
    this.setStatus(status, translations[currentLang]["demos.vlm_generating"] || "Generating...", "loading");
    // Elapsed timer for WASM — shows user the model is working (first token can take 1-2 min on mobile)
    if (this._vlmDevice === "wasm") {
      const startTime = Date.now();
      if (this._vlmElapsedTimer) clearInterval(this._vlmElapsedTimer);
      this._vlmElapsedTimer = setInterval(() => {
        if (this._vlmTokenCount > 0 || !this._vlmWorker) {
          clearInterval(this._vlmElapsedTimer);
          this._vlmElapsedTimer = null;
          return;
        }
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        this.setStatus(status, `Processing image... (${elapsed}s)`, "loading");
      }, 1000);
    }

    // Append language hint based on current page language
    let finalPrompt = prompt;
    if (typeof currentLang !== "undefined" && currentLang === "es") {
      finalPrompt += " Responde en espanol.";
    }

    const { maxTokens, temperature } = this.getVlmOpts();
    // Cap tokens more aggressively on WASM/mobile for usable response times
    const isWasm = this._vlmDevice === "wasm";
    const effectiveMaxTokens = this._vlmWebcamActive
      ? Math.min(maxTokens, isWasm ? 30 : 60)
      : (isWasm ? Math.min(maxTokens, 100) : maxTokens);
    this._vlmLog(`Generate: device=${this._vlmDevice} maxTok=${effectiveMaxTokens} temp=${temperature} webcam=${this._vlmWebcamActive}`);
    this._vlmWorker.postMessage({
      type: "generate",
      data: {
        image: this._vlmImageBase64,
        prompt: finalPrompt,
        maxTokens: effectiveMaxTokens,
        temperature
      }
    });
  },

  stopVlm() {
    // Only abort current generation — keep worker alive for manual reuse
    if (this._vlmWorker) {
      this._vlmWorker.postMessage({ type: "abort" });
    }
    if (this._vlmTypewriterId) {
      clearTimeout(this._vlmTypewriterId);
      this._vlmTypewriterId = null;
    }
    const output = document.getElementById("vlmOutput");
    if (output) {
      const cursor = output.querySelector(".cursor");
      if (cursor) cursor.remove();
    }
    this._vlmPendingText = "";
  },

  setVlmImage(base64) {
    this._vlmImageBase64 = base64;
    const preview = document.getElementById("vlmPreview");
    if (preview) {
      preview.src = base64;
      preview.style.display = "";
    }
    this.hidePlaceholder("demo-vlm");
    const btn = document.getElementById("vlmGenerate");
    if (btn && this._vlmReady) btn.disabled = false;
  },

  async startVlmWebcam() {
    const video = document.getElementById("vlmVideo");
    const preview = document.getElementById("vlmPreview");
    if (preview) preview.style.display = "none";

    this.hidePlaceholder("demo-vlm");
    video.style.display = "";

    await this.startWebcam(video);
    await this.initVlm();

    this._vlmWebcamActive = true;
    this._captionLoop();
  },

  _captionLoop() {
    if (!this._vlmWebcamActive || !this.stream) return;
    const video = document.getElementById("vlmVideo");
    if (!video || !video.videoWidth) {
      if (this._vlmWebcamActive && this.stream) setTimeout(() => this._captionLoop(), 500);
      return;
    }

    const c = document.createElement("canvas");
    // Reduce resolution on WASM to save memory and speed up inference
    const scale = this._vlmDevice === "wasm" ? 0.5 : 1;
    c.width = Math.round(video.videoWidth * scale);
    c.height = Math.round(video.videoHeight * scale);
    c.getContext("2d").drawImage(video, 0, 0, c.width, c.height);
    this._vlmImageBase64 = c.toDataURL("image/jpeg", this._vlmDevice === "wasm" ? 0.5 : 0.7);

    if (this._vlmReady) {
      this._vlmCaptionPending = true;
      this.generateVlm();
    } else {
      setTimeout(() => this._captionLoop(), 1000);
    }
  },

  stopVlmWebcam() {
    this._vlmWebcamActive = false;
    this._vlmCaptionPending = false;
    if (this._vlmTypewriterId) {
      clearTimeout(this._vlmTypewriterId);
      this._vlmTypewriterId = null;
    }
    const video = document.getElementById("vlmVideo");
    this.stopWebcam(video);
    if (video) video.style.display = "none";
    // Terminate worker to free model memory (~600MB)
    if (this._vlmWorker) {
      this._vlmWorker.terminate();
      this._vlmWorker = null;
      this._vlmReady = false;
    }
    this._vlmPendingText = "";
    this._vlmImageBase64 = null;
  },

  _typewriterReveal(el, text, onDone) {
    if (this._vlmTypewriterId) clearTimeout(this._vlmTypewriterId);
    el.textContent = "";
    let i = 0;
    const step = () => {
      if (i < text.length) {
        el.textContent = text.slice(0, ++i);
        this._vlmTypewriterId = setTimeout(step, 18);
      } else {
        this._vlmTypewriterId = null;
        if (onDone) onDone();
      }
    };
    step();
  },

  /* ---------- Cleanup ---------- */
  stopAll() {
    const detVideo = document.getElementById("detectionVideo");
    const poseVideo = document.getElementById("poseVideo");
    const depthVideo = document.getElementById("depthVideo");
    const vlmVideo = document.getElementById("vlmVideo");
    this.stopWebcam(detVideo);
    this.stopWebcam(poseVideo);
    this.stopWebcam(depthVideo);
    this._vlmWebcamActive = false;
    this.stopWebcam(vlmVideo);
    if (vlmVideo) vlmVideo.style.display = "none";
    if (this._vlmWorker) {
      this._vlmWorker.terminate();
      this._vlmWorker = null;
      this._vlmReady = false;
    }
    document.querySelectorAll(".demo-fps").forEach(el => el.textContent = "");
    document.querySelectorAll(".demo-status").forEach(el => { el.textContent = ""; el.className = "demo-status"; });
    document.querySelectorAll(".demo-start-btn").forEach(btn => {
      btn.disabled = false;
      btn.classList.remove("running");
      const span = btn.querySelector("[data-i18n]");
      if (span) span.textContent = translations[currentLang]["demos.start"] || "Start Webcam";
    });
    document.querySelectorAll(".demo-placeholder").forEach(ph => ph.style.display = "");
    // Reset VLM state
    const vlmOutput = document.getElementById("vlmOutput");
    if (vlmOutput) { vlmOutput.textContent = ""; vlmOutput.style.display = "none"; }
    const vlmPreview = document.getElementById("vlmPreview");
    if (vlmPreview) { vlmPreview.src = ""; vlmPreview.style.display = "none"; }
    const vlmProgress = document.getElementById("vlmProgress");
    if (vlmProgress) vlmProgress.style.display = "none";
    this._vlmImageBase64 = null;
    const vlmBtn = document.getElementById("vlmGenerate");
    if (vlmBtn) vlmBtn.disabled = true;
    // Reset VLM webcam button
    const vlmWcBtn = document.getElementById("vlmWebcamBtn");
    if (vlmWcBtn) {
      vlmWcBtn.classList.remove("running");
      const span = vlmWcBtn.querySelector("[data-i18n]");
      if (span) span.textContent = translations[currentLang]["demos.vlm_start_webcam"] || "Start Live Caption";
    }
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

  // Detection — pill toggle logic
  document.querySelectorAll("#detClassFilter .det-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      if (pill.dataset.group === "all") {
        document.querySelectorAll("#detClassFilter .det-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
      } else {
        document.querySelector('#detClassFilter .det-pill[data-group="all"]')?.classList.remove("active");
        pill.classList.toggle("active");
        if (!document.querySelector("#detClassFilter .det-pill.active")) {
          document.querySelector('#detClassFilter .det-pill[data-group="all"]')?.classList.add("active");
        }
      }
    });
  });

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

  // Depth Estimation — webcam
  const depthBtn = document.getElementById("startDepth");
  if (depthBtn) {
    depthBtn.addEventListener("click", function () {
      if (this.classList.contains("running")) {
        DemoEngine.stopWebcam(document.getElementById("depthVideo"));
        this.classList.remove("running");
        this.querySelector("[data-i18n]").textContent = translations[currentLang]["demos.start"] || "Start Webcam";
        DemoEngine.setStatus("depthStatus", "", "");
        document.getElementById("depthFps").textContent = "";
      } else {
        this.classList.add("running");
        this.querySelector("[data-i18n]").textContent = translations[currentLang]["demos.stop"] || "Stop";
        DemoEngine.initDepthWebcam();
      }
    });
  }

  // Depth Estimation — image upload
  const depthUpload = document.getElementById("depthUpload");
  if (depthUpload) {
    depthUpload.addEventListener("change", e => {
      if (e.target.files[0]) {
        DemoEngine.stopWebcam(document.getElementById("depthVideo"));
        const btn = document.getElementById("startDepth");
        if (btn) { btn.classList.remove("running"); btn.querySelector("[data-i18n]").textContent = translations[currentLang]["demos.start"] || "Start Webcam"; }
        DemoEngine.initDepth(e.target.files[0]);
      }
    });
  }

  // VLM — image upload
  const vlmUpload = document.getElementById("vlmUpload");
  if (vlmUpload) {
    vlmUpload.addEventListener("change", e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        DemoEngine.setVlmImage(reader.result);
        DemoEngine.initVlm();
      };
      reader.readAsDataURL(file);
    });
  }

  // VLM — webcam live caption toggle
  const vlmWebcamBtn = document.getElementById("vlmWebcamBtn");
  if (vlmWebcamBtn) {
    vlmWebcamBtn.addEventListener("click", async function () {
      if (DemoEngine._vlmWebcamActive) {
        DemoEngine.stopVlmWebcam();
        this.querySelector("[data-i18n]").textContent = translations[currentLang]["demos.vlm_start_webcam"] || "Start Live Caption";
        this.classList.remove("running");
      } else {
        this.classList.add("running");
        this.querySelector("[data-i18n]").textContent = translations[currentLang]["demos.vlm_stop_webcam"] || "Stop Live Caption";
        try {
          await DemoEngine.startVlmWebcam();
        } catch (err) {
          DemoEngine.setStatus("vlmStatus", err.message || "Camera error", "error");
          this.classList.remove("running");
          this.querySelector("[data-i18n]").textContent = translations[currentLang]["demos.vlm_start_webcam"] || "Start Live Caption";
        }
      }
    });
  }

  // VLM — prompt preset
  const vlmPreset = document.getElementById("vlmPreset");
  const vlmPrompt = document.getElementById("vlmPrompt");
  if (vlmPreset && vlmPrompt) {
    const presetKeys = {
      describe: "demos.vlm_preset_describe",
      objects: "demos.vlm_preset_objects",
      scene: "demos.vlm_preset_scene"
    };
    vlmPreset.addEventListener("change", () => {
      const key = presetKeys[vlmPreset.value];
      if (key) {
        vlmPrompt.value = translations[currentLang][key] || vlmPreset.options[vlmPreset.selectedIndex].textContent;
      } else {
        vlmPrompt.value = "";
        vlmPrompt.focus();
      }
    });
    // Set initial prompt
    vlmPrompt.value = translations[currentLang]["demos.vlm_preset_describe"] || "Briefly describe what you see in 1 sentence";
  }

  // VLM — generate button
  const vlmGen = document.getElementById("vlmGenerate");
  if (vlmGen) {
    vlmGen.addEventListener("click", () => {
      if (vlmGen.querySelector("[data-i18n]")?.textContent === (translations[currentLang]["demos.vlm_stop_gen"] || "Stop")) {
        DemoEngine.stopVlm();
        vlmGen.querySelector("[data-i18n]").textContent = translations[currentLang]["demos.vlm_generate"] || "Generate";
        DemoEngine.setStatus("vlmStatus", "", "");
      } else {
        DemoEngine.generateVlm();
      }
    });
  }

  // Camera flip buttons
  document.querySelectorAll(".camera-flip-btn").forEach(btn => {
    btn.addEventListener("click", () => DemoEngine.flipCamera());
  });

  // Range slider live value display
  const rangeBindings = [
    ["detConfidence", "detConfVal", v => `${v}%`],
    ["detMaxResults", "detMaxVal", v => v],
    ["poseNumPoses", "poseNumVal", v => v],
    ["poseConfidence", "poseConfVal", v => `${v}%`],
    ["vlmMaxTokens", "vlmMaxVal", v => v],
    ["vlmTemperature", "vlmTempVal", v => `${(v / 10).toFixed(1)}`],
  ];
  rangeBindings.forEach(([inputId, displayId, fmt]) => {
    const input = document.getElementById(inputId);
    const display = document.getElementById(displayId);
    if (input && display) {
      input.addEventListener("input", () => { display.textContent = fmt(input.value); });
    }
  });
}
