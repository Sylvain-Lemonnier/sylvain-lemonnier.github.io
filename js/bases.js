/* Schéma interactif des bases Notion (accueil) : une carte à deux faces.
   - Recto : le portefeuille d'initiatives au centre, les quatre familles autour.
   - Un clic sur une famille retourne la carte en 3D ; au verso, ses bases
     surgissent de la profondeur, puis leurs relations se tracent.
   - Le bouton « ← Retour » retourne la carte dans l'autre sens.
   - Sur ordinateur, la carte s'incline légèrement en suivant la souris.
   Sans JavaScript, le recto et le détail des familles s'affichent l'un sous l'autre.
   Si le visiteur a demandé moins d'animations, tout change sans mouvement. */

(function () {
  const bloc = document.querySelector('.bases');
  if (!bloc) return;

  const NS = 'http://www.w3.org/2000/svg';
  const scene = bloc.querySelector('.bases__scene');
  const carte = bloc.querySelector('.bases__carte');
  const recto = bloc.querySelector('.bases__face--recto');
  const verso = bloc.querySelector('.bases__face--verso');
  const etoile = bloc.querySelector('.bases__etoile');
  const pivot = bloc.querySelector('.bases__pivot');
  const familles = Array.prototype.slice.call(bloc.querySelectorAll('button.bases__famille'));
  const vues = Array.prototype.slice.call(bloc.querySelectorAll('.bases__vue'));
  const retour = bloc.querySelector('.bases__retour');
  const mouvement = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  bloc.classList.add('bases--js');
  vues.forEach(function (vue) { vue.hidden = true; });
  verso.inert = true;

  // --- Tracé des liens ---
  // Positions prises dans la mise en page (offsetLeft…), pas à l'écran :
  // elles restent justes même quand la carte est inclinée ou retournée.
  function centre(el) {
    return { x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight / 2 };
  }

  function placer(trait, a, b) {
    const p = centre(a);
    const q = centre(b);
    trait.setAttribute('x1', p.x);
    trait.setAttribute('y1', p.y);
    trait.setAttribute('x2', q.x);
    trait.setAttribute('y2', q.y);
    trait.style.setProperty('--longueur', Math.hypot(q.x - p.x, q.y - p.y) + 'px');
  }

  function nouveauTrait(svg, classe) {
    const trait = document.createElementNS(NS, 'line');
    trait.setAttribute('class', classe);
    svg.appendChild(trait);
    return trait;
  }

  // Recto : un trait du pivot vers chaque famille
  const svgEtoile = etoile.querySelector('.bases__liens');
  const traitsEtoile = familles.map(function (famille) {
    return nouveauTrait(svgEtoile, 'bases__lien');
  });

  function tracerEtoile() {
    familles.forEach(function (famille, i) { placer(traitsEtoile[i], pivot, famille); });
  }

  // Verso : un trait par relation listée dans la vue
  vues.forEach(function (vue) {
    const graphe = vue.querySelector('.bases__graphe');
    const svg = graphe.querySelector('.bases__liens');
    vue._traits = Array.prototype.map.call(vue.querySelectorAll('.bases__aretes li'), function (li) {
      return {
        trait: nouveauTrait(svg, 'bases__lien'),
        de: graphe.querySelector('[data-id="' + li.dataset.de + '"]'),
        vers: graphe.querySelector('[data-id="' + li.dataset.vers + '"]')
      };
    });
  });

  function tracerVue(vue) {
    vue._traits.forEach(function (t) { placer(t.trait, t.de, t.vers); });
  }

  let vueActive = null;
  function toutTracer() {
    tracerEtoile();
    if (vueActive) tracerVue(vueActive);
  }

  toutTracer();
  if ('ResizeObserver' in window) {
    new ResizeObserver(toutTracer).observe(carte);
  } else {
    window.addEventListener('resize', toutTracer);
  }

  // --- Retournement de la carte ---
  let familleChoisie = null;

  function ouvrir(famille) {
    familleChoisie = famille;
    const nom = famille.dataset.famille;
    vues.forEach(function (vue) { vue.hidden = vue.dataset.famille !== nom; });
    vueActive = vues.filter(function (vue) { return !vue.hidden; })[0];
    tracerVue(vueActive);

    if (mouvement) {
      // Départ : bases au fond, liens non tracés ; l'entrée démarre à mi-retournement
      vueActive.classList.add('entree');
      const noeuds = vueActive.querySelectorAll('.noeud');
      noeuds.forEach(function (noeud, i) { noeud.style.transitionDelay = (i * 0.07) + 's'; });
      vueActive._traits.forEach(function (t, i) {
        t.trait.style.transitionDelay = (noeuds.length * 0.07 + 0.2 + i * 0.06) + 's';
      });
      setTimeout(function () { vueActive.classList.remove('entree'); }, 380);
    }

    arreterInclinaison();
    carte.classList.add('retournee');
    recto.inert = true;
    verso.inert = false;
    setTimeout(function () { retour.focus({ preventScroll: true }); }, mouvement ? 500 : 0);
  }

  function fermer() {
    arreterInclinaison();
    carte.classList.remove('retournee');
    verso.inert = true;
    recto.inert = false;
    if (familleChoisie) familleChoisie.focus({ preventScroll: true });
  }

  familles.forEach(function (famille) {
    famille.addEventListener('click', function () { ouvrir(famille); });
  });
  retour.addEventListener('click', fermer);
  bloc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && carte.classList.contains('retournee')) fermer();
  });

  // --- Inclinaison au survol (souris uniquement) ---
  let pause = false;   // pas d'inclinaison pendant un retournement
  function arreterInclinaison() {
    pause = true;
    carte.classList.remove('suit');
    carte.style.setProperty('--incl-x', '0deg');
    carte.style.setProperty('--incl-y', '0deg');
    setTimeout(function () { pause = false; }, 950);
  }

  if (mouvement && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    scene.addEventListener('pointermove', function (e) {
      if (pause) return;
      const r = scene.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;    // de -0,5 à 0,5
      const y = (e.clientY - r.top) / r.height - 0.5;
      const sens = carte.classList.contains('retournee') ? -1 : 1;
      carte.classList.add('suit');
      carte.style.setProperty('--incl-y', (x * 8 * sens) + 'deg');
      carte.style.setProperty('--incl-x', (-y * 6) + 'deg');
    });
    scene.addEventListener('pointerleave', function () {
      if (pause) return;
      carte.classList.remove('suit');
      carte.style.setProperty('--incl-x', '0deg');
      carte.style.setProperty('--incl-y', '0deg');
    });
  }

  // --- Construction du recto à l'arrivée à l'écran ---
  if (!mouvement || !('IntersectionObserver' in window)) return;

  bloc.classList.add('bases--anime');
  pivot.style.transitionDelay = '0s';
  familles.forEach(function (famille, i) {
    traitsEtoile[i].style.transitionDelay = (0.35 + i * 0.2) + 's';
    famille.style.transitionDelay = (0.6 + i * 0.2) + 's';
  });

  const observateur = new IntersectionObserver(function (entrees) {
    if (!entrees[0].isIntersecting) return;
    observateur.disconnect();
    bloc.classList.add('visible');
    // Une fois construit, le recto retrouve ses transitions normales (survol)
    setTimeout(function () {
      bloc.classList.remove('bases--anime', 'visible');
      pivot.style.transitionDelay = '';
      familles.forEach(function (famille, i) {
        famille.style.transitionDelay = '';
        traitsEtoile[i].style.transitionDelay = '';
      });
    }, 2000);
  }, { rootMargin: '0px 0px -20% 0px' });
  observateur.observe(etoile);
})();
