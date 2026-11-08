---
layout: page
title: models
permalink: /models/
---

Models that fit on a phone with ~8GiB RAM — what they are, what each one is good for, what to pay, and how to compare them. This page exists because I keep hitting this wall: every model is a number with a marketing deck, and none of the numbers agree. So this is the honest version, maintained by hand and updated periodically rather than streamed live.

Data checked **2026-11-08**. Where a number is vendor-reported it's marked `†`; where I couldn't verify it says `UNVERIFIED` rather than being filled with a plausible-looking lie. Benchmarks don't transfer across vendors, so treat the "Measured" column as *one* signal, never the signal.

## the short version

- A model is a file of **weights** + a bit of plumbing. No internet, no account, no subscription needed to run one.
- Rule of thumb: **RAM ≈ parameters × bytes-per-parameter**. At int4 (4-bit) quantisation that's **~0.55 GB per billion parameters**, plus runtime overhead and plus **KV-cache growth with context** (cheap at short context; several GB extra at full ctx).
- 8 GiB usable ⇒ a realistic int4 weight budget of **4–5 GB** ⇒ comfortably **≤4B parameter dense models** (or ~8B models with very tight KV at short context; not "load it at 256K ctx" territory).
- Everything listed here fits that envelope with int4 quantisation — the largest are Gemma-4-E4B-class (~2.5 GB effective weights). Everything runs fully offline.

## the types of model you're choosing between

- **General LLM** — text in → text out. The "assistant" or the brains of the app: summarising, organising, answering, calling tools.
- **VLM (vision / multimodal)** — pixels or frames in → text out. OCR, document parsing, photo tagging, captioning, frame-sampled video understanding. A few add audio input or even speech output (see LFM3-Omni).
- **STT (speech-to-text)** — audio in → tokens out. Transcription, dictation, live captions, voice commands.
- **Speaker / diarization** — audio in → *who spoke when*. Not a vocabulary; these are segmentation + embedding + clustering models. Genuine low-latency "who is talking right now" open-weight is very new — see the table.
- **Reasoning models** — not a separate species, an LLM post-trained to emit a long private chain-of-thought before the answer. Usually slower per answer, much better at maths/code/multi-step planning. Nearly always also toggleable (marked `opt`).

