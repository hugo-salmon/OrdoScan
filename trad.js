document.addEventListener("DOMContentLoaded", () => {
    const selectLangue = document.getElementById('langue');
    
    // Fonction pour parcourir le DOM et traduire les nœuds de texte
    function translatePageText(targetLang) {
        const textNodes = [];
        
        // Fonction pour extraire les nœuds texte du DOM
        function getTextNodes(node) {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                textNodes.push(node);
            } else {
                node.childNodes.forEach(getTextNodes);
            }
        }
        
        // Récupère tous les nœuds de texte
        getTextNodes(document.body);
        
        // Prépare le texte à envoyer à l'API
        const textToTranslate = textNodes.map(node => node.textContent).join("\n");
        
        // Envoie le texte à l'API pour traduction
        translateText(textToTranslate, targetLang).then(translatedText => {
            const translatedLines = translatedText.split("\n");
            
            // Remplace chaque nœud de texte avec la traduction correspondante
            textNodes.forEach((node, index) => {
                if (translatedLines[index]) {
                    node.textContent = translatedLines[index];
                }
            });
        }).catch(error => {
            console.error('Erreur lors de la traduction:', error);
        });
    }
    
    // Fonction pour traduire du texte avec l'API Deepl
    async function translateText(text, targetLang) {
        const apiKey = 'b9128e9b-82e5-411c-92c5-3721b32a94a1:fx'; // Remplacez par votre clé API Deepl
        const url = 'https://api-free.deepl.com/v2/translate';
        
        const formData = new URLSearchParams();
        formData.append('auth_key', apiKey);
        formData.append('text', text);
        formData.append('target_lang', targetLang);
        
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de la traduction : ' + response.status);
        }
        
        const data = await response.json();
        return data.translations[0].text;
    }
    
    // Changer de langue et traduire toute la page
    selectLangue.addEventListener('change', (event) => {
        const selectedLang = event.target.value;
        translatePageText(selectedLang);
    });
});
