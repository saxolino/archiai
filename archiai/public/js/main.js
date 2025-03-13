// main.js - Da inserire nella pagina HTML o da caricare come file separato
document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    
    // URL del backend
    const API_URL = 'http://localhost:3000/api/query';
    
    // Funzione per aggiungere un messaggio alla chat
    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        // Se non è un messaggio utente, potrebbe contenere HTML (per i prodotti)
        if (!isUser) {
            messageDiv.innerHTML = message;
        } else {
            messageDiv.textContent = message;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Funzione per creare la griglia di prodotti
    function createProductsGrid(products) {
        if (!products || products.length === 0) return '';
        
        let gridHTML = '<div class="products-grid">';
        
        products.forEach(product => {
            const imageUrl = product.immagini && product.immagini.length > 0 
                ? product.immagini[0] 
                : '/api/placeholder/200/180';
            
            gridHTML += `
                <div class="product-card">
                    <img src="${imageUrl}" alt="${product.nome}" class="product-image">
                    <div class="product-info">
                        <div class="product-name">${product.nome}</div>
                        <div class="product-price">€${product.prezzo.toFixed(2)}</div>
                    </div>
                </div>
            `;
        });
        
        gridHTML += '</div>';
        return gridHTML;
    }
    
    // Funzione per inviare la query al backend
    async function sendQuery(query) {
        // Mostra messaggio di caricamento
        const loadingMsgId = 'loading-' + Date.now();
        addMessage('<div id="' + loadingMsgId + '">Sto cercando i prodotti migliori per te...</div>', false);
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            });
            
            const data = await response.json();
            
            // Rimuovi messaggio di caricamento
            const loadingMsg = document.getElementById(loadingMsgId);
            if (loadingMsg) loadingMsg.remove();
            
            // Mostra la risposta e i prodotti
            let responseHTML = data.response;
            
            if (data.products && data.products.length > 0) {
                responseHTML += createProductsGrid(data.products);
            }
            
            addMessage(responseHTML, false);
            
        } catch (error) {
            console.error('Errore nella richiesta:', error);
            
            // Rimuovi messaggio di caricamento
            const loadingMsg = document.getElementById(loadingMsgId);
            if (loadingMsg) loadingMsg.remove();
            
            addMessage('Mi dispiace, si è verificato un errore durante la ricerca dei prodotti. Riprova tra poco.', false);
        }
    }
    
    // Funzione per gestire l'invio del messaggio
    function handleSendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;
        
        // Aggiungi messaggio utente alla chat
        addMessage(message, true);
        
        // Invia la query al backend
        sendQuery(message);
        
        // Pulisci il campo di input
        userInput.value = '';
    }
    
    // Event listeners
    sendButton.addEventListener('click', handleSendMessage);
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });
});
