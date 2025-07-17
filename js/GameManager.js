/**
 * GameManager - Main game controller that coordinates all systems
 */
class GameManager {
    constructor() {
        this.gameState = new GameState();
        this.patientManager = new PatientManager(this.gameState, this);
        this.treatmentManager = new TreatmentManager(this.gameState, this.patientManager, this);
        this.uiManager = new UIManager(this.gameState);
        
        // Set cross-references
        this.patientManager.setGameManager(this);
        this.treatmentManager.setGameManager(this);
        
        // Timers
        this.gameTimer = null;
        this.spawnTimer = null;
        this.patienceTimer = null;
        
        this.initializeEventListeners();
        this.uiManager.init();
    }
    
    initializeEventListeners() {
        // Event listeners for selecting patients
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('patient')) {
                this.patientManager.selectPatient(e.target.dataset.patientId);
            }
        });
    }
    
    startGame() {
        console.log('Game started!');
        
        // Reset all systems
        this.gameState.reset();
        this.patientManager.clearAll();
        this.treatmentManager.clearAllStations();
        this.uiManager.hideGameOverModal();
        this.uiManager.clearWaitingRoom();
        
        // Start timers
        this.startTimers();
        
        // Update UI
        this.uiManager.updateGameStats();
        this.uiManager.updateButtons('playing');
    }
    
    pauseGame() {
        if (this.gameState.isPlaying()) {
            this.gameState.pause();
            this.stopTimers();
            this.uiManager.updateButtons('paused');
        } else if (this.gameState.isPaused()) {
            this.gameState.resume();
            this.startTimers();
            this.uiManager.updateButtons('playing');
        }
    }
    
    restartGame() {
        this.stopTimers();
        this.gameState.stop();
        this.patientManager.clearAll();
        this.treatmentManager.clearAllStations();
        this.uiManager.hideGameOverModal();
        
        // Reset UI
        this.uiManager.updateGameStats();
        this.uiManager.updateButtons('stopped');
    }
    
    startTimers() {
        // Main game timer
        this.gameTimer = setInterval(() => {
            this.gameState.decreaseTime();
            this.uiManager.updateGameStats();
            
            if (this.gameState.isGameOver()) {
                this.endGame();
            }
        }, 1000);
        
        // Timer to generate patients
        this.spawnTimer = setInterval(() => {
            this.patientManager.spawnPatient();
        }, this.gameState.patientSpawnRate);
        
        // Timer to update patient patience
        this.patienceTimer = setInterval(() => {
            this.patientManager.updatePatience();
        }, 100);
        
        // Generate first patient immediately
        this.patientManager.spawnPatient();
    }
    
    stopTimers() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        if (this.spawnTimer) {
            clearInterval(this.spawnTimer);
            this.spawnTimer = null;
        }
        if (this.patienceTimer) {
            clearInterval(this.patienceTimer);
            this.patienceTimer = null;
        }
        
        // Stop all treatment timers
        this.treatmentManager.stopAllTreatments();
    }
    
    treatPatient(stationId) {
        const success = this.treatmentManager.treatPatient(stationId);
        if (success) {
            // The treatment was started successfully
            // The completion will be handled by TreatmentManager automatically
        }
    }
    
    onPatientTreatmentComplete(points, stationId) {
        // Show score popup
        this.uiManager.showScorePopup(points, stationId);
        
        // Check for level up
        if (this.gameState.shouldLevelUp()) {
            const newSpawnRate = this.gameState.levelUp();
            this.uiManager.showLevelUpNotification();
            
            // Restart spawn timer with new speed
            if (this.spawnTimer) {
                clearInterval(this.spawnTimer);
                this.spawnTimer = setInterval(() => {
                    this.patientManager.spawnPatient();
                }, newSpawnRate);
            }
        }
        
        // Update UI
        this.uiManager.updateGameStats();
    }
    
    onPatientLeaves(penalty) {
        // Apply penalty
        this.gameState.subtractScore(-penalty); // penalty is already negative
        
        // Show penalty popup
        this.uiManager.showScorePopup(penalty, 'penalty');
        
        // Update UI
        this.uiManager.updateGameStats();
    }
    
    endGame() {
        console.log(`Game over! Final score: ${this.gameState.score}`);
        
        this.gameState.stop();
        this.stopTimers();
        
        // Show game over modal
        this.uiManager.showGameOverModal();
        
        // Update buttons
        this.uiManager.updateButtons('stopped');
    }
}

// Global game instance for HTML onclick handlers
let game;

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    game = new GameManager();
    console.log('Clinic Rush loaded! Click "Start Game" to begin.');
});
