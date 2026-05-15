import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { governanceAPI, brandDNAAPI } from '../services/api';

export default function ApproverADashboard() {
  const { user, logout } = useAuth();
  const [contents, setContents] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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
      console.log('Contents:', contentsData);
      console.log('Brands:', brandsData);
      setContents(contentsData || []);
      setBrands(brandsData || []);
    } catch (err) {
      console.error('Error cargando datos', err);
    } finally {
      setLoading(false);
    }
  };

  const getBrand = (brandId) => {
    if (!brandId || !brands.length) return null;
    return brands.find(b => b.id === brandId) || null;
  };

  const handleAction = async (approved) => {
    if (!selectedItem) return;
    setLoading(true);
    try {
      await governanceAPI.approve(selectedItem.id, approved, feedback, user.id);
      setContents(contents.filter(c => c.id !== selectedItem.id));
      setSelectedItem(null);
      setFeedback('');
    } catch (err) {
      alert('Error al procesar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedBrand = selectedItem ? getBrand(selectedItem.brand_dna_id) : null;

  const filteredContents = contents.filter(c => {
    const brand = getBrand(c.brand_dna_id);
    const brandName = brand?.name || 'Sin marca';
    const search = searchTerm.toLowerCase();
    return (
      brandName.toLowerCase().includes(search) ||
      (c.generated_content || '').toLowerCase().includes(search) ||
      (c.prompt || '').toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://www.alicorp.com.pe/images/logo-alicorp-header.svg" alt="Alicorp" className="h-8" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class="text-xl font-bold">Alicorp</span>'; }} />
            <span className="px-3 py-1 rounded-full bg-[#EEF2FF] text-[#0D6EFD] text-xs font-medium">APROBADOR A</span>
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

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#101820]"> Bandeja de Aprobación (Texto)</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por marca o contenido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-500">Cargando contenidos...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredContents.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">
                <p className="text-lg">{searchTerm ? 'No se encontraron resultados' : ' No hay contenidos pendientes de revisión.'}</p>
              </div>
            ) : (
              filteredContents.map((content) => {
                const brand = getBrand(content.brand_dna_id);
                const brandName = brand?.name || 'Sin marca';
                const colors = brand?.manual?.visual_identity?.primary_colors || [];
                
                return (
                  <div key={content.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {colors.slice(0, 3).map((color, i) => (
                            <div key={i} className="w-6 h-6 rounded-full border border-gray-200" style={{backgroundColor: color}} title={color}></div>
                          ))}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-[#101820]">{brandName}</h3>
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Pendiente</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          console.log('Opening modal for:', content);
                          console.log('Brand:', brand);
                          setSelectedItem(content);
                        }} 
                        className="px-4 py-2 bg-[#0D6EFD] text-white rounded-lg hover:bg-blue-600 cursor-pointer"
                      >
                        Revisar
                      </button>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm text-gray-600 font-semibold mb-1">Contenido Generado:</p>
                      <p className="text-gray-800 whitespace-pre-wrap line-clamp-3">{content.generated_content || 'Sin contenido'}</p>
                    </div>

                    {brand?.manual?.tone_of_voice && (
                      <div className="mt-3 flex gap-4 text-xs text-gray-500">
                        <span>🎤 {brand.manual.tone_of_voice.description?.slice(0, 50)}...</span>
                        <span>👥 {brand.manual.target_audience?.profile || 'N/A'}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Revisión de Contenido</h2>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="text-blue-600"></span>
                  Contenido Generado
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm whitespace-pre-wrap h-80 overflow-y-auto">
                  {selectedItem.generated_content || 'Sin contenido generado'}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Feedback (Opcional)</label>
                  <textarea 
                    value={feedback} 
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm"
                    rows="3"
                    placeholder="Razón del rechazo o comentarios..."
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="text-green-600"></span>
                  Manual de Marca - {selectedBrand?.name || 'Sin marca'}
                </h3>
                
                {selectedBrand?.manual ? (
                  <div className="space-y-3 text-sm max-h-80 overflow-y-auto">
                    {selectedBrand.manual.visual_identity?.primary_colors && (
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <p className="font-bold text-gray-800 mb-2"> Colores de la Marca:</p>
                        <div className="flex gap-2">
                          {selectedBrand.manual.visual_identity.primary_colors.map((color, i) => (
                            <div key={i} className="text-center">
                              <div className="w-12 h-12 rounded-lg border shadow-sm" style={{backgroundColor: color}}></div>
                              <p className="text-xs font-mono mt-1">{color}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                      <p className="font-bold text-green-800">🎤 Tono de Voz</p>
                      <p className="text-green-700 mt-1">{selectedBrand.manual.tone_of_voice?.description || 'N/A'}</p>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <p className="font-bold text-purple-800">👥 Audiencia</p>
                      <p className="text-purple-700 mt-1">{selectedBrand.manual.target_audience?.profile || 'N/A'}</p>
                    </div>

                    <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                      <p className="font-bold text-red-800">🚫 Palabras Prohibidas</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedBrand.manual.tone_of_voice?.forbidden_words?.map((w, i) => (
                          <span key={i} className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs">{w}</span>
                        ))}
                        {(!selectedBrand.manual.tone_of_voice?.forbidden_words || selectedBrand.manual.tone_of_voice.forbidden_words.length === 0) && (
                          <span className="text-red-600 text-xs">No especificadas</span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="font-bold text-blue-800">✅ DOs:</p>
                      <ul className="text-blue-700 mt-1 space-y-1">
                        {selectedBrand.manual.do_and_dont?.dos?.slice(0, 3).map((d, i) => (
                          <li key={i} className="text-xs">• {d}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <p className="font-bold text-orange-800">❌ DON'Ts:</p>
                      <ul className="text-orange-700 mt-1 space-y-1">
                        {selectedBrand.manual.do_and_dont?.donts?.slice(0, 3).map((d, i) => (
                          <li key={i} className="text-xs">• {d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-700">
                    <p>No se encontró el manual de marca para este contenido.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t">
              <button onClick={() => setSelectedItem(null)} className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={() => handleAction(false)} className="flex-1 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium">
                 Rechazar
              </button>
              <button onClick={() => handleAction(true)} className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium">
                 Aprobar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}