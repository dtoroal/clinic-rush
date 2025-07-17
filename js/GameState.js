/**
 * GameState - Manages the core game state and configuration
 */
class GameState {
    constructor() {
        // Game state
        this.gameState = 'stopped'; // 'stopped', 'playing', 'paused'
        this.score = 0;
        this.level = 1;
        this.patientsServed = 0;
        this.gameTime = 60; // seconds
        this.timeLeft = this.gameTime;
        
        // Game configuration
        this.maxPatients = 6;
        this.patientSpawnRate = 3000; // milliseconds
        this.treatmentTime = {
            1: 2000, // General Consultation - 2 seconds
            2: 4000, // Specialized Medicine - 4 seconds
            3: 1500  // Emergency - 1.5 seconds
        };
        
        // Patient types configuration
        this.patientTypes = [
            { name: 'General Consultation', type: 'general', station: 1, patience: 15000, points: 10 },
            { name: 'Specialist', type: 'specialist', station: 2, patience: 20000, points: 25 },
            { name: 'Emergency', type: 'emergency', station: 3, patience: 8000, points: 50 }
        ];
        
        this.patientNames = [
            'Anna Garcia', 'Louis Martin', 'Mary Lopez', 'Charles Ruiz', 'Elena Diaz',
            'Peter Sanchez', 'Laura Gonzalez', 'Michael Torres', 'Carmen Vega', 'Joseph Morales',
            'Isabel Ramos', 'Anthony Herrera', 'Rose Jimenez', 'Francis Castro', 'Pilar Ortega'
        ];
    }
    
    reset() {
        this.gameState = 'playing';
        this.score = 0;
        this.level = 1;
        this.patientsServed = 0;
        this.timeLeft = this.gameTime;
    }
    
    isPlaying() {
        return this.gameState === 'playing';
    }
    
    isPaused() {
        return this.gameState === 'paused';
    }
    
    pause() {
        this.gameState = 'paused';
    }
    
    resume() {
        this.gameState = 'playing';
    }
    
    stop() {
        this.gameState = 'stopped';
    }
    
    addScore(points) {
        this.score += points;
    }
    
    subtractScore(points) {
        this.score = Math.max(0, this.score - points);
    }
    
    incrementPatientsServed() {
        this.patientsServed++;
    }
    
    decreaseTime() {
        this.timeLeft--;
    }
    
    addTimeBonus(seconds) {
        this.timeLeft += seconds;
    }
    
    levelUp() {
        this.level++;
        this.addTimeBonus(30); // Time bonus for level up
        this.patientSpawnRate = Math.max(1500, this.patientSpawnRate - 200); // Faster spawning
        console.log(`Level ${this.level} reached!`);
        return this.patientSpawnRate;
    }
    
    shouldLevelUp() {
        const requiredPatients = this.level * 5;
        return this.patientsServed >= requiredPatients;
    }
    
    isGameOver() {
        return this.timeLeft <= 0;
    }
}
