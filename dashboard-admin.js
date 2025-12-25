 // ==================== DONNÉES DU SUPER ADMIN ====================
        let adminData = {
            superAdmin: {
                id: "SUPER-001",
                name: "Super Admin",
                email: "superadmin@bankai.com",
                role: "Super Admin",
                permissions: ["all"],
                lastLogin: new Date().toISOString(),
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=superadmin"
            },
            system: {
                users: [],
                enterprises: [],
                cards: [],
                orders: [],
                payments: [],
                admins: [],
                settings: {
                    notifications: {
                        newUser: true,
                        newOrder: true,
                        payment: true,
                        cardBlocked: true
                    },
                    security: {
                        sessionTimeout: 30,
                        maxLoginAttempts: 5,
                        twoFactorAuth: false
                    },
                    payments: {
                        defaultCurrency: "GNF",
                        serviceTax: 0
                    },
                    email: {
                        senderEmail: "noreply@bankai.com",
                        senderName: "Bankaï Support"
                    },
                    maintenance: false
                },
                analytics: {
                    stats: {
                        totalUsers: 0,
                        totalEnterprises: 0,
                        totalCards: 0,
                        activeCards: 0,
                        monthlyRevenue: 0,
                        dailyGrowth: 0
                    },
                    charts: {
                        usersGrowth: [],
                        cardsDistribution: [],
                        revenue: []
                    },
                    recentActivities: []
                }
            }
        };

        // ==================== INITIALISATION ====================
        document.addEventListener('DOMContentLoaded', function () {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser || currentUser.role !== 'superadmin') {
                window.location.href = 'login.html';
                return;
            }

            const savedData = localStorage.getItem('adminData');
            if (savedData) {
                adminData = JSON.parse(savedData);
            } else {
                generateDemoData();
                updateAnalytics(); // ← AJOUTER CETTE LIGNE
                saveAdminData();
            }

            // Force la mise à jour des analytics même si les données existent
            updateAnalytics(); // ← AJOUTER AUSSI CETTE LIGNE

            initializeAdminDashboard(currentUser);
            initializeDataTables();

            setTimeout(() => {
                initializeAdminCharts();
            }, 100);
        });

        function generateDemoData() {
            // Générer des utilisateurs de démo
            adminData.system.users = Array.from({ length: 50 }, (_, i) => {
                const isEnterprise = i % 3 === 0;
                const firstName = ["Mohamed", "Fatoumata", "Ibrahima", "Aïcha", "Moussa", "Kadiatou", "Oumar", "Mariam"][i % 8];
                const lastName = ["Konaté", "Diallo", "Traoré", "Bah", "Camara", "Sow", "Cissé", "Keita"][i % 8];

                return {
                    id: `USR-${String(1000 + i).padStart(6, '0')}`,
                    firstName: firstName,
                    lastName: lastName,
                    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
                    phone: `+2246${Math.floor(Math.random() * 90000000) + 10000000}`,
                    type: isEnterprise ? "enterprise" : "individual",
                    status: Math.random() > 0.2 ? "active" : "inactive",
                    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
                    lastLogin: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
                    company: isEnterprise ? `${firstName} ${lastName} SARL` : null,
                    taxId: isEnterprise ? `NIF-${Math.floor(Math.random() * 1000000000)}` : null
                };
            });

            // Générer des entreprises
            adminData.system.enterprises = adminData.system.users
                .filter(u => u.type === "enterprise")
                .map(user => ({
                    id: `ENT-${user.id.split('-')[1]}`,
                    name: user.company,
                    contact: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    phone: user.phone,
                    taxId: user.taxId,
                    subscription: {
                        plan: Math.random() > 0.5 ? "entreprise" : "premium",
                        price: Math.random() > 0.5 ? 400000 : 600000,
                        status: Math.random() > 0.2 ? "active" : "pending",
                        cardsCount: Math.floor(Math.random() * 50) + 10,
                        activeCards: Math.floor(Math.random() * 45) + 5
                    },
                    createdAt: user.createdAt,
                    lastActivity: user.lastLogin
                }));

            // Générer des cartes
            adminData.system.cards = Array.from({ length: 200 }, (_, i) => {
                const cardId = `BKA-${String(1000 + i).padStart(6, '0')}`;
                const isEnterpriseCard = i % 3 === 0;
                const owner = isEnterpriseCard ?
                    adminData.system.enterprises[Math.floor(Math.random() * adminData.system.enterprises.length)] :
                    adminData.system.users[Math.floor(Math.random() * adminData.system.users.length)];

                const statuses = ['active', 'active', 'active', 'inactive', 'blocked'];
                const status = statuses[Math.floor(Math.random() * statuses.length)];

                return {
                    id: cardId,
                    ownerId: owner.id,
                    ownerName: isEnterpriseCard ? owner.name : `${owner.firstName} ${owner.lastName}`,
                    ownerType: isEnterpriseCard ? "enterprise" : "individual",
                    cardType: Math.random() > 0.7 ? "pro" : "essentiel",
                    status: status,
                    scans: status === 'active' ? Math.floor(Math.random() * 500) + 50 : Math.floor(Math.random() * 50),
                    activeLinks: status === 'active' ? Math.floor(Math.random() * 10) + 1 : 0,
                    createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
                    lastScan: status === 'active' ?
                        new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
                    notes: status === 'blocked' ? "Carte perdue" : ""
                };
            });

            // Générer des commandes
            adminData.system.orders = Array.from({ length: 75 }, (_, i) => {
                const orderId = `CMD-${new Date().getFullYear()}-${String(1000 + i).padStart(3, '0')}`;
                const customer = adminData.system.users[Math.floor(Math.random() * adminData.system.users.length)];
                const statuses = ['pending', 'processing', 'shipping', 'delivered', 'cancelled'];
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                const productTypes = ["Carte Essentiel", "Carte Pro", "Renouvellement", "Pack Entreprise"];
                const product = productTypes[Math.floor(Math.random() * productTypes.length)];
                const amount = product.includes("Pro") ? 250000 :
                    product.includes("Entreprise") ? 400000 : 150000;

                return {
                    id: orderId,
                    customerId: customer.id,
                    customerName: `${customer.firstName} ${customer.lastName}`,
                    product: product,
                    quantity: 1,
                    amount: amount,
                    status: status,
                    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
                    deliveredAt: status === 'delivered' ?
                        new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
                    paymentStatus: Math.random() > 0.2 ? 'paid' : 'pending'
                };
            });

            // Générer des paiements
            adminData.system.payments = adminData.system.orders
                .filter(o => o.paymentStatus === 'paid')
                .map(order => ({
                    id: `PAY-${order.id.split('-').slice(1).join('-')}`,
                    orderId: order.id,
                    customerId: order.customerId,
                    customerName: order.customerName,
                    amount: order.amount,
                    method: ["orange_money", "mobile_money", "card", "bank_transfer"][Math.floor(Math.random() * 4)],
                    status: "completed",
                    transactionId: `TXN${Math.floor(Math.random() * 1000000000)}`,
                    date: order.createdAt
                }));

            // Générer des administrateurs
            adminData.system.admins = [
                {
                    id: "ADM-001",
                    name: "Admin Support",
                    email: "support@bankai.com",
                    role: "Admin Support",
                    permissions: ["orders", "cards", "exports"],
                    status: "active",
                    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: "ADM-002",
                    name: "Admin Analytics",
                    email: "analytics@bankai.com",
                    role: "Admin Analytics",
                    permissions: ["analytics", "exports"],
                    status: "active",
                    lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
                }
            ];

            // Mettre à jour les stats
            updateAnalytics();
        }

        function updateAnalytics() {
            const stats = adminData.system.analytics.stats;

            stats.totalUsers = adminData.system.users.length;
            stats.totalEnterprises = adminData.system.enterprises.length;
            stats.totalCards = adminData.system.cards.length;
            stats.activeCards = adminData.system.cards.filter(c => c.status === 'active').length;

            // Calculer les revenus mensuels
            const thisMonth = new Date().getMonth();
            const thisYear = new Date().getFullYear();
            stats.monthlyRevenue = adminData.system.payments
                .filter(p => {
                    const date = new Date(p.date);
                    return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
                })
                .reduce((sum, p) => sum + p.amount, 0);

            // Calculer la croissance quotidienne
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const usersToday = adminData.system.users.filter(u =>
                u.createdAt.split('T')[0] === today).length;
            const usersYesterday = adminData.system.users.filter(u =>
                u.createdAt.split('T')[0] === yesterday).length;

            stats.dailyGrowth = usersYesterday > 0 ?
                Math.round(((usersToday - usersYesterday) / usersYesterday) * 100) : 0;

            // Générer des données pour les graphiques
            generateChartData();
        }

        function generateChartData() {
            // Données de croissance des utilisateurs (30 derniers jours)
            adminData.system.analytics.charts.usersGrowth = Array.from({ length: 30 }, (_, i) => {
                const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
                return {
                    date: date.toISOString().split('T')[0],
                    count: Math.floor(Math.random() * 10) + 3
                };
            });

            // Répartition des cartes
            adminData.system.analytics.charts.cardsDistribution = {
                enterprise: adminData.system.cards.filter(c => c.ownerType === 'enterprise').length,
                individual: adminData.system.cards.filter(c => c.ownerType === 'individual').length
            };

            // Revenus des 12 derniers mois
            adminData.system.analytics.charts.revenue = Array.from({ length: 12 }, (_, i) => {
                const month = new Date();
                month.setMonth(month.getMonth() - (11 - i));
                return {
                    month: month.toLocaleDateString('fr-FR', { month: 'short' }),
                    revenue: Math.floor(Math.random() * 5000000) + 1000000
                };
            });

            // Activités récentes
            adminData.system.analytics.recentActivities = Array.from({ length: 10 }, (_, i) => {
                const activities = [
                    "Nouvel utilisateur inscrit",
                    "Commande créée",
                    "Paiement reçu",
                    "Carte bloquée",
                    "Carte activée",
                    "Statut de commande mis à jour",
                    "Export de données effectué",
                    "Admin connecté",
                    "Rapport généré",
                    "Paramètres mis à jour"
                ];
                const date = new Date(Date.now() - i * 2 * 60 * 60 * 1000);

                return {
                    id: `ACT-${Date.now()}-${i}`,
                    type: activities[Math.floor(Math.random() * activities.length)],
                    timestamp: date.toISOString(),
                    description: `${activities[Math.floor(Math.random() * activities.length)]} à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                };
            });
        }

        // ==================== FONCTIONS D'INITIALISATION ====================
        function initializeAdminDashboard(user) {
            // Mettre à jour l'affichage utilisateur
            updateAdminDisplay(user);

            // Charger toutes les données
            loadAllData();

            // Configurer les événements
            setupAdminEventListeners();
            setupMobileMenu();

            // Afficher la vue d'ensemble par défaut
            showAdminSection('overview');

            // Initialiser les modals
            setupModals();
        }

        function updateAdminDisplay(user) {
            document.getElementById('miniName').textContent = adminData.superAdmin.name;
            document.getElementById('userRole').textContent = adminData.superAdmin.role;
            document.getElementById('miniAvatar').src = adminData.superAdmin.avatar;
        }

        function loadAllData() {
            loadStats();
            loadUsersTable();
            loadEnterprisesGrid();
            loadCardsTable();
            loadOrdersTable();
            loadPaymentsTable();
            loadAdminsTable();
            loadRecentActivities();
            loadReportStats();
            loadSystemSettings();
        }

        function initializeDataTables() {
            // Initialiser DataTables avec options personnalisées
            $('#usersTable').DataTable({
                pageLength: 10,
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json'
                },
                dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rt<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
                columnDefs: [
                    { orderable: false, targets: 7 } // Désactiver le tri sur la colonne Actions
                ]
            });

            $('#cardsTable').DataTable({
                pageLength: 10,
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json'
                }
            });

            $('#ordersTable').DataTable({
                pageLength: 10,
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json'
                }
            });

            $('#paymentsTable').DataTable({
                pageLength: 10,
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json'
                }
            });
        }

        // ==================== FONCTIONS DE CHARGEMENT ====================
        function loadStats() {
            const stats = adminData.system.analytics.stats;

            document.getElementById('statsTotalUsers').textContent = stats.totalUsers.toLocaleString();
            document.getElementById('statsEnterprises').textContent = stats.totalEnterprises.toLocaleString();
            document.getElementById('statsActiveCards').textContent = stats.activeCards.toLocaleString();
            document.getElementById('statsRevenue').textContent = stats.monthlyRevenue.toLocaleString('fr-FR') + ' GNF';

            document.getElementById('totalRevenue').textContent =
                adminData.system.payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString('fr-FR') + ' GNF';
            document.getElementById('successfulPayments').textContent =
                adminData.system.payments.filter(p => p.status === 'completed').length.toLocaleString();
            document.getElementById('pendingPayments').textContent =
                adminData.system.orders.filter(o => o.paymentStatus === 'pending').length.toLocaleString();
            document.getElementById('failedPayments').textContent =
                adminData.system.orders.filter(o => o.status === 'cancelled').length.toLocaleString();
        }

        function loadUsersTable() {
            const tbody = document.getElementById('usersTableBody');
            tbody.innerHTML = '';

            adminData.system.users.forEach(user => {
                let typeClass = 'badge-individual';
                let typeText = 'Individuel';

                if (user.type === 'enterprise') {
                    typeClass = 'badge-enterprise';
                    typeText = 'Entreprise';
                } else if (user.type === 'subadmin') {
                    typeClass = 'badge-subadmin';
                    typeText = 'Sous-admin';
                }

                let statusClass = user.status === 'active' ? 'badge-active' :
                    user.status === 'inactive' ? 'badge-inactive' : 'badge-pending';

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><small class="text-secondary">${user.id}</small></td>
                    <td><strong>${user.firstName} ${user.lastName}</strong></td>
                    <td>${user.email}</td>
                    <td>${user.phone || 'Non renseigné'}</td>
                    <td><span class="badge-status ${typeClass}">${typeText}</span></td>
                    <td><span class="badge-status ${statusClass}">${user.status}</span></td>
                    <td>${new Date(user.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td>
                        <div class="d-flex gap-1">
                            <button class="btn btn-sm btn-admin-outline" onclick="viewUser('${user.id}')" title="Voir">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-admin-outline" onclick="editUser('${user.id}')" title="Modifier">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}', '${user.firstName} ${user.lastName}')" title="Supprimer">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        function loadEnterprisesGrid() {
            const grid = document.getElementById('enterprisesGrid');
            grid.innerHTML = '';

            adminData.system.enterprises.forEach(enterprise => {
                const card = document.createElement('div');
                card.className = 'card-item';
                card.innerHTML = `
                    <div class="card-header">
                        <div>
                            <div class="card-title">${enterprise.name}</div>
                            <div class="card-subtitle">${enterprise.contact}</div>
                        </div>
                        <span class="badge-status ${enterprise.subscription.status === 'active' ? 'badge-active' : 'badge-pending'}">
                            ${enterprise.subscription.status === 'active' ? 'Actif' : 'En attente'}
                        </span>
                    </div>
                    <div class="card-stats">
                        <div class="card-stat">
                            <div class="card-stat-value">${enterprise.subscription.cardsCount}</div>
                            <div class="card-stat-label">Cartes</div>
                        </div>
                        <div class="card-stat">
                            <div class="card-stat-value">${enterprise.subscription.activeCards}</div>
                            <div class="card-stat-label">Actives</div>
                        </div>
                    </div>
                    <div class="mt-3 d-flex gap-2">
                        <button class="btn btn-sm btn-admin-outline" onclick="viewEnterprise('${enterprise.id}')">
                            <i class="bi bi-eye me-1"></i> Voir
                        </button>
                        <button class="btn btn-sm btn-admin-outline" onclick="manageEnterpriseCards('${enterprise.id}')">
                            <i class="bi bi-credit-card me-1"></i> Cartes
                        </button>
                        <button class="btn btn-sm btn-admin-outline" onclick="sendEmailToEnterprise('${enterprise.id}')">
                            <i class="bi bi-envelope me-1"></i> Email
                        </button>
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        function loadCardsTable() {
            const tbody = document.getElementById('cardsTableBody');
            tbody.innerHTML = '';

            adminData.system.cards.forEach(card => {
                let statusClass = 'badge-inactive';
                let statusText = 'Inactive';

                if (card.status === 'active') {
                    statusClass = 'badge-active';
                    statusText = 'Active';
                } else if (card.status === 'blocked') {
                    statusClass = 'badge-blocked';
                    statusText = 'Bloquée';
                }

                const typeClass = card.ownerType === 'enterprise' ? 'badge-enterprise' : 'badge-individual';

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong class="text-primary">${card.id}</strong></td>
                    <td>${card.ownerName}</td>
                    <td><span class="badge-status ${typeClass}">${card.ownerType === 'enterprise' ? 'Entreprise' : 'Individuel'}</span></td>
                    <td><span class="badge-status ${statusClass}">${statusText}</span></td>
                    <td><strong>${card.scans}</strong></td>
                    <td>${card.activeLinks} liens</td>
                    <td>${new Date(card.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td>${card.lastScan ? new Date(card.lastScan).toLocaleDateString('fr-FR') : 'Jamais'}</td>
                    <td>
                        <div class="d-flex gap-1">
                            <button class="btn btn-sm btn-admin-outline" onclick="viewCard('${card.id}')" title="Voir">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-warning ${card.status === 'blocked' ? 'd-none' : ''}" 
                                    onclick="blockCard('${card.id}')" title="Bloquer">
                                <i class="bi bi-slash-circle"></i>
                            </button>
                            <button class="btn btn-sm btn-success ${card.status !== 'blocked' ? 'd-none' : ''}" 
                                    onclick="unblockCard('${card.id}')" title="Débloquer">
                                <i class="bi bi-check-circle"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteCard('${card.id}')" title="Supprimer">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        function loadOrdersTable() {
            const tbody = document.getElementById('ordersTableBody');
            tbody.innerHTML = '';

            adminData.system.orders.forEach(order => {
                let statusClass = 'badge-pending';
                let statusText = 'En attente';

                if (order.status === 'processing') {
                    statusClass = 'badge-warning';
                    statusText = 'En production';
                } else if (order.status === 'shipping') {
                    statusClass = 'badge-info';
                    statusText = 'Livraison';
                } else if (order.status === 'delivered') {
                    statusClass = 'badge-success';
                    statusText = 'Livrée';
                } else if (order.status === 'cancelled') {
                    statusClass = 'badge-danger';
                    statusText = 'Annulée';
                }

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong class="text-primary">${order.id}</strong></td>
                    <td>${order.customerName}</td>
                    <td>${order.product}</td>
                    <td>${order.amount.toLocaleString('fr-FR')} GNF</td>
                    <td><span class="badge-status ${statusClass}">${statusText}</span></td>
                    <td>${new Date(order.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td>${order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString('fr-FR') : '—'}</td>
                    <td>
                        <div class="d-flex gap-1">
                            <button class="btn btn-sm btn-admin-outline" onclick="viewOrder('${order.id}')">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-admin-outline" onclick="updateOrder('${order.id}')">
                                <i class="bi bi-pencil"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        function loadPaymentsTable() {
            const tbody = document.getElementById('paymentsTableBody');
            tbody.innerHTML = '';

            adminData.system.payments.forEach(payment => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><small class="text-secondary">${payment.id}</small></td>
                    <td>${payment.customerName}</td>
                    <td><strong>${payment.amount.toLocaleString('fr-FR')} GNF</strong></td>
                    <td>
                        <span class="badge-status ${payment.method === 'orange_money' ? 'badge-warning' : 'badge-admin'}">
                            ${payment.method === 'orange_money' ? 'Orange Money' :
                        payment.method === 'mobile_money' ? 'Mobile Money' :
                            payment.method === 'card' ? 'Carte' : 'Virement'}
                        </span>
                    </td>
                    <td><span class="badge-status badge-success">Payé</span></td>
                    <td>${new Date(payment.date).toLocaleDateString('fr-FR')}</td>
                    <td><small class="text-primary">${payment.orderId}</small></td>
                    <td>
                        <button class="btn btn-sm btn-admin-outline" onclick="viewPayment('${payment.id}')">
                            <i class="bi bi-eye"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        function loadAdminsTable() {
            const tbody = document.getElementById('adminsTableBody');
            tbody.innerHTML = '';

            // Ajouter le super admin
            const superAdminRow = document.createElement('tr');
            superAdminRow.innerHTML = `
                <td><strong>${adminData.superAdmin.name}</strong></td>
                <td>${adminData.superAdmin.email}</td>
                <td><span class="badge-status badge-admin">Super Admin</span></td>
                <td><small class="text-secondary">Toutes permissions</small></td>
                <td>${new Date(adminData.superAdmin.lastLogin).toLocaleDateString('fr-FR')}</td>
                <td><span class="badge-status badge-active">Actif</span></td>
                <td><span class="text-secondary">—</span></td>
            `;
            tbody.appendChild(superAdminRow);

            // Ajouter les autres admins
            adminData.system.admins.forEach(admin => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${admin.name}</td>
                    <td>${admin.email}</td>
                    <td><span class="badge-status ${admin.role.includes('Support') ? 'badge-success' : 'badge-info'}">
                        ${admin.role}
                    </span></td>
                    <td><small class="text-secondary">${admin.permissions.join(', ')}</small></td>
                    <td>${admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'}</td>
                    <td><span class="badge-status ${admin.status === 'active' ? 'badge-active' : 'badge-inactive'}">
                        ${admin.status === 'active' ? 'Actif' : 'Inactif'}
                    </span></td>
                    <td>
                        <div class="d-flex gap-1">
                            <button class="btn btn-sm btn-admin-outline" onclick="editAdmin('${admin.id}')">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteAdmin('${admin.id}', '${admin.name}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        function loadRecentActivities() {
            const container = document.getElementById('recentActivities');
            container.innerHTML = '';

            adminData.system.analytics.recentActivities.slice(0, 5).forEach(activity => {
                const date = new Date(activity.timestamp);
                const timeAgo = getTimeAgo(date);

                const item = document.createElement('div');
                item.className = 'timeline-item';
                item.innerHTML = `
                    <div class="timeline-date">${timeAgo}</div>
                    <div class="timeline-content">${activity.description}</div>
                `;
                container.appendChild(item);
            });
        }

        function loadReportStats() {
            // Statistiques quotidiennes
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('dailyUsers').textContent =
                adminData.system.users.filter(u => u.createdAt.split('T')[0] === today).length;
            document.getElementById('dailyOrders').textContent =
                adminData.system.orders.filter(o => o.createdAt.split('T')[0] === today).length;

            // Statistiques hebdomadaires
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const weeklyRevenue = adminData.system.payments
                .filter(p => new Date(p.date) >= weekAgo)
                .reduce((sum, p) => sum + p.amount, 0);
            document.getElementById('weeklyRevenue').textContent =
                weeklyRevenue.toLocaleString('fr-FR') + ' GNF';

            // Statistiques mensuelles
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            document.getElementById('monthlyActive').textContent =
                adminData.system.users.filter(u => new Date(u.lastLogin) >= monthAgo).length;
            document.getElementById('monthlyCards').textContent =
                adminData.system.cards.filter(c => new Date(c.createdAt) >= monthAgo).length;
        }

        function loadSystemSettings() {
            const settings = adminData.system.settings;

            // Notifications
            document.getElementById('sysNotifNewUser').checked = settings.notifications.newUser;
            document.getElementById('sysNotifNewOrder').checked = settings.notifications.newOrder;
            document.getElementById('sysNotifPayment').checked = settings.notifications.payment;
            document.getElementById('sysNotifCardBlocked').checked = settings.notifications.cardBlocked;

            // Sécurité
            document.getElementById('sysSessionTimeout').value = settings.security.sessionTimeout;
            document.getElementById('sysMaxLoginAttempts').value = settings.security.maxLoginAttempts;
            document.getElementById('sysTwoFactorAuth').checked = settings.security.twoFactorAuth;

            // Paiements
            document.getElementById('sysDefaultCurrency').value = settings.payments.defaultCurrency;
            document.getElementById('sysServiceTax').value = settings.payments.serviceTax;

            // Email
            document.getElementById('sysSenderEmail').value = settings.email.senderEmail;
            document.getElementById('sysSenderName').value = settings.email.senderName;

            // Maintenance
            document.getElementById('maintenanceMode').checked = settings.maintenance;

            // Base de données
            document.getElementById('dbSize').textContent =
                (JSON.stringify(adminData).length / 1024 / 1024).toFixed(2) + ' MB';
            document.getElementById('dbBackupCount').textContent =
                localStorage.getItem('adminBackups') ?
                    JSON.parse(localStorage.getItem('adminBackups')).length : 0;
        }

        function getTimeAgo(date) {
            const now = new Date();
            const diff = now - date;

            const minutes = Math.floor(diff / (1000 * 60));
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));

            if (minutes < 60) {
                return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
            } else if (hours < 24) {
                return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
            } else if (days < 7) {
                return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
            } else {
                return date.toLocaleDateString('fr-FR');
            }
        }

        // ==================== GRAPHIQUES ====================
        function initializeAdminCharts() {
            // Graphique de croissance des utilisateurs
            const usersCtx = document.getElementById('usersGrowthChart');
            if (usersCtx) {
                new Chart(usersCtx, {
                    type: 'line',
                    data: {
                        labels: adminData.system.analytics.charts.usersGrowth.map(d =>
                            new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })),
                        datasets: [{
                            label: 'Nouveaux utilisateurs',
                            data: adminData.system.analytics.charts.usersGrowth.map(d => d.count),
                            borderColor: 'rgb(34, 108, 218)',
                            backgroundColor: 'rgba(34, 108, 218, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                labels: {
                                    color: '#fff'
                                }
                            }
                        },
                        scales: {
                            x: {
                                ticks: {
                                    color: '#a1a1aa'
                                },
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                }
                            },
                            y: {
                                ticks: {
                                    color: '#a1a1aa'
                                },
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                }
                            }
                        }
                    }
                });
            }

            // Graphique de répartition des cartes
            const cardsCtx = document.getElementById('cardsDistributionChart');
            if (cardsCtx) {
                new Chart(cardsCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Entreprises', 'Individuels'],
                        datasets: [{
                            data: [
                                adminData.system.analytics.charts.cardsDistribution.enterprise,
                                adminData.system.analytics.charts.cardsDistribution.individual
                            ],
                            backgroundColor: [
                                'rgba(40, 167, 69, 0.8)',
                                'rgba(23, 162, 184, 0.8)'
                            ],
                            borderColor: [
                                'rgb(40, 167, 69)',
                                'rgb(23, 162, 184)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    color: '#fff',
                                    padding: 20
                                }
                            }
                        }
                    }
                });
            }

            // Graphique des revenus
            const revenueCtx = document.getElementById('revenueChart');
            if (revenueCtx) {
                new Chart(revenueCtx, {
                    type: 'bar',
                    data: {
                        labels: adminData.system.analytics.charts.revenue.map(d => d.month),
                        datasets: [{
                            label: 'Revenus (GNF)',
                            data: adminData.system.analytics.charts.revenue.map(d => d.revenue),
                            backgroundColor: 'rgba(34, 108, 218, 0.8)',
                            borderColor: 'rgb(34, 108, 218)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                labels: {
                                    color: '#fff'
                                }
                            }
                        },
                        scales: {
                            x: {
                                ticks: {
                                    color: '#a1a1aa'
                                },
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                }
                            },
                            y: {
                                ticks: {
                                    color: '#a1a1aa',
                                    callback: function (value) {
                                        return (value / 1000000).toFixed(1) + 'M';
                                    }
                                },
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                }
                            }
                        }
                    }
                });
            }
        }

        // ==================== GESTION DES ÉVÉNEMENTS ====================
        function setupAdminEventListeners() {
            // Navigation
            const navLinks = document.querySelectorAll('.sidebar .nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', function (e) {
                    e.preventDefault();

                    navLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');

                    const section = this.getAttribute('data-section');
                    showAdminSection(section);

                    closeMobileMenu();
                });
            });

            // Formulaire paramètres système
            document.getElementById('systemSettingsForm').addEventListener('submit', function (e) {
                e.preventDefault();
                saveSystemSettings();
            });

            // Type d'utilisateur dans le modal
            document.getElementById('userType').addEventListener('change', function () {
                const type = this.value;
                document.getElementById('companyFields').style.display =
                    type === 'enterprise' ? 'block' : 'none';
                document.getElementById('adminFields').style.display =
                    type === 'subadmin' ? 'block' : 'none';
            });

            // Déconnexion
            document.getElementById('logoutBtn').addEventListener('click', logout);
        }

        function setupMobileMenu() {
            const menuToggle = document.getElementById('menuToggle');
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebarOverlay');

            menuToggle.addEventListener('click', function () {
                sidebar.classList.add('show');
                overlay.classList.add('show');
            });

            overlay.addEventListener('click', closeMobileMenu);

            document.querySelectorAll('.sidebar .nav-link').forEach(link => {
                link.addEventListener('click', closeMobileMenu);
            });

            document.getElementById('logoutBtn').addEventListener('click', closeMobileMenu);
        }

        function setupModals() {
            // Gérer la fermeture des modals avec Escape
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    const modals = document.querySelectorAll('.modal.show');
                    modals.forEach(modal => {
                        const modalInstance = bootstrap.Modal.getInstance(modal);
                        if (modalInstance) {
                            modalInstance.hide();
                        }
                    });
                }
            });
        }

        function closeMobileMenu() {
            document.getElementById('sidebar').classList.remove('show');
            document.getElementById('sidebarOverlay').classList.remove('show');
        }

        // ==================== FONCTIONS PRINCIPALES ====================
        function showAdminSection(section) {
            // Cacher toutes les sections
            document.querySelectorAll('.dashboard-section').forEach(sec => {
                sec.classList.add('d-none');
            });

            // Afficher la section demandée
            document.getElementById(section + 'Section').classList.remove('d-none');

            // Mettre à jour le titre
            updateAdminTitle(section);

            // Mettre à jour la navigation
            updateAdminNavigation(section);

            // Recharger les données si nécessaire
            if (section === 'cards') {
                loadCardsTable();
            } else if (section === 'analytics') {
                initializeAdminCharts();
            }
        }

        function updateAdminTitle(section) {
            const titles = {
                overview: 'Vue d\'ensemble',
                users: 'Gestion des utilisateurs',
                enterprises: 'Gestion des entreprises',
                cards: 'Gestion des cartes',
                orders: 'Gestion des commandes',
                payments: 'Suivi des paiements',
                admins: 'Gestion des administrateurs',
                analytics: 'Analytics & Statistiques',
                reports: 'Rapports & Exports',
                settings: 'Paramètres système'
            };

            document.getElementById('dashboardTitle').textContent = titles[section] || 'Super Admin Dashboard';
        }

        function updateAdminNavigation(section) {
            const navLinks = document.querySelectorAll('.sidebar .nav-link');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-section') === section) {
                    link.classList.add('active');
                }
            });
        }

        // ==================== FONCTIONS UTILITAIRES ====================
        function showNotification(message, type = 'info', duration = 5000) {
            const notification = document.createElement('div');
            notification.className = `notification alert-${type}`;

            let icon = 'info-circle';
            if (type === 'success') icon = 'check-circle';
            if (type === 'error') icon = 'exclamation-circle';
            if (type === 'warning') icon = 'exclamation-triangle';

            notification.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <i class="bi bi-${icon} me-2"></i>
                        <span>${message}</span>
                    </div>
                    <button type="button" class="btn-close btn-close-white" onclick="this.parentElement.parentElement.remove()"></button>
                </div>
            `;

            document.body.appendChild(notification);

            // Supprimer après la durée spécifiée
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, duration);
        }

        function saveAdminData() {
            localStorage.setItem('adminData', JSON.stringify(adminData));
        }

        // ==================== FONCTIONS DE GESTION ====================
        function createUser() {
            const firstName = document.getElementById('userFirstName').value.trim();
            const lastName = document.getElementById('userLastName').value.trim();
            const email = document.getElementById('userEmail').value.trim();
            const password = document.getElementById('userPassword').value;
            const passwordConfirm = document.getElementById('userPasswordConfirm').value;
            const type = document.getElementById('userType').value;
            const status = document.getElementById('userStatus').value;

            if (!firstName || !lastName || !email || !password || !type) {
                showNotification('Veuillez remplir tous les champs obligatoires', 'error');
                return;
            }

            if (password !== passwordConfirm) {
                showNotification('Les mots de passe ne correspondent pas', 'error');
                return;
            }

            // Vérifier si l'email existe déjà
            if (adminData.system.users.some(u => u.email === email)) {
                showNotification('Cet email est déjà utilisé', 'error');
                return;
            }

            const newUser = {
                id: `USR-${String(1000 + adminData.system.users.length).padStart(6, '0')}`,
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: document.getElementById('userPhone').value.trim() || null,
                type: type,
                status: status,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                company: type === 'enterprise' ? document.getElementById('userCompany').value.trim() : null,
                taxId: type === 'enterprise' ? document.getElementById('userTaxId').value.trim() : null
            };

            adminData.system.users.push(newUser);

            // Si c'est une entreprise, l'ajouter à la liste des entreprises
            if (type === 'enterprise') {
                const newEnterprise = {
                    id: `ENT-${newUser.id.split('-')[1]}`,
                    name: newUser.company,
                    contact: `${firstName} ${lastName}`,
                    email: email,
                    phone: newUser.phone,
                    taxId: newUser.taxId,
                    subscription: {
                        plan: 'starter',
                        price: 150000,
                        status: 'pending',
                        cardsCount: 0,
                        activeCards: 0
                    },
                    createdAt: newUser.createdAt,
                    lastActivity: null
                };
                adminData.system.enterprises.push(newEnterprise);
            }

            // Mettre à jour les analytics
            updateAnalytics();

            // Sauvegarder
            saveAdminData();

            // Recharger les données
            loadStats();
            loadUsersTable();
            loadEnterprisesGrid();

            // Fermer le modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
            modal.hide();

            // Réinitialiser le formulaire
            document.getElementById('addUserForm').reset();

            // Ajouter une activité
            adminData.system.analytics.recentActivities.unshift({
                id: `ACT-${Date.now()}`,
                type: 'Nouvel utilisateur créé',
                timestamp: new Date().toISOString(),
                description: `Utilisateur ${firstName} ${lastName} créé par Super Admin`
            });

            showNotification('Utilisateur créé avec succès !', 'success');
        }

        function createAdmin() {
            const email = document.getElementById('adminEmail').value.trim();
            const name = document.getElementById('adminName').value.trim();
            const type = document.getElementById('adminType').value;
            const tempPassword = document.getElementById('adminTempPassword').value;

            if (!email || !name || !type || !tempPassword) {
                showNotification('Veuillez remplir tous les champs', 'error');
                return;
            }

            // Vérifier si l'email existe déjà
            if (adminData.system.admins.some(a => a.email === email) ||
                adminData.system.users.some(u => u.email === email)) {
                showNotification('Cet email est déjà utilisé', 'error');
                return;
            }

            let role, permissions;
            switch (type) {
                case 'superadmin':
                    role = 'Super Admin';
                    permissions = ['all'];
                    break;
                case 'support':
                    role = 'Admin Support';
                    permissions = ['users', 'orders', 'cards', 'exports'];
                    break;
                case 'analytics':
                    role = 'Admin Analytics';
                    permissions = ['analytics', 'exports'];
                    break;
            }

            const newAdmin = {
                id: `ADM-${String(100 + adminData.system.admins.length + 1).padStart(3, '0')}`,
                name: name,
                email: email,
                role: role,
                permissions: permissions,
                status: 'active',
                createdAt: new Date().toISOString(),
                lastLogin: null
            };

            adminData.system.admins.push(newAdmin);

            // Ajouter aussi comme utilisateur
            const newUser = {
                id: `USR-ADM-${newAdmin.id.split('-')[1]}`,
                firstName: name.split(' ')[0],
                lastName: name.split(' ').slice(1).join(' ') || '',
                email: email,
                type: 'subadmin',
                status: 'active',
                createdAt: new Date().toISOString(),
                lastLogin: null
            };
            adminData.system.users.push(newUser);

            // Sauvegarder
            saveAdminData();

            // Recharger
            loadAdminsTable();
            loadUsersTable();

            // Fermer le modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addAdminModal'));
            modal.hide();

            // Réinitialiser le formulaire
            document.getElementById('addAdminForm').reset();

            // Ajouter une activité
            adminData.system.analytics.recentActivities.unshift({
                id: `ACT-${Date.now()}`,
                type: 'Nouvel admin créé',
                timestamp: new Date().toISOString(),
                description: `Administrateur ${name} créé par Super Admin`
            });

            showNotification('Administrateur créé avec succès !', 'success');
        }

        function deleteUser(userId, userName) {
            if (!confirm(`Supprimer l'utilisateur "${userName}" ?\n\nCette action est irréversible !`)) {
                return;
            }

            const userIndex = adminData.system.users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                const user = adminData.system.users[userIndex];

                // Si c'est une entreprise, supprimer aussi de la liste des entreprises
                if (user.type === 'enterprise') {
                    const enterpriseIndex = adminData.system.enterprises.findIndex(e => e.id === `ENT-${user.id.split('-')[1]}`);
                    if (enterpriseIndex !== -1) {
                        adminData.system.enterprises.splice(enterpriseIndex, 1);
                    }
                }

                // Si c'est un admin, supprimer aussi de la liste des admins
                if (user.type === 'subadmin') {
                    const adminIndex = adminData.system.admins.findIndex(a =>
                        a.email === user.email);
                    if (adminIndex !== -1) {
                        adminData.system.admins.splice(adminIndex, 1);
                    }
                }

                adminData.system.users.splice(userIndex, 1);

                // Mettre à jour les analytics
                updateAnalytics();

                // Sauvegarder
                saveAdminData();

                // Recharger
                loadStats();
                loadUsersTable();
                loadEnterprisesGrid();
                loadAdminsTable();

                // Ajouter une activité
                adminData.system.analytics.recentActivities.unshift({
                    id: `ACT-${Date.now()}`,
                    type: 'Utilisateur supprimé',
                    timestamp: new Date().toISOString(),
                    description: `Utilisateur ${userName} supprimé par Super Admin`
                });

                showNotification('Utilisateur supprimé avec succès !', 'success');
            }
        }

        function deleteAdmin(adminId, adminName) {
            if (!confirm(`Supprimer l'administrateur "${adminName}" ?\n\nIl perdra immédiatement tous ses accès.`)) {
                return;
            }

            const adminIndex = adminData.system.admins.findIndex(a => a.id === adminId);
            if (adminIndex !== -1) {
                const admin = adminData.system.admins[adminIndex];

                // Supprimer aussi de la liste des utilisateurs
                const userIndex = adminData.system.users.findIndex(u =>
                    u.email === admin.email && u.type === 'subadmin');
                if (userIndex !== -1) {
                    adminData.system.users.splice(userIndex, 1);
                }

                adminData.system.admins.splice(adminIndex, 1);

                // Sauvegarder
                saveAdminData();

                // Recharger
                loadAdminsTable();
                loadUsersTable();

                // Ajouter une activité
                adminData.system.analytics.recentActivities.unshift({
                    id: `ACT-${Date.now()}`,
                    type: 'Admin supprimé',
                    timestamp: new Date().toISOString(),
                    description: `Administrateur ${adminName} supprimé par Super Admin`
                });

                showNotification('Administrateur supprimé avec succès !', 'success');
            }
        }

        function blockCard(cardId) {
            if (!confirm(`Bloquer la carte ${cardId} ?\n\nElle ne pourra plus être scannée.`)) {
                return;
            }

            const cardIndex = adminData.system.cards.findIndex(c => c.id === cardId);
            if (cardIndex !== -1) {
                adminData.system.cards[cardIndex].status = 'blocked';

                // Sauvegarder
                saveAdminData();

                // Recharger
                loadCardsTable();

                // Ajouter une activité
                adminData.system.analytics.recentActivities.unshift({
                    id: `ACT-${Date.now()}`,
                    type: 'Carte bloquée',
                    timestamp: new Date().toISOString(),
                    description: `Carte ${cardId} bloquée par Super Admin`
                });

                showNotification('Carte bloquée avec succès !', 'success');
            }
        }

        function unblockCard(cardId) {
            const cardIndex = adminData.system.cards.findIndex(c => c.id === cardId);
            if (cardIndex !== -1) {
                adminData.system.cards[cardIndex].status = 'active';

                // Sauvegarder
                saveAdminData();

                // Recharger
                loadCardsTable();

                // Ajouter une activité
                adminData.system.analytics.recentActivities.unshift({
                    id: `ACT-${Date.now()}`,
                    type: 'Carte débloquée',
                    timestamp: new Date().toISOString(),
                    description: `Carte ${cardId} débloquée par Super Admin`
                });

                showNotification('Carte débloquée avec succès !', 'success');
            }
        }

        function deleteCard(cardId) {
            if (!confirm(`Supprimer la carte ${cardId} ?\n\nCette action est irréversible !`)) {
                return;
            }

            const cardIndex = adminData.system.cards.findIndex(c => c.id === cardId);
            if (cardIndex !== -1) {
                adminData.system.cards.splice(cardIndex, 1);

                // Mettre à jour les analytics
                updateAnalytics();

                // Sauvegarder
                saveAdminData();

                // Recharger
                loadStats();
                loadCardsTable();

                // Ajouter une activité
                adminData.system.analytics.recentActivities.unshift({
                    id: `ACT-${Date.now()}`,
                    type: 'Carte supprimée',
                    timestamp: new Date().toISOString(),
                    description: `Carte ${cardId} supprimée par Super Admin`
                });

                showNotification('Carte supprimée avec succès !', 'success');
            }
        }

        function updateOrderStatus() {
            const orderId = document.getElementById('updateOrderId').value.trim();
            const newStatus = document.getElementById('updateOrderStatus').value;
            const notes = document.getElementById('updateOrderNotes').value.trim();

            if (!orderId) {
                showNotification('Veuillez entrer un numéro de commande', 'error');
                return;
            }

            const orderIndex = adminData.system.orders.findIndex(o => o.id === orderId);
            if (orderIndex === -1) {
                showNotification('Commande non trouvée', 'error');
                return;
            }

            const oldStatus = adminData.system.orders[orderIndex].status;
            adminData.system.orders[orderIndex].status = newStatus;

            if (newStatus === 'delivered') {
                adminData.system.orders[orderIndex].deliveredAt = new Date().toISOString();
            }

            // Sauvegarder
            saveAdminData();

            // Recharger
            loadOrdersTable();

            // Fermer le modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('updateOrderModal'));
            modal.hide();

            // Réinitialiser le formulaire
            document.getElementById('updateOrderId').value = '';
            document.getElementById('updateOrderNotes').value = '';

            // Ajouter une activité
            adminData.system.analytics.recentActivities.unshift({
                id: `ACT-${Date.now()}`,
                type: 'Statut de commande mis à jour',
                timestamp: new Date().toISOString(),
                description: `Commande ${orderId} : ${oldStatus} → ${newStatus}`
            });

            showNotification('Statut de commande mis à jour !', 'success');
        }

        function executeBulkCardAction() {
            const action = document.getElementById('bulkCardAction').value;
            const specificIds = document.getElementById('bulkCardIds').value
                .split('\n')
                .map(id => id.trim())
                .filter(id => id);

            if (!action) {
                showNotification('Veuillez sélectionner une action', 'error');
                return;
            }

            let cardsToUpdate = [];

            if (specificIds.length > 0) {
                // Utiliser les IDs spécifiques
                cardsToUpdate = adminData.system.cards.filter(card =>
                    specificIds.includes(card.id));
            } else {
                // Utiliser les filtres
                const selectAll = document.getElementById('bulkSelectAll').checked;
                const selectEnterprise = document.getElementById('bulkSelectEnterprise').checked;
                const selectIndividual = document.getElementById('bulkSelectIndividual').checked;
                const selectInactive = document.getElementById('bulkSelectInactive').checked;

                if (!selectAll && !selectEnterprise && !selectIndividual && !selectInactive) {
                    showNotification('Veuillez sélectionner au moins un filtre', 'error');
                    return;
                }

                cardsToUpdate = adminData.system.cards.filter(card => {
                    if (selectAll) return true;
                    if (selectEnterprise && card.ownerType === 'enterprise') return true;
                    if (selectIndividual && card.ownerType === 'individual') return true;
                    if (selectInactive && card.status === 'inactive') return true;
                    return false;
                });
            }

            if (cardsToUpdate.length === 0) {
                showNotification('Aucune carte correspondante trouvée', 'warning');
                return;
            }

            if (!confirm(`Exécuter l'action "${action}" sur ${cardsToUpdate.length} carte(s) ?`)) {
                return;
            }

            cardsToUpdate.forEach(card => {
                switch (action) {
                    case 'block':
                        card.status = 'blocked';
                        break;
                    case 'unblock':
                        card.status = 'active';
                        break;
                    case 'activate':
                        card.status = 'active';
                        break;
                    case 'deactivate':
                        card.status = 'inactive';
                        break;
                    case 'reset':
                        card.scans = 0;
                        card.lastScan = null;
                        break;
                }
            });

            // Sauvegarder
            saveAdminData();

            // Recharger
            loadCardsTable();

            // Fermer le modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('bulkCardActionModal'));
            modal.hide();

            // Réinitialiser le formulaire
            document.getElementById('bulkCardAction').value = '';
            document.getElementById('bulkCardIds').value = '';
            document.querySelectorAll('#bulkCardActionModal input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });

            // Ajouter une activité
            adminData.system.analytics.recentActivities.unshift({
                id: `ACT-${Date.now()}`,
                type: 'Action en masse sur les cartes',
                timestamp: new Date().toISOString(),
                description: `${action} exécuté sur ${cardsToUpdate.length} carte(s)`
            });

            showNotification(`Action exécutée sur ${cardsToUpdate.length} carte(s) !`, 'success');
        }

        // ==================== FONCTIONS DE FILTRAGE ====================
        function filterUsers(filter) {
            const rows = document.querySelectorAll('#usersTableBody tr');
            const filterButtons = document.querySelectorAll('[onclick^="filterUsers"]');

            // Mettre à jour les boutons
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('onclick') === `filterUsers('${filter}')`) {
                    btn.classList.add('active');
                }
            });

            // Filtrer les lignes
            rows.forEach(row => {
                if (filter === 'all') {
                    row.style.display = '';
                } else {
                    const typeBadge = row.querySelector('td:nth-child(5) .badge-status');
                    const statusBadge = row.querySelector('td:nth-child(6) .badge-status');

                    let show = false;

                    if (filter === 'individual') {
                        show = typeBadge.textContent.includes('Individuel');
                    } else if (filter === 'enterprise') {
                        show = typeBadge.textContent.includes('Entreprise');
                    } else if (filter === 'active') {
                        show = statusBadge.textContent.includes('active');
                    } else if (filter === 'inactive') {
                        show = statusBadge.textContent.includes('inactive') ||
                            statusBadge.textContent.includes('pending');
                    }

                    row.style.display = show ? '' : 'none';
                }
            });
        }

        function filterCards(filter) {
            const rows = document.querySelectorAll('#cardsTableBody tr');
            const filterButtons = document.querySelectorAll('[onclick^="filterCards"]');

            // Mettre à jour les boutons
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('onclick') === `filterCards('${filter}')`) {
                    btn.classList.add('active');
                }
            });

            // Filtrer les lignes
            rows.forEach(row => {
                if (filter === 'all') {
                    row.style.display = '';
                } else {
                    const typeBadge = row.querySelector('td:nth-child(3) .badge-status');
                    const statusBadge = row.querySelector('td:nth-child(4) .badge-status');

                    let show = false;

                    if (filter === 'active') {
                        show = statusBadge.textContent.includes('Active');
                    } else if (filter === 'inactive') {
                        show = statusBadge.textContent.includes('Inactive');
                    } else if (filter === 'blocked') {
                        show = statusBadge.textContent.includes('Bloquée');
                    } else if (filter === 'enterprise') {
                        show = typeBadge.textContent.includes('Entreprise');
                    } else if (filter === 'individual') {
                        show = typeBadge.textContent.includes('Individuel');
                    }

                    row.style.display = show ? '' : 'none';
                }
            });
        }

        function filterOrders(filter) {
            const rows = document.querySelectorAll('#ordersTableBody tr');
            const filterButtons = document.querySelectorAll('[onclick^="filterOrders"]');

            // Mettre à jour les boutons
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('onclick') === `filterOrders('${filter}')`) {
                    btn.classList.add('active');
                }
            });

            // Filtrer les lignes
            rows.forEach(row => {
                if (filter === 'all') {
                    row.style.display = '';
                } else {
                    const statusBadge = row.querySelector('td:nth-child(5) .badge-status');

                    let show = false;
                    const statusText = statusBadge.textContent;

                    if (filter === 'pending') {
                        show = statusText.includes('attente');
                    } else if (filter === 'processing') {
                        show = statusText.includes('production');
                    } else if (filter === 'shipping') {
                        show = statusText.includes('Livraison');
                    } else if (filter === 'delivered') {
                        show = statusText.includes('Livrée');
                    } else if (filter === 'cancelled') {
                        show = statusText.includes('Annulée');
                    }

                    row.style.display = show ? '' : 'none';
                }
            });
        }

        // ==================== FONCTIONS DE RAPPORTS ====================
        function generateReport(type) {
            let reportData = {};
            let fileName = '';

            switch (type) {
                case 'daily':
                    const today = new Date().toISOString().split('T')[0];
                    reportData = {
                        date: today,
                        type: 'daily',
                        stats: {
                            newUsers: adminData.system.users.filter(u => u.createdAt.split('T')[0] === today).length,
                            newOrders: adminData.system.orders.filter(o => o.createdAt.split('T')[0] === today).length,
                            newPayments: adminData.system.payments.filter(p => p.date.split('T')[0] === today).length,
                            totalRevenue: adminData.system.payments
                                .filter(p => p.date.split('T')[0] === today)
                                .reduce((sum, p) => sum + p.amount, 0)
                        },
                        activities: adminData.system.analytics.recentActivities.filter(a =>
                            new Date(a.timestamp).toISOString().split('T')[0] === today)
                    };
                    fileName = `rapport-quotidien-${today}.json`;
                    break;

                case 'weekly':
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    reportData = {
                        period: 'weekly',
                        from: weekAgo.toISOString().split('T')[0],
                        to: new Date().toISOString().split('T')[0],
                        stats: {
                            totalUsers: adminData.system.users.length,
                            newUsers: adminData.system.users.filter(u => new Date(u.createdAt) >= weekAgo).length,
                            totalRevenue: adminData.system.payments
                                .filter(p => new Date(p.date) >= weekAgo)
                                .reduce((sum, p) => sum + p.amount, 0),
                            activeUsers: adminData.system.users.filter(u =>
                                u.lastLogin && new Date(u.lastLogin) >= weekAgo).length
                        }
                    };
                    fileName = `rapport-hebdomadaire-${new Date().toISOString().split('T')[0]}.json`;
                    break;

                case 'monthly':
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    reportData = {
                        period: 'monthly',
                        from: monthAgo.toISOString().split('T')[0],
                        to: new Date().toISOString().split('T')[0],
                        stats: adminData.system.analytics.stats,
                        charts: adminData.system.analytics.charts,
                        summary: {
                            topEnterprises: adminData.system.enterprises
                                .slice(0, 5)
                                .map(e => ({ name: e.name, cards: e.subscription.activeCards })),
                            topCards: adminData.system.cards
                                .filter(c => c.status === 'active')
                                .sort((a, b) => b.scans - a.scans)
                                .slice(0, 10)
                                .map(c => ({ id: c.id, scans: c.scans, owner: c.ownerName }))
                        }
                    };
                    fileName = `rapport-mensuel-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}.json`;
                    break;
            }

            // Sauvegarder le rapport
            const reports = JSON.parse(localStorage.getItem('adminReports') || '[]');
            reports.unshift({
                id: `REP-${Date.now()}`,
                type: type,
                generatedAt: new Date().toISOString(),
                data: reportData
            });
            localStorage.setItem('adminReports', JSON.stringify(reports));

            // Télécharger le rapport
            downloadFile(JSON.stringify(reportData, null, 2), fileName, 'application/json');

            // Ajouter une activité
            adminData.system.analytics.recentActivities.unshift({
                id: `ACT-${Date.now()}`,
                type: 'Rapport généré',
                timestamp: new Date().toISOString(),
                description: `Rapport ${type} généré par Super Admin`
            });

            showNotification(`Rapport ${type} généré et téléchargé !`, 'success');
        }

        function generateAnalyticsReport() {
            const report = {
                generatedAt: new Date().toISOString(),
                type: 'analytics',
                period: 'all-time',
                data: {
                    users: adminData.system.users.length,
                    enterprises: adminData.system.enterprises.length,
                    cards: adminData.system.cards.length,
                    activeCards: adminData.system.cards.filter(c => c.status === 'active').length,
                    totalRevenue: adminData.system.payments.reduce((sum, p) => sum + p.amount, 0),
                    monthlyRevenue: adminData.system.analytics.stats.monthlyRevenue,
                    growth: adminData.system.analytics.stats.dailyGrowth + '%'
                },
                charts: adminData.system.analytics.charts,
                recentActivities: adminData.system.analytics.recentActivities.slice(0, 20)
            };

            // Créer un PDF simple (simulation)
            const pdfWindow = window.open('', '_blank');
            pdfWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Rapport Analytics Bankaï</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; }
                        h1 { color: #226cda; }
                        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }
                        .stat-box { border: 1px solid #ddd; padding: 20px; text-align: center; }
                        .stat-value { font-size: 24px; font-weight: bold; color: #226cda; }
                    </style>
                </head>
                <body>
                    <h1>📊 Rapport Analytics Bankaï</h1>
                    <p>Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
                    
                    <div class="stats">
                        <div class="stat-box">
                            <div class="stat-label">Utilisateurs</div>
                            <div class="stat-value">${report.data.users}</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Entreprises</div>
                            <div class="stat-value">${report.data.enterprises}</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Cartes actives</div>
                            <div class="stat-value">${report.data.activeCards}</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Revenus totaux</div>
                            <div class="stat-value">${report.data.totalRevenue.toLocaleString('fr-FR')} GNF</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Revenus mensuels</div>
                            <div class="stat-value">${report.data.monthlyRevenue.toLocaleString('fr-FR')} GNF</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Croissance</div>
                            <div class="stat-value">${report.data.growth}</div>
                        </div>
                    </div>
                    
                    <h2>Dernières activités</h2>
                    <ul>
                        ${report.recentActivities.map(a => `
                            <li>${new Date(a.timestamp).toLocaleString('fr-FR')} - ${a.description}</li>
                        `).join('')}
                    </ul>
                </body>
                </html>
            `);
            pdfWindow.document.close();

            // Ajouter une activité
            adminData.system.analytics.recentActivities.unshift({
                id: `ACT-${Date.now()}`,
                type: 'Rapport analytics généré',
                timestamp: new Date().toISOString(),
                description: 'Rapport analytics PDF généré par Super Admin'
            });

            showNotification('Rapport analytics généré !', 'success');
        }

        function generateAuditReport() {
            const auditData = {
                generatedAt: new Date().toISOString(),
                type: 'audit',
                admin: adminData.superAdmin,
                systemInfo: {
                    totalData: JSON.stringify(adminData).length / 1024 / 1024,
                    lastBackup: localStorage.getItem('adminLastBackup') || 'Jamais',
                    settings: adminData.system.settings
                },
                recentChanges: adminData.system.analytics.recentActivities
                    .filter(a => a.type.includes('créé') || a.type.includes('supprimé') || a.type.includes('modifié'))
                    .slice(0, 50)
            };

            downloadFile(
                JSON.stringify(auditData, null, 2),
                `audit-bankai-${new Date().toISOString().split('T')[0]}.json`,
                'application/json'
            );

            showNotification('Rapport d\'audit généré et téléchargé !', 'success');
        }

        // ==================== EXPORT DE DONNÉES ====================
        function exportData(type, format) {
            let data, fileName;

            switch (type) {
                case 'users':
                    data = adminData.system.users;
                    fileName = `users-export-${new Date().toISOString().split('T')[0]}`;
                    break;
                case 'enterprises':
                    data = adminData.system.enterprises;
                    fileName = `enterprises-export-${new Date().toISOString().split('T')[0]}`;
                    break;
                case 'cards':
                    data = adminData.system.cards;
                    fileName = `cards-export-${new Date().toISOString().split('T')[0]}`;
                    break;
            }

            let content, mimeType;

            switch (format) {
                case 'csv':
                    content = convertToCSV(data);
                    mimeType = 'text/csv';
                    fileName += '.csv';
                    break;
                case 'excel':
                    content = convertToExcel(data);
                    mimeType = 'application/vnd.ms-excel';
                    fileName += '.xls';
                    break;
                case 'json':
                    content = JSON.stringify(data, null, 2);
                    mimeType = 'application/json';
                    fileName += '.json';
                    break;
            }

            downloadFile(content, fileName, mimeType);

            // Ajouter une activité
            adminData.system.analytics.recentActivities.unshift({
                id: `ACT-${Date.now()}`,
                type: 'Export de données',
                timestamp: new Date().toISOString(),
                description: `Export ${type} en ${format} par Super Admin`
            });

            showNotification(`Données ${type} exportées en ${format.toUpperCase()} !`, 'success');
        }

        function exportAllData(format) {
            const allData = {
                exportDate: new Date().toISOString(),
                users: adminData.system.users,
                enterprises: adminData.system.enterprises,
                cards: adminData.system.cards,
                orders: adminData.system.orders,
                payments: adminData.system.payments,
                admins: adminData.system.admins
            };

            let content, fileName, mimeType;

            switch (format) {
                case 'csv':
                    content = convertToCSV(allData.users);
                    mimeType = 'text/csv';
                    fileName = `bankai-full-export-${new Date().toISOString().split('T')[0]}.csv`;
                    break;
                case 'excel':
                    content = convertToExcel(allData.users);
                    mimeType = 'application/vnd.ms-excel';
                    fileName = `bankai-full-export-${new Date().toISOString().split('T')[0]}.xls`;
                    break;
                case 'json':
                    content = JSON.stringify(allData, null, 2);
                    mimeType = 'application/json';
                    fileName = `bankai-full-export-${new Date().toISOString().split('T')[0]}.json`;
                    break;
            }

            downloadFile(content, fileName, mimeType);

            // Ajouter une activité
            adminData.system.analytics.recentActivities.unshift({
                id: `ACT-${Date.now()}`,
                type: 'Export complet',
                timestamp: new Date().toISOString(),
                description: `Export complet en ${format} par Super Admin`
            });

            showNotification('Export complet effectué !', 'success');
        }

        function convertToCSV(data) {
            if (!data || data.length === 0) return '';

            const headers = Object.keys(data[0]);
            const rows = data.map(row =>
                headers.map(header =>
                    JSON.stringify(row[header] || '')
                ).join(',')
            );

            return [headers.join(','), ...rows].join('\n');
        }

        function convertToExcel(data) {
            // Pour Excel, on retourne un CSV (Excel peut l'ouvrir)
            return convertToCSV(data).replace(/,/g, '\t');
        }

        function downloadFile(content, filename, mimeType) {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // ==================== PARAMÈTRES SYSTÈME ====================
        function saveSystemSettings() {
            const settings = adminData.system.settings;

            // Notifications
            settings.notifications.newUser = document.getElementById('sysNotifNewUser').checked;
            settings.notifications.newOrder = document.getElementById('sysNotifNewOrder').checked;
            settings.notifications.payment = document.getElementById('sysNotifPayment').checked;
            settings.notifications.cardBlocked = document.getElementById('sysNotifCardBlocked').checked;

            // Sécurité
            settings.security.sessionTimeout = parseInt(document.getElementById('sysSessionTimeout').value) || 30;
            settings.security.maxLoginAttempts = parseInt(document.getElementById('sysMaxLoginAttempts').value) || 5;
            settings.security.twoFactorAuth = document.getElementById('sysTwoFactorAuth').checked;

            // Paiements
            settings.payments.defaultCurrency = document.getElementById('sysDefaultCurrency').value;
            settings.payments.serviceTax = parseFloat(document.getElementById('sysServiceTax').value) || 0;

            // Email
            settings.email.senderEmail = document.getElementById('sysSenderEmail').value;
            settings.email.senderName = document.getElementById('sysSenderName').value;

            // Maintenance
            settings.maintenance = document.getElementById('maintenanceMode').checked;

            // Sauvegarder
            saveAdminData();

            // Ajouter une activité
            adminData.system.analytics.recentActivities.unshift({
                id: `ACT-${Date.now()}`,
                type: 'Paramètres système mis à jour',
                timestamp: new Date().toISOString(),
                description: 'Paramètres système mis à jour par Super Admin'
            });

            showNotification('Paramètres système enregistrés !', 'success');
        }

        function backupDatabase() {
            const backup = {
                timestamp: new Date().toISOString(),
                data: adminData,
                size: JSON.stringify(adminData).length / 1024 / 1024
            };

            const backups = JSON.parse(localStorage.getItem('adminBackups') || '[]');
            backups.unshift(backup);

            // Garder seulement les 10 derniers backups
            if (backups.length > 10) {
                backups.splice(10);
            }

            localStorage.setItem('adminBackups', JSON.stringify(backups));
            localStorage.setItem('adminLastBackup', new Date().toISOString());

            // Mettre à jour l'affichage
            document.getElementById('dbBackupCount').textContent = backups.length;

            // Ajouter une activité
            adminData.system.analytics.recentActivities.unshift({
                id: `ACT-${Date.now()}`,
                type: 'Backup de base de données',
                timestamp: new Date().toISOString(),
                description: 'Backup de la base de données effectué'
            });

            showNotification('Backup de la base de données effectué !', 'success');
        }

        function optimizeDatabase() {
            // Simulation d'optimisation
            setTimeout(() => {
                // Ajouter une activité
                adminData.system.analytics.recentActivities.unshift({
                    id: `ACT-${Date.now()}`,
                    type: 'Optimisation de base de données',
                    timestamp: new Date().toISOString(),
                    description: 'Base de données optimisée par Super Admin'
                });

                showNotification('Base de données optimisée !', 'success');
            }, 1500);
        }

        function clearCache() {
            // Effacer certains éléments du localStorage
            localStorage.removeItem('adminReports');
            localStorage.removeItem('adminCache');

            // Ajouter une activité
            adminData.system.analytics.recentActivities.unshift({
                id: `ACT-${Date.now()}`,
                type: 'Cache vidé',
                timestamp: new Date().toISOString(),
                description: 'Cache système vidé par Super Admin'
            });

            showNotification('Cache vidé avec succès !', 'success');
        }

        function runSystemCheck() {
            // Simulation de vérification système
            const checks = [
                { name: 'Base de données', status: '✅ OK' },
                { name: 'Connectivité API', status: '✅ OK' },
                { name: 'Stockage', status: '✅ OK' },
                { name: 'Sécurité', status: '✅ OK' },
                { name: 'Performances', status: '✅ OK' }
            ];

            let report = '=== Rapport de vérification système ===\n\n';
            checks.forEach(check => {
                report += `${check.name}: ${check.status}\n`;
            });

            alert(report);

            // Ajouter une activité
            adminData.system.analytics.recentActivities.unshift({
                id: `ACT-${Date.now()}`,
                type: 'Vérification système',
                timestamp: new Date().toISOString(),
                description: 'Vérification système exécutée par Super Admin'
            });
        }

        function resetAllSettings() {
            if (!confirm('⚠️ Réinitialiser TOUS les paramètres système ?\n\nToutes les configurations seront perdues.')) {
                return;
            }

            adminData.system.settings = {
                notifications: {
                    newUser: true,
                    newOrder: true,
                    payment: true,
                    cardBlocked: true
                },
                security: {
                    sessionTimeout: 30,
                    maxLoginAttempts: 5,
                    twoFactorAuth: false
                },
                payments: {
                    defaultCurrency: "GNF",
                    serviceTax: 0
                },
                email: {
                    senderEmail: "noreply@bankai.com",
                    senderName: "Bankaï Support"
                },
                maintenance: false
            };

            saveAdminData();
            loadSystemSettings();

            // Ajouter une activité
            adminData.system.analytics.recentActivities.unshift({
                id: `ACT-${Date.now()}`,
                type: 'Paramètres réinitialisés',
                timestamp: new Date().toISOString(),
                description: 'Tous les paramètres système réinitialisés'
            });

            showNotification('Paramètres système réinitialisés !', 'success');
        }

        function purgeOldData() {
            if (!confirm('⚠️ Purger les données anciennes ?\n\nCette action supprimera les données de plus de 6 mois.')) {
                return;
            }

            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            let purgedCount = 0;

            // Purger les utilisateurs inactifs
            adminData.system.users = adminData.system.users.filter(user => {
                if (user.lastLogin && new Date(user.lastLogin) < sixMonthsAgo && user.status === 'inactive') {
                    purgedCount++;
                    return false;
                }
                return true;
            });

            // Purger les activités anciennes
            adminData.system.analytics.recentActivities =
                adminData.system.analytics.recentActivities.filter(activity =>
                    new Date(activity.timestamp) > sixMonthsAgo
                );

            saveAdminData();
            loadAllData();

            // Ajouter une activité
            adminData.system.analytics.recentActivities.unshift({
                id: `ACT-${Date.now()}`,
                type: 'Données purgées',
                timestamp: new Date().toISOString(),
                description: `${purgedCount} entrées anciennes purgées par Super Admin`
            });

            showNotification(`${purgedCount} entrées purgées avec succès !`, 'success');
        }

        // ==================== FONCTIONS DIVERSES ====================
        function viewUser(userId) {
            const user = adminData.system.users.find(u => u.id === userId);
            if (!user) {
                showNotification('Utilisateur non trouvé', 'error');
                return;
            }

            alert(`Détails de l'utilisateur:\n\n` +
                `ID: ${user.id}\n` +
                `Nom: ${user.firstName} ${user.lastName}\n` +
                `Email: ${user.email}\n` +
                `Téléphone: ${user.phone || 'Non renseigné'}\n` +
                `Type: ${user.type === 'enterprise' ? 'Entreprise' : user.type === 'subadmin' ? 'Sous-admin' : 'Individuel'}\n` +
                `Statut: ${user.status}\n` +
                `Date inscription: ${new Date(user.createdAt).toLocaleDateString('fr-FR')}\n` +
                `Dernière connexion: ${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'}`);
        }

        function viewEnterprise(enterpriseId) {
            const enterprise = adminData.system.enterprises.find(e => e.id === enterpriseId);
            if (!enterprise) {
                showNotification('Entreprise non trouvée', 'error');
                return;
            }

            alert(`Détails de l'entreprise:\n\n` +
                `Nom: ${enterprise.name}\n` +
                `Contact: ${enterprise.contact}\n` +
                `Email: ${enterprise.email}\n` +
                `Téléphone: ${enterprise.phone}\n` +
                `SIRET/NIF: ${enterprise.taxId || 'Non renseigné'}\n` +
                `Abonnement: ${enterprise.subscription.plan}\n` +
                `Statut: ${enterprise.subscription.status}\n` +
                `Cartes: ${enterprise.subscription.activeCards}/${enterprise.subscription.cardsCount} actives\n` +
                `Date inscription: ${new Date(enterprise.createdAt).toLocaleDateString('fr-FR')}`);
        }

        function viewCard(cardId) {
            const card = adminData.system.cards.find(c => c.id === cardId);
            if (!card) {
                showNotification('Carte non trouvée', 'error');
                return;
            }

            alert(`Détails de la carte:\n\n` +
                `ID: ${card.id}\n` +
                `Propriétaire: ${card.ownerName}\n` +
                `Type: ${card.ownerType === 'enterprise' ? 'Entreprise' : 'Individuel'}\n` +
                `Type carte: ${card.cardType === 'pro' ? 'Pro' : 'Essentiel'}\n` +
                `Statut: ${card.status}\n` +
                `Scans: ${card.scans}\n` +
                `Liens actifs: ${card.activeLinks}\n` +
                `Date création: ${new Date(card.createdAt).toLocaleDateString('fr-FR')}\n` +
                `Dernier scan: ${card.lastScan ? new Date(card.lastScan).toLocaleDateString('fr-FR') : 'Jamais'}\n` +
                `Notes: ${card.notes || 'Aucune'}`);
        }

        function viewOrder(orderId) {
            const order = adminData.system.orders.find(o => o.id === orderId);
            if (!order) {
                showNotification('Commande non trouvée', 'error');
                return;
            }

            alert(`Détails de la commande:\n\n` +
                `N°: ${order.id}\n` +
                `Client: ${order.customerName}\n` +
                `Produit: ${order.product}\n` +
                `Quantité: ${order.quantity}\n` +
                `Montant: ${order.amount.toLocaleString('fr-FR')} GNF\n` +
                `Statut: ${order.status}\n` +
                `Statut paiement: ${order.paymentStatus === 'paid' ? 'Payé' : 'En attente'}\n` +
                `Date commande: ${new Date(order.createdAt).toLocaleDateString('fr-FR')}\n` +
                `Date livraison: ${order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString('fr-FR') : '—'}`);
        }

        function viewPayment(paymentId) {
            const payment = adminData.system.payments.find(p => p.id === paymentId);
            if (!payment) {
                showNotification('Paiement non trouvé', 'error');
                return;
            }

            alert(`Détails du paiement:\n\n` +
                `ID: ${payment.id}\n` +
                `Client: ${payment.customerName}\n` +
                `Montant: ${payment.amount.toLocaleString('fr-FR')} GNF\n` +
                `Méthode: ${payment.method === 'orange_money' ? 'Orange Money' :
                    payment.method === 'mobile_money' ? 'Mobile Money' :
                        payment.method === 'card' ? 'Carte bancaire' : 'Virement bancaire'}\n` +
                `Transaction ID: ${payment.transactionId}\n` +
                `Statut: ${payment.status}\n` +
                `Date: ${new Date(payment.date).toLocaleDateString('fr-FR')}\n` +
                `Commande associée: ${payment.orderId}`);
        }

        function manageEnterpriseCards(enterpriseId) {
            const enterprise = adminData.system.enterprises.find(e => e.id === enterpriseId);
            if (!enterprise) {
                showNotification('Entreprise non trouvée', 'error');
                return;
            }

            const enterpriseCards = adminData.system.cards.filter(c =>
                c.ownerId === enterprise.id ||
                (c.ownerType === 'enterprise' && c.ownerName === enterprise.name)
            );

            alert(`Cartes de l'entreprise ${enterprise.name}:\n\n` +
                `Total: ${enterpriseCards.length} cartes\n` +
                `Actives: ${enterpriseCards.filter(c => c.status === 'active').length}\n` +
                `Inactives: ${enterpriseCards.filter(c => c.status === 'inactive').length}\n` +
                `Bloquées: ${enterpriseCards.filter(c => c.status === 'blocked').length}\n\n` +
                `Liste des cartes:\n${enterpriseCards.map(c => `• ${c.id} - ${c.status} - ${c.scans} scans`).join('\n')}`);
        }

        function viewEnterpriseStats() {
            const stats = adminData.system.analytics.stats;

            alert(`Statistiques des entreprises:\n\n` +
                `Total entreprises: ${stats.totalEnterprises}\n` +
                `Cartes entreprises: ${adminData.system.cards.filter(c => c.ownerType === 'enterprise').length}\n` +
                `Scans entreprises: ${adminData.system.cards.filter(c => c.ownerType === 'enterprise').reduce((sum, c) => sum + c.scans, 0)}\n` +
                `Revenus entreprises: ${adminData.system.payments.filter(p => {
                    const user = adminData.system.users.find(u => u.email === p.customerName.split(' ')[0].toLowerCase() + '.' + p.customerName.split(' ')[1].toLowerCase() + '@example.com');
                    return user && user.type === 'enterprise';
                }).reduce((sum, p) => sum + p.amount, 0).toLocaleString('fr-FR')} GNF`);
        }

        function sendEmailToEnterprise(enterpriseId) {
            const enterprise = adminData.system.enterprises.find(e => e.id === enterpriseId);
            if (!enterprise) {
                showNotification('Entreprise non trouvée', 'error');
                return;
            }

            const subject = encodeURIComponent('Bankaï - Communication importante');
            const body = encodeURIComponent(`Bonjour ${enterprise.contact},

Ceci est un message concernant votre compte entreprise Bankaï.

Cordialement,
L'équipe Bankaï`);

            window.open(`mailto:${enterprise.email}?subject=${subject}&body=${body}`);
        }

        function refreshOrders() {
            // Simulation de rafraîchissement
            setTimeout(() => {
                loadOrdersTable();
                showNotification('Commandes rafraîchies !', 'success');
            }, 1000);
        }

        function editUser(userId) {
            const user = adminData.system.users.find(u => u.id === userId);
            if (!user) {
                showNotification('Utilisateur non trouvé', 'error');
                return;
            }

            alert(`Modification de l'utilisateur ${user.firstName} ${user.lastName}\n\n` +
                `À implémenter : Formulaire de modification avec options complètes`);
        }

        function editAdmin(adminId) {
            const admin = adminData.system.admins.find(a => a.id === adminId);
            if (!admin) {
                showNotification('Administrateur non trouvé', 'error');
                return;
            }

            alert(`Modification de l'administrateur ${admin.name}\n\n` +
                `À implémenter : Interface de modification des permissions et du rôle`);
        }

        function updateOrder(orderId) {
            // Ouvrir le modal avec l'ID pré-rempli
            document.getElementById('updateOrderId').value = orderId;
            const modal = new bootstrap.Modal(document.getElementById('updateOrderModal'));
            modal.show();
        }

        function logout() {
            if (confirm('Voulez-vous vous déconnecter ?')) {
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            }
        }