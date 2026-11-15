/* Visionneuse plein écran des captures.
   Un bouton « Agrandir » (ou un clic sur l'image) ouvre la capture
   en pleine résolution dans une fenêtre <dialog>.
   Dans la visionneuse : clic sur l'image = zoom, clic à côté,
   bouton ✕ ou touche Échap = fermeture. */

(function () {
  const visionneuse = document.querySelector('.visionneuse');
  if (!visionneuse || typeof visionneuse.showModal !== 'function') return;

  const image = visionneuse.querySelector('.visionneuse__image');
  const zone = visionneuse.querySelector('.visionneuse__zone');
  let boutonOrigine = null;

  function ouvrir(bouton) {
    const miniature = bouton.closest('.capture__cadre').querySelector('img');
    boutonOrigine = bouton;
    image.src = bouton.dataset.pleinEcran;
    image.alt = miniature.alt;
    visionneuse.classList.remove('visionneuse--zoom');
    document.documentElement.classList.add('sans-defilement');
    visionneuse.showModal();
  }

  function fermer() {
    visionneuse.close();
  }

  // Ouverture : bouton « Agrandir » ou clic sur la miniature
  document.querySelectorAll('.capture__agrandir').forEach(function (bouton) {
    bouton.addEventListener('click', function () { ouvrir(bouton); });
    const miniature = bouton.closest('.capture__cadre').querySelector('img');
    miniature.addEventListener('click', function () { ouvrir(bouton); });
  });

  // Clic sur l'image : bascule entre « ajusté à l'écran » et « taille réelle »
  image.addEventListener('click', function (e) {
    e.stopPropagation();
    visionneuse.classList.toggle('visionneuse--zoom');
  });

  // Clic à côté de l'image, ou sur ✕ : fermeture
  zone.addEventListener('click', fermer);
  visionneuse.querySelector('.visionneuse__fermer').addEventListener('click', fermer);

  // À la fermeture (y compris par Échap) : on rend la page et le focus
  visionneuse.addEventListener('close', function () {
    document.documentElement.classList.remove('sans-defilement');
    image.removeAttribute('src');
    if (boutonOrigine) boutonOrigine.focus();
  });
})();
