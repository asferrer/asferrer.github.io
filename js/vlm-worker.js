/* ==============================
   SmolVLM Web Worker
   Runs model loading + inference off the main thread
   ============================== */

import {
  AutoProcessor,
  AutoModelForVision2Seq,
  TextStreamer,
  load_image,
  env,
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";

const MODEL_ID = "HuggingFaceTB/SmolVLM-256M-Instruct";

let processor = null;
let model = null;
let aborted = false;
let deviceUsed = "webgpu";

function log(msg) {
  self.postMessage({ type: "log", data: msg });
}

// Global error handler - prevents silent worker crash
self.onerror = (e) => {
  log(`onerror: ${e.message || e}`);
  self.postMessage({ type: "load:error", data: { message: e.message || "Worker error" } });
};
self.onunhandledrejection = (e) => {
  log(`unhandledrejection: ${e.reason?.message || e.reason || "unknown"}`);
  self.postMessage({ type: "load:error", data: { message: e.reason?.message || "Unhandled error in worker" } });
};

self.onmessage = async ({ data: msg }) => {
  if (msg.type === "load") {
    await handleLoad();
  } else if (msg.type === "generate") {
    await handleGenerate(msg.data);
  } else if (msg.type === "abort") {
    aborted = true;
  }
};

async function detectDevice() {
  if (navigator.gpu) {
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (adapter) return "webgpu";
    } catch { /* fall through */ }
  }
  return "wasm";
}

async function handleLoad() {
  try {
    if (processor && model) {
      self.postMessage({ type: "load:ready", data: { device: deviceUsed } });
      return;
    }

    deviceUsed = await detectDevice();
    log(`Device detected: ${deviceUsed}`);

    // Force single-threaded WASM: prevents iOS JSC crash (Issue #1242),
    // avoids SharedArrayBuffer requirement (GitHub Pages has no COOP/COEP).
    if (deviceUsed === "wasm") {
      env.backends.onnx.wasm.numThreads = 1;
      log("WASM numThreads set to 1");
    }

    // WASM dtype: fp16 for vision_encoder (avoids ConvInteger issue of int8,
    // halves download from 374→187MB). int8 for decoder (proven stable).
    const dtype = deviceUsed === "webgpu"
      ? "fp32"
      : {
          embed_tokens: "fp16",
          vision_encoder: "fp16",
          decoder_model_merged: "int8"
        };

    log(`dtype: ${JSON.stringify(dtype)}`);
    self.postMessage({ type: "load:device", data: { device: deviceUsed } });

    const progressCb = (p) => {
      if (p.progress != null) {
        self.postMessage({ type: "load:progress", data: { progress: Math.round(p.progress) } });
      }
    };

    log("Loading processor...");
    processor = await AutoProcessor.from_pretrained(MODEL_ID, {
      progress_callback: progressCb
    });
    log("Processor loaded");

    log("Loading model...");
    model = await AutoModelForVision2Seq.from_pretrained(MODEL_ID, {
      dtype,
      device: deviceUsed,
      progress_callback: progressCb
    });
    log("Model loaded");

    self.postMessage({ type: "load:ready", data: { device: deviceUsed } });
  } catch (e) {
    log(`Load error: ${e.message}`);
    self.postMessage({ type: "load:error", data: { message: e.message || "Failed to load model" } });
  }
}

async function handleGenerate({ image, prompt, maxTokens, temperature }) {
  aborted = false;

  try {
    log("Loading image...");
    const img = await load_image(image);

    const messages = [
      {
        role: "user",
        content: [
          { type: "image", image },
          { type: "text", text: prompt }
        ]
      }
    ];

    log("Applying chat template...");
    const text = processor.apply_chat_template(messages, { add_generation_prompt: true });
    const inputs = await processor(text, [img]);
    log("Inputs ready, generating...");

    let fullText = "";
    const streamer = new TextStreamer(processor.tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: (token) => {
        if (aborted) return;
        fullText += token;
        self.postMessage({ type: "generate:token", data: { token } });
      }
    });

    const genOpts = {
      ...inputs,
      max_new_tokens: maxTokens || 200,
      repetition_penalty: 1.2,
      streamer,
    };
    if (temperature && temperature > 0) {
      genOpts.do_sample = true;
      genOpts.temperature = temperature;
    } else {
      genOpts.do_sample = false;
    }

    await model.generate(genOpts);

    if (!aborted) {
      log(`Generation done: ${fullText.length} chars`);
      self.postMessage({ type: "generate:done", data: { fullText } });
    }
  } catch (e) {
    log(`Generate error: ${e.message}`);
    if (!aborted) {
      self.postMessage({ type: "generate:error", data: { message: e.message || "Generation failed" } });
    }
  }
}
