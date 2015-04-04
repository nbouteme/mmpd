Manager for Music Player Daemon
===============================

Une version live est/sera présente à
[cette adresse](http://music.kuriyama.moe).N'oubliez pas qu'il s'agit
d'un *client*, et non pas d'un lecteur de musique, mpd estle programme
qui produit le son. Sur le port [8000](http://kuriyama.moe:8000/) du
lienci-dessus, il y a un stream HTTP de la musique jouée, vous pouvez
le lire à partir d'un navigateur, mais je recommende d'utiliser un
lecteur à part entière pour réduire d'éventuels délais.

Configuration
-------------

Je suppose qu'une machine est sur le réseau et dispose du music player
daemon configuré et fonctionnel.

Le serveur qui exécute le script PHP n'est pas forcément celui qui
exécute mpd.  Il suffit d'autoriser n'importe qui à se connecter à MPD
avec `bind_to_address "0.0.0.0:6600"` que je ne recommende que si la
machine est isolé d'internet. Dans le cas contraire, utiliser un
socket unix avec `bind_to_address "/var/lib/mpd/socket"` Il faudra
modifier le fichier app/Config.ini en mettant Type à tcp ou unix,
selon les as, et Address au 'nom d'hote:port' ou bien au chemin vers
le socket unix.

Il faut aussi que MusicDir corresponde au dossier dans lequel se
trouve vos musiques, et qu'il soit accessible en lecture par
l'utilisateur http.

Aussi, lancez `composer install` à la racine du projet pour les
dépendances PHP.

C'est théorique et non testé.

nginx doit rediriger toutes les requetes vers index.php, utilisez
try_files, je ne sais pas du tout si le projet fonctionnera sous
Apache.

Lancement
---------

Au premier chargement de la page, le script va générer les couvertures
de tout vos morceaux, puis les placer dans un cache, ce qui pourrait
causer un premier démarrage un peu lent.

L'acces n'est pas protégé car il est destiné à un usage local.

Utilisation
-----------

En bas vous avez les controles, pour mettre en pause la musique,
passer à la suivante et précedente, normal..., ainsi qu'un slider pour
seek dans le morceau.  En haut à gauche, vous choisissez le type de
classement, bibliothèque entière, artistes, albums, ou playlists.  En
haut à droite, vous définnissez des option tel que la répétition ou la
lecture aléatoire.  Sur chaque morceau, vous pouvez voir les artistes
ou albums associés, les télécharger, ou les ajouter à des playlists.
Sur l'ecran de playlist, vous pourrez supprimer vos playlists, ou
supprimer des morceau de vos playslists ou autres.

Dépendances
-----------

Le php n'a été testé que sur la dernière version stable, il dépend sur
hoa/eventsource, car à priori mon implémentation des SSE ne s'arrete
pas à la fermeture de la connexion et fais DOS le pool PHP, j'ai beau
lire leur code, je vois pas la différence avec le mien...  Il dépends
bien évidemment sur mpd, mais aussi ffmpeg pour l'extraction des
images de couvertures.
