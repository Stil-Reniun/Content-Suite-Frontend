import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { governanceAPI, brandDNAAPI } from '../services/api';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center gap-2">
    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
    <span>Aprobando...</span>
  </div>
);

const SuccessAnimation = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
    <div className="bg-white rounded-2xl p-8 text-center shadow-2xl animate-bounce-in max-w-sm mx-4">
      <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-12 h-12 text-green-600 animate-checkmark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">¡Aprobado!</h3>
      <p className="text-gray-600">El contenido ha sido aprobado exitosamente</p>
    </div>
  </div>
);

export default function ApproverBDashboard() {
  const { user, logout } = useAuth();
  const [contents, setContents] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [auditResult, setAuditResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [finalizing, setFinalizing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contentsData, brandsData] = await Promise.all([
        governanceAPI.getPendingContents(), 
        brandDNAAPI.getAll()
      ]);
      setContents(contentsData || []);
      setBrands(brandsData || []);
    } catch (err) {
      console.error('Error cargando datos', err);
    } finally {
      setLoading(false);
    }
  };

  const getBrand = (brandId) => brands.find(b => b.id === brandId);

  const handleAudit = async () => {
    if (!selectedItem || !selectedFile) return;
    setUploading(true);
    try {
      const result = await governanceAPI.auditImage(selectedItem.id, user.id, selectedFile);
      setAuditResult(result.audit);
    } catch (err) {
      alert('Error en auditoría: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFinalizeApproval = async () => {
    if (!selectedItem) return;
    setFinalizing(true);
    try {
      await governanceAPI.finalizeApproval(selectedItem.id, user.id);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedItem(null);
        setAuditResult(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        loadData();
      }, 2000);
    } catch (err) {
      alert('Error al aprobar: ' + err.message);
    } finally {
      setFinalizing(false);
    }
  };

  const filteredContents = contents.filter(c => {
    const brand = getBrand(c.brand_dna_id);
    const searchTerm = searchQuery.toLowerCase();
    return (
      brand?.name?.toLowerCase().includes(searchTerm) ||
      c.generated_content?.toLowerCase().includes(searchTerm)
    );
  });

  const selectedBrand = selectedItem ? getBrand(selectedItem.brand_dna_id) : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://www.alicorp.com.pe/images/logo-alicorp-header.svg" alt="Alicorp" className="h-8" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class="text-xl font-bold">Alicorp</span>'; }} />
            <span className="px-3 py-1 rounded-full bg-[#EEF2FF] text-[#0D6EFD] text-xs font-medium">APROBADOR B</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-[#101820]">{user?.full_name || user?.email}</p>
              <p className="text-xs text-[#64748B]">{user?.email}</p>
            </div>
            <button onClick={logout} className="p-2 rounded-lg hover:bg-gray-100">
              <svg className="w-5 h-5 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-[#101820] mb-6"> Auditoría Multimodal de Imágenes</h1>
        
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por marca o contenido..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="grid gap-6">
          {filteredContents.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">
              <p>{searchQuery ? 'No se encontraron resultados...' : 'No hay contenidos pendientes para auditar...'}</p>
            </div>
          ) : (
            filteredContents.map((content) => {
              const brand = getBrand(content.brand_dna_id);
              return (
                <div key={content.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{brand?.name}</h3>
                      <p className="text-sm text-gray-500">Estado: <span className="text-yellow-600 font-medium">Pendiente</span></p>
                    </div>
                    <button onClick={() => { setSelectedItem(content); setAuditResult(null); setSelectedFile(null); }} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                       Auditar Imagen
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 bg-gray-50 p-3 rounded">{content.generated_content}</p>
                </div>
              );
            })
          )}
        </div>
      </main>

      {selectedItem && selectedBrand && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Auditoría Visual: {selectedBrand.name}</h2>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-gray-700 mb-4"> Reglas Visuales del Manual</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="font-semibold text-sm mb-2">Colores Permitidos:</p>
                    <div className="flex gap-2">
                      {selectedBrand.manual?.visual_identity?.primary_colors?.map((c, i) => (
                        <div key={i} className="w-10 h-10 rounded-full border shadow-sm" style={{backgroundColor: c}} title={c}></div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="font-semibold text-sm mb-2">Reglas del Logo:</p>
                    <ul className="text-sm text-gray-600 list-disc ml-4">
                      {selectedBrand.manual?.visual_identity?.logo_usage_rules?.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-700 mb-4"> Subir Imagen para Validar</h3>
                <p className="text-xs text-gray-500 mb-2">Formatos aceptados: PNG, JPEG, GIF, WEBP</p>
                <input 
                  type="file" 
                  accept="image/png,image/jpeg,image/gif,image/webp" 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if(file) {
                      const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
                      if(!validTypes.includes(file.type)) {
                        alert(`Formato no soportado. Usa: PNG, JPEG, GIF o WEBP`);
                        return;
                      }
                      setSelectedFile(file);
                      setPreviewUrl(URL.createObjectURL(file));
                      setAuditResult(null);
                    }
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 mb-4"
                />
                
                {previewUrl && (
                  <img src={previewUrl} alt="Preview" className="w-full h-48 object-contain rounded-lg border mb-4 bg-gray-100" />
                )}

                <button 
                  onClick={handleAudit} 
                  disabled={!selectedFile || uploading}
                  className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
                >
                  {uploading ? 'Analizando con IA...' : 'Ejecutar Auditoría Multimodal'}
                </button>

                {auditResult && (
                  <div className={`mt-6 p-4 rounded-lg border-2 ${auditResult.approved ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                    <p className={`font-bold text-lg ${auditResult.approved ? 'text-green-700' : 'text-red-700'}`}>
                      {auditResult.approved ? ' CUMPLE CON EL MANUAL' : ' NO CUMPLE'}
                    </p>
                    {auditResult.score !== undefined && (
                      <p className="text-sm mt-1 text-gray-600">Puntuación: {(auditResult.score * 100).toFixed(0)}%</p>
                    )}
                    
                    {auditResult.explanation && (
                      <p className="text-sm mt-2 text-gray-700 font-medium">{auditResult.explanation}</p>
                    )}
                    
                    {auditResult.issues && auditResult.issues.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-red-600 mb-1">Problemas encontrados:</p>
                        <ul className="text-sm text-red-700 space-y-1">
                          {auditResult.issues.map((issue, i) => (
                            <li key={i}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {auditResult.recommendations && auditResult.recommendations.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-blue-600 mb-1">Recomendaciones:</p>
                        <ul className="text-sm text-blue-700 space-y-1">
                          {auditResult.recommendations.map((rec, i) => (
                            <li key={i}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {auditResult.strengths && auditResult.strengths.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-green-600 mb-1">Puntos fuertes:</p>
                        <ul className="text-sm text-green-700 space-y-1">
                          {auditResult.strengths.map((s, i) => (
                            <li key={i}>• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="mt-4 flex gap-3">
                      {auditResult.approved ? (
                        <button 
                          onClick={handleFinalizeApproval}
                          disabled={finalizing}
                          className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 font-medium disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          {finalizing ? <LoadingSpinner /> : '✅ Terminar de Aprobar'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            setAuditResult(null);
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }}
                          className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                        >
                           Actualizar Imagen
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showSuccess && <SuccessAnimation />}
    </div>
  );
}