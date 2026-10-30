import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Inspection, 
  FilterStatus, 
  Sector, 
  UserRole 
} from './types/printer';
import { 
  auth, 
  subscribePrinters, 
  subscribeInspections, 
  subscribeSectors, 
  savePrinterToFirestore, 
  deletePrinterFromFirestore, 
  saveInspectionToFirestore, 
  deleteInspectionFromFirestore, 
  seedInitialPrintersIfEmpty,
  testFirestoreConnection,
  getUserRoleFromFirestore
} from './services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { calculatePrinterStatus, exportInspectionsToCSV } from './utils/exportUtils';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { PrinterCard } from './components/PrinterCard';
import { InspectionForm } from './components/InspectionForm';
import { PrinterFormModal } from './components/PrinterFormModal';
import { InspectionDetailModal } from './components/InspectionDetailModal';
import { HistoryList } from './components/HistoryList';
import { TroubleshootingGuide } from './components/TroubleshootingGuide';
import { BackupManageTab } from './components/BackupManageTab';
import { NetworkDiagModal } from './components/NetworkDiagModal';
import { PrintReportModal } from './components/PrintReportModal';
import { AuthModal } from './components/AuthModal';
import { LoginScreen } from './components/LoginScreen';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { 
  Search, 
  Plus, 
  Printer as PrinterIcon, 
  CheckSquare, 
  Layers, 
  BookOpen, 
  Settings, 
  CheckCircle2, 
  AlertCircle,
  Cloud,
  Loader2,
  KeyRound
} from 'lucide-react';

