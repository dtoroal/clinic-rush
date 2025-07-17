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
        this.gameTime = 25; // seconds
        this.timeLeft = this.gameTime;

        // Game configuration
        this.maxPatients = 4;
        this.patientSpawnRate = 2000; // milliseconds
        this.treatmentTime = {
            'consultation': 2000, // General Consultation - 2 seconds
            'surgery': 4000, // Surgery - 4 seconds
            'radiology': 3000, // Radiology - 3 seconds
            'emergency': 1500  // Emergency - 1.5 seconds
        };

        // Patient types configuration
        this.patientTypes = [
            { name: 'General Consultation', type: 'general', station: 'consultation', patience: 15000, points: 10 },
            { name: 'Surgery', type: 'surgery', station: 'surgery', patience: 20000, points: 25 },
            { name: 'Radiology', type: 'radiology', station: 'radiology', patience: 18000, points: 20 },
            { name: 'Emergency', type: 'emergency', station: 'emergency', patience: 3000, points: 50 }
        ];

        this.patientNames = [
            'Emily Smith', 'James Johnson', 'Olivia Brown', 'Michael Davis', 'Sophia Wilson',
            'Daniel Miller', 'Emma Taylor', 'William Anderson', 'Ava Thomas', 'John Moore',
            'Lily Jackson', 'David White', 'Chloe Harris', 'Jhon Martin', 'Grace Lewis'
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
        this.addTimeBonus(20); // Time bonus for level up
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
