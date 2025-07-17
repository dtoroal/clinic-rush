/**
 * Clinic Rush - Hospital Management Game
 * A game where you have to treat patients before they get angry and leave
 */

class ClinicGame {
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
        
        // Arrays to manage state
        this.patients = [];
        this.selectedPatient = null;
        this.treatmentStations = {
            1: { occupied: false, patientId: null, timer: null },
            2: { occupied: false, patientId: null, timer: null },
            3: { occupied: false, patientId: null, timer: null }
        };
        
        // Timers
        this.gameTimer = null;
        this.spawnTimer = null;
        this.patienceTimer = null;
        
        // Patient types
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
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Event listeners for selecting patients
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('patient')) {
                this.selectPatient(e.target.dataset.patientId);
            }
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.level = 1;
        this.patientsServed = 0;
        this.timeLeft = this.gameTime;
        this.patients = [];
        this.selectedPatient = null;
        
        // Clear stations
        Object.keys(this.treatmentStations).forEach(stationId => {
            this.clearStation(stationId);
        });
        
        // Clear patient container
        document.getElementById('waiting-patients').innerHTML = '';
        
        // Hide modal
        document.getElementById('game-over-modal').classList.add('hidden');
        
        // Update UI
        this.updateUI();
        
        // Start timers
        this.startTimers();
        
        // Update buttons
        document.getElementById('start-btn').disabled = true;
        document.getElementById('pause-btn').disabled = false;
        
        console.log('Game started!');
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.stopTimers();
            document.getElementById('pause-btn').textContent = 'Continue';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.startTimers();
            document.getElementById('pause-btn').textContent = 'Pause';
        }
    }
    
    restartGame() {
        this.stopTimers();
        this.gameState = 'stopped';
        document.getElementById('start-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
        document.getElementById('pause-btn').textContent = 'Pause';
        document.getElementById('game-over-modal').classList.add('hidden');
        
        // Reset UI
        this.updateUI();
    }
    
    startTimers() {
        // Main game timer
        this.gameTimer = setInterval(() => {
            this.timeLeft--;
            this.updateUI();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
        
        // Timer to generate patients
        this.spawnTimer = setInterval(() => {
            this.spawnPatient();
        }, this.patientSpawnRate);
        
        // Timer to update patient patience
        this.patienceTimer = setInterval(() => {
            this.updatePatience();
        }, 100);
        
        // Generate first patient immediately
        this.spawnPatient();
    }
    
    stopTimers() {
        if (this.gameTimer) clearInterval(this.gameTimer);
        if (this.spawnTimer) clearInterval(this.spawnTimer);
        if (this.patienceTimer) clearInterval(this.patienceTimer);
        
        // Clear treatment timers
        Object.values(this.treatmentStations).forEach(station => {
            if (station.timer) clearTimeout(station.timer);
        });
    }
    
    spawnPatient() {
        if (this.patients.length >= this.maxPatients || this.gameState !== 'playing') {
            return;
        }
        
        const patientType = this.getRandomPatientType();
        const patient = {
            id: Date.now() + Math.random(),
            name: this.getRandomName(),
            type: patientType.type,
            station: patientType.station,
            typeName: patientType.name,
            patience: patientType.patience,
            maxPatience: patientType.patience,
            points: patientType.points,
            spawnTime: Date.now()
        };
        
        this.patients.push(patient);
        this.renderPatient(patient);
        
        console.log(`New patient: ${patient.name} (${patient.typeName})`);
    }
    
    getRandomPatientType() {
        // Adjust probabilities based on level
        const weights = [0.5, 0.3, 0.2]; // General, Specialist, Emergency
        const random = Math.random();
        let weightSum = 0;
        
        for (let i = 0; i < weights.length; i++) {
            weightSum += weights[i];
            if (random <= weightSum) {
                return this.patientTypes[i];
            }
        }
        
        return this.patientTypes[0];
    }
    
    getRandomName() {
        return this.patientNames[Math.floor(Math.random() * this.patientNames.length)];
    }
    
    renderPatient(patient) {
        const container = document.getElementById('waiting-patients');
        const patientElement = document.createElement('div');
        patientElement.className = `patient patient-enter type-${patient.type}`;
        patientElement.dataset.patientId = patient.id;
        
        patientElement.innerHTML = `
            <div class="patient-avatar">
                <div class="patient-face face-happy"></div>
            </div>
            <div class="patient-details">
                <div class="patient-name">${patient.name}</div>
                <div class="patient-type">${patient.typeName}</div>
                <div class="patient-points">+${patient.points} pts</div>
                <div class="patience-bar">
                    <div class="patience-fill" style="width: 100%"></div>
                </div>
            </div>
            <div class="patient-speech-bubble"></div>
        `;
        
        container.appendChild(patientElement);
    }
    
    selectPatient(patientId) {
        // Deseleccionar paciente anterior
        document.querySelectorAll('.patient').forEach(p => {
            p.classList.remove('selected');
        });
        
        // Seleccionar nuevo paciente
        const patientElement = document.querySelector(`[data-patient-id="${patientId}"]`);
        if (patientElement) {
            patientElement.classList.add('selected');
            this.selectedPatient = this.patients.find(p => p.id == patientId);
            console.log(`Patient selected: ${this.selectedPatient.name}`);
        }
    }
    
    treatPatient(stationId) {
        if (!this.selectedPatient || this.gameState !== 'playing') {
            alert('Select a patient first');
            return;
        }
        
        const station = this.treatmentStations[stationId];
        if (station.occupied) {
            alert('This station is occupied');
            return;
        }
        
        if (this.selectedPatient.station !== stationId) {
            alert(`This patient needs to go to station ${this.selectedPatient.station}`);
            return;
        }
        
        // Move patient to station
        this.movePatientToStation(this.selectedPatient, stationId);
    }
    
    movePatientToStation(patient, stationId) {
        const station = this.treatmentStations[stationId];
        
        // Update station state
        station.occupied = true;
        station.patientId = patient.id;
        
        // Update station UI
        const stationElement = document.getElementById(`station-${stationId}`);
        const stationPatient = stationElement.querySelector('.station-patient');
        const treatButton = stationElement.querySelector('.treat-button');
        
        stationPatient.innerHTML = `
            <div class="patient-avatar">
                <div class="patient-face face-happy"></div>
            </div>
            <div class="patient-details">
                <div class="patient-name">${patient.name}</div>
                <div class="patient-type">${patient.typeName}</div>
            </div>
        `;
        stationPatient.classList.add('occupied');
        treatButton.disabled = true;
        treatButton.textContent = 'Treating...';
        
        // Remove patient from waiting room
        this.removePatientFromWaiting(patient.id);
        
        // Start treatment
        station.timer = setTimeout(() => {
            this.completePatientTreatment(patient, stationId);
        }, this.treatmentTime[stationId]);
        
        console.log(`${patient.name} is being treated at station ${stationId}`);
    }
    
    completePatientTreatment(patient, stationId) {
        // Calculate points (bonus for remaining patience)
        const patienceBonus = Math.floor((patient.patience / patient.maxPatience) * 50);
        const totalPoints = patient.points + patienceBonus;
        
        this.score += totalPoints;
        this.patientsServed++;
        
        // Create happy particles effect
        this.createHappyParticles(stationId);
        
        // Show points earned
        this.showScorePopup(totalPoints, stationId);
        
        // Clear station
        this.clearStation(stationId);
        
        // Update level if necessary
        this.checkLevelUp();
        
        // Update UI
        this.updateUI();
        
        console.log(`${patient.name} treated! +${totalPoints} points`);
    }
    
    createHappyParticles(stationId) {
        const stationElement = document.getElementById(`station-${stationId}`);
        const particles = ['💚', '⭐', '✨', '🎉', '👍'];
        
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'happy-particle';
                particle.textContent = particles[Math.floor(Math.random() * particles.length)];
                
                const rect = stationElement.getBoundingClientRect();
                particle.style.position = 'fixed';
                particle.style.left = `${rect.left + Math.random() * rect.width}px`;
                particle.style.top = `${rect.top + rect.height / 2}px`;
                particle.style.zIndex = '1000';
                
                document.body.appendChild(particle);
                
                setTimeout(() => {
                    particle.remove();
                }, 1000);
            }, i * 100);
        }
    }
    
    clearStation(stationId) {
        const station = this.treatmentStations[stationId];
        
        if (station.timer) {
            clearTimeout(station.timer);
            station.timer = null;
        }
        
        station.occupied = false;
        station.patientId = null;
        
        // Update UI
        const stationElement = document.getElementById(`station-${stationId}`);
        const stationPatient = stationElement.querySelector('.station-patient');
        const treatButton = stationElement.querySelector('.treat-button');
        
        stationPatient.innerHTML = '<span class="station-status">Available</span>';
        stationPatient.classList.remove('occupied');
        treatButton.disabled = false;
        treatButton.textContent = 'Treat';
    }
    
    removePatientFromWaiting(patientId) {
        // Remove from array
        this.patients = this.patients.filter(p => p.id != patientId);
        
        // Remove from DOM
        const patientElement = document.querySelector(`[data-patient-id="${patientId}"]`);
        if (patientElement) {
            patientElement.classList.add('patient-leave');
            setTimeout(() => {
                patientElement.remove();
            }, 500);
        }
        
        // Deselect if it was the selected patient
        if (this.selectedPatient && this.selectedPatient.id == patientId) {
            this.selectedPatient = null;
        }
    }
    
    updatePatience() {
        if (this.gameState !== 'playing') return;
        
        this.patients.forEach(patient => {
            patient.patience -= 100; // Reduce patience
            
            const patientElement = document.querySelector(`[data-patient-id="${patient.id}"]`);
            if (patientElement) {
                const patienceFill = patientElement.querySelector('.patience-fill');
                const patientFace = patientElement.querySelector('.patient-face');
                const patiencePercentage = (patient.patience / patient.maxPatience) * 100;
                
                patienceFill.style.width = `${Math.max(0, patiencePercentage)}%`;
                
                // Change colors and expressions based on patience
                patienceFill.className = 'patience-fill';
                patientElement.className = `patient type-${patient.type}`;
                
                // Update facial expressions based on patience level
                if (patiencePercentage <= 15) {
                    patienceFill.classList.add('critical');
                    patientElement.classList.add('very-angry');
                    patientFace.className = 'patient-face face-very-angry';
                } else if (patiencePercentage <= 35) {
                    patienceFill.classList.add('low');
                    patientElement.classList.add('angry');
                    patientFace.className = 'patient-face face-angry';
                } else if (patiencePercentage <= 60) {
                    patientFace.className = 'patient-face face-worried';
                } else if (patiencePercentage <= 85) {
                    patientFace.className = 'patient-face face-neutral';
                } else {
                    patientFace.className = 'patient-face face-happy';
                }
                
                // If patience runs out, they leave
                if (patient.patience <= 0) {
                    this.patientLeaves(patient.id);
                }
            }
        });
    }
    
    patientLeaves(patientId) {
        console.log('A patient left angry!');
        this.removePatientFromWaiting(patientId);
        
        // Penalty for losing a patient
        this.score = Math.max(0, this.score - 20);
        this.updateUI();
        
        // Show penalty message
        this.showScorePopup(-20, 'penalty');
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
    
    checkLevelUp() {
        const requiredPatients = this.level * 5;
        if (this.patientsServed >= requiredPatients) {
            this.level++;
            this.timeLeft += 30; // Time bonus
            this.patientSpawnRate = Math.max(1500, this.patientSpawnRate - 200); // Faster
            
            // Restart spawn timer with new speed
            if (this.spawnTimer) {
                clearInterval(this.spawnTimer);
                this.spawnTimer = setInterval(() => {
                    this.spawnPatient();
                }, this.patientSpawnRate);
            }
            
            console.log(`Level ${this.level} reached!`);
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('patients-served').textContent = this.patientsServed;
        document.getElementById('level').textContent = this.level;
        document.getElementById('timer').textContent = this.timeLeft;
    }
    
    endGame() {
        this.gameState = 'stopped';
        this.stopTimers();
        
        // Show game over modal
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-patients').textContent = this.patientsServed;
        document.getElementById('final-level').textContent = this.level;
        document.getElementById('game-over-modal').classList.remove('hidden');
        
        // Update buttons
        document.getElementById('start-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
        document.getElementById('pause-btn').textContent = 'Pause';
        
        console.log(`Game over! Final score: ${this.score}`);
    }
}

// Initialize the game when the page loads
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new ClinicGame();
    console.log('Clinic Rush loaded! Click "Start Game" to begin.');
});