export default function App() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCloudConnected, setIsCloudConnected] = useState(true);

  // Authentication & Roles
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('tech');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Navigation: 'home' | 'inspect' | 'history' | 'manage' | 'guide'
  const [activeTab, setActiveTab] = useState<'home' | 'inspect' | 'history' | 'manage' | 'guide'>('home');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [historyPrinterFilter, setHistoryPrinterFilter] = useState<string | null>(null);

  // Modals state
  const [printerModalOpen, setPrinterModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);

  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [diagnosePrinter, setDiagnosePrinter] = useState<Printer | null>(null);
  const [diagnoseModalOpen, setDiagnoseModalOpen] = useState(false);

  const [printReportModalOpen, setPrintReportModalOpen] = useState(false);

  // Inspection form target printer
  const [inspectTargetPrinterId, setInspectTargetPrinterId] = useState<string>('');

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // 1. Firebase Auth state listener (Does not use anonymous fallback bypass)
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const role = await getUserRoleFromFirestore(user.uid, user.email);
          setCurrentRole(role);
        } catch (err) {
          console.warn('Could not determine role from Firestore:', err);
          setCurrentRole(user.email === 'graalgarotoclassico@gmail.com' ? 'admin' : 'tech');
        }
      } else {
        setCurrentRole('viewer');
      }
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. Real-time Cloud Firestore Subscriptions (Strictly executed ONLY when authenticated)
  useEffect(() => {
    if (!currentUser) {
      setPrinters([]);
      setInspections([]);
      setSectors([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    testFirestoreConnection();

    // Idempotent initial seed check
    seedInitialPrintersIfEmpty().catch((err) => {
      console.warn('Seed note:', err);
    });

    // Subscribe to real-time updates for printers
    const unsubPrinters = subscribePrinters(
      (list) => {
        setPrinters(list);
        setIsLoading(false);
        setIsCloudConnected(true);
      },
      (err) => {
        console.error('Printers subscription error:', err);
        setIsCloudConnected(false);
      }
    );

    // Subscribe to real-time updates for inspections
    const unsubInspections = subscribeInspections(
      (list) => {
        setInspections(list);
      },
      (err) => {
        console.error('Inspections subscription error:', err);
      }
    );

    // Subscribe to real-time updates for sectors
    const unsubSectors = subscribeSectors(
      (list) => {
        setSectors(list);
      },
      (err) => {
        console.error('Sectors subscription error:', err);
      }
    );

    return () => {
      unsubPrinters();
      unsubInspections();
      unsubSectors();
    };
  }, [currentUser]);

  // Calculations for stats
  const totalCount = printers.length;
  const pendingCount = printers.filter((p) => calculatePrinterStatus(p, inspections) === 'pending').length;
  const issueCount = printers.filter((p) => calculatePrinterStatus(p, inspections) === 'issue').length;
  const okCount = printers.filter((p) => calculatePrinterStatus(p, inspections) === 'ok').length;

  // Sectors list
  const uniqueSectors = Array.from(
    new Set([...printers.map((p) => p.sector), ...sectors.map((s) => s.name)])
  ).filter(Boolean).sort();

  // Filtered printers for home list
  const filteredPrinters = printers.filter((p) => {
    // Status filter
    const status = calculatePrinterStatus(p, inspections);
    if (statusFilter !== 'all' && status !== statusFilter) {
      return false;
    }

    // Sector filter
    if (sectorFilter !== 'all' && p.sector !== sectorFilter) {
      return false;
    }

    // Query search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSector = p.sector.toLowerCase().includes(q);
      const matchIp = p.ip?.toLowerCase().includes(q) || false;
      const matchModel = p.model?.toLowerCase().includes(q) || false;
      const matchSerial = p.serial?.toLowerCase().includes(q) || false;
      const matchPatrimony = p.patrimony?.toLowerCase().includes(q) || false;
      return matchName || matchSector || matchIp || matchModel || matchSerial || matchPatrimony;
    }

    return true;
  }).sort((a, b) => a.sector.localeCompare(b.sector, 'pt-BR') || a.name.localeCompare(b.name, 'pt-BR'));

  // Handlers for Printer actions
  const handleStartInspection = (printerId: string) => {
    setInspectTargetPrinterId(printerId);
    setActiveTab('inspect');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewPrinterHistory = (printerId: string) => {
    setHistoryPrinterFilter(printerId);
    setActiveTab('history');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditPrinter = (printer: Printer) => {
    if (currentRole === 'viewer') {
      alert('Seu perfil atual é de Consulta (somente leitura).');
      return;
    }
    setEditingPrinter(printer);
    setPrinterModalOpen(true);
  };

  const handleDeletePrinter = async (printerId: string) => {
    if (currentRole !== 'admin') {
      alert('Apenas Administradores possuem permissão para excluir equipamentos do banco.');
      return;
    }
    const p = printers.find((x) => x.id === printerId);
    if (!window.confirm(`Tem certeza que deseja excluir a impressora "${p?.name || 'selecionada'}" do Cloud Firestore?`)) {
      return;
    }
    try {
      await deletePrinterFromFirestore(printerId);
      showToast('Impressora excluída da nuvem com sucesso.');
    } catch (err: any) {
      alert('Falha ao excluir no banco: ' + (err.message || String(err)));
    }
  };

  const handleDiagnosePrinter = (printer: Printer) => {
    setDiagnosePrinter(printer);
    setDiagnoseModalOpen(true);
  };

  const handleSavePrinter = async (data: Omit<Printer, 'id' | 'createdAt'>, printerId?: string) => {
    if (currentRole === 'viewer') {
      alert('Seu perfil atual é de Consulta (somente leitura).');
      return;
    }
    try {
      await savePrinterToFirestore(data, printerId);
      showToast(printerId ? 'Cadastro atualizado no Cloud Firestore.' : 'Nova impressora salva no Cloud Firestore.');
    } catch (err: any) {
      alert('Erro ao gravar no banco central: ' + (err.message || String(err)));
    }
  };

  // Handlers for Inspection
  const handleSaveInspection = async (
    inspectionData: Omit<Inspection, 'id' | 'createdAt'>,
    saveAnother?: boolean
  ) => {
    if (currentRole === 'viewer') {
      alert('Seu perfil atual é de Consulta (somente leitura).');
      return;
    }
    try {
      await saveInspectionToFirestore({
        ...inspectionData,
        userId: currentUser?.uid || 'guest-tech',
      });
      showToast('✓ Laudo de inspeção sincronizado no Cloud Firestore!');

      if (!saveAnother) {
        setActiveTab('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      alert('Erro ao salvar laudo na nuvem: ' + (err.message || String(err)));
    }
  };

  const handleDeleteInspection = async (inspectionId: string) => {
    if (currentRole !== 'admin') {
      alert('Apenas Administradores possuem permissão para remover laudos do histórico.');
      return;
    }
    if (!window.confirm('Deseja excluir este laudo de inspeção do banco de dados central?')) return;
    try {
      await deleteInspectionFromFirestore(inspectionId);
      if (detailModalOpen) setDetailModalOpen(false);
      showToast('Laudo excluído da nuvem com sucesso.');
    } catch (err: any) {
      alert('Erro ao excluir laudo: ' + (err.message || String(err)));
    }
  };

  const handleViewInspectionDetails = (inspection: Inspection) => {
    setSelectedInspection(inspection);
    setDetailModalOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center font-sans">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
        <h2 className="text-white text-base font-bold">Verificando credenciais corporativas...</h2>
        <p className="text-slate-400 text-xs mt-1">Conectando ao sistema de controle e inspeção de impressoras</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex flex-col font-sans pb-20 sm:pb-8">
      {/* Top Header with Cloud sync indicator & User Auth */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickAdd={() => {
          if (currentRole === 'viewer') {
            alert('Seu perfil atual é de Consulta (somente leitura).');
            return;
          }
          setEditingPrinter(null);
          setPrinterModalOpen(true);
        }}
        onExportCsv={() => exportInspectionsToCSV(printers, inspections)}
        totalPrinters={printers.length}
        currentUser={currentUser}
        currentRole={currentRole}
        onOpenAuth={() => setAuthModalOpen(true)}
        isOnline={isCloudConnected}
      />

      {/* PWA Install Notification (Discreet and non-blocking) */}
      <PWAInstallBanner />

      {/* Security alert for default tiadmin password */}
      {currentUser?.email?.includes('tiadmin') && (
        <div className="bg-amber-950/90 border-b border-amber-800 text-amber-200 px-4 py-2 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Você está conectado com o usuário inicial <strong>tiadmin</strong>. Por segurança corporativa, recomendamos trocar a senha padrão.
            </span>
          </div>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[11px] transition-colors shrink-0 ml-2 cursor-pointer"
          >
            Alterar Senha
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-4 pb-8 flex-1">
        {/* Loading Spinner on Initial Cloud Connection */}
        {isLoading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center my-4 shadow-sm">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Conectando ao Cloud Firestore (Plano Spark Grátis)...</p>
            <p className="text-xs text-slate-500 mt-1">Carregando dados compartilhados e ativos industriais</p>
          </div>
        )}

        {/* TAB 1: HOME (Printers fleet dashboard) */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            {/* Quick Metrics */}
            <StatsOverview
              total={totalCount}
              pending={pendingCount}
              issues={issueCount}
              ok={okCount}
              currentFilter={statusFilter}
              onSelectFilter={(f) => setStatusFilter(f)}
            />

            {/* Toolbar: Search, Sector dropdown & Add button */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="search"
                  placeholder="Buscar por setor, nome, modelo, IP ou patrimônio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-9 pr-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Sector Filter */}
              <div className="w-full sm:w-48">
                <select
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value)}
                  className="w-full h-11 px-3 text-xs sm:text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="all">Todos os Setores</option>
                  {uniqueSectors.map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

              {/* Add printer button */}
              {currentRole !== 'viewer' && (
                <button
                  onClick={() => {
                    setEditingPrinter(null);
                    setPrinterModalOpen(true);
                  }}
                  className="h-11 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm shadow-blue-600/30 transition-colors flex items-center justify-center gap-1.5 shrink-0 active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Impressora</span>
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 text-xs">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-full font-bold transition-all whitespace-nowrap ${
                    statusFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Todas ({printers.length})
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-full font-bold transition-all whitespace-nowrap ${
                    statusFilter === 'pending'
                      ? 'bg-amber-500 text-white'
                      : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  Pendentes ({pendingCount})
                </button>
                <button
                  onClick={() => setStatusFilter('ok')}
                  className={`px-3 py-1.5 rounded-full font-bold transition-all whitespace-nowrap ${
                    statusFilter === 'ok'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  Funcionando ({okCount})
                </button>
                <button
                  onClick={() => setStatusFilter('issue')}
                  className={`px-3 py-1.5 rounded-full font-bold transition-all whitespace-nowrap ${
                    statusFilter === 'issue'
                      ? 'bg-rose-600 text-white'
                      : 'bg-white text-rose-800 border border-rose-200 hover:bg-rose-50'
                  }`}
                >
                  Com Defeito ({issueCount})
                </button>
              </div>

              <span className="text-xs text-slate-500 shrink-0 font-medium hidden sm:inline">
                {filteredPrinters.length} {filteredPrinters.length === 1 ? 'impressora' : 'impressoras'}
              </span>
            </div>

            {/* Printers Grid */}
            {filteredPrinters.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <PrinterIcon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  {printers.length === 0 ? 'Conectando ao banco de dados...' : 'Nenhuma impressora corresponde ao filtro'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                  {printers.length === 0
                    ? 'Aguarde a sincronização com o Cloud Firestore ou use a aba Cloud & Backup para forçar o carregamento.'
                    : 'Tente limpar a busca ou selecionar outro status nas opções acima.'}
                </p>
                {printers.length === 0 && (
                  <button
                    onClick={() => seedInitialPrintersIfEmpty()}
                    className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    Inicializar Catálogo de Impressoras na Nuvem
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredPrinters.map((printer) => (
                  <PrinterCard
                    key={printer.id}
                    printer={printer}
                    inspections={inspections}
                    onInspect={handleStartInspection}
                    onViewHistory={handleViewPrinterHistory}
                    onEdit={handleEditPrinter}
                    onDelete={handleDeletePrinter}
                    onDiagnose={handleDiagnosePrinter}
                    canEdit={currentRole !== 'viewer'}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INSPECT FORM */}
        {activeTab === 'inspect' && (
          <InspectionForm
            printers={printers}
            initialPrinterId={inspectTargetPrinterId}
            defaultTech={currentUser?.displayName || 'Técnico Responsável'}
            onSave={handleSaveInspection}
            onCancel={() => setActiveTab('home')}
            onUpdateDefaultTech={() => {}}
          />
        )}

        {/* TAB 3: HISTORY */}
        {activeTab === 'history' && (
          <HistoryList
            inspections={inspections}
            printers={printers}
            selectedPrinterFilter={historyPrinterFilter}
            onClearPrinterFilter={() => setHistoryPrinterFilter(null)}
            onViewDetails={handleViewInspectionDetails}
            onDeleteInspection={handleDeleteInspection}
            onExportCsv={() => exportInspectionsToCSV(printers, inspections)}
          />
        )}

        {/* TAB 4: TROUBLESHOOTING GUIDE */}
        {activeTab === 'guide' && <TroubleshootingGuide />}

        {/* TAB 5: CLOUD & BACKUP MANAGEMENT */}
        {activeTab === 'manage' && (
          <BackupManageTab
            printers={printers}
            inspections={inspections}
            defaultTech={currentUser?.displayName || 'Técnico Responsável'}
            onImportBackup={async (data) => {
              for (const p of data.printers) {
                await savePrinterToFirestore(p);
              }
              for (const insp of data.inspections) {
                await saveInspectionToFirestore(insp);
              }
              showToast('Backup sincronizado no Cloud Firestore!');
            }}
            onResetToDemoData={() => seedInitialPrintersIfEmpty()}
            onClearAllData={() => {
              alert('A exclusão em massa no Cloud Firestore deve ser feita pelo console do Firebase para prevenir acidentes.');
            }}
            onOpenPrintReport={() => setPrintReportModalOpen(true)}
            canManage={currentRole === 'admin'}
          />
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-colors ${
            activeTab === 'home' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <PrinterIcon className="w-5 h-5" />
          <span>Impressoras</span>
        </button>

        <button
          onClick={() => {
            setInspectTargetPrinterId('');
            setActiveTab('inspect');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-colors ${
            activeTab === 'inspect' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span>Inspecionar</span>
        </button>

        <button
          onClick={() => {
            setHistoryPrinterFilter(null);
            setActiveTab('history');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-colors ${
            activeTab === 'history' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>Histórico</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-colors ${
            activeTab === 'guide' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Guia</span>
        </button>

        <button
          onClick={() => setActiveTab('manage')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-colors ${
            activeTab === 'manage' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Cloud</span>
        </button>
      </nav>

      {/* TOAST POPUP */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MODALS */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        currentRole={currentRole}
        onRoleChange={(role) => setCurrentRole(role)}
      />

      <PrinterFormModal
        isOpen={printerModalOpen}
        onClose={() => setPrinterModalOpen(false)}
        onSave={handleSavePrinter}
        printerToEdit={editingPrinter}
      />

      <InspectionDetailModal
        isOpen={detailModalOpen}
        inspection={selectedInspection}
        printer={printers.find((p) => p.id === selectedInspection?.printerId) || null}
        onClose={() => setDetailModalOpen(false)}
        onDelete={handleDeleteInspection}
      />

      <NetworkDiagModal
        isOpen={diagnoseModalOpen}
        printer={diagnosePrinter}
        onClose={() => setDiagnoseModalOpen(false)}
      />

      <PrintReportModal
        isOpen={printReportModalOpen}
        printers={printers}
        inspections={inspections}
        onClose={() => setPrintReportModalOpen(false)}
      />
    </div>
  );
}
