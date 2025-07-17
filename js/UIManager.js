/**
 * UIManager - Handles all UI updates and visual effects
 */
class UIManager {
    constructor(gameState) {
        this.gameState = gameState;
    }
    
    updateGameStats() {
        document.getElementById('score').textContent = this.gameState.score;
        document.getElementById('patients-served').textContent = this.gameState.patientsServed;
        document.getElementById('level').textContent = this.gameState.level;
        document.getElementById('timer').textContent = this.gameState.timeLeft;
    }
    
    updateButtons(gameState) {
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const restartBtn = document.getElementById('restart-btn');
        
        switch (gameState) {
            case 'playing':
                startBtn.disabled = true;
                pauseBtn.disabled = false;
                pauseBtn.textContent = 'Pause';
                restartBtn.disabled = false;
                break;
            case 'paused':
                startBtn.disabled = true;
                pauseBtn.disabled = false;
                pauseBtn.textContent = 'Continue';
                restartBtn.disabled = false;
                break;
            case 'stopped':
                startBtn.disabled = false;
                pauseBtn.disabled = true;
                pauseBtn.textContent = 'Pause';
                restartBtn.disabled = true;
                break;
        }
    }
    
    showScorePopup(points, location) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = points > 0 ? `+${points}` : `${points}`;
        popup.style.color = points > 0 ? '#28a745' : '#dc3545';
        
        // Position the popup
        let targetElement;
        if (location === 'penalty') {
            targetElement = document.getElementById('waiting-patients');
        } else {
            targetElement = document.getElementById(`station-${location}`);
        }
        
        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            popup.style.position = 'fixed';
            popup.style.left = `${rect.left + rect.width / 2}px`;
            popup.style.top = `${rect.top}px`;
            popup.style.zIndex = '1000';
            
            document.body.appendChild(popup);
            
            setTimeout(() => {
                popup.remove();
            }, 1000);
        }
    }
    
    showGameOverModal() {
        document.getElementById('final-score').textContent = this.gameState.score;
        document.getElementById('final-patients').textContent = this.gameState.patientsServed;
        document.getElementById('final-level').textContent = this.gameState.level;
        document.getElementById('game-over-modal').classList.remove('hidden');
    }
    
    hideGameOverModal() {
        document.getElementById('game-over-modal').classList.add('hidden');
    }
    
    clearWaitingRoom() {
        // Clear the new waiting zone
        const waitingZone = document.getElementById('waiting-zone');
        if (waitingZone) {
            waitingZone.innerHTML = '';
        }
        
        // Clear the corridor path
        const corridorPath = document.getElementById('corridor-path');
        if (corridorPath) {
            corridorPath.innerHTML = '';
        }
        
        // Also clear the old waiting-patients container if it exists (for backwards compatibility)
        const container = document.getElementById('waiting-patients');
        if (container) {
            container.innerHTML = '';
        }
    }
    
    showLevelUpNotification() {
        const notification = document.createElement('div');
        notification.className = 'level-notification';
        notification.innerHTML = `
            <div class="level-notification-content">
                <h3>🎉 Level Up!</h3>
                <p>Level ${this.gameState.level}</p>
                <p>+30 seconds bonus!</p>
            </div>
        `;
        
        notification.style.position = 'fixed';
        notification.style.top = '50%';
        notification.style.left = '50%';
        notification.style.transform = 'translate(-50%, -50%)';
        notification.style.background = 'linear-gradient(45deg, #4facfe, #00f2fe)';
        notification.style.color = 'white';
        notification.style.padding = '20px';
        notification.style.borderRadius = '15px';
        notification.style.textAlign = 'center';
        notification.style.zIndex = '2000';
        notification.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
        notification.style.animation = 'bounceIn 0.6s ease-out';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }
    
    addNotificationStyles() {
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes bounceIn {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
                    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
                    70% { transform: translate(-50%, -50%) scale(0.9); }
                    100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
                
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                
                .level-notification-content h3 {
                    margin: 0 0 10px 0;
                    font-size: 1.5em;
                }
                
                .level-notification-content p {
                    margin: 5px 0;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    init() {
        this.addNotificationStyles();
        this.updateGameStats();
        this.updateButtons('stopped');
    }
}
