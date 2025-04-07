document.addEventListener('DOMContentLoaded', function() {
   
    const currentTipElement = document.getElementById('current-tip');
    const tipHistoryElement = document.getElementById('tip-history');
    const refreshButton = document.getElementById('refresh-tip');
    const countdownElement = document.getElementById('countdown');
    

    let countdownValue = 10;  
    let countdownInterval;
    let tipHistory = [];
    
    //Fetching the current tip
    function fetchCurrentTip() {
        fetch('/get_current_tip')
            .then(response => response.json())
            .then(data => {
                updateTipDisplay(data.tip, data.history);
                tipHistory = data.history;
            })
            .catch(error => {
                console.error('Error fetching tip:', error);
                currentTipElement.textContent = 'Unable to load tip. Please try again later.';
            });
    }
    
    //generating a new tip on demand
    function generateNewTip() {
    
        currentTipElement.innerHTML = '<div class="loading">Generating new tip <span class="dots">...</span></div>';
        refreshButton.disabled = true;
        
        fetch('/generate_new_tip')
            .then(response => response.json())
            .then(data => {
                updateTipDisplay(data.tip, data.history);
                tipHistory = data.history;
                
            
                resetCountdown();
                refreshButton.disabled = false;
            })
            .catch(error => {
                console.error('Error generating new tip:', error);
                currentTipElement.textContent = 'Unable to generate new tip. Please try again later.';
                refreshButton.disabled = false;
            });
    }
    
    //Updating the tip display
    function updateTipDisplay(tip, history) {
        // Updating the current tip with fade effect
        currentTipElement.style.opacity = '0';
        
        setTimeout(() => {
            currentTipElement.textContent = tip;
            currentTipElement.style.opacity = '1';
        }, 300);
        
        // Updating history
        tipHistoryElement.innerHTML = '';
        
        if (history.length <= 1) {
            
            const emptyMessage = document.createElement('div');     // Showing a message when history is empty
            emptyMessage.className = 'history-empty';
            emptyMessage.textContent = 'No history yet. Generate more tips to see them here!';
            tipHistoryElement.appendChild(emptyMessage);
        } else {
            // Reversing history so newest is at top and skip the current tip
            const displayHistory = [...history].reverse().slice(1);
            
            displayHistory.forEach((historyTip, index) => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.textContent = historyTip;
                tipHistoryElement.appendChild(historyItem);
                
                // Adding staggered animation
                setTimeout(() => {
                    historyItem.style.opacity = '1';
                }, 100 * index);
            });
        }
    }
    

    function resetCountdown() {
        
        clearInterval(countdownInterval);
        
        
        countdownValue = 10;  
        countdownElement.textContent = countdownValue;
        
       
        countdownInterval = setInterval(() => {
            countdownValue--;
            
            
            countdownElement.textContent = countdownValue;
            
            // When countdown reaches 0, fetching a new tip and reset
            if (countdownValue <= 0) {
                fetchCurrentTip();
                resetCountdown();
            }
        }, 1000);
    }
    
    
    refreshButton.addEventListener('click', generateNewTip);
    
    
    fetchCurrentTip();
    resetCountdown();
    
   
    setInterval(() => {
        if (countdownValue <= 3) {  
            countdownElement.classList.add('pulse');
        } else {
            countdownElement.classList.remove('pulse');
        }
    }, 1000);
});


document.head.insertAdjacentHTML('beforeend', `
<style>
    .loading .dots {
        animation: dotPulse 1.5s infinite;
    }
    
    @keyframes dotPulse {
        0% { opacity: 0.2; }
        20% { opacity: 1; }
        100% { opacity: 0.2; }
    }
    
    .pulse {
        animation: pulse 1s infinite;
        color: #f44336;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    #current-tip {
        transition: opacity 0.3s ease;
    }
    
    .history-item {
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    .history-empty {
        padding: 1rem;
        text-align: center;
        color: #999;
        font-style: italic;
    }
</style>
`);