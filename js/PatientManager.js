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
        // Deselect previous patient
        document.querySelectorAll('.patient').forEach(p => {
            p.classList.remove('selected');
        });
        
        // Select new patient
        const patientElement = document.querySelector(`[data-patient-id="${patientId}"]`);
        if (patientElement) {
            patientElement.classList.add('selected');
            this.selectedPatient = this.patients.find(p => p.id == patientId);
            console.log(`Patient selected: ${this.selectedPatient.name}`);
        }
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
