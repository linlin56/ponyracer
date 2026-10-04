// dictionnaires de traduction de l'application
// les paramètres sont notés {nom} et remplacés à l'affichage
export const fr = {
  'home.tagline': 'Le plaisir des paris hippiques, version poney',
  'home.login': 'Connexion',
  'home.register': 'Inscription',

  'menu.close': 'Fermer',
  'menu.races': 'Courses',
  'menu.logout': 'Déconnexion',
  'menu.language': 'Langue',

  'login.title': 'Connexion',
  'login.username': 'Identifiant',
  'login.password': 'Mot de passe',
  'login.submit': 'Se connecter',
  'login.error': 'Identifiant ou mot de passe incorrect.',

  'register.title': 'Inscription',
  'register.birthYear': 'Année de naissance',
  'register.submit': "S'inscrire",
  'register.alreadyRegistered': 'Déjà inscrit ? Se connecter',
  'register.error': 'Une erreur est survenue.',

  'races.title': 'Courses',
  'races.bet': 'Parier sur {name}',
  'races.empty': 'Aucune course disponible pour le moment. Réessayez plus tard.',

  'race.startsIn': 'Départ dans',
  'race.watchLive': 'Voir le direct',
  'race.clickToBet': 'Cliquez pour parier sur votre poney préféré',
  'race.betOn': 'Vous avez parié sur',
  'race.cancelBet': 'Annuler le pari',
  'race.loadError': 'Impossible de charger cette course.',
  'race.betPlaced': 'Pari placé sur {pony} ! Bonne chance.',
  'race.betCancelled': 'Pari annulé.',
  'race.cancelError': "Impossible d'annuler le pari.",

  'live.backToRaces': 'Retour aux courses',
  'live.finished': 'Course terminée !',
  'live.winners': 'Gagnant(s) :',
  'live.boostHint': 'Cliquez sur votre poney parié pour lui donner un coup de boost !',
  'live.unavailable': 'La course en direct est indisponible pour le moment.',
  'live.loadError': 'Impossible de charger la course en direct.',

  'fromNow.inSeconds': 'dans {seconds} secondes',
};

export type TranslationKey = keyof typeof fr;

// le typage garantit que chaque clé française a son équivalent anglais
export const en: Record<TranslationKey, string> = {
  'home.tagline': 'The thrill of horse betting, pony style',
  'home.login': 'Log in',
  'home.register': 'Sign up',

  'menu.close': 'Close',
  'menu.races': 'Races',
  'menu.logout': 'Log out',
  'menu.language': 'Language',

  'login.title': 'Log in',
  'login.username': 'Username',
  'login.password': 'Password',
  'login.submit': 'Log in',
  'login.error': 'Incorrect username or password.',

  'register.title': 'Sign up',
  'register.birthYear': 'Birth year',
  'register.submit': 'Sign up',
  'register.alreadyRegistered': 'Already registered? Log in',
  'register.error': 'Something went wrong.',

  'races.title': 'Races',
  'races.bet': 'Bet on {name}',
  'races.empty': 'No races available at the moment. Please try again later.',

  'race.startsIn': 'Starts in',
  'race.watchLive': 'Watch live',
  'race.clickToBet': 'Click to bet on your favorite pony',
  'race.betOn': 'You bet on',
  'race.cancelBet': 'Cancel bet',
  'race.loadError': 'Unable to load this race.',
  'race.betPlaced': 'Bet placed on {pony}! Good luck.',
  'race.betCancelled': 'Bet cancelled.',
  'race.cancelError': 'Unable to cancel the bet.',

  'live.backToRaces': 'Back to races',
  'live.finished': 'Race finished!',
  'live.winners': 'Winner(s):',
  'live.boostHint': 'Click on the pony you bet on to give it a boost!',
  'live.unavailable': 'The live race is unavailable at the moment.',
  'live.loadError': 'Unable to load the live race.',

  'fromNow.inSeconds': 'in {seconds} seconds',
};

export const translations = { fr, en };

export type Lang = keyof typeof translations;
