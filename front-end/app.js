/* ==========================================
   ATIFOFLOW JAVASCRIPT APPLICATION CORE
   ========================================== */

const API_BASE_URL_EQUIPAMENTOS = 'http://localhost:8080/api/equipamentos';
const API_BASE_URL_CHAMADOS = 'http://localhost:8080/api/chamados';
const API_BASE_URL_TECNICOS = 'http://localhost:8080/api/tecnicos';

class AtivoFlowApp {
    constructor() {
        // Estado Global da Aplicação
        this.state = {
            equipamentos: [],
            chamados: [],
            tecnicos: [],
            currentTab: 'dashboard',
            charts: {
                equipamentos: null,
                chamados: null
            },
            isLogged: false,
            currentUser: null
        };

        // Bindings de Métodos
        this.switchTab = this.switchTab.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.handleDeletarChamado = this.handleDeletarChamado.bind(this);
    }

    // Inicialização da Aplicação
    init() {
        this.initializeLocalDatabase();
        this.registerEventListeners();
        this.checkSession();
        
        // Atualiza ícones iniciais
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Loop de atualização automática a cada 30 segundos (apenas se logado)
        setInterval(() => {
            if (this.state.isLogged) {
                this.fetchData(true);
            }
        }, 30000);
    }

    // ==========================================
    // BASE DE DADOS LOCAL (LOCAL STORAGE)
    // ==========================================
    initializeLocalDatabase() {
        // Inicializamos ou garantimos que o usuário admin tem a role de administrador
        let users = [];
        try {
            users = JSON.parse(localStorage.getItem('ativoflow_users')) || [];
        } catch (e) {
            users = [];
        }

        const adminIndex = users.findIndex(u => u.username === 'admin');
        if (adminIndex === -1) {
            users.push({
                name: 'Ana Sousa',
                username: 'admin',
                password: 'admin',
                role: 'Administrador de TI'
            });
            localStorage.setItem('ativoflow_users', JSON.stringify(users));
        } else if (users[adminIndex].role !== 'Administrador de TI') {
            // Atualiza a role para Administrador de TI caso estivesse como técnica
            users[adminIndex].role = 'Administrador de TI';
            localStorage.setItem('ativoflow_users', JSON.stringify(users));
        }

        // Se o usuário logado atualmente for o admin e a role dele não for Administrador de TI, atualizamos a sessão dele
        const loggedUserJSON = localStorage.getItem('ativoflow_current_user');
        if (loggedUserJSON) {
            try {
                const loggedUser = JSON.parse(loggedUserJSON);
                if (loggedUser.username === 'admin' && loggedUser.role !== 'Administrador de TI') {
                    loggedUser.role = 'Administrador de TI';
                    localStorage.setItem('ativoflow_current_user', JSON.stringify(loggedUser));
                }
            } catch(e) {}
        }
    }

    checkSession() {
        const isLogged = localStorage.getItem('ativoflow_logged') === 'true';
        const userJSON = localStorage.getItem('ativoflow_current_user');

        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');

        if (isLogged && userJSON) {
            this.state.isLogged = true;
            this.state.currentUser = JSON.parse(userJSON);

            // Atualizar perfil na UI
            this.updateProfileUI();

            // Alternar containers
            if (authContainer) authContainer.style.display = 'none';
            if (appContainer) appContainer.style.display = 'flex';

            // Carregar dados das APIs
            this.fetchData(true);
        } else {
            this.state.isLogged = false;
            this.state.currentUser = null;

            if (authContainer) authContainer.style.display = 'flex';
            if (appContainer) appContainer.style.display = 'none';
            
            // Garantir que mostra o card de login inicial
            this.toggleAuthCards('login');
        }
    }

    updateProfileUI() {
        const nameHeader = document.getElementById('header-user-name');
        const roleHeader = document.getElementById('header-user-role');

        if (this.state.currentUser) {
            if (nameHeader) nameHeader.textContent = this.state.currentUser.name;
            if (roleHeader) roleHeader.textContent = this.state.currentUser.role;
        }
    }

    toggleAuthCards(target) {
        const loginCard = document.getElementById('login-card');
        const registerCard = document.getElementById('register-card');

        if (target === 'register') {
            if (loginCard) loginCard.style.display = 'none';
            if (registerCard) registerCard.style.display = 'block';
        } else {
            if (loginCard) loginCard.style.display = 'block';
            if (registerCard) registerCard.style.display = 'none';
        }
    }

