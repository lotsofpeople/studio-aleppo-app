const functions = require('firebase-functions');
const admin = require('firebase-admin');
const handlebars = require('handlebars');

admin.initializeApp(functions.config().firebase);

const fileContents = require('fs').readFileSync(__dirname + '/index.hbs').toString();
var template = handlebars.compile(fileContents);

exports.render = functions.https.onRequest((req, res) => {
  let params = req.url.split(/\//g).splice(1);

  let galleryId = params[1];
  var db = admin.database().ref('/gallery-metadata/' + galleryId);
  
  db.once('value', function(snapshot) {
    let galleryData = snapshot.val();
    let statusCode = 200;
    let templateData = {
      title: 'Studio-Aleppo',
      description: 'Picturing (new) European citizens'
    };

    if(galleryData) {
      templateData = {
        title: galleryData.author + "'s gallery",
        description: "Picturing (new) European citizens",
        imageUrl: `https://api.studioaleppo.nl/wp-content/uploads/2017/09/Share_Aleppo.png`
      }
    }

    if(galleryId !== undefined && (!galleryData)) {
      statusCode = 404;
    }

    var html = template(templateData)
      .replace(/\&#x3D\;/g, '=')
      .replace(/\&amp\;/g, '&');

    res.status(statusCode).send(html);
  });

});