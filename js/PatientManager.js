/**
 * PatientManager - Handles patient creation, behavior, and management
 */
class PatientManager {
    constructor(gameState, gameManager = null) {
        this.gameState = gameState;
        this.gameManager = gameManager;
        this.patients = [];
        this.selectedPatient = null;
    }
    
    setGameManager(gameManager) {
        this.gameManager = gameManager;
    }
    
    spawnPatient() {
        if (this.patients.length >= this.gameState.maxPatients || !this.gameState.isPlaying()) {
            return null;
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
        return patient;
    }
    
    // New: Animate patient walking in, then move to waiting zone
    spawnPatientAnimated() {
        if (this.patients.length >= this.gameState.maxPatients || !this.gameState.isPlaying()) {
            return null;
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
            spawnTime: Date.now(),
            state: 'walking-in',
            walkTimeout: null,
            waitingTimeout: null
        };
        this.patients.push(patient);
        this.renderWalkingPatient(patient);
        return patient;
    }

    getRandomPatientType() {
        // Adjust probabilities based on level
        const weights = [0.5, 0.3, 0.2]; // General, Specialist, Emergency
        const random = Math.random();
        let weightSum = 0;
        
        for (let i = 0; i < weights.length; i++) {
            weightSum += weights[i];
            if (random <= weightSum) {
                return this.gameState.patientTypes[i];
            }
        }
        
        return this.gameState.patientTypes[0];
    }
    
    getRandomName() {
        return this.gameState.patientNames[Math.floor(Math.random() * this.gameState.patientNames.length)];
    }
    
    renderPatient(patient) {
        const container = document.getElementById('waiting-patients');
        const patientElement = document.createElement('div');
        patientElement.className = `patient patient-enter type-${patient.type}`;
        patientElement.dataset.patientId = patient.id;
        patientElement.dataset.station = patient.station;
        
        // Make patient draggable
        patientElement.draggable = true;
        
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
            <div class="drag-hint">📋 Drag to station ${patient.station}</div>
        `;
        
        container.appendChild(patientElement);
    }
    
    renderWalkingPatient(patient) {
        const corridorPath = document.getElementById('corridor-path');
        const patientElement = document.createElement('div');
        patientElement.className = `patient walking-in type-${patient.type}`;
        patientElement.dataset.patientId = patient.id;
        patientElement.dataset.station = patient.station;
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
        `;
        corridorPath.appendChild(patientElement);
        // After walking animation completes, move to waiting area
        patient.walkTimeout = setTimeout(() => {
            this.moveToWaitingArea(patient);
        }, 2500); // Match the walkIn animation duration
    }

    moveToWaitingArea(patient) {
        const patientElement = document.querySelector(`[data-patient-id="${patient.id}"]`);
        if (patientElement) patientElement.remove();
        patient.state = 'waiting';
        this.renderWaitingPatient(patient);
        // Start patience countdown for walking out
        patient.waitingTimeout = setTimeout(() => {
            this.makePatientAngryAndLeave(patient);
        }, patient.patience);
    }

    renderWaitingPatient(patient) {
        const waitingZone = document.getElementById('waiting-zone');
        const patientElement = document.createElement('div');
        patientElement.className = `patient waiting type-${patient.type}`;
        patientElement.dataset.patientId = patient.id;
        patientElement.dataset.station = patient.station;
        patientElement.draggable = true;
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
        `;
        waitingZone.appendChild(patientElement);
    }

    makePatientAngryAndLeave(patient) {
        if (patient.state !== 'waiting') return;
        const patientElement = document.querySelector(`[data-patient-id="${patient.id}"]`);
        if (patientElement) patientElement.remove();
        patient.state = 'walking-out';
        this.renderLeavingPatient(patient);
        setTimeout(() => {
            this.removePatient(patient.id);
            if (this.gameManager) {
                this.gameManager.onPatientLeft(patient);
            }
        }, 2000); // Match walkOut animation
    }

    renderLeavingPatient(patient) {
        const corridorPath = document.getElementById('corridor-path');
        const patientElement = document.createElement('div');
        patientElement.className = `patient walking-out angry type-${patient.type}`;
        patientElement.dataset.patientId = patient.id;
        patientElement.innerHTML = `
            <div class="patient-avatar">
                <div class="patient-face face-very-angry"></div>
            </div>
            <div class="patient-details">
                <div class="patient-name">${patient.name}</div>
                <div class="patient-type">ANGRY</div>
                <div class="patient-points">-20 pts</div>
            </div>
        `;
        corridorPath.appendChild(patientElement);
    }
    
    selectPatient(patientId) {
        // For drag and drop, we don't need click selection anymore
        // This method is kept for compatibility but can be simplified
        console.log(`Patient ${patientId} interacted with`);
    }
    
    removePatient(patientId) {
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
        if (!this.gameState.isPlaying()) return;
        
        const patientsToRemove = [];
        
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
                
                // If patience runs out, mark for removal
                if (patient.patience <= 0) {
                    patientsToRemove.push(patient.id);
                }
            }
        });
        
        // Remove patients who ran out of patience
        patientsToRemove.forEach(patientId => {
            const penalty = this.patientLeaves(patientId);
            if (this.gameManager) {
                this.gameManager.onPatientLeaves(penalty);
            }
        });
    }
    
    patientLeaves(patientId) {
        console.log('A patient left angry!');
        this.removePatient(patientId);
        
        // Return penalty points
        return -20;
    }
    
    clearAll() {
        this.patients = [];
        this.selectedPatient = null;
        
        // Clear UI
        const container = document.getElementById('waiting-patients');
        if (container) {
            container.innerHTML = '';
        }
    }
    
    getSelectedPatient() {
        return this.selectedPatient;
    }
    
    getPatientById(patientId) {
        return this.patients.find(p => p.id == patientId);
    }
    
    getPatientCount() {
        return this.patients.length;
    }
}
