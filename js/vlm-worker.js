/* ==============================
   SmolVLM Web Worker
   Runs model loading + inference off the main thread
   ============================== */

import {
  AutoProcessor,
  AutoModelForVision2Seq,
  TextStreamer,
  RawImage,
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers";

const MODEL_ID = "HuggingFaceTB/SmolVLM-256M-Instruct";

let processor = null;
let model = null;
let aborted = false;

self.onmessage = async ({ data: msg }) => {
  if (msg.type === "load") {
    await handleLoad();
  } else if (msg.type === "generate") {
    await handleGenerate(msg.data);
  } else if (msg.type === "abort") {
    aborted = true;
  }
};

async function handleLoad() {
  try {
    if (!navigator.gpu) {
      self.postMessage({ type: "load:error", data: { message: "WebGPU not available" } });
      return;
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      self.postMessage({ type: "load:error", data: { message: "No compatible GPU found" } });
      return;
    }

    if (processor && model) {
      self.postMessage({ type: "load:ready" });
      return;
    }

    processor = await AutoProcessor.from_pretrained(MODEL_ID, {
      progress_callback: (p) => {
        if (p.progress != null) {
          self.postMessage({ type: "load:progress", data: { progress: Math.round(p.progress) } });
        }
      }
    });

    model = await AutoModelForVision2Seq.from_pretrained(MODEL_ID, {
      dtype: "q4f16",
      device: "webgpu",
      progress_callback: (p) => {
        if (p.progress != null) {
          self.postMessage({ type: "load:progress", data: { progress: Math.round(p.progress) } });
        }
      }
    });

    self.postMessage({ type: "load:ready" });
  } catch (e) {
    self.postMessage({ type: "load:error", data: { message: e.message || "Failed to load model" } });
  }
}

async function handleGenerate({ image, prompt, maxTokens, temperature }) {
  aborted = false;

  try {
    const rawImage = await RawImage.fromURL(image);

    const messages = [
      {
        role: "user",
        content: [
          { type: "image" },
          { type: "text", text: prompt }
        ]
      }
    ];

    const text = processor.apply_chat_template(messages, { add_generation_prompt: true });
    const inputs = await processor(rawImage, { text });

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
      temperature: temperature || 0.3,
      do_sample: temperature > 0,
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
