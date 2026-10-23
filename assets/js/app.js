/* 微言字体 - 前端逻辑：载入 fonts.json，渲染卡片，支持搜索 + 风格/用途筛选 */
(function () {
  'use strict';

  var STYLE_MAP = {
    serif: '衬线',
    sans: '无衬线',
    handwritten: '手写',
    mono: '等宽',
    decorative: '装饰'
  };
  var SCENE_MAP = {
    title: '标题',
    body: '正文',
    code: '代码',
    poster: '海报',
    logo: 'Logo',
    ui: 'UI'
  };

  var fonts = [];
  var state = { style: '', scene: '', q: '' };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function chipHandler(group, key) {
    return function (ev) {
      var chips = group.querySelectorAll('.chip');
      for (var i = 0; i < chips.length; i++) chips[i].classList.remove('active');
      ev.currentTarget.classList.add('active');
      state[key] = ev.currentTarget.dataset.value || '';
      render();
    };
  }

  function buildChips() {
    buildGroup('styleFilters', STYLE_MAP, function (f) { return [f.style]; });
    buildGroup('sceneFilters', SCENE_MAP, function (f) { return f.scene || []; });
  }

  function buildGroup(groupId, map, getValues) {
    var group = document.getElementById(groupId);
    var used = {};
    fonts.forEach(function (f) {
      getValues(f).forEach(function (v) { if (v) used[v] = true; });
    });
    Object.keys(map).forEach(function (k) {
      if (!used[k]) return;
      var b = document.createElement('button');
      b.className = 'chip';
      b.dataset.value = k;
      b.textContent = map[k];
      b.addEventListener('click', chipHandler(group, group.dataset.key));
      group.appendChild(b);
    });
    // 「全部」chip
    var all = group.querySelector('.chip[data-value=""]');
    if (all) all.addEventListener('click', chipHandler(group, group.dataset.key));
  }

  function match(f) {
    if (state.style && f.style !== state.style) return false;
    if (state.scene && (f.scene || []).indexOf(state.scene) === -1) return false;
    if (state.q) {
      var hay = [f.name, f.desc, f.license, f.licenseNote].join(' ').toLowerCase();
      if (hay.indexOf(state.q.toLowerCase()) === -1) return false;
    }
    return true;
  }

  function cardHTML(f) {
    var styleLabel = STYLE_MAP[f.style] || f.style || '';
    var sceneHTML = (f.scene || []).map(function (s) {
      return '<span class="badge">' + esc(SCENE_MAP[s] || s) + '</span>';
    }).join('');
    var quarkOk = f.quark && f.quark.indexOf('待补充') === -1;
    var btn = quarkOk
      ? '<a class="btn" href="' + esc(f.quark) + '" target="_blank" rel="noopener">夸克下载</a>'
      : '<span class="btn disabled">链接待补充</span>';
    return (
      '<article class="card">' +
        '<a class="thumb" href="' + esc(f.preview) + '" target="_blank" rel="noopener">' +
          '<img src="' + esc(f.preview) + '" alt="' + esc(f.name) + '" loading="lazy">' +
        '</a>' +
        '<div class="card-body">' +
          '<h2 class="name">' + esc(f.name) + '</h2>' +
          '<div class="badges">' +
            '<span class="badge">' + esc(styleLabel) + '</span>' +
            sceneHTML +
            '<span class="badge license" title="' + esc(f.licenseNote) + '">' + esc(f.license) + '</span>' +
          '</div>' +
          '<p class="desc">' + esc(f.desc) + '</p>' +
          '<div class="card-foot">' + btn + '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function render() {
    var grid = document.getElementById('grid');
    var list = fonts.filter(match);
    document.getElementById('count').textContent = list.length;
    document.getElementById('empty').hidden = list.length > 0;
    grid.innerHTML = list.map(cardHTML).join('');
  }

  function load() {
    return fetch('data/fonts.json')
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        fonts = data;
        buildChips();
        render();
      })
      .catch(function () {
        document.getElementById('grid').innerHTML =
          '<div class="error">加载 data/fonts.json 失败。请通过本地 HTTP 服务访问：' +
          '<code>python -m http.server</code></div>';
      });
  }

  document.getElementById('search').addEventListener('input', function (e) {
    state.q = e.target.value.trim();
    render();
  });

  load();
})();
