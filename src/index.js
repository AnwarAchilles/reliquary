/* Exura JS
 * full documentation here
 * https://github.com/devneet/exura
 * */


/* R E C O R D S
 * The page of a reliquary reads its own records: relic.json & nexus.json,
 * served next to index.html (GitHub Pages, or `php pages serve`).
 * Opened as a file (file://), the browser refuses fetch: serve it.
 * */
const reliquary = {
  main: 'devneet-id/reliquary', // until relic.json answers

  // GET a json; null when it can not be read
  async read(url) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      return response.ok ? await response.json() : null;
    } catch (error) {
      return null;
    }
  },

  // a version list, newest first
  versions(tags) {
    const key = (v) => String(v).replace(/^v/, '').split(/[.-]/).map((n) => n.padStart(8, '0')).join('.');
    return Object.keys(tags || {}).sort((a, b) => key(b).localeCompare(key(a)));
  },

  empty(text) {
    return `<div class="empty">${text}</div>`;
  },
};
const e = (value) => Exura.escape(value ?? '');
const named = (name) => {
  const [owner, ...rest] = String(name).split('/');
  return `<span class="owner">${e(owner)}/</span>${e(rest.join('/'))}`;
};


/* NAVBAR & HERO
 * the links follow the reliquary of this page (a fork points to itself) */
function navbar() {
  navbar.store.set('repo', `https://github.com/${reliquary.main}`);
  navbar.render();
}

function hero(relic, links) {
  const list = Object.values(relic?.list || {});
  hero.store.set('main', reliquary.main);
  hero.store.set('repo', `https://github.com/${reliquary.main}`);
  hero.store.set('fork', `https://github.com/${reliquary.main}/fork`);
  hero.store.set('relics', relic ? list.length : '–');
  hero.store.set('versions', relic ? list.reduce((sum, item) => sum + Object.keys(item.tags || {}).length, 0) : '–');
  hero.store.set('forks', links ? Object.keys(links.list || {}).length : '–');
  hero.render();
}


/* RELICS
 * relic.json: every relic of this reliquary, its versions and seals */
function relics(record) {
  const list = Object.entries(record?.list || {});
  relics.store.set('count', record ? `${list.length} relic${list.length === 1 ? '' : 's'}` : '–');

  if (!record) {
    relics.store.set('list', reliquary.empty('<i clip="warning"></i> relic.json can not be read — serve this page next to its records.'));
  } else if (!list.length) {
    relics.store.set('list', reliquary.empty('No relic yet — <code>php relic register</code>'));
  } else {
    relics.store.set('list', list.map(([name, relic]) => {
      const tags = relic.tags || {};
      const versions = reliquary.versions(tags);
      return `
        <div class="record">
          <div class="record-head">
            <h4><a href="${e(relic.repo || 'https://github.com/' + name)}" target="_blank" rel="noopener">${named(name)}</a></h4>
            <span class="meta">${e(relic.runite || 'cast')}.rune</span>
          </div>
          ${relic.note ? `<p>${e(relic.note)}</p>` : ''}
          <div class="tags">
            ${versions.map((version, index) => {
              const item = tags[version] || {};
              const title = [`sha256 ${item.sha256 || '?'}`, item.ref, item.rune && `Rune ${item.rune}`].filter(Boolean).join(' · ');
              return `<a class="tag${index ? '' : ' latest'}" href="${e(item.url)}" target="_blank" rel="noopener" title="${e(title)}">${e(version)} <small>${e(String(item.sha256 || '').slice(0, 7))}</small></a>`;
            }).join('')}
          </div>
        </div>`;
    }).join(''));
  }
  relics.render();
}


/* NEXUS
 * nexus.json: the forks of this reliquary, each read once for its relics */
function nexus(record) {
  const list = Object.entries(record?.list || {});
  nexus.store.set('count', record ? `${list.length} nexus${list.length === 1 ? '' : 's'}` : '–');

  if (!record) {
    nexus.store.set('list', reliquary.empty('<i clip="warning"></i> nexus.json can not be read.'));
  } else if (!list.length) {
    nexus.store.set('list', reliquary.empty('No fork mapped yet — <code>php nexus update</code>'));
  } else {
    nexus.store.set('list', list.map(([name, fork], index) => `
      <div class="record">
        <div class="record-head">
          <h4><a href="https://github.com/${e(name)}" target="_blank" rel="noopener">${named(name)}</a></h4>
          <span class="state" id="nexus-${index}">reading…</span>
        </div>
        <span class="meta">${e(fork.owner || name.split('/')[0])}/* · ${e(fork.branch || 'main')}</span>
      </div>`).join(''));
  }
  nexus.render();

  // the relics of each fork, from its own relic.json
  list.forEach(async ([name, fork], index) => {
    const owner = String(fork.owner || name.split('/')[0]).toLowerCase();
    const theirs = fork.relic ? await reliquary.read(fork.relic) : null;
    const count = Object.keys(theirs?.list || {}).filter((key) => key.split('/')[0].toLowerCase() === owner).length;
    const label = document.getElementById(`nexus-${index}`);
    if (label) {
      label.textContent = theirs ? `${count} relic${count === 1 ? '' : 's'}` : 'not initiated';
      label.classList.toggle('ok', Boolean(theirs));
    }
  });
}


/* A W A K E N */
Exura.module(navbar);
Exura.module(hero);
Exura.module(relics);
Exura.module(nexus);

document.addEventListener("DOMContentLoaded", async () => {
  document.body.setAttribute("dark", true);

  // the navbar turns to glass once the page moves
  const bar = document.getElementById('navbar');
  const glass = () => bar.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', glass, { passive: true });
  glass();

  // copy a spell
  document.querySelectorAll('.spell .copy').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.nextElementSibling.textContent);
        button.textContent = 'copied';
        button.classList.add('done');
        setTimeout(() => { button.textContent = 'copy'; button.classList.remove('done'); }, 1400);
      } catch (error) {}
    });
  });

  navbar();
  hero(); // '–' until the records answer

  const [relic, links] = await Promise.all([reliquary.read('./relic.json'), reliquary.read('./nexus.json')]);
  reliquary.main = relic?.main || links?.main || reliquary.main;
  navbar();
  hero(relic, links);
  relics(relic);
  nexus(links);
});
