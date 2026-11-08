// Filter / sort / search for the /models/ table. No dependencies.
(function () {
  var table = document.getElementById('models-table');
  if (!table) { return; }

  var tbody = table.querySelector('tbody');
  var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
  var search = document.getElementById('models-search');
  var chips = Array.prototype.slice.call(document.querySelectorAll('.models-filter'));
  var counter = document.getElementById('models-count');
  var activeFilter = 'all';
  var activeDir = { released: -1 }; // matches the default sort (newest first)

  function rowText(tr) {
    return (tr.textContent || '').toLowerCase();
  }

  function applyFilter() {
    var q = search ? search.value.trim().toLowerCase() : '';
    var visible = 0;
    rows.forEach(function (tr) {
      var typeOk = activeFilter === 'all' || tr.getAttribute('data-type') === activeFilter;
      var textOk = !q || rowText(tr).indexOf(q) !== -1;
      var show = typeOk && textOk;
      tr.style.display = show ? '' : 'none';
      if (show) { visible += 1; }
    });
    if (counter) {
      counter.textContent = visible + ' of ' + rows.length + ' models';
    }
  }

  function sortBy(key, dir) {
    var numeric = ['params', 'size', 'context'].indexOf(key) !== -1;
    var sorted = rows.slice().sort(function (a, b) {
      var av = a.getAttribute('data-' + key);
      var bv = b.getAttribute('data-' + key);
      var cmp;
      if (numeric) {
        cmp = (parseFloat(av) || 0) - (parseFloat(bv) || 0);
      } else {
        cmp = String(av).localeCompare(String(bv));
      }
      return dir * cmp;
    });
    sorted.forEach(function (tr) { tbody.appendChild(tr); });
    rows = sorted;
    var headers = table.querySelectorAll('th .sort-btn');
    Array.prototype.forEach.call(headers, function (btn) {
      var k = btn.getAttribute('data-key');
      var isActive = k === key;
      btn.classList.toggle('sorted', isActive);
      btn.classList.toggle('desc', isActive && dir === -1);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    applyFilter();
  }

  // Filter chips
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeFilter = chip.getAttribute('data-filter');
      chips.forEach(function (c) { c.classList.toggle('active', c === chip); });
      applyFilter();
    });
  });

  if (search) { search.addEventListener('input', applyFilter); }

  // Sortable headers
  var buttons = table.querySelectorAll('th .sort-btn[data-key]');
  Array.prototype.forEach.call(buttons, function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-key');
      var current = activeDir[key] || 1;
      var next = btn.classList.contains('sorted') ? -current : 1;
      activeDir[key] = next;
      sortBy(key, next);
    });
  });

  // Default sort: newest first
  sortBy('released', -1);
})();
