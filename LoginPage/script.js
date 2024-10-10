const twilio = require('twilio');

const numeroPhone= document.getElementById('test');
const accountSid = 'TON_ACCOUNT_SID';
const authToken = 'TON_AUTH_TOKEN';
const client = twilio(accountSid, authToken);

// Fonction pour envoyer un SMS
function sendSms(to, message) {
  client.messages
  .create({
    body: message,
    from:numeroPhone,  // Ton numéro Twilio
    to: to,  // Numéro du destinataire
  })
  .then(message => console.log(`Message envoyé avec SID: ${message.sid}`))
  .catch(error => console.error('Erreur lors de l\'envoi du message:', error));
}

// Exemple d'envoi
sendSms(numeroPhone, 'Voici une notification depuis Twilio');
