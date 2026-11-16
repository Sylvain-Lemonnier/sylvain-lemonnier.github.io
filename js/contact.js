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
          formulaire.reset();
          afficher('Merci, votre message est bien envoyé.', 'succes');
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