A few things the table does *not* tell you, because nobody can: how a model feels in your actual conversation flow (that's a week with a good and a bad prompt), or how its chat template handles your system prompt (read the card).

## the table

Search, filter by type, click a header to sort. `†` = vendor-reported; `UNVERIFIED` = could not be confirmed from source.

<div class="models-controls">
  <input id="models-search" type="search" placeholder="search models…" aria-label="Search models">
  <div class="models-chips" role="group" aria-label="Filter by type">
    <button class="models-filter active" data-filter="all">all</button>
    <button class="models-filter" data-filter="llm">general LLMs</button>
    <button class="models-filter" data-filter="vlm">vision / multimodal</button>
    <button class="models-filter" data-filter="stt">STT</button>
    <button class="models-filter" data-filter="speaker">speaker ID</button>
  </div>
  <span id="models-count" class="models-count"></span>
</div>

<div class="models-table-wrap">
<table id="models-table">
  <thead>
    <tr>
      <th><button class="sort-btn" data-key="name">Model</button></th>
      <th><button class="sort-btn" data-key="released">Released</button></th>
      <th class="nosort">Type</th>
      <th><button class="sort-btn" data-key="params">Params</button></th>
      <th><button class="sort-btn" data-key="size">~INT4</button></th>
      <th><button class="sort-btn" data-key="context">Context</button></th>
      <th class="nosort">In → Out</th>
      <th class="nosort">Think</th>
      <th class="nosort">Measured</th>
      <th class="nosort">License</th>
      <th class="nosort">Best for</th>
      <th class="nosort">Status</th>
    </tr>
  </thead>
  <tbody>
{% for m in site.data.models %}    <tr data-type="{{ m.type }}" data-name="{{ m.name | downcase | escape }}" data-released="{{ m.released }}" data-params="{{ m.params_b }}" data-size="{{ m.size_gb }}" data-context="{{ m.context_raw }}">
      <td><a href="{{ m.url }}">{{ m.name }}</a><span class="models-org">{{ m.org }}</span></td>
      <td>{{ m.released }}</td>
      <td>{% case m.type %}{% when 'llm' %}LLM{% when 'vlm' %}VLM{% when 'stt' %}STT{% when 'speaker' %}speaker{% endcase %}</td>
      <td>{{ m.params_label }}</td>
      <td>{{ m.size_label }}</td>
      <td>{{ m.context_label }}</td>
      <td>{{ m.modes }}</td>
      <td class="think">{% case m.think %}{% when 'yes' %}✓{% when 'opt' %}±{% when 'no' %}✗{% else %}—{% endcase %}</td>
      <td class="bench">{{ m.bench }}</td>
      <td>{{ m.license }}</td>
      <td>{{ m.best_for }}</td>
      <td><span class="status status-{{ m.status }}">{{ m.status }}</span></td>
    </tr>
{% endfor %}  </tbody>
</table>
</div>

<p class="models-legend">
  <small>
    <strong>Glossary.</strong> WER = word error rate (lower is better) · DER = diarization error rate (lower) · EER = equal error rate (lower) · MMMU / MMLU(-Pro) = multimodal / text knowledge (higher) · INT4 size = weights only, ~0.55 GB per billion params + ~5% (excludes KV cache &amp; runtime) · `✓` reasoning always on · `±` toggleable thinking mode · `✗` none · `—` n/a ·
    <code>*128K</code> = config positions; card recommends lower generation length · Status: <em>superseded</em> = later open weights exist · <em>legacy</em> = kept for reproducibility · <em>gated</em> = free but licence conditions to accept · <em>research</em> / <em>demo</em> = not packaged for production.
    † = vendor-reported. Canary-1B-v2 has a card but no clean public WER — marked <code>UNVERIFIED</code> rather than guessed.
  </small>
</p>

## what you pay

Everything here runs **free** once downloaded — that's the whole point of open weights.

A few also have **hosted** access if you'd rather not self-serve. As of **2026-11-08** (OpenRouter prices, per million tokens prompt / completion):

| Model | Prompt | Completion |
|---|---|---|
| meta-llama/llama-3.2-1b-instruct | $0.027 | $0.201 |
| meta-llama/llama-3.2-3b-instruct | $0.05 | $0.33 |
| google/gemma-3-4b-it | $0.05 | $0.10 |
| mistralai/ministral-3b-2512 (131K ctx) | $0.10 | $0.10 |

That's it — the rest of this list is legal-but-not-hosted or hosted elsewhere at prices set by each host. Calls/second/subsidisation change; check OpenRouter for the day's number. Self-hosting cost ≈ **$0 (electricity)**. There is no "API price" hiding behind an open download.

## a realistic stack for STT + active speaker + image/video, multilingual

On 8GiB, on battery or on the charger, for an app that listens, watches, and knows who was talking:

- **STT**: `Qwen3-ASR-0.6B` (30 languages + 22 dialects, leaderboard WER 1.7/4.0, Apache-2.0) — my default. `Parakeet-TDT-0.6B-v3` if your languages are the 25 European set and raw speed matters. `Whisper-small` if you need the long tail of Whisper's 99 languages and can afford ~2× worse accuracy.
- **Active speaker (reality)**: today = *offline post-processing*, not sub-second "who is talking now". Two workable paths: **sherpa-onnx** on device (`pyannote/segmentation-3.0` + `WeSpeaker CAM++` embeddings, ~30–40 MB total, seconds of latency, MIT-but-gated for the pyannote weights) — works, well trodden. Or the 2026 newcomer loop: **Nemotron-3-Diarization** (100M params, streaming, DIHARD-3 12.7) — best open option, but DIY GGUF; nothing plug-and-play yet. Sortformer v2 if you need ≤4 speakers over ≤30 s billing latency. True audio-visual ASD (Light-ASD) remains research-only.
- **Image / video processing**: `MiniCPM-V-4.7-1B` (OCR/document grade), `Qwen3.5-2B` (all-round, 256K ctx, reasoning toggle) or `Gemma-4-E2B` (Apache-2.0, omni w/ audio-in).
- **Orchestration brain** (routing, structuring, answering): `Qwen3.5-2B` or `SmolLM3-3B` (both toggleable thinking).
- **One-model-many-jobs**: `LFM3-Omni-2B` if you genuinely need audio-in *and* speech-out in one weights file.

If it were my build: Qwen3-ASR + Nemotron-3-Diarization + Qwen3.5-2B (orchestrator + vision). Three models, all < 1 GB each at int4/int8, all Apache/OpenMDW, all offline, none with a licence questionnaire.

## running these on a phone — working notes

- **Stacks that matter**: `llama.cpp`/`whisper.cpp` (GGUF, CPU/GPU/Vulkan) · `MLC LLM` · `ExecuTorch` · `sherpa-onnx` (**speech/Android+iOS first class**) · `WhisperKit` (Apple ANE) · `ONNX Runtime Mobile` · `MediaPipe LLM Inference` · `LiteRT` · `Core ML`.
- **Formats**: GGUF at Q4_K_M / int4. Avoid grouping-size > 64; keep Q4/int8 KV for long ctx (quantised KV matters more than quantised weights).
- **iOS**: ANE chops small models into a 4 GB DRAM envelope per app; `WhisperKit` + `Core ML` finds it. Android: NNAPI/GPU delegate where available, else CPU; watch thermal throttle on sustained STT.
- **Context is not free**: at 256K ctx, expect GBs of KV — the cards' "128K/256K context" is a hard ceiling, not a dial you should set. Real-world on phones: 4–32K.
- **Multilingual** ≠ *certified*: Whisper's 99 languages is "trained on", not "quality-checked". For production, spot-check top-5 languages you actually touch.

## exclusions and gotchas (the ones worth printing)

- **Qwen2.5-VL-3B** — Qwen Research License, non-commercial (the 7B is Apache-2.0). Excluded.
- **canary-1b** — CC-BY-NC-4.0. Use **canary-1b-flash / -v2** instead (CC-BY-4.0).
- **Sortformer v1 (diar_sortformer_4spk-v1)** — CC-BY-NC-4.0. Use **v2** (CC-BY-4.0).
- **sherpa-onnx reverb-diarization-v1** (`Revai/..`) — non-commercial. Don't ship in a commercial app.
- **pyannote weights** — technically MIT/CC-BY but *gated*: account + conditions, contact info flows to pyannote. Legally fine for personal use, read conditions for commercial redistribution.
- **Gemma 3 / 3n** — Gemma Terms of Use (not Apache). **Gemma 4** moved to Apache.
- **LFM3** — LFM Open License v1.0: free commercial use only under **$10M annual revenue**; else talk to Liquid.
- **Llama 3.2** — Llama Community License, >700M MAU needs Meta's blessing; multimodal Llama variants are EU-restricted (text models unaffected).
- **Benchmarks**: every `†` is vendor-reported. Vendor rigs optimistic/in-house evals. Cross-vendor comparisons on the same public benchmark (e.g. Qwen3.5-vs-Gemma4 MMMU) at least use one axis per benchmark. Don't read "97.0 MATH-500" as "superhuman at maths".
- **Cards lie in both directions**: sometimes the model samples a better number; sometimes they just don't print any. `UNVERIFIED` is the honest comment.

## sources

Model cards, official blogs, tech reports — no third-party comparison sites except where marked. Retrieval **2026-11-08**.

- Qwen (Qwen3 blog 2025-04-29 · arXiv:2505.09388 · Qwen3.5 Feb 2026 · <https://huggingface.co/Qwen> · <https://qwenlm.github.io/blog/qwen3/>) · Qwen3-VL (arXiv:2511.21631 · <https://github.com/qwenlm/qwen3-vl>) · Qwen3-ASR (arXiv:2601.21337 · <https://huggingface.co/Qwen/Qwen3-ASR-0.6B-hf>)
- Google (Gemma 3 blog 2025-03-12 · <https://arxiv.org/abs/2503.19786> · Gemma 3n guide 2025-06-26 · Gemma 4 blog 2026-04-02 · <https://arxiv.org/abs/2607.02770>)
- Hugging Face (SmolLM3 <https://hf.co/blog/smollm3> 2025-07 · SmolVLM2 <https://huggingface.co/HuggingFaceTB/SmolVLM2-2.2B-Instruct>)
- Microsoft (Phi-4-mini · arXiv:2503.01743 · Phi-4-mini-reasoning · arXiv:2504.21233)
- Meta (Llama 3.2 · 2024-09-25 · <https://huggingface.co/meta-llama>)
- NVIDIA (Parakeet-TDT-0.6B-v3 · arXiv:2509.14128 · Nemotron-3-Diarization <https://huggingface.co/nvidia/Nemotron-3-Diarization> · Sortformer v2 · canary-1b-v2)
- OpenBMB (MiniCPM5-2B · MiniCPM-V-4.7 · MiniCPM-OCR-1.0 · <https://huggingface.co/openbmb>)
- Liquid AI (LFM3 2026-10-27 · <https://www.liquid.ai/blog/lfm3> · LFM3-VL-2B · LFM3-Omni-2B)
- OpenAI (Whisper family · <https://huggingface.co/openai/whisper-small> · large-v3-turbo)
- Distil-Whisper <https://huggingface.co/distil-whisper/distil-large-v3> · Moonshine <https://arxiv.org/abs/2410.15608> · SenseVoice <https://arxiv.org/abs/2407.04051>
- pyannote (community-1 · <https://github.com/pyannote/pyannote-audio> · DER table 2025-09) · WeSpeaker EER table · sherpa-onnx diarization docs · 3D-Speaker DER table
- OpenRouter context/pricing snapshot 2026-11-08 (<https://openrouter.ai/api/v1/models>)

**How to update**: this page renders the table from `_data/models.yml` in the site repo — update a row there, push, done. If a model goes EOL or gets beaten by something ≤4B that did happen recently, flag it with `status: superseded` rather than deleting the row; reproducibility beats tidiness.

<script src="/assets/js/models.js" defer></script>
