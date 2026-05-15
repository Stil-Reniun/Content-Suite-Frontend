import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { brandDNAAPI, governanceAPI } from '../services/api';

export default function CreatorDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('brands');
  const [brands, setBrands] = useState([]);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingBrandData, setPendingBrandData] = useState(null);
  const [previewBrand, setPreviewBrand] = useState(null);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const data = await brandDNAAPI.getAll();
        if (Array.isArray(data)) {
          setBrands(data.map(item => ({
            id: item.id,
            name: item.name,
            tone: item.tone,
            audience: item.audience,
            description: item.description,
            manual: typeof item.manual === 'string' ? JSON.parse(item.manual) : item.manual
          })));
        }
      } catch (err) {
        console.error('Error loading brands:', err);
      }
    };
    loadBrands();
  }, []);

  useEffect(() => {
    if (activeTab === 'contents') {
      loadAllContents();
    }
  }, [activeTab]);

  const loadAllContents = async () => {
    setLoading(true);
    try {
      const data = await governanceAPI.getAllContents();
      const contentsWithBrands = (data.data || data || []).map(c => ({
        ...c,
        brand: brands.find(b => b.id === c.brand_dna_id)?.name || 'Sin marca'
      }));
      setContents(contentsWithBrands);
    } catch (err) {
      console.error('Error loading contents:', err);
    } finally {
      setLoading(false);
    }
  };

  const [brandForm, setBrandForm] = useState({
    name: '', tone: '', audience: '', description: '', customTone: '', customAudience: ''
  });

  const toneOptions = [
    { value: 'divertido_profesional', label: 'Divertido pero profesional' },
    { value: 'formal_corporativo', label: 'Formal corporativo' },
    { value: 'formal_academico', label: 'Formal académico' },
    { value: 'innovador_creativo', label: 'Innovador y creativo' },
    { value: 'cercano_familiar', label: 'Cercano y familiar' },
    { value: 'premium_exclusivo', label: 'Premium y exclusivo' },
    { value: 'energetico_joven', label: 'Energético y joven' },
    { value: 'juvenil', label: 'Juvenil' },
    { value: 'serio', label: 'Serio' },
    { value: 'autoridad_experto', label: 'Autoridad y experto' },
    { value: 'emocional_inspirador', label: 'Emocional e inspirador' },
    { value: 'otro', label: 'Otro (especificar)' },
  ];

  const audienceOptions = [
    { value: 'gen_z', label: 'Gen Z (18-27)' },
    { value: 'millennials', label: 'Millennials (28-43)' },
    { value: 'gen_x', label: 'Gen X (44-59)' },
    { value: 'baby_boomers', label: 'Baby Boomers (60+)' },
    { value: 'profesionales', label: 'Profesionales' },
    { value: 'emprendedores', label: 'Emprendedores' },
    { value: 'madres_familias', label: 'Madres y familias' },
    { value: 'estudiantes', label: 'Estudiantes' },
    { value: 'otro', label: 'Otro (especificar)' },
  ];

  const [generateForm, setGenerateForm] = useState({ prompt: '', brandId: '', contentType: '', customContentType: '' });
  const [selectedNetworks, setSelectedNetworks] = useState([]);

  const contentTypeOptions = [
    { value: 'social_media', label: '📱 Publicación para Redes Sociales' },
    { value: 'tiktok_guide', label: '🎬 Guía para TikTok' },
    { value: 'marketing_strategy', label: '📈 Estrategia de Marketing' },
    { value: 'blog_article', label: ' Artículo de Blog' },
    { value: 'email_campaign', label: '📧 Campaña de Email' },
    { value: 'video_script', label: '🎥 Guión de Video' },
    { value: 'ad_copy', label: '💰 Copy para Anuncios' },
    { value: 'product_description', label: '🏷️ Descripción de Producto' },
    { value: 'other', label: '📌 Otro (especificar)' },
  ];

  const socialNetworkOptions = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'twitter', label: 'Twitter/X' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
  ];

  const handleCreateBrandClick = (e) => {
    e.preventDefault();
    const toneValue = brandForm.tone === 'custom' ? brandForm.customTone : (toneOptions.find(o => o.value === brandForm.tone)?.label || brandForm.tone);
    const audienceValue = brandForm.audience === 'custom' ? brandForm.customAudience : (audienceOptions.find(o => o.value === brandForm.audience)?.label || brandForm.audience);
    
    setPendingBrandData({ name: brandForm.name, tone: toneValue, audience: audienceValue, description: brandForm.description, user_id: user.id });
    setShowConfirmModal(true);
  };

  const confirmCreateBrand = async () => {
    if (!pendingBrandData) return;
    setError(''); setSuccess(''); setLoading(true); setShowConfirmModal(false);
    
    try {
      const result = await brandDNAAPI.create(pendingBrandData);
      let manualData = result.manual;
      if (typeof manualData === 'string') manualData = JSON.parse(manualData);
      const newBrand = { id: result.id, name: pendingBrandData.name, tone: pendingBrandData.tone, audience: pendingBrandData.audience, manual: manualData, description: pendingBrandData.description };
      setPreviewBrand(newBrand); setIsPreview(true);
      setBrandForm({ name: '', tone: '', audience: '', description: '', customTone: '', customAudience: '' });
      setSuccess('Brand DNA generado. Confirma para guardar o regenera.');
    } catch (err) { 
      setError(err.message || 'Error al crear Brand DNA'); 
    }
    finally { setLoading(false); setPendingBrandData(null); }
  };

  const saveBrand = () => {
    if (previewBrand) { setBrands([...brands, previewBrand]); setSuccess('Brand DNA guardado exitosamente'); setTimeout(() => setSuccess(''), 5000); setPreviewBrand(null); setIsPreview(false); }
  };

  const regenerateBrand = () => { setPreviewBrand(null); setIsPreview(false); setSuccess(''); };

  const handleGenerate = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    
    try {
      const result = await brandDNAAPI.generate(generateForm.prompt, generateForm.brandId);
      
      setContents([...contents, { id: result.content_id, prompt: generateForm.prompt, content: result.response, status: 'pending', brand: brands.find(b => b.id === generateForm.brandId)?.name }]);
      setGenerateForm({ prompt: '', brandId: '' });
      setSuccess('Contenido generado y enviado para aprobación');
    } catch (err) { 
      setError(err.message || 'Error al generar contenido'); 
    }
    finally { setLoading(false); }
  };

  const getStatusBadge = (status) => {
    const badges = { pending: { class: 'status-pending', text: 'Pendiente' }, approved: { class: 'status-approved', text: 'Aprobado' }, rejected: { class: 'status-rejected', text: 'Rechazado' } };
    return <span className={`status-badge ${badges[status]?.class || badges.pending.class}`}>{badges[status]?.text || 'Pendiente'}</span>;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://www.alicorp.com.pe/images/logo-alicorp-header.svg" alt="Alicorp" className="h-8" />
            <span className="px-3 py-1 rounded-full bg-[#EEF2FF] text-[#0D6EFD] text-xs font-medium">CREADOR</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-[#101820]">{user.full_name}</p>
              <p className="text-xs text-[#64748B]">{user.email}</p>
            </div>
            <button onClick={logout} className="p-2 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {error && <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">{error}</div>}
          {success && <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700">{success}</div>}

          <div className="flex gap-6">
            <nav className="w-56 shrink-0">
              <div className="card p-4 space-y-2 sticky top-24">
                <button onClick={() => setActiveTab('brands')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeTab === 'brands' ? 'bg-[#EEF2FF] text-[#0D6EFD]' : 'text-[#64748B] hover:bg-gray-50'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  Brand DNA
                </button>
                <button onClick={() => setActiveTab('generate')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeTab === 'generate' ? 'bg-[#EEF2FF] text-[#0D6EFD]' : 'text-[#64748B] hover:bg-gray-50'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Generar Contenido
                </button>
                <button onClick={() => setActiveTab('contents')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeTab === 'contents' ? 'bg-[#EEF2FF] text-[#0D6EFD]' : 'text-[#64748B] hover:bg-gray-50'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Mis Contenidos
                </button>
              </div>
            </nav>

            <main className="flex-1">
              {activeTab === 'brands' && (
                <div className="space-y-6">
                  <div className="card p-6">
                    <h2 className="text-xl font-bold text-[#101820] mb-6">Crear Brand DNA</h2>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#101820] mb-2">Nombre de la marca</label>
                        <input type="text" value={brandForm.name} onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })} className="input-field" placeholder="ej. Snack de Palta" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#101820] mb-2">Tono de voz</label>
                        <select value={brandForm.tone === 'custom' ? 'otro' : brandForm.tone} onChange={(e) => setBrandForm({ ...brandForm, tone: e.target.value === 'otro' ? 'custom' : e.target.value, customTone: '' })} className="input-field" required>
                          <option value="">Selecciona un tono...</option>
                          {toneOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        {brandForm.tone === 'custom' && <input type="text" value={brandForm.customTone} onChange={(e) => setBrandForm({ ...brandForm, customTone: e.target.value })} className="input-field mt-2" placeholder="Escribe tu tono..." />}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#101820] mb-2">Audiencia objetivo</label>
                        <select value={brandForm.audience === 'custom' ? 'otro' : brandForm.audience} onChange={(e) => setBrandForm({ ...brandForm, audience: e.target.value === 'otro' ? 'custom' : e.target.value, customAudience: '' })} className="input-field" required>
                          <option value="">Selecciona una audiencia...</option>
                          {audienceOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        {brandForm.audience === 'custom' && <input type="text" value={brandForm.customAudience} onChange={(e) => setBrandForm({ ...brandForm, customAudience: e.target.value })} className="input-field mt-2" placeholder="Escribe tu audiencia..." />}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#101820] mb-2">Descripción</label>
                        <textarea value={brandForm.description} onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })} className="input-field min-h-[120px]" placeholder="Describe tu producto..." required />
                      </div>
                      <button type="button" onClick={handleCreateBrandClick} disabled={loading || !brandForm.name || !brandForm.tone || !brandForm.audience || !brandForm.description} className="btn-primary w-full">
                        {loading ? 'Generando...' : 'Crear Brand DNA'}
                      </button>
                    </form>
                  </div>

                  {previewBrand && previewBrand.manual && (
                    <div className="space-y-6">
                      {/* Header del Brand DNA */}
                      <div className="bg-gradient-to-r from-[#0D6EFD] to-[#0b5ed7] rounded-xl p-6 text-white">
                        <h3 className="text-2xl font-bold mb-2">📋 Presentación — Brand DNA "{previewBrand.name}"</h3>
                        <p className="text-blue-100">{previewBrand.manual.brand_overview?.summary || previewBrand.description}</p>
                      </div>

                      {/* Propuesta de Valor y Diferenciadores */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                          <h4 className="font-bold text-[#101820] mb-3 flex items-center gap-2">
                            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"></span>
                            Propuesta de Valor
                          </h4>
                          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">{previewBrand.manual.brand_overview?.value_proposition}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                          <h4 className="font-bold text-[#101820] mb-3 flex items-center gap-2">
                            <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">🏆</span>
                            Diferenciadores Clave
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {previewBrand.manual.brand_overview?.key_differentiators?.map((diff, i) => (
                              <span key={i} className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-200">✅ {diff}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Paleta de Colores */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h4 className="font-bold text-[#101820] mb-4 flex items-center gap-2">
                          <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600"></span>
                          Paleta de Colores de la Marca
                        </h4>
                        
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Colores Primarios:</p>
                          <div className="flex gap-4">
                            {previewBrand.manual.visual_identity?.primary_colors?.map((color, i) => (
                              <div key={i} className="text-center">
                                <div className="w-20 h-20 rounded-xl border-2 border-gray-200 shadow-lg" style={{backgroundColor: color}}></div>
                                <p className="mt-2 font-mono text-sm font-bold text-gray-800">{color}</p>
                                <p className="text-xs text-gray-500">{i === 0 ? 'Primario' : 'Secundario'}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {previewBrand.manual.visual_identity?.secondary_colors && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Colores Secundarios:</p>
                            <div className="flex gap-3">
                              {previewBrand.manual.visual_identity.secondary_colors.map((color, i) => (
                                <div key={i} className="text-center">
                                  <div className="w-14 h-14 rounded-lg border border-gray-200" style={{backgroundColor: color}}></div>
                                  <p className="mt-1 font-mono text-xs text-gray-600">{color}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Audiencia Objetivo */}
                      {previewBrand.manual.target_audience && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                          <h4 className="font-bold text-[#101820] mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">👥</span>
                            Segmento Principal — {previewBrand.manual.target_audience.profile}
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                              <p className="font-semibold text-green-800 mb-2">🎯 Características:</p>
                              <ul className="space-y-1">
                                {previewBrand.manual.target_audience.behaviors?.map((b, i) => (
                                  <li key={i} className="text-sm text-green-700">❤️ {b}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                              <p className="font-semibold text-red-800 mb-2">️ Pain Points:</p>
                              <ul className="space-y-1">
                                {previewBrand.manual.target_audience.pain_points?.map((p, i) => (
                                  <li key={i} className="text-sm text-red-700">❌ {p}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {previewBrand.manual.target_audience.expectations && (
                            <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-100">
                              <p className="font-semibold text-blue-800 mb-2">✨ Expectativas:</p>
                              <ul className="space-y-1">
                                {previewBrand.manual.target_audience.expectations.map((e, i) => (
                                  <li key={i} className="text-sm text-blue-700">• {e}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tono de Comunicación */}
                      {previewBrand.manual.tone_of_voice && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                          <h4 className="font-bold text-[#101820] mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">🗣️</span>
                            Tono de Comunicación
                          </h4>
                          
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-semibold text-gray-700">Estilo:</p>
                            <p className="text-sm text-gray-600">{previewBrand.manual.tone_of_voice.description}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                              <p className="font-semibold text-green-800 mb-2">✅ Debe incluir:</p>
                              <ul className="space-y-1">
                                {previewBrand.manual.tone_of_voice.do_examples?.map((ex, i) => (
                                  <li key={i} className="text-sm text-green-700">📚 {ex}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                              <p className="font-semibold text-red-800 mb-2">❌ Debe evitar:</p>
                              <ul className="space-y-1">
                                {previewBrand.manual.tone_of_voice.dont_examples?.map((ex, i) => (
                                  <li key={i} className="text-sm text-red-700">🚫 {ex}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {previewBrand.manual.tone_of_voice.forbidden_words && (
                            <div className="mt-4">
                              <p className="text-sm font-semibold text-gray-700 mb-2">🚫 Palabras Prohibidas:</p>
                              <div className="flex flex-wrap gap-2">
                                {previewBrand.manual.tone_of_voice.forbidden_words.map((word, i) => (
                                  <span key={i} className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">{word}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Identidad Visual - Reglas */}
                      {previewBrand.manual.visual_identity && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                          <h4 className="font-bold text-[#101820] mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600">🎨</span>
                            Identidad Visual — Reglas
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                              <p className="font-semibold text-blue-800 mb-2">📐 Reglas del Logo:</p>
                              <ul className="space-y-1">
                                {previewBrand.manual.visual_identity.logo_usage_rules?.map((rule, i) => (
                                  <li key={i} className="text-sm text-blue-700">• {rule}</li>
                                ))}
                              </ul>
                              {previewBrand.manual.visual_identity.minimum_logo_size && (
                                <p className="text-sm text-blue-700 mt-2">📏 Tamaño mínimo: {previewBrand.manual.visual_identity.minimum_logo_size}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* DOs y DON'Ts */}
                      {previewBrand.manual.do_and_dont && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                          <h4 className="font-bold text-[#101820] mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600">✅</span>
                            DOs y DON'Ts de la Marca
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                              <p className="font-semibold text-green-800 mb-2">✓ SÍ HACER:</p>
                              <ul className="space-y-1">
                                {previewBrand.manual.do_and_dont.dos?.map((d, i) => (
                                  <li key={i} className="text-sm text-green-700">✅ {d}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                              <p className="font-semibold text-red-800 mb-2">✗ NO HACER:</p>
                              <ul className="space-y-1">
                                {previewBrand.manual.do_and_dont.donts?.map((d, i) => (
                                  <li key={i} className="text-sm text-red-700">❌ {d}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {previewBrand.manual.do_and_dont.visual_dos && (
                            <div className="mt-4 grid grid-cols-2 gap-4">
                              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                <p className="font-semibold text-blue-800 mb-2">🎨 Visual SÍ:</p>
                                <ul className="space-y-1">
                                  {previewBrand.manual.do_and_dont.visual_dos.map((v, i) => (
                                    <li key={i} className="text-sm text-blue-700">• {v}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                                <p className="font-semibold text-orange-800 mb-2">🎨 Visual NO:</p>
                                <ul className="space-y-1">
                                  {previewBrand.manual.do_and_dont.visual_donts?.map((v, i) => (
                                    <li key={i} className="text-sm text-orange-700">• {v}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Ejemplos de Contenido */}
                      {previewBrand.manual.example_content && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                          <h4 className="font-bold text-[#101820] mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center text-violet-600">📝</span>
                            Ejemplos de Contenido
                          </h4>
                          
                          {previewBrand.manual.example_content.marketing_copy && (
                            <div className="mb-4">
                              <p className="text-sm font-semibold text-gray-700 mb-2">Copy de Marketing:</p>
                              <div className="space-y-2">
                                {previewBrand.manual.example_content.marketing_copy.map((c, i) => (
                                  <p key={i} className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">"{c}"</p>
                                ))}
                              </div>
                            </div>
                          )}

                          {previewBrand.manual.example_content.social_media_posts && (
                            <div className="mb-4">
                              <p className="text-sm font-semibold text-gray-700 mb-2">Posts para Redes:</p>
                              <div className="space-y-2">
                                {previewBrand.manual.example_content.social_media_posts.map((p, i) => (
                                  <p key={i} className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg border-l-4 border-green-400">"{p}"</p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Botones de Acción */}
                      <div className="flex gap-3">
                        <button onClick={regenerateBrand} className="flex-1 py-3 border-2 border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50">
                           Regenerar Brand DNA
                        </button>
                        <button onClick={saveBrand} className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium">
                          ✓ Confirmar y Guardar
                        </button>
                      </div>
                    </div>
                  )}

                  {!previewBrand && brands.length > 0 && (
                    <div className="card p-6">
                      <h3 className="text-lg font-bold text-[#101820] mb-4">Mis Brands</h3>
                      <div className="space-y-3">
                        {brands.map((brand) => (
                          <div key={brand.id} className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-[#101820]">{brand.name}</p>
                                <p className="text-sm text-[#64748B]">{brand.tone} • {brand.audience}</p>
                              </div>
                              <span className="text-xs text-[#10B981] font-medium">✓ Guardado</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'generate' && (
                <div className="card p-6">
                  <h2 className="text-xl font-bold text-[#101820] mb-6">Generar Contenido</h2>
                  <form onSubmit={handleGenerate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#101820] mb-2">Seleccionar Brand DNA</label>
                      <select value={generateForm.brandId} onChange={(e) => setGenerateForm({ ...generateForm, brandId: e.target.value })} className="input-field" required>
                        <option value="">Selecciona un brand...</option>
                        {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                      </select>
                    </div>

                    {generateForm.brandId && (() => {
                      const selectedBrand = brands.find(b => b.id === generateForm.brandId);
                      return selectedBrand ? (
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <h4 className="font-semibold text-[#101820] mb-3">📋 Resumen del Brand: {selectedBrand.name}</h4>
                          {selectedBrand.manual && (
                            <div className="space-y-3 text-sm">
                              {selectedBrand.manual.target_audience && (
                                <div>
                                  <p className="font-medium text-[#3B82F6] mb-1">👥 Audiencia Objetivo:</p>
                                  <p className="text-[#64748B]">{selectedBrand.manual.target_audience.profile}</p>
                                </div>
                              )}
                              {selectedBrand.manual.tone_of_voice && (
                                <div>
                                  <p className="font-medium text-[#8B5CF6] mb-1">🎤 Tono de Voz:</p>
                                  <p className="text-[#64748B]">{selectedBrand.manual.tone_of_voice.description}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : null;
                    })()}

                    <div>
                      <label className="block text-sm font-medium text-[#101820] mb-2">Tipo de Contenido</label>
                      <select value={generateForm.contentType} onChange={(e) => setGenerateForm({ ...generateForm, contentType: e.target.value, customContentType: '' })} className="input-field" required>
                        <option value="">Selecciona el tipo...</option>
                        {contentTypeOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#101820] mb-2">Prompt de contenido</label>
                      <textarea value={generateForm.prompt} onChange={(e) => setGenerateForm({ ...generateForm, prompt: e.target.value })} className="input-field min-h-[150px]" placeholder="Describe el contenido que necesitas..." required />
                    </div>

                    <button type="submit" disabled={loading || !brands.length || !generateForm.contentType} className="btn-primary w-full">
                      {loading ? 'Generando...' : 'Generar Contenido'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'contents' && (
                <div className="card p-6">
                  <h2 className="text-xl font-bold text-[#101820] mb-6">📊 Estado de Mis Contenidos</h2>
                  
                  {loading ? (
                    <p className="text-center py-8 text-gray-500">Cargando...</p>
                  ) : contents.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p>No hay contenidos generados aún</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-2 mb-4">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                          Pendientes: {contents.filter(c => c.status === 'pending').length}
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          Aprobados: {contents.filter(c => c.status === 'approved').length}
                        </span>
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                          Rechazados: {contents.filter(c => c.status === 'rejected').length}
                        </span>
                      </div>

                      {contents.map((content) => (
                        <div key={content.id} className="p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-semibold text-[#101820]">{content.brand}</p>
                              <p className="text-xs text-gray-400">{content.prompt?.slice(0, 60)}...</p>
                            </div>
                            <div className="text-right">
                              {content.status === 'pending' && <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full font-medium">⏳ Pendiente</span>}
                              {content.status === 'approved' && <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">✓ Aprobado</span>}
                              {content.status === 'rejected' && <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full font-medium">✗ Rechazado</span>}
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-gray-50 text-sm line-clamp-2">{content.generated_content || content.content}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>

      {showConfirmModal && pendingBrandData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold text-[#101820] mb-4">Generar Brand DNA</h2>
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <p><span className="font-medium">Nombre:</span> {pendingBrandData.name}</p>
              <p><span className="font-medium">Tono:</span> {pendingBrandData.tone}</p>
              <p><span className="font-medium">Audiencia:</span> {pendingBrandData.audience}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowConfirmModal(false); setPendingBrandData(null); }} className="flex-1 py-2 border-2 border-gray-300 rounded-lg text-[#64748B]">Cancelar</button>
              <button onClick={confirmCreateBrand} disabled={loading} className="flex-1 btn-primary">{loading ? 'Generando...' : 'Generar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}