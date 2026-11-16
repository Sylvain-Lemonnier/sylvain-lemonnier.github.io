/* Formulaire de contact : envoi à Web3Forms sans quitter la page.
   Sans JavaScript, le formulaire s'envoie quand même (page de Web3Forms). */
(function () {
  var formulaire = document.getElementById('formulaire-contact');
  if (!formulaire || !window.fetch) return;

  var statut = document.getElementById('formulaire-statut');
  var bouton = formulaire.querySelector('button[type="submit"]');

  function afficher(texte, type) {
    statut.textContent = texte;
    statut.className = 'formulaire__statut formulaire__statut--' + type;
  }

  formulaire.addEventListener('submit', function (evenement) {
    evenement.preventDefault();

    var donnees = new FormData(formulaire);
    if (donnees.get('access_key').indexOf('[') === 0) {
      afficher("Le formulaire n'est pas encore activé. Merci de réessayer plus tard.", 'erreur');
      return;
    }

    bouton.disabled = true;
    bouton.textContent = 'Envoi en cours…';
    afficher('', 'attente');

    fetch(formulaire.action, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: donnees
    })
      .then(function (reponse) { return reponse.json(); })
      .then(function (resultat) {
        if (resultat.success) {
          // Le formulaire et la phrase d'introduction laissent place à la seule confirmation
          var confirmation = document.getElementById('confirmation');
          var chapeau = document.getElementById('contact-chapeau');
          formulaire.reset();
          formulaire.hidden = true;
          if (chapeau) chapeau.hidden = true;
          confirmation.hidden = false;
          confirmation.focus();   // les lecteurs d'écran annoncent la confirmation
          window.scrollTo(0, 0);
        } else {
          throw new Error(resultat.message);
        }
      })
      .catch(function () {
        afficher("L'envoi n'a pas abouti. Vérifiez votre connexion et réessayez.", 'erreur');
      })
      .then(function () {
        bouton.disabled = false;
        bouton.textContent = 'Envoyer';
      });
  });
})();