    // Registo de Event Listeners globais
    registerEventListeners() {
        // --- EVENTOS DE AUTENTICAÇÃO ---
        const linkToReg = document.getElementById('link-goto-register');
        if (linkToReg) {
            linkToReg.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAuthCards('register');
            });
        }

        const linkToLogin = document.getElementById('link-goto-login');
        if (linkToLogin) {
            linkToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAuthCards('login');
            });
        }

        const formLogin = document.getElementById('form-login');
        if (formLogin) {
            formLogin.addEventListener('submit', this.handleLogin);
        }

        const formRegister = document.getElementById('form-register');
        if (formRegister) {
            formRegister.addEventListener('submit', this.handleRegister);
        }

        const btnHeaderLogout = document.getElementById('btn-header-logout');
        if (btnHeaderLogout) {
            btnHeaderLogout.addEventListener('click', this.handleLogout);
        }

        const btnSidebarLogout = document.getElementById('btn-sidebar-logout');
        if (btnSidebarLogout) {
            btnSidebarLogout.addEventListener('click', this.handleLogout);
        }


        // --- EVENTOS DA APP PRINCIPAL ---

        // Navegação (Sidebar & Bottom Nav)
        const navButtons = document.querySelectorAll('.nav-item, .bottom-nav-item');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = btn.getAttribute('data-tab');
                if (tabId) this.switchTab(tabId);
            });
        });

        // Botão de Atualizar Manual
        const btnRefresh = document.getElementById('btn-refresh');
        if (btnRefresh) {
            btnRefresh.addEventListener('click', () => {
                btnRefresh.classList.add('rotating');
                this.fetchData().finally(() => {
                    setTimeout(() => btnRefresh.classList.remove('rotating'), 600);
                });
            });
        }

        // Botões de Abrir Modais
        const btnNovoEq = document.getElementById('btn-novo-equipamento');
        if (btnNovoEq) {
            btnNovoEq.addEventListener('click', () => this.openModal('equipamento'));
        }

        const btnNovoCh = document.getElementById('btn-novo-chamado');
        if (btnNovoCh) {
            btnNovoCh.addEventListener('click', () => this.openModal('chamado'));
        }

        const btnNovoTec = document.getElementById('btn-novo-tecnico');
        if (btnNovoTec) {
            btnNovoTec.addEventListener('click', () => this.openModal('tecnico'));
        }

        // Fechar modais
        const modalOverlays = document.querySelectorAll('.modal-overlay');
        modalOverlays.forEach(overlay => {
            // Fechar ao clicar no overlay de fundo
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal(overlay.id);
                }
            });

            // Fechar ao clicar em elementos com atributo [data-close]
            const closeBtns = overlay.querySelectorAll('[data-close]');
            closeBtns.forEach(btn => {
                btn.addEventListener('click', () => this.closeModal(overlay.id));
            });
        });

        // Submissão de Formulários da App
        const formEq = document.getElementById('form-equipamento');
        if (formEq) {
            formEq.addEventListener('submit', (e) => this.handleSaveEquipamento(e));
        }

        const formCh = document.getElementById('form-chamado');
        if (formCh) {
            formCh.addEventListener('submit', (e) => this.handleSaveChamado(e));
        }

        const formTec = document.getElementById('form-tecnico');
        if (formTec) {
            formTec.addEventListener('submit', (e) => this.handleSaveTecnico(e));
        }

        const formCc = document.getElementById('form-concluir');
        if (formCc) {
            formCc.addEventListener('submit', (e) => this.handleConcluirChamado(e));
        }

        // Pesquisa e Filtros (Tempo real)
        const searchEq = document.getElementById('search-equipamentos');
        if (searchEq) {
            searchEq.addEventListener('input', () => this.renderEquipamentos());
        }

        const filterStatusEq = document.getElementById('filter-status-equipamentos');
        if (filterStatusEq) {
            filterStatusEq.addEventListener('change', () => this.renderEquipamentos());
        }

        const searchCh = document.getElementById('search-chamados');
        if (searchCh) {
            searchCh.addEventListener('input', () => this.renderChamados());
        }

        const filterStatusCh = document.getElementById('filter-status-chamados');
        if (filterStatusCh) {
            filterStatusCh.addEventListener('change', () => this.renderChamados());
        }
    }

    // ==========================================
    // LÓGICA DE LOGIN E REGISTO (MOCK)
    // ==========================================
    handleLogin(e) {
        e.preventDefault();

        const userInp = document.getElementById('login-username').value.trim();
        const passInp = document.getElementById('login-password').value;
        const btnSubmit = document.getElementById('btn-login-submit');
        const loginCard = document.getElementById('login-card');

        if (!userInp || !passInp) {
            this.showToast('Campos vazios', 'Por favor preencha todos os campos.', 'warning');
            return;
        }

        // Simula carregamento
        btnSubmit.disabled = true;
        const origText = btnSubmit.innerHTML;
        btnSubmit.innerHTML = '<span>Verificando...</span>';

        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem('ativoflow_users') || '[]');
            const foundUser = users.find(u => u.username.toLowerCase() === userInp.toLowerCase() && u.password === passInp);

            if (foundUser) {
                // Sucesso
                localStorage.setItem('ativoflow_logged', 'true');
                localStorage.setItem('ativoflow_current_user', JSON.stringify(foundUser));

                this.showToast('Login Efetuado', `Bem-vindo de volta, ${foundUser.name}!`, 'success');
                
                // Reinicia sessão e carrega a app
                this.checkSession();
                
                // Limpar campos
                document.getElementById('form-login').reset();
            } else {
                // Erro
                loginCard.classList.add('shake');
                this.showToast('Credenciais Inválidas', 'Utilizador ou senha incorretos.', 'danger');
                setTimeout(() => loginCard.classList.remove('shake'), 400);
            }

            btnSubmit.disabled = false;
            btnSubmit.innerHTML = origText;
        }, 800);
    }

    handleRegister(e) {
        e.preventDefault();

        const nome = document.getElementById('reg-nome').value.trim();
        const username = document.getElementById('reg-username').value.trim().toLowerCase();
        const password = document.getElementById('reg-password').value;
        const role = document.getElementById('reg-role').value;
        
        const btnSubmit = document.getElementById('btn-register-submit');
        const regCard = document.getElementById('register-card');

        if (!nome || !username || !password || !role) {
            this.showToast('Campos Vazios', 'Todos os campos de cadastro são obrigatórios.', 'warning');
            return;
        }

        if (password.length < 4) {
            this.showToast('Palavra-passe Curta', 'A senha deve possuir no mínimo 4 caracteres.', 'warning');
            return;
        }

        btnSubmit.disabled = true;
        const origText = btnSubmit.innerHTML;
        btnSubmit.innerHTML = '<span>Criando conta...</span>';

        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem('ativoflow_users') || '[]');
            const exists = users.some(u => u.username === username);

            if (exists) {
                // Username já está em uso
                regCard.classList.add('shake');
                this.showToast('Utilizador em uso', 'Este nome de utilizador já está registado.', 'danger');
                setTimeout(() => regCard.classList.remove('shake'), 400);
            } else {
                // Registar novo utilizador
                const newUser = { name: nome, username, password, role };
                users.push(newUser);
                localStorage.setItem('ativoflow_users', JSON.stringify(users));

                this.showToast('Conta Criada', 'O seu utilizador foi cadastrado! Faça login.', 'success');
                
                // Limpar formulário e voltar ao login
                document.getElementById('form-register').reset();
                this.toggleAuthCards('login');
            }

            btnSubmit.disabled = false;
            btnSubmit.innerHTML = origText;
        }, 800);
    }

    handleLogout() {
        localStorage.removeItem('ativoflow_logged');
        localStorage.removeItem('ativoflow_current_user');
        
        this.showToast('Sessão Encerrada', 'Saiu da aplicação com sucesso.', 'info');
        
        // Destruir gráficos anteriores para não darem erro ao renderizar de novo
        if (this.state.charts.equipamentos) {
            this.state.charts.equipamentos.destroy();
            this.state.charts.equipamentos = null;
        }
        if (this.state.charts.chamados) {
            this.state.charts.chamados.destroy();
            this.state.charts.chamados = null;
        }

        this.checkSession();
    }

    // ==========================================
    // CONTROLO DE TAB/ROTEAMENTO SPA
    // ==========================================
    switchTab(tabId) {
        if (this.state.currentTab === tabId) return;
        
        this.state.currentTab = tabId;

        // Atualizar classes de botões ativos (Sidebar e Bottom Nav)
        document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(btn => {
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Alternar visualização das secções de conteúdo
        document.querySelectorAll('.tab-content').forEach(section => {
            if (section.id === `tab-${tabId}`) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        // Atualizar título do cabeçalho
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            const titles = {
                dashboard: 'Dashboard',
                equipamentos: 'Gestão de Equipamentos',
                chamados: 'Histórico & Chamados Técnicos'
            };
            pageTitle.textContent = titles[tabId] || 'AtivoFlow';
        }

        // Ações extras ao mudar de tab
        if (tabId === 'dashboard') {
            this.updateCharts();
        }
    }

    // ==========================================
    // SISTEMA DE MODAIS
    // ==========================================
    openModal(modalType, data = null) {
        const modalId = `modal-${modalType}`;
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.add('active');

        // Configuração inicial conforme tipo de modal
        if (modalType === 'chamado') {
            const selectEq = document.getElementById('ch-equipamento');
            if (selectEq) {
                selectEq.innerHTML = '<option value="">Sem Equipamento Específico (Geral)</option>';
                this.state.equipamentos.forEach(eq => {
                    const option = document.createElement('option');
                    option.value = eq.id;
                    option.textContent = `${eq.nome} (${eq.nomeEmpresa}) - [Status: ${eq.status}]`;
                    if (data && data.equipamentoId === eq.id) {
                        option.selected = true;
                    }
                    selectEq.appendChild(option);
                });
            }

            const selectTec = document.getElementById('ch-tecnico');
            if (selectTec) {
                selectTec.innerHTML = '<option value="" disabled selected>Escolha um técnico...</option>';
                this.state.tecnicos.forEach(tec => {
                    const option = document.createElement('option');
                    option.value = tec.id;
                    option.textContent = `${tec.nome} (${tec.email})`;
                    selectTec.appendChild(option);
                });
            }
        } else if (modalType === 'concluir' && data) {
            const inputId = document.getElementById('concluir-chamado-id');
            const inputEq = document.getElementById('concluir-equipamento-nome');
            const textDesc = document.getElementById('concluir-descricao-problema');
            const inputDiag = document.getElementById('concluir-diagnostico');

            if (inputId) inputId.value = data.id;
            if (inputEq) inputEq.value = data.equipamentoNome;
            if (textDesc) textDesc.textContent = data.descricao;
            if (inputDiag) inputDiag.value = '';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.remove('active');
        
        // Limpar formulário interno
        const form = modal.querySelector('form');
        if (form) form.reset();
    }

    // ==========================================
    // INTEGRAÇÃO DE API (FETCH, POST, PATCH)
    // ==========================================
    async fetchData(isSilent = false) {
        if (!this.state.isLogged) return; // Não fetch se não logado

        try {
            const [resEquipamentos, resChamados, resTecnicos] = await Promise.all([
                fetch(API_BASE_URL_EQUIPAMENTOS),
                fetch(API_BASE_URL_CHAMADOS),
                fetch(API_BASE_URL_TECNICOS)
            ]);

            if (!resEquipamentos.ok || !resChamados.ok || !resTecnicos.ok) {
                throw new Error('Falha ao obter dados da API');
            }

            this.state.equipamentos = await resEquipamentos.json();
            this.state.chamados = await resChamados.json();
            this.state.tecnicos = await resTecnicos.json();

            // Atualizar status do servidor na barra lateral
            this.updateServerStatus(true);

            // Renderizar componentes
            this.updateMetrics();
            this.renderEquipamentos();
            this.renderChamados();
            this.renderRecentChamados();
            this.updateCharts();

            if (!isSilent) {
                this.showToast('Dados Carregados', 'Os dados do sistema foram atualizados.', 'success');
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.updateServerStatus(false);
            this.showToast('Erro de Conexão', 'Não foi possível comunicar com o servidor backend.', 'danger');
        }
    }

    updateServerStatus(isOnline) {
        const dots = document.querySelectorAll('.status-dot');
        const textSpan = document.querySelector('.server-status span:last-child');
        
        dots.forEach(dot => {
            if (isOnline) {
                dot.className = 'status-dot online';
            } else {
                dot.className = 'status-dot offline';
            }
        });

        if (textSpan) {
            textSpan.textContent = isOnline ? 'Servidor Online' : 'Servidor Offline';
        }
    }

    // Salvar novo Equipamento
    async handleSaveEquipamento(e) {
        e.preventDefault();
        
        const nome = document.getElementById('eq-nome').value.trim();
        const nomeEmpresa = document.getElementById('eq-empresa').value.trim();
        const especificacoes = document.getElementById('eq-especificacoes').value.trim();
        const status = document.getElementById('eq-status').value;

        if (!nome || !nomeEmpresa) {
            this.showToast('Validação', 'Nome e Empresa são campos obrigatórios.', 'warning');
            return;
        }

        const payload = { nome, nomeEmpresa, especificacoes, status };

        try {
            const res = await fetch(API_BASE_URL_EQUIPAMENTOS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.status === 201 || res.ok) {
                this.closeModal('modal-equipamento');
                this.showToast('Sucesso', 'Equipamento registado com sucesso!', 'success');
                this.fetchData(true);
            } else {
                // Caso falhe pela validação de negócio (Ex: Empresa duplicada)
                this.showToast('Erro de Validação', 'Já existe um equipamento registado com esta empresa.', 'danger');
            }
        } catch (error) {
            console.error('Erro ao salvar equipamento:', error);
            this.showToast('Erro no Backend', 'Erro ao processar o registo do equipamento.', 'danger');
        }
    }

    // Salvar novo Técnico
    async handleSaveTecnico(e) {
        e.preventDefault();

        const nome = document.getElementById('tec-nome').value.trim();
        const email = document.getElementById('tec-email').value.trim();

        if (!nome || !email) {
            this.showToast('Validação', 'Nome e E-mail são obrigatórios.', 'warning');
            return;
        }

        const payload = { nome, email };

        try {
            const res = await fetch(API_BASE_URL_TECNICOS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.status === 201 || res.ok) {
                this.closeModal('modal-tecnico');
                this.showToast('Técnico Registado', 'O técnico foi adicionado ao sistema com sucesso!', 'success');
                this.fetchData(true);
            } else {
                const msg = await res.text();
                this.showToast('Erro de Registo', msg || 'Já existe um técnico registado com este e-mail.', 'danger');
            }
        } catch (error) {
            console.error('Erro ao salvar técnico:', error);
            this.showToast('Erro', 'Não foi possível salvar o técnico no backend.', 'danger');
        }
    }

    // Alterar Status do Equipamento
    async handlePatchStatusEquipamento(id, novoStatus) {
        try {
            const res = await fetch(`${API_BASE_URL_EQUIPAMENTOS}/${id}/status?status=${novoStatus}`, {
                method: 'PATCH'
            });

            if (res.ok) {
                this.showToast('Status Atualizado', `Equipamento atualizado para ${novoStatus}.`, 'success');
                this.fetchData(true);
            } else {
                this.showToast('Falha', 'Não foi possível alterar o estado do equipamento.', 'danger');
            }
        } catch (error) {
            console.error('Erro ao patchear status:', error);
            this.showToast('Erro', 'Erro ao alterar o estado do equipamento.', 'danger');
        }
    }

    // Abrir Novo Chamado
    async handleSaveChamado(e) {
        e.preventDefault();

        const eqId = document.getElementById('ch-equipamento').value;
        const tecId = document.getElementById('ch-tecnico').value;
        const descricao = document.getElementById('ch-descricao').value.trim();

        if (!tecId || !descricao) {
            this.showToast('Validação', 'Técnico responsável e descrição do problema são obrigatórios.', 'warning');
            return;
        }

        const payload = {
            descricaoProblema: descricao,
            tecnico: { id: parseInt(tecId) },
            equipamento: eqId ? { id: parseInt(eqId) } : null
        };

        try {
            const res = await fetch(API_BASE_URL_CHAMADOS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.status === 201 || res.ok) {
                this.closeModal('modal-chamado');
                this.showToast('Chamado Aberto', 'O chamado foi registado com sucesso!', 'success');
                this.fetchData(true);
            } else {
                const msg = await res.text();
                this.showToast('Erro de Regra', msg || 'Erro ao abrir o chamado.', 'danger');
            }
        } catch (error) {
            console.error('Erro ao abrir chamado:', error);
            this.showToast('Erro de Rede', 'Erro de rede ao submeter o chamado.', 'danger');
        }
    }

    // Concluir Chamado (Adicionar Diagnóstico)
    async handleConcluirChamado(e) {
        e.preventDefault();

        const id = document.getElementById('concluir-chamado-id').value;
        const diagnostico = document.getElementById('concluir-diagnostico').value.trim();

        if (!diagnostico) {
            this.showToast('Validação', 'É necessário preencher o diagnóstico técnico.', 'warning');
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL_CHAMADOS}/${id}/concluir?diagnostico=${encodeURIComponent(diagnostico)}`, {
                method: 'PATCH'
            });

            if (res.ok) {
                this.closeModal('modal-concluir');
                this.showToast('Chamado Concluído', 'O chamado foi finalizado.', 'success');
                this.fetchData(true);
            } else {
                const msg = await res.text();
                this.showToast('Erro', msg || 'Não foi possível concluir o chamado.', 'danger');
            }
        } catch (error) {
            console.error('Erro ao concluir chamado:', error);
            this.showToast('Erro', 'Erro de comunicação ao concluir chamado.', 'danger');
        }
    }

    // Excluir Chamado
    async handleDeletarChamado(id) {
        if (!confirm('Tem a certeza que deseja excluir permanentemente este chamado?')) {
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL_CHAMADOS}/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                this.showToast('Chamado Excluído', 'O chamado foi excluído com sucesso!', 'success');
                this.fetchData(true);
            } else {
                let msg = '';
                try {
                    msg = await res.text();
                } catch(e) {}
                this.showToast('Erro ao Excluir', msg || 'Não foi possível excluir o chamado.', 'danger');
            }
        } catch (error) {
            console.error('Erro ao excluir chamado:', error);
            this.showToast('Erro de Rede', 'Erro de comunicação ao excluir chamado.', 'danger');
        }
    }

    // ==========================================
    // ESTATÍSTICAS E MÉTRICAS
    // ==========================================
    updateMetrics() {
        const totalEq = this.state.equipamentos.length;
        const ativosEq = this.state.equipamentos.filter(e => e.status === 'ATIVO').length;
        const manutEq = this.state.equipamentos.filter(e => e.status === 'EM_MANUTENCAO').length;
        
        const totalCh = this.state.chamados.length;
        const abertosCh = this.state.chamados.filter(c => c.status === 'ABERTO').length;

        // Atualizar nos nós HTML
        document.getElementById('stat-total-equipamentos').textContent = totalEq;
        document.getElementById('stat-ativos-equipamentos').textContent = ativosEq;
        document.getElementById('stat-manutencao-equipamentos').textContent = manutEq;
        document.getElementById('stat-chamados-abertos').textContent = abertosCh;

        const percent = totalEq > 0 ? Math.round((ativosEq / totalEq) * 100) : 0;
        document.getElementById('stat-ativos-percent').textContent = `${percent}% operacionais`;
    }

    // ==========================================
    // RENDERIZAR ELEMENTOS NA TELA
    // ==========================================

    // Renderizar lista de equipamentos com filtros
    renderEquipamentos() {
        const query = document.getElementById('search-equipamentos').value.toLowerCase().trim();
        const statusFilter = document.getElementById('filter-status-equipamentos').value;
        const listContainer = document.getElementById('equipamentos-list');
        const emptyState = document.getElementById('empty-state-equipamentos');

        if (!listContainer) return;

        // Filtragem
        const filtered = this.state.equipamentos.filter(eq => {
            const matchesQuery = eq.nome.toLowerCase().includes(query) || 
                               eq.nomeEmpresa.toLowerCase().includes(query) ||
                               (eq.especificacoes && eq.especificacoes.toLowerCase().includes(query));
            const matchesStatus = statusFilter === 'ALL' || eq.status === statusFilter;
            
            return matchesQuery && matchesStatus;
        });

        // Limpar
        listContainer.innerHTML = '';

        if (filtered.length === 0) {
            emptyState.style.display = 'flex';
            return;
        } else {
            emptyState.style.display = 'none';
        }

        filtered.forEach(eq => {
            const card = document.createElement('div');
            card.className = 'equipamento-card';

            let badgeClass = 'badge-success';
            let badgeText = 'Ativo';
            if (eq.status === 'EM_MANUTENCAO') {
                badgeClass = 'badge-warning';
                badgeText = 'Em Manutenção';
            } else if (eq.status === 'DESTACADO') {
                badgeClass = 'badge-info';
                badgeText = 'Destacado';
            }

            card.innerHTML = `
                <div class="eq-card-header">
                    <div class="eq-card-title">
                        <h4>${this.escapeHTML(eq.nome)}</h4>
                        <span class="eq-card-company">
                            <i data-lucide="building" style="width: 14px; height: 14px;"></i>
                            ${this.escapeHTML(eq.nomeEmpresa)}
                        </span>
                    </div>
                    <span class="badge ${badgeClass}">${badgeText}</span>
                </div>
                
                <div class="eq-card-specs">
                    <span class="eq-card-specs-title">Especificações</span>
                    <p class="eq-card-specs-text">${eq.especificacoes ? this.escapeHTML(eq.especificacoes) : '<span style="color: hsl(var(--text-muted)); font-style: italic;">Nenhuma especificação registada.</span>'}</p>
                </div>

                <div class="eq-card-actions">
                    <div class="eq-status-controller">
                        <select class="btn btn-secondary btn-sm select-status-patch" data-id="${eq.id}">
                            <option value="ATIVO" ${eq.status === 'ATIVO' ? 'selected' : ''}>Ativo</option>
                            <option value="EM_MANUTENCAO" ${eq.status === 'EM_MANUTENCAO' ? 'selected' : ''}>Manutenção</option>
                            <option value="DESTACADO" ${eq.status === 'DESTACADO' ? 'selected' : ''}>Destacado</option>
                        </select>
                    </div>
                    
                    <button class="btn btn-icon btn-icon-primary btn-abrir-chamado-eq" data-id="${eq.id}" data-nome="${this.escapeHTML(eq.nome)}" title="Abrir chamado para este ativo">
                        <i data-lucide="alert-triangle" style="width: 16px; height: 16px;"></i>
                    </button>
                </div>
            `;

            // Escuta ações no card de equipamento
            const selectStatus = card.querySelector('.select-status-patch');
            selectStatus.addEventListener('change', (e) => {
                this.handlePatchStatusEquipamento(eq.id, e.target.value);
            });

            const btnAbrirChamado = card.querySelector('.btn-abrir-chamado-eq');
            btnAbrirChamado.addEventListener('click', () => {
                this.openModal('chamado', { equipamentoId: eq.id });
            });

            listContainer.appendChild(card);
        });

        // Recriar ícones lucide
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // Renderizar lista de chamados com filtros
    renderChamados() {
        const query = document.getElementById('search-chamados').value.toLowerCase().trim();
        const statusFilter = document.getElementById('filter-status-chamados').value;
        const listContainer = document.getElementById('chamados-list');
        const emptyState = document.getElementById('empty-state-chamados');

        if (!listContainer) return;

        // Filtragem
        const filtered = this.state.chamados.filter(ch => {
            const matchesQuery = ch.descricaoProblema.toLowerCase().includes(query) || 
                               (ch.diagnosticoTecnico && ch.diagnosticoTecnico.toLowerCase().includes(query)) ||
                               (ch.equipamento && ch.equipamento.nome.toLowerCase().includes(query)) || 
                               (ch.equipamento && ch.equipamento.nomeEmpresa.toLowerCase().includes(query)) ||
                               (ch.tecnico && ch.tecnico.nome.toLowerCase().includes(query));
            
            const matchesStatus = statusFilter === 'ALL' || ch.status === statusFilter;
            
            return matchesQuery && matchesStatus;
        });

        // Ordenar: os abertos primeiro, depois por data de abertura decrescente
        filtered.sort((a, b) => {
            if (a.status === 'ABERTO' && b.status !== 'ABERTO') return -1;
            if (a.status !== 'ABERTO' && b.status === 'ABERTO') return 1;
            return new Date(b.dataAbertura) - new Date(a.dataAbertura);
        });

        // Limpar
        listContainer.innerHTML = '';

        if (filtered.length === 0) {
            emptyState.style.display = 'flex';
            return;
        } else {
            emptyState.style.display = 'none';
        }

        filtered.forEach(ch => {
            const card = document.createElement('div');
            card.className = 'chamado-card';

            let statusBadge = '';
            if (ch.status === 'ABERTO') {
                statusBadge = '<span class="badge badge-danger">Aberto</span>';
            } else if (ch.status === 'EM_ANDAMENTO') {
                statusBadge = '<span class="badge badge-warning">Em Andamento</span>';
            } else if (ch.status === 'CONCLUIDO') {
                statusBadge = '<span class="badge badge-success">Concluído</span>';
            }

            // Nome do equipamento (tratamento opcional)
            const eqNome = ch.equipamento ? this.escapeHTML(ch.equipamento.nome) : 'Não Especificado (Geral)';
            const eqEmpresa = ch.equipamento ? this.escapeHTML(ch.equipamento.nomeEmpresa) : '-';
            const eqTextDisplay = ch.equipamento ? `${eqNome}` : `<span style="font-style: italic; color: hsl(var(--text-muted));">${eqNome}</span>`;

            // Técnico responsável
            const tecNome = ch.tecnico ? this.escapeHTML(ch.tecnico.nome) : 'Não Atribuído';

            // Ações disponíveis
            let actionButtons = '';
            if (ch.status === 'ABERTO') {
                actionButtons = `
                    <button class="btn btn-success btn-sm btn-concluir-chamado-card" data-id="${ch.id}" data-eq-nome="${this.escapeHTML(eqNome)}" data-descricao="${this.escapeHTML(ch.descricaoProblema)}">
                        <i data-lucide="check" style="width: 14px; height: 14px;"></i> Concluir Chamado
                    </button>
                `;
            }

            // Se o utilizador atual for Administrador de TI, adicionamos a opção de excluir
            if (this.state.currentUser && this.state.currentUser.role === 'Administrador de TI') {
                actionButtons += `
                    <button class="btn btn-danger btn-sm btn-excluir-chamado-card" data-id="${ch.id}">
                        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i> Excluir Chamado
                    </button>
                `;
            }

            // Se não houver nenhuma ação disponível, mostra o texto padrão
            if (!actionButtons) {
                actionButtons = `<span style="font-size: 0.8rem; color: hsl(var(--text-muted)); font-style: italic;">Sem ações pendentes</span>`;
            }

            // Diagnóstico técnico
            const diagBlock = ch.diagnosticoTecnico 
                ? `<div class="ch-diagnostico">
                     <div class="ch-diagnostico-label">Diagnóstico Técnico</div>
                     <div>${this.escapeHTML(ch.diagnosticoTecnico)}</div>
                   </div>`
                : '';

            card.innerHTML = `
                <div class="ch-card-meta">
                    <span class="ch-id-badge">TICKET #${ch.id}</span>
                    <div class="ch-eq-info">
                        <span class="ch-eq-name">${eqTextDisplay}</span>
                        <span class="ch-eq-company">${eqEmpresa}</span>
                    </div>
                    <div>${statusBadge}</div>
                </div>

                <div class="ch-card-detail">
                    <p class="ch-description">${this.escapeHTML(ch.descricaoProblema)}</p>
                    ${diagBlock}
                    <div class="ch-dates">
                        <div class="ch-date-item">
                            <i data-lucide="user" style="width: 12px; height: 12px; color: hsl(var(--primary));"></i>
                            Técnico: <strong>${tecNome}</strong>
                        </div>
                        <div class="ch-date-item">
                            <i data-lucide="calendar" style="width: 12px; height: 12px;"></i>
                            Abertura: ${this.formatDate(ch.dataAbertura)}
                        </div>
                        ${ch.dataFechamento ? `
                        <div class="ch-date-item" style="color: hsl(var(--success));">
                            <i data-lucide="calendar-check" style="width: 12px; height: 12px;"></i>
                            Fecho: ${this.formatDate(ch.dataFechamento)}
                        </div>
                        ` : ''}
                    </div>
                </div>

                <div class="ch-card-actions-wrapper">
                    ${actionButtons}
                </div>
            `;

            // Event listener da ação concluir
            const btnConcluir = card.querySelector('.btn-concluir-chamado-card');
            if (btnConcluir) {
                btnConcluir.addEventListener('click', () => {
                    this.openModal('concluir', {
                        id: ch.id,
                        equipamentoNome: eqNome,
                        descricao: ch.descricaoProblema
                    });
                });
            }

            // Event listener da ação excluir
            const btnExcluir = card.querySelector('.btn-excluir-chamado-card');
            if (btnExcluir) {
                btnExcluir.addEventListener('click', () => {
                    this.handleDeletarChamado(ch.id);
                });
            }

            listContainer.appendChild(card);
        });

        // Recriar ícones lucide
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // Renderizar tabela de chamados recentes no dashboard
    renderRecentChamados() {
        const tableBody = document.querySelector('#table-recent-chamados tbody');
        const emptyState = document.getElementById('empty-state-recent');
        
        if (!tableBody) return;

        // Pegar chamados mais recentes (limite 5)
        const sorted = [...this.state.chamados]
            .sort((a, b) => new Date(b.dataAbertura) - new Date(a.dataAbertura))
            .slice(0, 5);

        tableBody.innerHTML = '';

        if (sorted.length === 0) {
            emptyState.style.display = 'block';
            tableBody.closest('table').style.display = 'none';
            return;
        } else {
            emptyState.style.display = 'none';
            tableBody.closest('table').style.display = 'table';
        }

        sorted.forEach(ch => {
            const row = document.createElement('tr');
            
            let badgeClass = 'badge-danger';
            let badgeText = 'Aberto';
            if (ch.status === 'EM_ANDAMENTO') {
                badgeClass = 'badge-warning';
                badgeText = 'Andamento';
            } else if (ch.status === 'CONCLUIDO') {
                badgeClass = 'badge-success';
                badgeText = 'Concluído';
            }

            const truncateDesc = ch.descricaoProblema.length > 50 
                ? ch.descricaoProblema.substring(0, 50) + '...'
                : ch.descricaoProblema;

            const eqNome = ch.equipamento ? this.escapeHTML(ch.equipamento.nome) : 'Não Especificado';
            const tecNome = ch.tecnico ? this.escapeHTML(ch.tecnico.nome) : 'Não Atribuído';

            row.innerHTML = `
                <td data-label="ID">#${ch.id}</td>
                <td data-label="Equipamento" style="font-weight: 500; color: #fff;">${eqNome}</td>
                <td data-label="Responsável">${tecNome}</td>
                <td data-label="Abertura">${this.formatDate(ch.dataAbertura)}</td>
                <td data-label="Status"><span class="badge ${badgeClass}">${badgeText}</span></td>
                <td data-label="Ações">
                    ${ch.status === 'ABERTO' ? `
                    <button class="btn btn-icon btn-icon-success btn-concluir-recent" data-id="${ch.id}" data-eq-nome="${this.escapeHTML(eqNome)}" data-descricao="${this.escapeHTML(ch.descricaoProblema)}" title="Concluir chamado">
                        <i data-lucide="check" style="width: 14px; height: 14px;"></i>
                    </button>` : `<span style="color: hsl(var(--text-muted)); font-size: 0.75rem;">Resolvido</span>`}
                </td>
            `;

            // Event listener da conclusão rápida
            const btnConcluirRecent = row.querySelector('.btn-concluir-recent');
            if (btnConcluirRecent) {
                btnConcluirRecent.addEventListener('click', () => {
                    this.openModal('concluir', {
                        id: ch.id,
                        equipamentoNome: eqNome,
                        descricao: ch.descricaoProblema
                    });
                });
            }

            tableBody.appendChild(row);
        });

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // ==========================================
    // ATUALIZAR GRÁFICOS DO CHART.JS
    // ==========================================
    updateCharts() {
        if (!this.state.isLogged || this.state.currentTab !== 'dashboard') return;

        // 1. Gráfico de Equipamentos
        const ctxEq = document.getElementById('chart-equipamentos');
        if (ctxEq) {
            const ativos = this.state.equipamentos.filter(e => e.status === 'ATIVO').length;
            const manut = this.state.equipamentos.filter(e => e.status === 'EM_MANUTENCAO').length;
            const dest = this.state.equipamentos.filter(e => e.status === 'DESTACADO').length;

            if (this.state.charts.equipamentos) {
                // Atualizar gráfico existente
                this.state.charts.equipamentos.data.datasets[0].data = [ativos, manut, dest];
                this.state.charts.equipamentos.update();
            } else {
                // Criar gráfico
                this.state.charts.equipamentos = new Chart(ctxEq, {
                    type: 'doughnut',
                    data: {
                        labels: ['Ativos', 'Em Manutenção', 'Destacados'],
                        datasets: [{
                            data: [ativos, manut, dest],
                            backgroundColor: [
                                'rgba(34, 197, 94, 0.75)',  // Verde
                                'rgba(245, 158, 11, 0.75)', // Amarelo
                                'rgba(14, 165, 233, 0.75)'  // Azul
                            ],
                            borderColor: [
                                '#121622', '#121622', '#121622'
                            ],
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: { color: '#e5e7eb', font: { family: 'Inter', size: 11 } }
                            }
                        },
                        cutout: '65%'
                    }
                });
            }
        }

        // 2. Gráfico de Chamados
        const ctxCh = document.getElementById('chart-chamados');
        if (ctxCh) {
            const abertos = this.state.chamados.filter(c => c.status === 'ABERTO').length;
            const andamento = this.state.chamados.filter(c => c.status === 'EM_ANDAMENTO').length;
            const concluidos = this.state.chamados.filter(c => c.status === 'CONCLUIDO').length;

            if (this.state.charts.chamados) {
                this.state.charts.chamados.data.datasets[0].data = [abertos, andamento, concluidos];
                this.state.charts.chamados.update();
            } else {
                this.state.charts.chamados = new Chart(ctxCh, {
                    type: 'bar',
                    data: {
                        labels: ['Abertos', 'Em Andamento', 'Concluídos'],
                        datasets: [{
                            label: 'Quantidade',
                            data: [abertos, andamento, concluidos],
                            backgroundColor: [
                                'rgba(239, 68, 68, 0.75)',  // Vermelho
                                'rgba(245, 158, 11, 0.75)', // Amarelo
                                'rgba(34, 197, 94, 0.75)'   // Verde
                            ],
                            borderColor: '#252c42',
                            borderWidth: 1,
                            borderRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            x: {
                                grid: { display: false },
                                ticks: { color: '#9ca3af', font: { family: 'Inter' } }
                            },
                            y: {
                                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                                ticks: { color: '#9ca3af', stepSize: 1, font: { family: 'Inter' } }
                            }
                        }
                    }
                });
            }
        }
    }

    // ==========================================
    // SISTEMA DE TOAST NOTIFICATIONS
    // ==========================================
    showToast(title, message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: 'check-circle-2',
            danger: 'alert-triangle',
            warning: 'alert-circle',
            info: 'info'
        };

        const iconName = icons[type] || 'info';

        toast.innerHTML = `
            <div class="toast-icon">
                <i data-lucide="${iconName}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${this.escapeHTML(title)}</div>
                <div class="toast-msg">${this.escapeHTML(message)}</div>
            </div>
            <button class="toast-close">
                <i data-lucide="x"></i>
            </button>
        `;

        // Lógica de fechamento ao clicar no X
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.removeToast(toast);
        });

        container.appendChild(toast);
        
        // Criar ícones lucide no toast recém-criado
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Auto-remover após 5 segundos
        setTimeout(() => {
            this.removeToast(toast);
        }, 5000);
    }

    removeToast(toast) {
        if (toast.parentNode) {
            toast.classList.add('removing');
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }
    }

    // ==========================================
    // MÉTODOS AUXILIARES
    // ==========================================
    formatDate(dateString) {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('pt-PT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    }

    escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

// Inicializar aplicação
const app = new AtivoFlowApp();
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
