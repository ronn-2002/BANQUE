
class BankMaster {
    constructor() {
        this.clients = JSON.parse(localStorage.getItem('bankmaster_clients')) || [];
        this.accounts = JSON.parse(localStorage.getItem('bankmaster_accounts')) || [];
        this.operations = JSON.parse(localStorage.getItem('bankmaster_operations')) || [];
        this.loans = JSON.parse(localStorage.getItem('bankmaster_loans')) || [];
        this.trash = JSON.parse(localStorage.getItem('bankmaster_trash')) || [];
        this.isLoggedIn = localStorage.getItem('bankmaster_logged_in') === 'true';
        this.init();
    }

    init() {
        if (this.isLoggedIn) {
            this.showApp();
        } else {
            this.showLogin();
        }
        this.initEventListeners();
        this.populateExportClientSelect();
        this.initBackgroundAnimation();
    }

    initEventListeners() {
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('client-form').addEventListener('submit', (e) => this.handleAddClient(e));
        document.getElementById('account-form').addEventListener('submit', (e) => this.handleAddAccount(e));
        document.getElementById('operation-form').addEventListener('submit', (e) => this.handleAddOperation(e));
        document.getElementById('loan-form').addEventListener('submit', (e) => this.handleLoanSimulation(e));
        document.getElementById('client-type').addEventListener('change', () => this.handleClientTypeChange());
        document.getElementById('account-type').addEventListener('change', () => this.handleAccountTypeChange());
        document.getElementById('dashboard-client').addEventListener('change', () => this.updateBalanceChart());
        document.getElementById('export-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const clientId = document.getElementById('export-client').value;
            this.exportData(clientId);
            document.getElementById('export-modal').style.display = 'none';
            this.showAlert('Données exportées avec succès', 'success');
        });
        // Initialize search bar functionality
        const searchBar = document.getElementById('search-bar');
        if (searchBar) {
            searchBar.addEventListener('input', () => this.searchData(searchBar.value));
        }
    }

    initBackgroundAnimation() {
        const slides = document.querySelectorAll('.slide');
        let currentSlide = 0;

        const changeSlide = () => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        };

        slides[currentSlide].classList.add('active');
        setInterval(changeSlide, 5000);

        const particlesContainer = document.getElementById('particles');
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 6}s`;
            particlesContainer.appendChild(particle);
        }
    }

    populateExportClientSelect() {
        const select = document.getElementById('export-client');
        if (select) {
            select.innerHTML = '<option value="">Tous les clients</option>';
            this.clients.forEach(client => {
                const option = document.createElement('option');
                option.value = client.id;
                option.textContent = `${client.prenom} ${client.nom}`;
                select.appendChild(option);
            });
        }
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    showLogin() {
        document.getElementById('login-container').style.display = 'flex';
        document.getElementById('app-container').classList.remove('active');
    }

    showApp() {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('app-container').classList.add('active');
        this.updateDashboard();
        this.updateAllLists();
        this.updateHomeSection();
        this.updateTrashList();
        this.populateExportClientSelect();
    }

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === 'admin' && password === 'admin123') {
            this.isLoggedIn = true;
            localStorage.setItem('bankmaster_logged_in', 'true');
            this.showApp();
        } else {
            this.showError('Nom d\'utilisateur ou mot de passe incorrect');
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('login-error');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }

    showAlert(message, type) {
        const alertContainer = document.getElementById('notification-container') || document.createElement('div');
        if (!alertContainer.id) {
            alertContainer.id = 'notification-container';
            alertContainer.style.position = 'fixed';
            alertContainer.style.top = '20px';
            alertContainer.style.right = '20px';
            alertContainer.style.zIndex = '1000';
            document.body.appendChild(alertContainer);
        }

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.style.padding = '15px';
        alertDiv.style.marginBottom = '10px';
        alertDiv.style.borderRadius = '5px';
        alertDiv.style.opacity = '0';
        alertDiv.style.transition = 'opacity 0.5s ease-in-out';
        alertDiv.style.color = '#fff';
        alertDiv.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
        
        switch (type) {
            case 'success':
                alertDiv.style.backgroundColor = '#27ae60';
                break;
            case 'error':
                alertDiv.style.backgroundColor = '#c0392b';
                break;
            case 'info':
                alertDiv.style.backgroundColor = '#3498db';
                break;
        }

        alertDiv.textContent = message;
        alertContainer.prepend(alertDiv);

        // Fade in
        setTimeout(() => {
            alertDiv.style.opacity = '1';
        }, 10);

        // Fade out and remove
        setTimeout(() => {
            alertDiv.style.opacity = '0';
            setTimeout(() => {
                alertDiv.remove();
            }, 500);
        }, 3000);
    }

    logout() {
        this.isLoggedIn = false;
        localStorage.removeItem('bankmaster_logged_in');
        this.showLogin();
        this.showAlert('Déconnexion réussie', 'success');
    }

    saveData() {
        localStorage.setItem('bankmaster_clients', JSON.stringify(this.clients));
        localStorage.setItem('bankmaster_accounts', JSON.stringify(this.accounts));
        localStorage.setItem('bankmaster_operations', JSON.stringify(this.operations));
        localStorage.setItem('bankmaster_loans', JSON.stringify(this.loans));
        localStorage.setItem('bankmaster_trash', JSON.stringify(this.trash));
    }

    handleClientTypeChange() {
        const clientType = document.getElementById('client-type').value;
        const contractField = document.getElementById('client-contract').parentElement;
        const durationField = document.getElementById('client-contract-duration').parentElement;
        
        if (clientType === 'Salarié') {
            contractField.style.display = 'flex';
            durationField.style.display = 'flex';
            document.getElementById('client-contract').required = true;
        } else {
            contractField.style.display = 'none';
            durationField.style.display = 'none';
            document.getElementById('client-contract').required = false;
            document.getElementById('client-contract-duration').required = false;
        }
    }

    handleAccountTypeChange() {
        const accountType = document.getElementById('account-type').value;
        const blockedDateField = document.getElementById('account-blocked-date').parentElement;
        
        if (accountType === 'Épargne bloquée') {
            blockedDateField.style.display = 'flex';
            document.getElementById('account-blocked-date').required = true;
        } else {
            blockedDateField.style.display = 'none';
            document.getElementById('account-blocked-date').required = false;
        }
    }

    handleEditAccountTypeChange() {
        const accountType = document.getElementById('edit-account-type').value;
        const blockedDateField = document.getElementById('edit-account-blocked-date').parentElement;
        
        if (accountType === 'Épargne bloquée') {
            blockedDateField.style.display = 'flex';
            document.getElementById('edit-account-blocked-date').required = true;
        } else {
            blockedDateField.style.display = 'none';
            document.getElementById('edit-account-blocked-date').required = false;
        }
    }

    handleAddClient(e) {
        e.preventDefault();
        const clientData = {
            id: this.generateUUID(),
            nom: document.getElementById('client-name').value,
            prenom: document.getElementById('client-firstname').value,
            age: parseInt(document.getElementById('client-age').value),
            type: document.getElementById('client-type').value,
            revenu: parseFloat(document.getElementById('client-income').value),
            contrat: document.getElementById('client-contract').value,
            dureeContrat: parseInt(document.getElementById('client-contract-duration').value) || null,
            dateCreation: new Date().toISOString()
        };

        if (clientData.type === 'Salarié' && !clientData.contrat) {
            this.showAlert('Le type de contrat est obligatoire pour un salarié', 'error');
            return;
        }

        if (clientData.contrat === 'CDD' && !clientData.dureeContrat) {
            this.showAlert('La durée du contrat est obligatoire pour un CDD', 'error');
            return;
        }

        this.clients.push(clientData);
        this.saveData();
        this.updateClientList();
        this.updateClientSelects();
        this.updateDashboard();
        this.updateHomeSection();
        document.getElementById('client-form').reset();
        this.showAlert('Client ajouté avec succès', 'success');
    }

    editClient(clientId) {
        const client = this.clients.find(c => c.id === clientId);
        if (!client) {
            this.showAlert('Client non trouvé', 'error');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'edit-client-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Modifier Client</h3>
                    <span class="close" onclick="document.getElementById('edit-client-modal').remove()">×</span>
                </div>
                <form id="edit-client-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="edit-client-name">Nom *</label>
                            <input type="text" id="edit-client-name" value="${client.nom}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-client-firstname">Prénom *</label>
                            <input type="text" id="edit-client-firstname" value="${client.prenom}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-client-age">Âge *</label>
                            <input type="number" id="edit-client-age" value="${client.age}" min="18" max="100" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-client-type">Type de client *</label>
                            <select id="edit-client-type" required>
                                <option value="Particulier" ${client.type === 'Particulier' ? 'selected' : ''}>Particulier</option>
                                <option value="Salarié" ${client.type === 'Salarié' ? 'selected' : ''}>Salarié</option>
                                <option value="Entreprise" ${client.type === 'Entreprise' ? 'selected' : ''}>Entreprise</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-client-income">Revenu mensuel (F CFA) *</label>
                            <input type="number" id="edit-client-income" value="${client.revenu}" min="0" required>
                        </div>
                        <div class="form-group" id="edit-client-contract-group" style="display: ${client.type === 'Salarié' ? 'flex' : 'none'}">
                            <label for="edit-client-contract">Type de contrat</label>
                            <select id="edit-client-contract" ${client.type === 'Salarié' ? 'required' : ''}>
                                <option value="">Sélectionner...</option>
                                <option value="CDI" ${client.contrat === 'CDI' ? 'selected' : ''}>CDI</option>
                                <option value="CDD" ${client.contrat === 'CDD' ? 'selected' : ''}>CDD</option>
                            </select>
                        </div>
                        <div class="form-group" id="edit-client-contract-duration-group" style="display: ${client.type === 'Salarié' ? 'flex' : 'none'}">
                            <label for="edit-client-contract-duration">Durée contrat (mois)</label>
                            <input type="number" id="edit-client-contract-duration" value="${client.dureeContrat || ''}" min="1" ${client.contrat === 'CDD' ? 'required' : ''}>
                        </div>
                    </div>
                    <button type="submit" class="btn">Mettre à jour</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';

        document.getElementById('edit-client-type').addEventListener('change', () => {
            const clientType = document.getElementById('edit-client-type').value;
            const contractField = document.getElementById('edit-client-contract-group');
            const durationField = document.getElementById('edit-client-contract-duration-group');
            if (clientType === 'Salarié') {
                contractField.style.display = 'flex';
                durationField.style.display = 'flex';
                document.getElementById('edit-client-contract').required = true;
            } else {
                contractField.style.display = 'none';
                durationField.style.display = 'none';
                document.getElementById('edit-client-contract').required = false;
                document.getElementById('edit-client-contract-duration').required = false;
            }
        });

        document.getElementById('edit-client-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const updatedClient = {
                id: clientId,
                nom: document.getElementById('edit-client-name').value,
                prenom: document.getElementById('edit-client-firstname').value,
                age: parseInt(document.getElementById('edit-client-age').value),
                type: document.getElementById('edit-client-type').value,
                revenu: parseFloat(document.getElementById('edit-client-income').value),
                contrat: document.getElementById('edit-client-contract').value,
                dureeContrat: parseInt(document.getElementById('edit-client-contract-duration').value) || null,
                dateCreation: client.dateCreation
            };

            if (updatedClient.type === 'Salarié' && !updatedClient.contrat) {
                this.showAlert('Le type de contrat est obligatoire pour un salarié', 'error');
                return;
            }

            if (updatedClient.contrat === 'CDD' && !updatedClient.dureeContrat) {
                this.showAlert('La durée du contrat est obligatoire pour un CDD', 'error');
                return;
            }

            this.clients = this.clients.map(c => c.id === clientId ? updatedClient : c);
            this.saveData();
            this.updateAllLists();
            this.updateDashboard();
            this.updateHomeSection();
            modal.remove();
            this.showAlert('Client mis à jour avec succès', 'success');
        });
    }

    editAccount(accountId) {
        const account = this.accounts.find(a => a.id === accountId);
        if (!account) {
            this.showAlert('Compte non trouvé', 'error');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'edit-account-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Modifier Compte</h3>
                    <span class="close" onclick="document.getElementById('edit-account-modal').remove()">×</span>
                </div>
                <form id="edit-account-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="edit-account-client">Client *</label>
                            <select id="edit-account-client" required>
                                <option value="">Sélectionner un client</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-account-type">Type de compte *</label>
                            <select id="edit-account-type" required>
                                <option value="">Sélectionner...</option>
                                <option value="Courant" ${account.type === 'Courant' ? 'selected' : ''}>Courant</option>
                                <option value="Épargne libre" ${account.type === 'Épargne libre' ? 'selected' : ''}>Épargne libre</option>
                                <option value="Épargne bloquée" ${account.type === 'Épargne bloquée' ? 'selected' : ''}>Épargne bloquée</option>
                                <option value="Société" ${account.type === 'Société' ? 'selected' : ''}>Société</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-account-balance">Solde (F CFA) *</label>
                            <input type="number" id="edit-account-balance" value="${account.solde}" min="0" required>
                        </div>
                        <div class="form-group" id="edit-account-blocked-date-group" style="display: ${account.type === 'Épargne bloquée' ? 'flex' : 'none'}">
                            <label for="edit-account-blocked-date">Date de déblocage</label>
                            <input type="date" id="edit-account-blocked-date" value="${account.dateDeblocage || ''}" ${account.type === 'Épargne bloquée' ? 'required' : ''}>
                        </div>
                    </div>
                    <button type="submit" class="btn">Mettre à jour</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';

        const clientSelect = document.getElementById('edit-account-client');
        this.clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = `${client.prenom} ${client.nom}`;
            if (client.id === account.clientId) {
                option.selected = true;
            }
            clientSelect.appendChild(option);
        });

        document.getElementById('edit-account-type').addEventListener('change', () => this.handleEditAccountTypeChange());

        document.getElementById('edit-account-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const clientId = document.getElementById('edit-account-client').value;
            const accountType = document.getElementById('edit-account-type').value;
            const balance = parseFloat(document.getElementById('edit-account-balance').value);
            const blockedDate = document.getElementById('edit-account-blocked-date').value;

            const client = this.clients.find(c => c.id === clientId);
            if (!client) {
                this.showAlert('Client non trouvé', 'error');
                modal.remove();
                return;
            }

            if (accountType === 'Courant' && client.type !== 'Salarié') {
                this.showAlert('Le compte courant est réservé aux salariés', 'error');
                return;
            }

            if (accountType === 'Épargne libre' && client.type !== 'Particulier') {
                this.showAlert('L\'épargne libre est réservée aux particuliers', 'error');
                return;
            }

            if (accountType === 'Épargne bloquée' && client.type !== 'Particulier') {
                this.showAlert('L\'épargne bloquée est réservée aux particuliers', 'error');
                return;
            }

            if (accountType === 'Société' && client.type !== 'Entreprise') {
                this.showAlert('Le compte société est réservé aux entreprises', 'error');
                return;
            }

            if (accountType === 'Société' && balance < 200000) {
                this.showAlert('Le solde d\'un compte société doit être d\'au moins 200 000 F CFA', 'error');
                return;
            }

            if (accountType === 'Épargne bloquée' && !blockedDate) {
                this.showAlert('La date de déblocage est obligatoire pour l\'épargne bloquée', 'error');
                return;
            }

            const updatedAccount = {
                id: accountId,
                numero: account.numero,
                clientId: clientId,
                type: accountType,
                solde: balance,
                dateOuverture: account.dateOuverture,
                dateDeblocage: blockedDate || null
            };

            this.accounts = this.accounts.map(a => a.id === accountId ? updatedAccount : a);
            this.saveData();
            this.updateAccountList();
            this.updateAccountSelects();
            this.updateDashboard();
            this.updateHomeSection();
            modal.remove();
            this.showAlert('Compte mis à jour avec succès', 'success');
        });
    }

    handleAddAccount(e) {
        e.preventDefault();
        const clientId = document.getElementById('account-client').value;
        const accountType = document.getElementById('account-type').value;
        const initialBalance = parseFloat(document.getElementById('account-balance').value);
        const blockedDate = document.getElementById('account-blocked-date').value;

        const client = this.clients.find(c => c.id === clientId);
        if (!client) {
            this.showAlert('Client non trouvé', 'error');
            return;
        }

        if (accountType === 'Courant' && client.type !== 'Salarié') {
            this.showAlert('Le compte courant est réservé aux salariés', 'error');
            return;
        }

        if (accountType === 'Épargne libre' && client.type !== 'Particulier') {
            this.showAlert('L\'épargne libre est réservée aux particuliers', 'error');
            return;
        }

        if (accountType === 'Épargne bloquée' && client.type !== 'Particulier') {
            this.showAlert('L\'épargne bloquée est réservée aux particuliers', 'error');
            return;
        }

        if (accountType === 'Société' && client.type !== 'Entreprise') {
            this.showAlert('Le compte société est réservé aux entreprises', 'error');
            return;
        }

        if (accountType === 'Société' && initialBalance < 200000) {
            this.showAlert('Le solde initial d\'un compte société doit être d\'au moins 200 000 F CFA', 'error');
            return;
        }

        if (accountType === 'Épargne bloquée' && !blockedDate) {
            this.showAlert('La date de déblocage est obligatoire pour l\'épargne bloquée', 'error');
            return;
        }

        const accountData = {
            id: this.generateUUID(),
            numero: `AC${Date.now()}${Math.floor(Math.random() * 1000)}`,
            clientId: clientId,
            type: accountType,
            solde: initialBalance,
            dateOuverture: new Date().toISOString(),
            dateDeblocage: blockedDate || null
        };

        this.accounts.push(accountData);
        this.saveData();
        this.updateAccountList();
        this.updateAccountSelects();
        this.updateDashboard();
        this.updateHomeSection();
        document.getElementById('account-form').reset();
        this.showAlert('Compte créé avec succès', 'success');
    }

    handleAddOperation(e) {
        e.preventDefault();
        const accountId = document.getElementById('operation-account').value;
        const operationType = document.getElementById('operation-type').value;
        const amount = parseFloat(document.getElementById('operation-amount').value);

        const account = this.accounts.find(a => a.id === accountId);
        if (!account) {
            this.showAlert('Compte non trouvé', 'error');
            return;
        }

        if (account.type === 'Épargne bloquée' && operationType === 'Retrait') {
            const today = new Date();
            const blockedDate = new Date(account.dateDeblocage);
            if (today < blockedDate) {
                this.showAlert('Retrait impossible : compte bloqué jusqu\'au ' + blockedDate.toLocaleDateString(), 'error');
                return;
            }
        }

        if (operationType === 'Retrait' && account.solde < amount) {
            this.showAlert('Solde insuffisant', 'error');
            return;
        }

        const oldBalance = account.solde;
        if (operationType === 'Dépôt') {
            account.solde += amount;
        } else {
            account.solde -= amount;
        }

        const operationData = {
            id: this.generateUUID(),
            accountId: accountId,
            type: operationType,
            montant: amount,
            soldeAvant: oldBalance,
            soldeApres: account.solde,
            date: new Date().toISOString()
        };

        this.operations.push(operationData);
        this.saveData();
        this.updateOperationList();
        this.updateDashboard();
        this.updateHomeSection();
        document.getElementById('operation-form').reset();
        this.showAlert('Opération effectuée avec succès', 'success');
    }

    editOperation(operationId) {
        const operation = this.operations.find(op => op.id === operationId);
        if (!operation) {
            this.showAlert('Opération non trouvée', 'error');
            return;
        }

        const account = this.accounts.find(a => a.id === operation.accountId);
        const client = account ? this.clients.find(c => c.id === account.clientId) : null;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'edit-operation-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Modifier Opération</h3>
                    <span class="close" onclick="document.getElementById('edit-operation-modal').remove()">×</span>
                </div>
                <form id="edit-operation-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="edit-operation-account">Compte *</label>
                            <select id="edit-operation-account" required>
                                <option value="">Sélectionner un compte</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-operation-type">Type d'opération *</label>
                            <select id="edit-operation-type" required>
                                <option value="Dépôt" ${operation.type === 'Dépôt' ? 'selected' : ''}>Dépôt</option>
                                <option value="Retrait" ${operation.type === 'Retrait' ? 'selected' : ''}>Retrait</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-operation-amount">Montant (F CFA) *</label>
                            <input type="number" id="edit-operation-amount" value="${operation.montant}" min="1" required>
                        </div>
                    </div>
                    <button type="submit" class="btn">Mettre à jour</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';

        const accountSelect = document.getElementById('edit-operation-account');
        this.accounts.forEach(acc => {
            const client = this.clients.find(c => c.id === acc.clientId);
            const option = document.createElement('option');
            option.value = acc.id;
            option.textContent = `${acc.numero} - ${client ? client.prenom + ' ' + client.nom : 'Client supprimé'}`;
            if (acc.id === operation.accountId) {
                option.selected = true;
            }
            accountSelect.appendChild(option);
        });

        document.getElementById('edit-operation-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const newAccountId = document.getElementById('edit-operation-account').value;
            const newType = document.getElementById('edit-operation-type').value;
            const newAmount = parseFloat(document.getElementById('edit-operation-amount').value);

            const newAccount = this.accounts.find(a => a.id === newAccountId);
            if (!newAccount) {
                this.showAlert('Compte non trouvé', 'error');
                modal.remove();
                return;
            }

            if (newAccount.type === 'Épargne bloquée' && newType === 'Retrait') {
                const today = new Date();
                const blockedDate = new Date(newAccount.dateDeblocage);
                if (today < blockedDate) {
                    this.showAlert('Retrait impossible : compte bloqué jusqu\'au ' + blockedDate.toLocaleDateString(), 'error');
                    modal.remove();
                    return;
                }
            }

            // Revert the previous operation
            const oldAccount = this.accounts.find(a => a.id === operation.accountId);
            if (oldAccount) {
                if (operation.type === 'Dépôt') {
                    oldAccount.solde -= operation.montant;
                } else {
                    oldAccount.solde += operation.montant;
                }
            }

            // Apply the new operation
            const oldBalance = newAccount.solde;
            if (newType === 'Retrait' && newAccount.solde < newAmount) {
                this.showAlert('Solde insuffisant', 'error');
                if (oldAccount) {
                    if (operation.type === 'Dépôt') {
                        oldAccount.solde += operation.montant;
                    } else {
                        oldAccount.solde -= operation.montant;
                    }
                }
                modal.remove();
                return;
            }

            if (newType === 'Dépôt') {
                newAccount.solde += newAmount;
            } else {
                newAccount.solde -= newAmount;
            }

            const updatedOperation = {
                id: operationId,
                accountId: newAccountId,
                type: newType,
                montant: newAmount,
                soldeAvant: oldBalance,
                soldeApres: newAccount.solde,
                date: new Date().toISOString()
            };

            this.operations = this.operations.map(op => op.id === operationId ? updatedOperation : op);
            this.saveData();
            this.updateOperationList();
            this.updateDashboard();
            this.updateHomeSection();
            modal.remove();
            this.showAlert('Opération mise à jour avec succès', 'success');
        });
    }

    deleteOperation(operationId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette opération ?')) {
            return;
        }

        const operation = this.operations.find(op => op.id === operationId);
        if (!operation) {
            this.showAlert('Opération non trouvée', 'error');
            return;
        }

        // Revert the operation's effect on the account balance
        const account = this.accounts.find(a => a.id === operation.accountId);
        if (account) {
            if (operation.type === 'Dépôt') {
                account.solde -= operation.montant;
            } else {
                account.solde += operation.montant;
            }
        }

        // Move to trash
        this.trash.push({
            type: 'operation',
            data: operation,
            deletedAt: new Date().toISOString()
        });

        // Remove from operations
        this.operations = this.operations.filter(op => op.id !== operationId);
        this.saveData();
        this.updateOperationList();
        this.updateDashboard();
        this.updateHomeSection();
        this.updateTrashList();
        this.showAlert('Opération supprimée avec succès', 'success');
    }

    handleLoanSimulation(e) {
        e.preventDefault();
        const clientId = document.getElementById('loan-client').value;
        const amount = parseFloat(document.getElementById('loan-amount').value);
        const duration = parseInt(document.getElementById('loan-duration').value);
        const rate = parseFloat(document.getElementById('loan-rate').value);
        const loanType = document.getElementById('loan-type').value;
        const insurance = document.getElementById('loan-insurance').checked;

        const client = this.clients.find(c => c.id === clientId);
        if (!client) {
            this.showAlert('Client non trouvé', 'error');
            return;
        }

        const simulation = this.simulateLoan(client, amount, duration, rate, loanType, insurance);
        this.displayLoanResult(simulation);

        // Save loan simulation
        const loanData = {
            id: this.generateUUID(),
            clientId: clientId,
            amount: amount,
            duration: duration,
            rate: rate,
            type: loanType,
            insurance: insurance,
            monthlyPayment: simulation.monthlyPaymentWithInsurance,
            totalCost: simulation.totalCost,
            totalInterest: simulation.totalInterest,
            insuranceCost: simulation.insuranceCost,
            eligible: simulation.eligible,
            reason: simulation.reason,
            date: new Date().toISOString()
        };

        this.loans.push(loanData);
        this.saveData();
        this.updateLoanList();
        this.updateDashboard();
        this.showAlert('Simulation de prêt effectuée avec succès', 'success');
    }

    simulateLoan(client, amount, duration, rate, loanType, insurance) {
        const monthlyRate = rate / 100 / 12;
        const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, duration)) / (Math.pow(1 + monthlyRate, duration) - 1);
        const totalCost = monthlyPayment * duration;
        const totalInterest = totalCost - amount;

        let insuranceCost = 0;
        let monthlyPaymentWithInsurance = monthlyPayment;

        if (insurance) {
            insuranceCost = amount * 0.003 / 12 * duration;
            monthlyPaymentWithInsurance = monthlyPayment + (amount * 0.003 / 12);
        }

        let eligible = true;
        let reason = '';

        if (client.type === 'Salarié' && client.contrat === 'CDI') {
            const ageAtEnd = client.age + Math.floor(duration / 12);
            if (ageAtEnd >= 65) {
                eligible = false;
                reason = 'Le prêt se terminera après 65 ans';
            }
        }

        if (client.type === 'Salarié' && client.contrat === 'CDD') {
            if (duration > client.dureeContrat) {
                eligible = false;
                reason = 'Le prêt dépasse la durée du contrat';
            }
        }

        if (client.type === 'Particulier' || client.type === 'Entreprise') {
            if (client.revenu * 0.35 < monthlyPaymentWithInsurance) {
                eligible = false;
                reason = 'Le remboursement mensuel dépasse 35% du revenu';
            }
        }

        return {
            monthlyPayment: monthlyPayment.toFixed(2),
            monthlyPaymentWithInsurance: monthlyPaymentWithInsurance.toFixed(2),
            totalCost: totalCost.toFixed(2),
            totalInterest: totalInterest.toFixed(2),
            insuranceCost: insuranceCost.toFixed(2),
            eligible,
            reason
        };
    }

    displayLoanResult(simulation) {
        const resultDiv = document.getElementById('loan-result');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <h3>Résultat de la Simulation</h3>
            <div class="comparison-table">
                <table>
                    <tr>
                        <th>Mensualité</th>
                        <td>${simulation.monthlyPayment} F CFA</td>
                    </tr>
                    <tr>
                        <th>Mensualité avec assurance</th>
                        <td>${simulation.monthlyPaymentWithInsurance} F CFA</td>
                    </tr>
                    <tr>
                        <th>Coût total</th>
                        <td>${simulation.totalCost} F CFA</td>
                    </tr>
                    <tr>
                        <th>Intérêts totaux</th>
                        <td>${simulation.totalInterest} F CFA</td>
                    </tr>
                    <tr>
                        <th>Coût de l'assurance</th>
                        <td>${simulation.insuranceCost} F CFA</td>
                    </tr>
                    <tr>
                        <th>Éligibilité</th>
                        <td>${simulation.eligible ? 'Éligible' : `Non éligible: ${simulation.reason}`}</td>
                    </tr>
                </table>
            </div>
        `;
    }

    searchData(query) {
        query = query.toLowerCase().trim();
        this.updateClientList(query);
        this.updateAccountList(query);
        this.updateOperationList(query);
        this.updateLoanList(query);
        this.updateTrashList(query);
        this.showAlert(`Recherche effectuée pour "${query || 'tous les éléments'}"`, 'info');
    }

    updateClientList(query = '') {
        const clientList = document.getElementById('client-list');
        clientList.innerHTML = '';
        const filteredClients = query
            ? this.clients.filter(client =>
                `${client.prenom} ${client.nom}`.toLowerCase().includes(query) ||
                client.type.toLowerCase().includes(query) ||
                client.revenu.toString().includes(query)
            )
            : this.clients;

        if (filteredClients.length === 0 && query) {
            clientList.innerHTML = '<p>Aucun client trouvé.</p>';
            return;
        }

        filteredClients.forEach(client => {
            const clientItem = document.createElement('div');
            clientItem.className = 'list-item';
            clientItem.innerHTML = `
                <span>${client.prenom} ${client.nom} (${client.type}) - ${client.revenu} F CFA/mois</span>
                <div class="list-actions">
                    <button class="btn btn-small btn-secondary" onclick="window.app.editClient('${client.id}')">Modifier</button>
                    <button class="btn btn-small btn-danger" onclick="window.app.deleteClient('${client.id}')">Supprimer</button>
                </div>
            `;
            clientList.appendChild(clientItem);
        });
    }

    updateAccountList(query = '') {
        const accountList = document.getElementById('account-list');
        accountList.innerHTML = '';
        const filteredAccounts = query
            ? this.accounts.filter(account => {
                const client = this.clients.find(c => c.id === account.clientId);
                return (
                    account.numero.toLowerCase().includes(query) ||
                    account.type.toLowerCase().includes(query) ||
                    account.solde.toString().includes(query) ||
                    (client && `${client.prenom} ${client.nom}`.toLowerCase().includes(query))
                );
            })
            : this.accounts;

        if (filteredAccounts.length === 0 && query) {
            accountList.innerHTML = '<p>Aucun compte trouvé.</p>';
            return;
        }

        filteredAccounts.forEach(account => {
            const client = this.clients.find(c => c.id === account.clientId);
            const accountItem = document.createElement('div');
            accountItem.className = 'list-item';
            accountItem.innerHTML = `
                <span>${account.numero} - ${client ? client.prenom + ' ' + client.nom : 'Client supprimé'} (${account.type}) - ${account.solde} F CFA</span>
                <div class="list-actions">
                    <button class="btn btn-small btn-secondary" onclick="window.app.editAccount('${account.id}')">Modifier</button>
                    <button class="btn btn-small btn-danger" onclick="window.app.deleteAccount('${account.id}')">Supprimer</button>
                </div>
            `;
            accountList.appendChild(accountItem);
        });
    }

    updateOperationList(query = '') {
        const operationList = document.getElementById('operation-list');
        operationList.innerHTML = '';
        const filteredOperations = query
            ? this.operations.filter(operation => {
                const account = this.accounts.find(a => a.id === operation.accountId);
                const client = account ? this.clients.find(c => c.id === account.clientId) : null;
                return (
                    operation.type.toLowerCase().includes(query) ||
                    operation.montant.toString().includes(query) ||
                    (account && account.numero.toLowerCase().includes(query)) ||
                    (client && `${client.prenom} ${client.nom}`.toLowerCase().includes(query))
                );
            })
            : this.operations;

        if (filteredOperations.length === 0 && query) {
            operationList.innerHTML = '<p>Aucune opération trouvée.</p>';
            return;
        }

        filteredOperations.forEach(operation => {
            const account = this.accounts.find(a => a.id === operation.accountId);
            const client = account ? this.clients.find(c => c.id === account.clientId) : null;
            const operationItem = document.createElement('div');
            operationItem.className = 'list-item';
            operationItem.innerHTML = `
                <span>${operation.type} - ${operation.montant} F CFA - ${account ? account.numero : 'Compte supprimé'} (${client ? client.prenom + ' ' + client.nom : 'Client supprimé'}) - ${new Date(operation.date).toLocaleString()}</span>
                <div class="list-actions">
                    <button class="btn btn-small btn-secondary" onclick="window.app.editOperation('${operation.id}')">Modifier</button>
                    <button class="btn btn-small btn-danger" onclick="window.app.deleteOperation('${operation.id}')">Supprimer</button>
                </div>
            `;
            operationList.appendChild(operationItem);
        });
    }

    updateLoanList(query = '') {
        const loanResultDiv = document.getElementById('loan-result');
        const filteredLoans = query
            ? this.loans.filter(loan => {
                const client = this.clients.find(c => c.id === loan.clientId);
                return (
                    loan.type.toLowerCase().includes(query) ||
                    loan.amount.toString().includes(query) ||
                    loan.duration.toString().includes(query) ||
                    (client && `${client.prenom} ${client.nom}`.toLowerCase().includes(query))
                );
            })
            : this.loans;

        if (filteredLoans.length > 0) {
            loanResultDiv.style.display = 'block';
            let html = '<h3>Historique des Simulations</h3>';
            filteredLoans.forEach(loan => {
                const client = this.clients.find(c => c.id === loan.clientId);
                html += `
                    <div class="list-item">
                        <span>${client ? client.prenom + ' ' + client.nom : 'Client supprimé'} - ${loan.type} - ${loan.amount} F CFA - ${loan.duration} mois - ${loan.eligible ? 'Éligible' : 'Non éligible'}</span>
                        <div class="list-actions">
                            <button class="btn btn-small btn-danger" onclick="window.app.deleteLoan('${loan.id}')">Supprimer</button>
                        </div>
                    </div>
                `;
            });
            loanResultDiv.innerHTML = html;
        } else {
            loanResultDiv.style.display = query ? 'block' : 'none';
            loanResultDiv.innerHTML = query ? '<p>Aucune simulation trouvée.</p>' : '';
        }
    }

    updateTrashList(query = '') {
        const trashList = document.getElementById('trash-list');
        trashList.innerHTML = '';
        const filteredTrash = query
            ? this.trash.filter(item => {
                if (item.type === 'client') {
                    return `${item.data.prenom} ${item.data.nom}`.toLowerCase().includes(query) || item.type.toLowerCase().includes(query);
                } else if (item.type === 'account') {
                    const client = this.clients.find(c => c.id === item.data.clientId);
                    return (
                        item.data.numero.toLowerCase().includes(query) ||
                        item.data.type.toLowerCase().includes(query) ||
                        (client && `${client.prenom} ${client.nom}`.toLowerCase().includes(query))
                    );
                } else if (item.type === 'operation') {
                    const account = this.accounts.find(a => a.id === item.data.accountId);
                    const client = account ? this.clients.find(c => c.id === account.clientId) : null;
                    return (
                        item.data.type.toLowerCase().includes(query) ||
                        item.data.montant.toString().includes(query) ||
                        (account && account.numero.toLowerCase().includes(query)) ||
                        (client && `${client.prenom} ${client.nom}`.toLowerCase().includes(query))
                    );
                } else if (item.type === 'loan') {
                    const client = this.clients.find(c => c.id === item.data.clientId);
                    return (
                        item.data.type.toLowerCase().includes(query) ||
                        item.data.amount.toString().includes(query) ||
                        (client && `${client.prenom} ${client.nom}`.toLowerCase().includes(query))
                    );
                }
                return false;
            })
            : this.trash;

        if (filteredTrash.length === 0 && query) {
            trashList.innerHTML = '<p>Aucun élément trouvé dans la corbeille.</p>';
            return;
        }

        filteredTrash.forEach(item => {
            let name = '';
            if (item.type === 'client') {
                name = `${item.data.prenom} ${item.data.nom}`;
            } else if (item.type === 'account') {
                const client = this.clients.find(c => c.id === item.data.clientId);
                name = `${item.data.numero} - ${client ? client.prenom + ' ' + client.nom : 'Client supprimé'}`;
            } else if (item.type === 'operation') {
                const account = this.accounts.find(a => a.id === item.data.accountId);
                const client = account ? this.clients.find(c => c.id === account.clientId) : null;
                name = `${item.data.type} - ${item.data.montant} F CFA - ${account ? account.numero : 'Compte supprimé'}`;
            } else if (item.type === 'loan') {
                const client = this.clients.find(c => c.id === item.data.clientId);
                name = `${client ? client.prenom + ' ' + client.nom : 'Client supprimé'} - ${item.data.type} - ${item.data.amount} F CFA`;
            }
            const trashItem = document.createElement('div');
            trashItem.className = 'list-item';
            trashItem.innerHTML = `
                <span>${item.type.charAt(0).toUpperCase() + item.type.slice(1)}: ${name} - Supprimé le ${new Date(item.deletedAt).toLocaleString()}</span>
                <div class="list-actions">
                    <button class="btn btn-small btn-secondary" onclick="window.app.restoreFromTrash('${item.data.id}', '${item.type}')">Restaurer</button>
                </div>
            `;
            trashList.appendChild(trashItem);
        });
    }

    deleteClient(clientId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
            return;
        }

        const client = this.clients.find(c => c.id === clientId);
        if (!client) {
            this.showAlert('Client non trouvé', 'error');
            return;
        }

        // Move client to trash
        this.trash.push({
            type: 'client',
            data: client,
            deletedAt: new Date().toISOString()
        });

        // Move associated accounts to trash
        const clientAccounts = this.accounts.filter(a => a.clientId === clientId);
        clientAccounts.forEach(account => {
            this.trash.push({
                type: 'account',
                data: account,
                deletedAt: new Date().toISOString()
            });

            // Move associated operations to trash
            const accountOperations = this.operations.filter(op => op.accountId === account.id);
            accountOperations.forEach(operation => {
                this.trash.push({
                    type: 'operation',
                    data: operation,
                    deletedAt: new Date().toISOString()
                });
            });

            this.operations = this.operations.filter(op => op.accountId !== account.id);
        });

        // Move associated loans to trash
        const clientLoans = this.loans.filter(loan => loan.clientId === clientId);
        clientLoans.forEach(loan => {
            this.trash.push({
                type: 'loan',
                data: loan,
                deletedAt: new Date().toISOString()
            });
        });

        // Remove from main data
        this.clients = this.clients.filter(c => c.id !== clientId);
        this.accounts = this.accounts.filter(a => a.clientId !== clientId);
        this.loans = this.loans.filter(loan => loan.clientId !== clientId);

        this.saveData();
        this.updateAllLists();
        this.updateDashboard();
        this.updateHomeSection();
        this.updateTrashList();
        this.showAlert('Client supprimé avec succès', 'success');
    }

    deleteAccount(accountId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
            return;
        }

        const account = this.accounts.find(a => a.id === accountId);
        if (!account) {
            this.showAlert('Compte non trouvé', 'error');
            return;
        }

        // Move account to trash
        this.trash.push({
            type: 'account',
            data: account,
            deletedAt: new Date().toISOString()
        });

        // Move associated operations to trash
        const accountOperations = this.operations.filter(op => op.accountId === accountId);
        accountOperations.forEach(operation => {
            this.trash.push({
                type: 'operation',
                data: operation,
                deletedAt: new Date().toISOString()
            });
        });

        // Remove from main data
        this.accounts = this.accounts.filter(a => a.id !== accountId);
        this.operations = this.operations.filter(op => op.accountId !== accountId);

        this.saveData();
        this.updateAccountList();
        this.updateAccountSelects();
        this.updateDashboard();
        this.updateHomeSection();
        this.updateTrashList();
        this.showAlert('Compte supprimé avec succès', 'success');
    }

    deleteLoan(loanId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette simulation de prêt ?')) {
            return;
        }

        const loan = this.loans.find(loan => loan.id === loanId);
        if (!loan) {
            this.showAlert('Simulation de prêt non trouvée', 'error');
            return;
        }

        this.trash.push({
            type: 'loan',
            data: loan,
            deletedAt: new Date().toISOString()
        });

        this.loans = this.loans.filter(loan => loan.id !== loanId);
        this.saveData();
        this.updateLoanList();
        this.updateDashboard();
        this.updateTrashList();
        this.showAlert('Simulation de prêt supprimée avec succès', 'success');
    }

    restoreFromTrash(itemId, itemType) {
        const item = this.trash.find(t => t.data.id === itemId && t.type === itemType);
        if (!item) {
            this.showAlert('Élément non trouvé dans la corbeille', 'error');
            return;
        }

        if (itemType === 'client') {
            this.clients.push(item.data);
            // Restore associated accounts
            const clientAccounts = this.trash.filter(t => t.type === 'account' && t.data.clientId === itemId);
            clientAccounts.forEach(account => {
                this.accounts.push(account.data);
                // Restore associated operations
                const accountOperations = this.trash.filter(t => t.type === 'operation' && t.data.accountId === account.data.id);
                accountOperations.forEach(operation => {
                    this.operations.push(operation.data);
                });
                this.trash = this.trash.filter(t => t.data.id !== account.data.id || t.type !== 'operation');
            });
            // Restore associated loans
            const clientLoans = this.trash.filter(t => t.type === 'loan' && t.data.clientId === itemId);
            clientLoans.forEach(loan => {
                this.loans.push(loan.data);
            });
            this.trash = this.trash.filter(t => t.data.id !== itemId || t.type !== 'client');
            this.trash = this.trash.filter(t => t.type !== 'account' || t.data.clientId !== itemId);
            this.trash = this.trash.filter(t => t.type !== 'loan' || t.data.clientId !== itemId);
        } else if (itemType === 'account') {
            const client = this.clients.find(c => c.id === item.data.clientId);
            if (!client) {
                this.showAlert('Impossible de restaurer le compte : le client associé n\'existe plus', 'error');
                return;
            }
            this.accounts.push(item.data);
            // Restore associated operations
            const accountOperations = this.trash.filter(t => t.type === 'operation' && t.data.accountId === itemId);
            accountOperations.forEach(operation => {
                this.operations.push(operation.data);
            });
            this.trash = this.trash.filter(t => t.data.id !== itemId || t.type !== 'account');
            this.trash = this.trash.filter(t => t.type !== 'operation' || t.data.accountId !== itemId);
        } else if (itemType === 'operation') {
            const account = this.accounts.find(a => a.id === item.data.accountId);
            if (!account) {
                this.showAlert('Impossible de restaurer l\'opération : le compte associé n\'existe plus', 'error');
                return;
            }
            this.operations.push(item.data);
            this.trash = this.trash.filter(t => t.data.id !== itemId || t.type !== 'operation');
        } else if (itemType === 'loan') {
            const client = this.clients.find(c => c.id === item.data.clientId);
            if (!client) {
                this.showAlert('Impossible de restaurer la simulation de prêt : le client associé n\'existe plus', 'error');
                return;
            }
            this.loans.push(item.data);
            this.trash = this.trash.filter(t => t.data.id !== itemId || t.type !== 'loan');
        }

        this.saveData();
        this.updateAllLists();
        this.updateDashboard();
        this.updateHomeSection();
        this.updateTrashList();
        this.showAlert(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} restauré avec succès`, 'success');
    }

    clearTrash() {
        if (!confirm('Êtes-vous sûr de vouloir vider la corbeille ? Cette action est irréversible.')) {
            return;
        }

        this.trash = [];
        this.saveData();
        this.updateTrashList();
        this.showAlert('Corbeille vidée avec succès', 'success');
    }

    updateClientSelects() {
        const selects = [
            document.getElementById('account-client'),
            document.getElementById('operation-account'),
            document.getElementById('loan-client'),
            document.getElementById('home-client'),
            document.getElementById('dashboard-client')
        ];

        selects.forEach(select => {
            if (select) {
                const currentValue = select.value;
                select.innerHTML = select.id === 'dashboard-client' ? '<option value="">Tous les clients</option>' : '<option value="">Sélectionner un client</option>';
                this.clients.forEach(client => {
                    const option = document.createElement('option');
                    option.value = client.id;
                    option.textContent = `${client.prenom} ${client.nom}`;
                    if (client.id === currentValue) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
            }
        });

        const operationAccountSelect = document.getElementById('operation-account');
        if (operationAccountSelect) {
            operationAccountSelect.innerHTML = '<option value="">Sélectionner un compte</option>';
            this.accounts.forEach(account => {
                const client = this.clients.find(c => c.id === account.clientId);
                const option = document.createElement('option');
                option.value = account.id;
                option.textContent = `${account.numero} - ${client ? client.prenom + ' ' + client.nom : 'Client supprimé'}`;
                operationAccountSelect.appendChild(option);
            });
        }
    }

    updateAllLists(query = '') {
        this.updateClientList(query);
        this.updateAccountList(query);
        this.updateOperationList(query);
        this.updateLoanList(query);
        this.updateClientSelects();
    }

    updateDashboard() {
        const totalBalance = this.accounts.reduce((sum, account) => sum + account.solde, 0);
        const activeClients = this.clients.length;
        const activeAccounts = this.accounts.length;
        const recentOperations = this.operations.filter(op => {
            const opDate = new Date(op.date);
            const now = new Date();
            return (now - opDate) / (1000 * 60 * 60 * 24) <= 30;
        }).length;

        document.getElementById('total-balance').textContent = `${totalBalance.toLocaleString()} F CFA`;
        document.getElementById('active-clients').textContent = activeClients;
        document.getElementById('active-accounts').textContent = activeAccounts;
        document.getElementById('recent-operations').textContent = recentOperations;

        this.updateBalanceChart();
        this.updateMonthlyOperationsChart();
        this.updateAccountTypeChart();
        this.updateClientTypeChart();
        this.updateLoanTrendChart();
    }

    updateBalanceChart() {
        const ctx = document.getElementById('balance-chart').getContext('2d');
        const selectedClient = document.getElementById('dashboard-client').value;

        let data;
        if (selectedClient) {
            const clientAccounts = this.accounts.filter(a => a.clientId === selectedClient);
            data = clientAccounts.map(account => {
                const operations = this.operations.filter(op => op.accountId === account.id);
                return operations.reduce((balance, op) => {
                    return op.type === 'Dépôt' ? balance + op.montant : balance - op.montant;
                }, account.solde);
            });
        } else {
            data = this.accounts.map(account => {
                const operations = this.operations.filter(op => op.accountId === account.id);
                return operations.reduce((balance, op) => {
                    return op.type === 'Dépôt' ? balance + op.montant : balance - op.montant;
                }, account.solde);
            });
        }

        if (window.balanceChart) {
            window.balanceChart.destroy();
        }

        window.balanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map((_, index) => `Point ${index + 1}`),
                datasets: [{
                    label: 'Solde',
                    data: data,
                    borderColor: '#8e44ad',
                    backgroundColor: 'rgba(142, 68, 173, 0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Solde (F CFA)'
                        }
                    }
                }
            }
        });
    }

    updateMonthlyOperationsChart() {
        const ctx = document.getElementById('monthly-operations-chart').getContext('2d');
        const now = new Date();
        const labels = [];
        const deposits = [];
        const withdrawals = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(date.toLocaleString('default', { month: 'short', year: 'numeric' }));
            const monthOperations = this.operations.filter(op => {
                const opDate = new Date(op.date);
                return opDate.getMonth() === date.getMonth() && opDate.getFullYear() === date.getFullYear();
            });
            deposits.push(monthOperations.filter(op => op.type === 'Dépôt').length);
            withdrawals.push(monthOperations.filter(op => op.type === 'Retrait').length);
        }

        if (window.monthlyOperationsChart) {
            window.monthlyOperationsChart.destroy();
        }

        window.monthlyOperationsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Dépôts',
                        data: deposits,
                        backgroundColor: '#27ae60'
                    },
                    {
                        label: 'Retraits',
                        data: withdrawals,
                        backgroundColor: '#c0392b'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Nombre d\'opérations'
                        }
                    }
                }
            }
        });
    }

    updateAccountTypeChart() {
        const ctx = document.getElementById('account-type-chart').getContext('2d');
        const accountTypes = ['Courant', 'Épargne libre', 'Épargne bloquée', 'Société'];
        const data = accountTypes.map(type => this.accounts.filter(a => a.type === type).length);

        if (window.accountTypeChart) {
            window.accountTypeChart.destroy();
        }

        window.accountTypeChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: accountTypes,
                datasets: [{
                    data: data,
                    backgroundColor: ['#8e44ad', '#3498db', '#e74c3c', '#2ecc71']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    updateClientTypeChart() {
        const ctx = document.getElementById('client-type-chart').getContext('2d');
        const clientTypes = ['Particulier', 'Salarié', 'Entreprise'];
        const data = clientTypes.map(type => this.clients.filter(c => c.type === type).length);

        if (window.clientTypeChart) {
            window.clientTypeChart.destroy();
        }

        window.clientTypeChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: clientTypes,
                datasets: [{
                    data: data,
                    backgroundColor: ['#3498db', '#e74c3c', '#2ecc71']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    updateLoanTrendChart() {
        const ctx = document.getElementById('loan-trend-chart').getContext('2d');
        const now = new Date();
        const labels = [];
        const data = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(date.toLocaleString('default', { month: 'short', year: 'numeric' }));
            const monthLoans = this.loans.filter(loan => {
                const loanDate = new Date(loan.date);
                return loanDate.getMonth() === date.getMonth() && loanDate.getFullYear() === date.getFullYear();
            });
            data.push(monthLoans.reduce((sum, loan) => sum + loan.amount, 0));
        }

        if (window.loanTrendChart) {
            window.loanTrendChart.destroy();
        }

        window.loanTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Montant des prêts',
                    data: data,
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.2)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Montant (F CFA)'
                        }
                    }
                }
            }
        });
    }

    updateHomeSection() {
        const homeClientSelect = document.getElementById('home-client');
        const clientDetails = document.getElementById('client-details');

        homeClientSelect.innerHTML = '<option value="">Sélectionner un client</option>';
        this.clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = `${client.prenom} ${client.nom}`;
            homeClientSelect.appendChild(option);
        });

        homeClientSelect.addEventListener('change', () => {
            const clientId = homeClientSelect.value;
            if (clientId) {
                const client = this.clients.find(c => c.id === clientId);
                if (client) {
                    const clientAccounts = this.accounts.filter(a => a.clientId === clientId);
                    const clientOperations = this.operations.filter(op => {
                        const account = this.accounts.find(a => a.id === op.accountId);
                        return account && account.clientId === clientId;
                    });
                    const clientLoans = this.loans.filter(loan => loan.clientId === clientId);

                    clientDetails.innerHTML = `
                        <div class="card">
                            <h3>Informations du Client</h3>
                            <p><strong>Nom:</strong> ${client.prenom} ${client.nom}</p>
                            <p><strong>Type:</strong> ${client.type}</p>
                            <p><strong>Revenu:</strong> ${client.revenu.toLocaleString()} F CFA/mois</p>
                            <p><strong>Âge:</strong> ${client.age} ans</p>
                            ${client.type === 'Salarié' ? `<p><strong>Contrat:</strong> ${client.contrat}</p>` : ''}
                            ${client.contrat === 'CDD' ? `<p><strong>Durée du contrat:</strong> ${client.dureeContrat} mois</p>` : ''}
                        </div>
                        <div class="card">
                            <h3>Comptes</h3>
                            ${clientAccounts.length > 0 ? clientAccounts.map(account => `
                                <p>${account.numero} (${account.type}) - ${account.solde.toLocaleString()} F CFA</p>
                            `).join('') : '<p>Aucun compte</p>'}
                        </div>
                        <div class="card">
                            <h3>Opérations Récentes</h3>
                            ${clientOperations.length > 0 ? clientOperations.slice(0, 5).map(op => `
                                <p>${op.type} - ${op.montant.toLocaleString()} F CFA - ${new Date(op.date).toLocaleString()}</p>
                            `).join('') : '<p>Aucune opération</p>'}
                        </div>
                        <div class="card">
                            <h3>Simulations de Prêt</h3>
                            ${clientLoans.length > 0 ? clientLoans.map(loan => `
                                <p>${loan.type} - ${loan.amount.toLocaleString()} F CFA - ${loan.duration} mois - ${loan.eligible ? 'Éligible' : 'Non éligible'}</p>
                            `).join('') : '<p>Aucune simulation</p>'}
                        </div>
                    `;
                } else {
                    clientDetails.innerHTML = '<p>Sélectionnez un client pour voir les détails.</p>';
                }
            } else {
                clientDetails.innerHTML = '<p>Sélectionnez un client pour voir les détails.</p>';
            }
        });
    }

    showExportModal() {
        document.getElementById('export-modal').style.display = 'block';
    }

    exportData(clientId = null) {
        let exportData;
        if (clientId) {
            const client = this.clients.find(c => c.id === clientId);
            if (!client) {
                this.showAlert('Client non trouvé', 'error');
                return;
            }
            const clientAccounts = this.accounts.filter(a => a.clientId === clientId);
            const accountIds = clientAccounts.map(a => a.id);
            const clientOperations = this.operations.filter(op => accountIds.includes(op.accountId));
            const clientLoans = this.loans.filter(loan => loan.clientId === clientId);

            exportData = {
                client: {
                    id: client.id,
                    nom: client.nom,
                    prenom: client.prenom,
                    age: client.age,
                    type: client.type,
                    revenu: client.revenu,
                    contrat: client.contrat,
                    dureeContrat: client.dureeContrat,
                    dateCreation: client.dateCreation
                },
                accounts: clientAccounts,
                operations: clientOperations,
                loans: clientLoans
            };
        } else {
            exportData = {
                clients: this.clients,
                accounts: this.accounts,
                operations: this.operations,
                loans: this.loans
            };
        }

        const jsonStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bankmaster_export${clientId ? `_client_${clientId}` : ''}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Expose methods to window for HTML onclick handlers
window.app = new BankMaster();
window.showSection = function(sectionId) {
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    document.querySelector(`[onclick="window.showSection('${sectionId}')"]`).classList.add('active');
};
window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const menuIcon = document.querySelector('.mobile-menu-icon');
    sidebar.classList.toggle('active');
    menuIcon.classList.toggle('active');
};
window.showExportModal = function() {
    window.app.showExportModal();
};
window.logout = function() {
    window.app.logout();
};
