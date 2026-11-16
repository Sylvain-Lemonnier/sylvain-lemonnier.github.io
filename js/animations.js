/* Animations au défilement de la page d'accueil.
   - Le schéma « en boucle » se construit quand il arrive à l'écran.
   - Les légendes des captures apparaissent l'une après l'autre (téléphone).
   - Les chiffres du bandeau défilent de 0 à leur valeur.
   Le contenu reste visible sans JavaScript : les éléments ne sont masqués
   que lorsque ce script ajoute la classe « anime » sur <html>.
   Rien ne bouge si le visiteur a demandé moins d'animations. */

(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.documentElement.classList.add('anime');

  // Déclenche une seule fois, quand l'élément est bien entré dans l'écran
  function quandVisible(elements, action, marge) {
    const observateur = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (!entree.isIntersecting) return;
        observateur.unobserve(entree.target);
        action(entree.target);
      });
    }, { rootMargin: marge || '0px 0px -15% 0px' });
    elements.forEach(function (el) { observateur.observe(el); });
  }

  function rendreVisible(el) { el.classList.add('visible'); }

  // 1. Schéma de structure et 2. légendes des captures : le CSS fait le reste
  quandVisible(document.querySelectorAll('.structure, .capture__legendes'), rendreVisible);

  // 3. Chiffres du bandeau
  const nombres = document.querySelectorAll('.reperes__nombre');

  nombres.forEach(function (nombre) {
    const texte = nombre.textContent.trim();
    // Les lecteurs d'écran lisent la valeur finale, pas le décompte
    const lu = document.createElement('span');
    lu.className = 'visuellement-cache';
    lu.textContent = texte;
    nombre.before(lu);
    nombre.setAttribute('aria-hidden', 'true');
    // Largeur réservée pour que le bandeau ne bouge pas pendant le décompte
    nombre.style.minWidth = nombre.getBoundingClientRect().width + 'px';
    nombre.textContent = '–';   // tiret d'attente, avant le décompte
  });

  quandVisible(document.querySelectorAll('.reperes'), function () {
    nombres.forEach(function (nombre) {
      const texte = nombre.previousElementSibling.textContent;
      const cible = parseInt(texte, 10);
      const suffixe = texte.replace(/^\d+/, '');
      const attente = 1000;   // laisse le temps de découvrir la page avant de démarrer
      const duree = 3500;
      const debut = performance.now() + attente;

      function etape(maintenant) {
        if (maintenant < debut) { requestAnimationFrame(etape); return; }   // le tiret reste pendant l'attente
        const t = Math.min((maintenant - debut) / duree, 1);
        const ralenti = 1 - Math.pow(1 - t, 2);   // ralentit, en douceur, à l'approche de la cible
        nombre.textContent = Math.round(cible * ralenti) + (t === 1 ? suffixe : '');
        if (t < 1) requestAnimationFrame(etape);
      }
      requestAnimationFrame(etape);
    });
  }, '0px');   // le bandeau est souvent tout en bas de l'écran au chargement
})();
