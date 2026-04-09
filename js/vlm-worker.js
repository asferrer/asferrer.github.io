/* ==============================
   SmolVLM Web Worker
   Runs model loading + inference off the main thread
   ============================== */

import {
  AutoProcessor,
  AutoModelForVision2Seq,
  TextStreamer,
  load_image,
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers";

const MODEL_ID = "HuggingFaceTB/SmolVLM-256M-Instruct";

let processor = null;
let model = null;
let aborted = false;
let deviceUsed = "webgpu";

// Global error handler - prevents silent worker crash
self.onerror = (e) => {
  self.postMessage({ type: "load:error", data: { message: e.message || "Worker error" } });
};
self.onunhandledrejection = (e) => {
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

    // q4/q4f16 use MatMulNBits which is WebGPU-only.
    // WASM uses per-module int8 (~260MB, standard ONNX ops).
    const dtype = deviceUsed === "webgpu"
      ? "fp32"
      : {
          embed_tokens: "fp32",
          vision_encoder: "int8",
          decoder_model_merged: "int8"
        };

    self.postMessage({ type: "load:device", data: { device: deviceUsed } });

    const progressCb = (p) => {
      if (p.progress != null) {
        self.postMessage({ type: "load:progress", data: { progress: Math.round(p.progress) } });
      }
    };

    processor = await AutoProcessor.from_pretrained(MODEL_ID, {
      progress_callback: progressCb
    });

    model = await AutoModelForVision2Seq.from_pretrained(MODEL_ID, {
      dtype,
      device: deviceUsed,
      progress_callback: progressCb
    });

    self.postMessage({ type: "load:ready", data: { device: deviceUsed } });
  } catch (e) {
    self.postMessage({ type: "load:error", data: { message: e.message || "Failed to load model" } });
  }
}

async function handleGenerate({ image, prompt, maxTokens, temperature }) {
  aborted = false;

  try {
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

    const text = processor.apply_chat_template(messages, { add_generation_prompt: true });
    const inputs = await processor(text, [img]);

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

    await model.generate({
      ...inputs,
      max_new_tokens: maxTokens || 200,
      do_sample: false,
      repetition_penalty: 1.2,
      streamer,
    });

    if (!aborted) {
      self.postMessage({ type: "generate:done", data: { fullText } });
    }
  } catch (e) {
    if (!aborted) {
      self.postMessage({ type: "generate:error", data: { message: e.message || "Generation failed" } });
    }
  }
}
