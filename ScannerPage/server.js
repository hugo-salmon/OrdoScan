const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Fonction pour générer le fichier .ics
// Fonction pour générer le fichier .ics
function generateICS(medicationData) {
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN`;

    medicationData.forEach(med => {
        const { name, reminderTimes, endDate } = med;

        reminderTimes.forEach(time => {
            const [hours, minutes] = time.split(':');
            const eventStart = new Date();
            eventStart.setHours(hours);
            eventStart.setMinutes(minutes);
            eventStart.setSeconds(0);

            // Format de la date et de l'heure pour l'événement (YYYYMMDDTHHMMSS)
            const startTime = formatDateToICS(eventStart);

            // Ajouter la date de fin pour la règle de récurrence
            const endDateObj = new Date(endDate);
            endDateObj.setHours(23, 59, 59);
            const endDateFormatted = formatDateToICS(endDateObj);

            icsContent += `
BEGIN:VEVENT
SUMMARY:Rappel - ${name}
DTSTART:${startTime}
DTEND:${startTime}
RRULE:FREQ=DAILY;UNTIL=${endDateFormatted}
DESCRIPTION:Rappel pour prendre le médicament ${name} à ${time}.
END:VEVENT`;
        });
    });

    icsContent += `
END:VCALENDAR`;

    return icsContent;
}


function formatDateToICS(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

app.post('/create-ics', (req, res) => {
    const { medicationData, recipientEmail } = req.body;
    const icsContent = generateICS(medicationData);
    const filePath = path.join(__dirname, 'rappels_medication.ics');

    fs.writeFile(filePath, icsContent, (err) => {
        if (err) {
            console.error('Erreur lors de la création du fichier .ics :', err);
            return res.status(500).send({ message: 'Erreur lors de la création du fichier .ics' });
        }

        const icsUrl = `http://localhost:${port}/download/rappels_medication.ics`;
        sendEmailWithICS(recipientEmail, icsUrl, medicationData, res); // On passe les données des médicaments ici.
    });
});


function sendEmailWithICS(email, icsUrl, medicationData, res) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'salmon.hugo69330@gmail.com',
            pass: 'cleu fufd ghyc xmad',
        },
    });

    // Construire le contenu de l'email avec les détails des médicaments
    let emailContent = `Bonjour,\n\nVous trouverez ci-dessous les détails de vos médicaments et leurs rappels :\n\n`;

    medicationData.forEach((med, index) => {
        emailContent += `Médicament ${index + 1} :
- Nom : ${med.name}
- Dosage : ${med.dosage || 'Non spécifié'}
- Heures de rappel : ${med.reminderTimes.length > 0 ? med.reminderTimes.join(', ') : 'Aucune heure de rappel spécifiée'}
- Date de fin : ${med.endDate || 'Non spécifiée'}
- Notes : ${med.notes || 'Aucune note spécifiée'}

`;
    });

    emailContent += `\nVous pouvez télécharger votre fichier de rappel pour les médicaments via le lien suivant : ${icsUrl}\n\nCordialement,\nL'équipe OrdoScan`;

    const mailOptions = {
        from: 'salmon.hugo69330@gmail.com',
        to: email,
        subject: 'Récapitulatif de vos médicaments - Téléchargez votre fichier de rappel',
        text: emailContent,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Erreur lors de l\'envoi de l\'email :', error);
            res.status(500).send({ message: 'Erreur lors de l\'envoi de l\'email' });
        } else {
            console.log('Email envoyé avec succès :', info.response);
            res.status(200).send({ message: 'Email envoyé avec le lien du fichier .ics' });
        }
    });
}



app.get('/download/rappels_medication.ics', (req, res) => {
    const filePath = path.join(__dirname, 'rappels_medication.ics');
    res.download(filePath, 'rappels_medication.ics', (err) => {
        if (err) {
            console.error('Erreur lors du téléchargement du fichier .ics :', err);
            res.status(500).send({ message: 'Erreur lors du téléchargement du fichier .ics' });
        }
    });
});

app.listen(port, () => {
    console.log(`Serveur en écoute sur le port ${port}`);
});
