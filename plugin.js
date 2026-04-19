(function () {
  'use strict';

  try {
    if (window.__DesignAIPluginLoaded) return;
    window.__DesignAIPluginLoaded = true;

    var CFG = (window.DesignAIConfig || {});
    var SERVER_URL = (CFG.serverUrl || 'http://localhost:3001').replace(/\/+$/, '');
    var COMPANY = CFG.companyName || 'DesignAI';

    var MATERIALS = [
      { id: 1, name: 'Aerolite Coffee Grey', imageUrl: 'https://raw.githubusercontent.com/uuuucnex-rgb/casteliaCATALOG/refs/heads/main/Aerolite_COFFEE_grey.jpg' },
      { id: 2, name: 'Roman Pillar Milan Red', imageUrl: 'https://raw.githubusercontent.com/uuuucnex-rgb/casteliaCATALOG/refs/heads/main/Roman_pillar_milan_red.jpg' },
      { id: 3, name: 'Marble Bianco Carara', imageUrl: 'https://raw.githubusercontent.com/uuuucnex-rgb/casteliaCATALOG/refs/heads/main/Marble_Bianco_Carara.png' }
    ];

    // ---------- fonts ----------
    try {
      var l1 = document.createElement('link');
      l1.rel = 'preconnect'; l1.href = 'https://fonts.googleapis.com';
      document.head.appendChild(l1);
      var l2 = document.createElement('link');
      l2.rel = 'preconnect'; l2.href = 'https://fonts.gstatic.com'; l2.crossOrigin = '';
      document.head.appendChild(l2);
      var l3 = document.createElement('link');
      l3.rel = 'stylesheet';
      l3.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap';
      document.head.appendChild(l3);
    } catch (e) {}

    // ---------- styles ----------
    var CSS = '' +
    '._dai_root,._dai_root *{box-sizing:border-box;font-family:"DM Sans",system-ui,-apple-system,Segoe UI,Roboto,sans-serif;}' +
    '._dai_fab{position:fixed;right:28px;bottom:28px;z-index:999990;height:56px;width:56px;display:flex;align-items:center;justify-content:flex-start;background:#1a1410;border:1px solid rgba(201,169,110,0.5);border-radius:999px;color:#c9a96e;cursor:pointer;overflow:hidden;padding:0;transition:width .45s ease,box-shadow .3s ease;box-shadow:0 10px 30px rgba(0,0,0,0.35);}' +
    '._dai_fab:hover{box-shadow:0 14px 40px rgba(201,169,110,0.25);}' +
    '._dai_fab_icon{flex:0 0 56px;height:56px;display:flex;align-items:center;justify-content:center;font-size:22px;color:#e8c98e;animation:_dai_spin 12s linear infinite;}' +
    '._dai_fab_ring{position:absolute;inset:-6px;border-radius:999px;border:1px solid rgba(201,169,110,0.35);animation:_dai_pulse 2.4s ease-out infinite;pointer-events:none;}' +
    '._dai_fab_text{white-space:nowrap;display:flex;flex-direction:column;justify-content:center;line-height:1.1;padding-right:18px;opacity:0;transition:opacity .25s ease .15s;}' +
    '._dai_fab._dai_expanded{width:240px;}' +
    '._dai_fab._dai_expanded ._dai_fab_text{opacity:1;}' +
    '._dai_fab_title{font-weight:700;color:#e8c98e;font-size:14px;letter-spacing:.2px;}' +
    '._dai_fab_sub{font-size:11px;color:rgba(237,233,227,0.6);margin-top:2px;}' +
    '@keyframes _dai_spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}' +
    '@keyframes _dai_pulse{0%{transform:scale(1);opacity:.6}100%{transform:scale(1.35);opacity:0}}' +

    '._dai_overlay{position:fixed;inset:0;background:rgba(0,0,0,0.78);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);z-index:999991;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity .3s ease;}' +
    '._dai_overlay._dai_open{opacity:1;}' +
    '._dai_modal{width:100%;max-width:860px;max-height:92vh;background:#0e0f0d;color:#ede9e3;border:1px solid rgba(201,169,110,0.18);border-radius:20px;display:flex;flex-direction:column;overflow:hidden;transform:scale(.96) translateY(28px);transition:transform .4s ease;box-shadow:0 40px 120px rgba(0,0,0,0.55);}' +
    '._dai_overlay._dai_open ._dai_modal{transform:scale(1) translateY(0);}' +
    '._dai_header{display:flex;align-items:center;gap:14px;padding:18px 22px;border-bottom:1px solid rgba(255,255,255,0.07);}' +
    '._dai_h_icon{font-size:18px;color:#e8c98e;animation:_dai_spin 12s linear infinite;}' +
    '._dai_h_title{font-weight:700;font-size:15px;letter-spacing:.3px;flex:0 0 auto;}' +
    '._dai_dots{display:flex;gap:8px;margin-left:14px;flex:1;}' +
    '._dai_dot{width:8px;height:8px;border-radius:999px;background:rgba(237,233,227,0.18);transition:background .3s ease,transform .3s ease;}' +
    '._dai_dot._dai_active{background:#c9a96e;transform:scale(1.2);}' +
    '._dai_dot._dai_done{background:#6b5a3a;}' +
    '._dai_close{background:transparent;border:0;color:#ede9e3;font-size:18px;cursor:pointer;padding:6px 10px;border-radius:8px;opacity:.7;}' +
    '._dai_close:hover{opacity:1;background:rgba(255,255,255,0.06);}' +
    '._dai_body{padding:22px;overflow-y:auto;scrollbar-width:thin;}' +
    '._dai_body::-webkit-scrollbar{width:8px;}' +
    '._dai_body::-webkit-scrollbar-thumb{background:rgba(201,169,110,0.25);border-radius:8px;}' +
    '._dai_footer{display:flex;justify-content:space-between;gap:10px;padding:16px 22px;border-top:1px solid rgba(255,255,255,0.07);}' +
    '._dai_footer._dai_hidden{display:none;}' +
    '._dai_btn{border:0;border-radius:12px;padding:12px 20px;font-size:14px;font-weight:600;cursor:pointer;transition:transform .15s ease,opacity .2s ease,background .2s ease;font-family:inherit;}' +
    '._dai_btn:disabled{opacity:.4;cursor:not-allowed;}' +
    '._dai_btn_ghost{background:transparent;color:#ede9e3;border:1px solid rgba(255,255,255,0.12);}' +
    '._dai_btn_ghost:hover:not(:disabled){background:rgba(255,255,255,0.05);}' +
    '._dai_btn_gold{background:linear-gradient(180deg,#e8c98e 0%,#c9a96e 100%);color:#1a1410;}' +
    '._dai_btn_gold:hover:not(:disabled){transform:translateY(-1px);}' +

    '._dai_step_title{font-size:20px;font-weight:700;margin:0 0 6px;color:#ede9e3;letter-spacing:.2px;}' +
    '._dai_step_sub{color:rgba(237,233,227,0.55);font-size:14px;margin:0 0 20px;}' +

    '._dai_grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}' +
    '@media (max-width:640px){._dai_grid{grid-template-columns:1fr 1fr;}}' +
    '._dai_card{position:relative;border:2px solid rgba(255,255,255,0.08);border-radius:14px;overflow:hidden;cursor:pointer;background:#15160f;transition:border-color .2s ease,transform .15s ease;}' +
    '._dai_card:hover{transform:translateY(-2px);}' +
    '._dai_card._dai_selected{border-color:#c9a96e;box-shadow:0 0 0 3px rgba(201,169,110,0.2);}' +
    '._dai_card img{display:block;width:100%;height:150px;object-fit:cover;background:#222;}' +
    '._dai_card_name{padding:10px 12px;font-size:13px;font-weight:500;color:#ede9e3;}' +
    '._dai_check{position:absolute;top:10px;right:10px;width:26px;height:26px;border-radius:999px;background:#c9a96e;color:#1a1410;display:none;align-items:center;justify-content:center;font-weight:800;font-size:14px;}' +
    '._dai_card._dai_selected ._dai_check{display:flex;}' +

    '._dai_drop{border:2px dashed rgba(201,169,110,0.35);border-radius:16px;padding:40px 20px;text-align:center;background:rgba(201,169,110,0.04);cursor:pointer;transition:background .2s ease,border-color .2s ease;}' +
    '._dai_drop:hover,._dai_drop._dai_hover{background:rgba(201,169,110,0.08);border-color:#c9a96e;}' +
    '._dai_drop_title{font-size:16px;color:#ede9e3;font-weight:600;margin:0 0 6px;}' +
    '._dai_drop_sub{font-size:13px;color:rgba(237,233,227,0.5);margin:0;}' +
    '._dai_cam_row{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;}' +
    '._dai_cam_row ._dai_btn{flex:1;min-width:160px;}' +
    '._dai_preview{position:relative;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);}' +
    '._dai_preview img{display:block;width:100%;max-height:420px;object-fit:contain;background:#000;}' +
    '._dai_preview_actions{display:flex;justify-content:center;margin-top:12px;}' +

    '._dai_gen{display:flex;flex-direction:column;align-items:center;padding:30px 10px 10px;}' +
    '._dai_ring{width:88px;height:88px;border-radius:999px;border:3px solid rgba(201,169,110,0.18);border-top-color:#c9a96e;animation:_dai_spin 1.1s linear infinite;margin-bottom:22px;}' +
    '._dai_progress{width:100%;max-width:420px;height:6px;background:rgba(255,255,255,0.07);border-radius:999px;overflow:hidden;margin-bottom:18px;}' +
    '._dai_progress_bar{height:100%;width:0%;background:linear-gradient(90deg,#c9a96e,#e8c98e);transition:width .4s ease;}' +
    '._dai_stage{color:#ede9e3;font-size:14px;font-weight:600;min-height:20px;}' +
    '._dai_stage_hint{color:rgba(237,233,227,0.45);font-size:12px;margin-top:6px;}' +
    '._dai_error{margin-top:18px;padding:14px 16px;background:rgba(255,80,80,0.08);border:1px solid rgba(255,120,120,0.25);color:#ffb3b3;border-radius:12px;font-size:13px;text-align:center;}' +

    '._dai_result_grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}' +
    '@media (max-width:640px){._dai_result_grid{grid-template-columns:1fr;}}' +
    '._dai_result_box{border:1px solid rgba(255,255,255,0.08);border-radius:14px;overflow:hidden;background:#15160f;}' +
    '._dai_result_box img{display:block;width:100%;max-height:360px;object-fit:contain;background:#000;}' +
    '._dai_result_cap{padding:10px 12px;font-size:13px;color:rgba(237,233,227,0.75);border-top:1px solid rgba(255,255,255,0.06);text-align:center;}' +
    '._dai_result_cap._dai_gold{color:#e8c98e;font-weight:600;}' +
    '._dai_meta{margin-top:16px;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;color:rgba(237,233,227,0.6);font-size:13px;}' +
    '._dai_meta b{color:#ede9e3;font-weight:600;}' +
    '._dai_result_actions{display:flex;justify-content:center;margin-top:18px;}' +
    '';

    try {
      var style = document.createElement('style');
      style.id = '_dai_styles';
      style.textContent = CSS;
      document.head.appendChild(style);
    } catch (e) {}

    // ---------- state ----------
    var state = {
      step: 1,
      selectedMaterial: null,
      clientImageBase64: null,
      clientImageMime: null,
      clientImageDataUrl: null,
      resultDataUrl: null,
      generationTimeMs: 0
    };

    // ---------- helpers ----------
    function el(tag, props, children) {
      var e = document.createElement(tag);
      if (props) {
        for (var k in props) {
          if (k === 'class') e.className = props[k];
          else if (k === 'style') e.style.cssText = props[k];
          else if (k === 'html') e.innerHTML = props[k];
          else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), props[k]);
          else e.setAttribute(k, props[k]);
        }
      }
      if (children) {
        if (!Array.isArray(children)) children = [children];
        for (var i = 0; i < children.length; i++) {
          var c = children[i];
          if (c == null) continue;
          e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
        }
      }
      return e;
    }

    function fileToBase64(file) {
      return new Promise(function (resolve, reject) {
        var r = new FileReader();
        r.onload = function () {
          var s = r.result || '';
          var m = /^data:([^;]+);base64,(.*)$/.exec(s);
          if (!m) return reject(new Error('Bad file'));
          resolve({ dataUrl: s, mime: m[1], base64: m[2] });
        };
        r.onerror = function () { reject(new Error('Read error')); };
        r.readAsDataURL(file);
      });
    }

    // ---------- FAB ----------
    var fab, fabCollapseTimer;
    function buildFab() {
      fab = el('button', { class: '_dai_root _dai_fab', 'aria-label': 'Открыть примерку материала' }, [
        el('span', { class: '_dai_fab_ring' }),
        el('span', { class: '_dai_fab_icon', html: '&#10022;' }),
        el('span', { class: '_dai_fab_text' }, [
          el('span', { class: '_dai_fab_title' }, 'Примерить материал'),
          el('span', { class: '_dai_fab_sub' }, 'по вашему фото · ИИ')
        ])
      ]);
      fab.addEventListener('click', openModal);
      fab.addEventListener('mouseenter', function () {
        clearTimeout(fabCollapseTimer);
        fab.classList.add('_dai_expanded');
      });
      fab.addEventListener('mouseleave', function () {
        clearTimeout(fabCollapseTimer);
        fabCollapseTimer = setTimeout(function () {
          fab.classList.remove('_dai_expanded');
        }, 3000);
      });
      document.body.appendChild(fab);
      setTimeout(function () {
        fab.classList.add('_dai_expanded');
        fabCollapseTimer = setTimeout(function () {
          fab.classList.remove('_dai_expanded');
        }, 4500);
      }, 1200);
    }

    // ---------- Modal ----------
    var overlay, modal, bodyEl, dotsEl, footerEl, backBtn, nextBtn;
    function buildModal() {
      overlay = el('div', { class: '_dai_root _dai_overlay', onclick: function (e) { if (e.target === overlay) closeModal(); } });
      dotsEl = el('div', { class: '_dai_dots' });
      for (var i = 0; i < 4; i++) dotsEl.appendChild(el('div', { class: '_dai_dot' }));

      var header = el('div', { class: '_dai_header' }, [
        el('span', { class: '_dai_h_icon', html: '&#10022;' }),
        el('span', { class: '_dai_h_title' }, COMPANY),
        dotsEl,
        el('button', { class: '_dai_close', 'aria-label': 'Закрыть', onclick: closeModal, html: '&#10005;' })
      ]);

      bodyEl = el('div', { class: '_dai_body' });

      backBtn = el('button', { class: '_dai_btn _dai_btn_ghost', onclick: onBack }, '← Назад');
      nextBtn = el('button', { class: '_dai_btn _dai_btn_gold', onclick: onNext }, 'Далее →');
      footerEl = el('div', { class: '_dai_footer' }, [backBtn, nextBtn]);

      modal = el('div', { class: '_dai_modal', onclick: function (e) { e.stopPropagation(); } }, [header, bodyEl, footerEl]);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
    }

    function openModal() {
      state.step = 1;
      render();
      requestAnimationFrame(function () { overlay.classList.add('_dai_open'); });
    }
    function closeModal() {
      overlay.classList.remove('_dai_open');
    }

    function setDots() {
      var dots = dotsEl.children;
      for (var i = 0; i < dots.length; i++) {
        dots[i].classList.remove('_dai_active', '_dai_done');
        if (i + 1 < state.step) dots[i].classList.add('_dai_done');
        else if (i + 1 === state.step) dots[i].classList.add('_dai_active');
      }
    }

    function onBack() {
      if (state.step === 1) { closeModal(); return; }
      if (state.step === 4) { state.step = 1; state.clientImageBase64 = null; state.clientImageMime = null; state.clientImageDataUrl = null; state.resultDataUrl = null; render(); return; }
      state.step -= 1;
      render();
    }
    function onNext() {
      if (state.step === 1) {
        if (!state.selectedMaterial) return;
        state.step = 2; render(); return;
      }
      if (state.step === 2) {
        if (!state.clientImageBase64) return;
        state.step = 3; render(); runGeneration(); return;
      }
    }

    function render() {
      bodyEl.innerHTML = '';
      setDots();

      if (state.step === 1) renderStep1();
      else if (state.step === 2) renderStep2();
      else if (state.step === 3) renderStep3();
      else if (state.step === 4) renderStep4();

      if (state.step === 3 || state.step === 4) footerEl.classList.add('_dai_hidden');
      else footerEl.classList.remove('_dai_hidden');

      if (state.step === 1) {
        backBtn.textContent = 'Закрыть';
        nextBtn.textContent = 'Далее →';
        nextBtn.disabled = !state.selectedMaterial;
      } else if (state.step === 2) {
        backBtn.textContent = '← Назад';
        nextBtn.textContent = 'Сгенерировать →';
        nextBtn.disabled = !state.clientImageBase64;
      }
    }

    // ---------- Step 1 ----------
    function renderStep1() {
      bodyEl.appendChild(el('h3', { class: '_dai_step_title' }, 'Выберите материал'));
      bodyEl.appendChild(el('p', { class: '_dai_step_sub' }, 'Коллекция премиальных отделочных материалов'));

      var grid = el('div', { class: '_dai_grid' });
      MATERIALS.forEach(function (m) {
        var card = el('div', {
          class: '_dai_card' + (state.selectedMaterial && state.selectedMaterial.id === m.id ? ' _dai_selected' : ''),
          onclick: function () {
            state.selectedMaterial = m;
            render();
          }
        }, [
          el('img', { src: m.imageUrl, alt: m.name, loading: 'lazy' }),
          el('div', { class: '_dai_card_name' }, m.name),
          el('div', { class: '_dai_check', html: '&#10003;' })
        ]);
        grid.appendChild(card);
      });
      bodyEl.appendChild(grid);
    }

    // ---------- Step 2 ----------
    function renderStep2() {
      bodyEl.appendChild(el('h3', { class: '_dai_step_title' }, 'Загрузите фото объекта'));
      bodyEl.appendChild(el('p', { class: '_dai_step_sub' }, 'Фото интерьера или фасада — мы применим выбранный материал к поверхностям'));

      if (state.clientImageDataUrl) {
        var prev = el('div', { class: '_dai_preview' }, [ el('img', { src: state.clientImageDataUrl, alt: 'Превью' }) ]);
        var actions = el('div', { class: '_dai_preview_actions' }, [
          el('button', {
            class: '_dai_btn _dai_btn_ghost',
            onclick: function () {
              state.clientImageBase64 = null; state.clientImageMime = null; state.clientImageDataUrl = null;
              render();
            }
          }, 'Изменить фото')
        ]);
        bodyEl.appendChild(prev);
        bodyEl.appendChild(actions);
        return;
      }

      var fileInput = el('input', { type: 'file', accept: 'image/*', style: 'display:none;' });
      fileInput.addEventListener('change', function (e) { handleFile(e.target.files && e.target.files[0]); });
      var camInput = el('input', { type: 'file', accept: 'image/*', capture: 'environment', style: 'display:none;' });
      camInput.addEventListener('change', function (e) { handleFile(e.target.files && e.target.files[0]); });

      var drop = el('div', {
        class: '_dai_drop',
        onclick: function () { fileInput.click(); },
        ondragover: function (e) { e.preventDefault(); drop.classList.add('_dai_hover'); },
        ondragleave: function () { drop.classList.remove('_dai_hover'); },
        ondrop: function (e) {
          e.preventDefault(); drop.classList.remove('_dai_hover');
          var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
          if (f) handleFile(f);
        }
      }, [
        el('h4', { class: '_dai_drop_title' }, 'Перетащите фото сюда или нажмите для выбора'),
        el('p', { class: '_dai_drop_sub' }, 'JPG, PNG · одно фото интерьера или фасада')
      ]);

      var camRow = el('div', { class: '_dai_cam_row' }, [
        el('button', { class: '_dai_btn _dai_btn_ghost', onclick: function () { fileInput.click(); } }, 'Выбрать файл'),
        el('button', { class: '_dai_btn _dai_btn_gold', onclick: function () { camInput.click(); } }, '📷 Открыть камеру')
      ]);

      bodyEl.appendChild(drop);
      bodyEl.appendChild(camRow);
      bodyEl.appendChild(fileInput);
      bodyEl.appendChild(camInput);
    }

    function handleFile(file) {
      if (!file) return;
      if (!/^image\//i.test(file.type)) return;
      fileToBase64(file).then(function (r) {
        state.clientImageBase64 = r.base64;
        state.clientImageMime = r.mime;
        state.clientImageDataUrl = r.dataUrl;
        render();
      }).catch(function () {});
    }

    // ---------- Step 3 ----------
    var STAGES = [
      'Анализ фото объекта',
      'Обработка текстуры материала',
      'Генерация NanoBanana 2',
      'Финальная обработка'
    ];
    var genTimers = [];
    function clearGenTimers() { genTimers.forEach(function (t) { clearTimeout(t); }); genTimers = []; }

    function renderStep3() {
      var wrap = el('div', { class: '_dai_gen' });
      var ring = el('div', { class: '_dai_ring' });
      var prog = el('div', { class: '_dai_progress' }, [ el('div', { class: '_dai_progress_bar' }) ]);
      var stage = el('div', { class: '_dai_stage' }, STAGES[0]);
      var hint = el('div', { class: '_dai_stage_hint' }, 'Это может занять 20–60 секунд');

      wrap.appendChild(ring);
      wrap.appendChild(prog);
      wrap.appendChild(stage);
      wrap.appendChild(hint);
      bodyEl.appendChild(wrap);

      state._ui = { progressBar: prog.firstChild, stage: stage, wrap: wrap };

      var steps = [
        { at: 0, pct: 10, text: STAGES[0] },
        { at: 1500, pct: 35, text: STAGES[1] },
        { at: 3500, pct: 65, text: STAGES[2] },
        { at: 12000, pct: 88, text: STAGES[3] }
      ];
      clearGenTimers();
      steps.forEach(function (s) {
        genTimers.push(setTimeout(function () {
          if (!state._ui) return;
          state._ui.progressBar.style.width = s.pct + '%';
          state._ui.stage.textContent = s.text;
        }, s.at));
      });
    }

    function showGenerationError(msg) {
      clearGenTimers();
      if (!state._ui || !state._ui.wrap) return;
      state._ui.stage.textContent = 'Не удалось сгенерировать';
      state._ui.progressBar.style.width = '100%';
      state._ui.progressBar.style.background = '#a94444';
      var errBox = el('div', { class: '_dai_error' }, msg || 'Неизвестная ошибка');
      var actions = el('div', { class: '_dai_result_actions', style: 'gap:10px;' }, [
        el('button', { class: '_dai_btn _dai_btn_ghost', onclick: function () { state.step = 2; render(); } }, '← Назад'),
        el('button', { class: '_dai_btn _dai_btn_gold', onclick: function () { render(); runGeneration(); } }, 'Попробовать снова')
      ]);
      state._ui.wrap.appendChild(errBox);
      state._ui.wrap.appendChild(actions);
    }

    function runGeneration() {
      var started = Date.now();
      var payload = {
        clientImageBase64: state.clientImageBase64,
        clientImageMime: state.clientImageMime,
        materialImageUrl: state.selectedMaterial.imageUrl,
        materialName: state.selectedMaterial.name
      };
      var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
      var timeoutId = setTimeout(function () { if (controller) controller.abort(); }, 125000);

      fetch(SERVER_URL + '/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller ? controller.signal : undefined
      })
        .then(function (res) { return res.json().then(function (d) { return { ok: res.ok, data: d }; }); })
        .then(function (r) {
          clearTimeout(timeoutId);
          if (!r.ok || !r.data || r.data.error || !r.data.resultDataUrl) {
            showGenerationError((r.data && r.data.error) ? r.data.error : 'Ошибка сервера');
            return;
          }
          state.resultDataUrl = r.data.resultDataUrl;
          state.generationTimeMs = r.data.generationTime || (Date.now() - started);
          clearGenTimers();
          if (state._ui) {
            state._ui.progressBar.style.width = '100%';
            state._ui.stage.textContent = 'Готово';
          }
          setTimeout(function () {
            state.step = 4;
            render();
          }, 400);
        })
        .catch(function (err) {
          clearTimeout(timeoutId);
          showGenerationError((err && err.message) ? err.message : 'Сеть недоступна');
        });
    }

    // ---------- Step 4 ----------
    function renderStep4() {
      bodyEl.appendChild(el('h3', { class: '_dai_step_title' }, 'Готово'));
      bodyEl.appendChild(el('p', { class: '_dai_step_sub' }, 'Сравните оригинал и визуализацию с выбранным материалом'));

      var grid = el('div', { class: '_dai_result_grid' }, [
        el('div', { class: '_dai_result_box' }, [
          el('img', { src: state.clientImageDataUrl, alt: 'Оригинал' }),
          el('div', { class: '_dai_result_cap' }, 'Ваш объект')
        ]),
        el('div', { class: '_dai_result_box' }, [
          el('img', { src: state.resultDataUrl, alt: 'Результат' }),
          el('div', { class: '_dai_result_cap _dai_gold' }, '✦ После · NanoBanana 2')
        ])
      ]);
      bodyEl.appendChild(grid);

      var secs = Math.max(1, Math.round((state.generationTimeMs || 0) / 1000));
      var meta = el('div', { class: '_dai_meta' }, [
        el('div', {}, [ document.createTextNode('Материал: '), el('b', {}, state.selectedMaterial.name) ]),
        el('div', {}, [ document.createTextNode('Время генерации: '), el('b', {}, secs + ' с') ])
      ]);
      bodyEl.appendChild(meta);

      var actions = el('div', { class: '_dai_result_actions' }, [
        el('button', {
          class: '_dai_btn _dai_btn_gold',
          onclick: function () {
            state.step = 1;
            state.clientImageBase64 = null;
            state.clientImageMime = null;
            state.clientImageDataUrl = null;
            state.resultDataUrl = null;
            state.generationTimeMs = 0;
            render();
          }
        }, '🔄 Попробовать другой материал')
      ]);
      bodyEl.appendChild(actions);
    }

    // ---------- init ----------
    function init() {
      try {
        buildFab();
        buildModal();
      } catch (e) { console && console.error && console.error('DesignAI init error:', e); }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  } catch (e) {
    try { console.error('DesignAI plugin failed:', e); } catch (_) {}
  }
})();
