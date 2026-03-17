'use client';

import { useEffect, useState, useRef } from "react";
import axios from 'axios';
import { Upload, Loader2, X } from 'lucide-react';
import ImageUploader from "../../components/ImageUploader";
import { Toaster, toast } from 'sonner';
import { SUBCATEGORIAS, type CategoriaPrincipal } from '../../../constants/subcategorias';
import { TIPOS_ARETES } from '../../../constants/tiposAretes';
import PedidosPanel from '../components/PedidosPanel';

// Función para normalizar URLs (agregar / al inicio si no tiene) - DEFINIDA A NIVEL GLOBAL
const normalizeUrl = (url: string) => {
  if (!url) return '';
  
  // Si ya es una URL completa (http), dejarla igual
  if (url.startsWith('http')) return url;
  
  // Si ya tiene /uploads al inicio, dejarla igual
  if (url.startsWith('/uploads')) return url;
  
  // Si empieza con uploads (sin /), agregar el /
  if (url.startsWith('uploads')) return `/${url}`;
  
  // Si no tiene ninguna de las anteriores, agregar /uploads/
  return `/uploads/${url}`;
};

// Componente para gestionar todos los medios (imagen principal + adicionales + videos)
const MediaManager = ({
  mainImage,
  images = [],
  videos = [],
  onMainImageChange,
  onImagesChange,
  onVideosChange,
  label
}: {
  mainImage?: string;
  images: string[];
  videos: string[];
  onMainImageChange?: (url: string) => void;
  onImagesChange: (urls: string[]) => void;
  onVideosChange: (urls: string[]) => void;
  label: string;
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'image' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadType(type);

    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('type', type);

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const url = response.data.url;

      if (type === 'image') {
        onImagesChange([...images, url]);
        toast.success('Imagen subida correctamente');
      } else {
        onVideosChange([...videos, url]);
        toast.success('Video subido correctamente');
      }
    } catch (error) {
      console.error('Error al subir archivo:', error);
      toast.error(`Error al subir ${type === 'image' ? 'imagen' : 'video'}`);
    } finally {
      setUploading(false);
      setUploadType(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    // Crear una copia del array actual
    const currentImages = [...images];
    
    // Verificar que el índice existe
    if (index >= 0 && index < currentImages.length) {
      // Eliminar solo la imagen en ese índice
      currentImages.splice(index, 1);
      
      // Actualizar el estado con el nuevo array
      onImagesChange(currentImages);
      
      toast.success('Imagen eliminada');
    }
  };

  const handleRemoveVideo = (index: number) => {
    const newVideos = [...videos];
    newVideos.splice(index, 1);
    onVideosChange(newVideos);
  };

  const handleRemoveMainImage = () => {
    if (onMainImageChange) {
      onMainImageChange('');
    }
  };

  return (
    <div className="space-y-6 p-4 bg-gray-50 rounded-xl">
      {/* Sección de Imagen Principal */}
      {mainImage !== undefined && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-gray-700">Imagen Principal</label>
            {onMainImageChange && (
              <button
                type="button"
                onClick={() => document.getElementById('main-image-upload')?.click()}
                className="flex items-center gap-1 text-xs bg-black text-white px-3 py-1 rounded-full hover:bg-gray-800 transition"
              >
                <Upload size={12} />
                Cambiar
              </button>
            )}
          </div>
          
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files[0] && onMainImageChange) {
                const formData = new FormData();
                formData.append('file', files[0]);
                formData.append('type', 'image');
                
                axios.post('/api/upload', formData, {
                  headers: { 'Content-Type': 'multipart/form-data' },
                }).then(response => {
                  onMainImageChange(response.data.url);
                  toast.success('Imagen principal actualizada');
                }).catch(() => {
                  toast.error('Error al subir imagen principal');
                });
              }
            }}
            id="main-image-upload"
          />
          
          {mainImage && (
            <div className="relative w-32 h-32 group">
              <img 
                src={normalizeUrl(mainImage)} 
                alt="Principal" 
                className="w-full h-full object-cover rounded-lg border-2 border-black"
              />
              <button
                type="button"
                onClick={handleRemoveMainImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sección de Imágenes Adicionales */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-gray-700">Imágenes Adicionales</label>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'image')}
              id="image-upload"
            />
            <button
              type="button"
              onClick={() => document.getElementById('image-upload')?.click()}
              disabled={uploading}
              className="flex items-center gap-1 text-xs bg-black text-white px-3 py-1 rounded-full hover:bg-gray-800 transition disabled:opacity-50"
            >
              {uploading && uploadType === 'image' ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Upload size={12} />
              )}
              + Agregar
            </button>
          </div>
        </div>

        {images.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2">{images.length} imagen(es)</p>
            <div className="grid grid-cols-4 gap-2">
              {images.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img 
                    src={normalizeUrl(url)} 
                    alt={`Adicional ${idx}`} 
                    className="w-full h-20 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sección de Videos */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-gray-700">Videos</label>
          <div className="flex gap-2">
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'video')}
              id="video-upload"
            />
            <button
              type="button"
              onClick={() => document.getElementById('video-upload')?.click()}
              disabled={uploading}
              className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition disabled:opacity-50"
            >
              {uploading && uploadType === 'video' ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Upload size={12} />
              )}
              + Agregar
            </button>
          </div>
        </div>

        {videos.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2">{videos.length} video(s)</p>
            <div className="grid grid-cols-4 gap-2">
              {videos.map((url, idx) => (
                <div key={idx} className="relative group bg-gray-200 h-20 rounded-lg flex items-center justify-center">
                  {url.includes('youtube') || url.includes('vimeo') ? (
                    <span className="text-xs text-gray-600">🎥 Video</span>
                  ) : (
                    <video src={normalizeUrl(url)} className="w-full h-full object-cover rounded-lg" />
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveVideo(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Indicador de carga */}
      {uploading && (
        <div className="text-center py-2">
          <p className="text-xs text-gray-500">Subiendo {uploadType === 'image' ? 'imagen' : 'video'}...</p>
        </div>
      )}
    </div>
  );
};

export default function AdminPage() {
  const [hero, setHero] = useState<any>(null);
  const [editorial, setEditorial] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [siteConfig, setSiteConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hero');
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productTab, setProductTab] = useState('lista');
  
  // Estado para el formulario de nuevo producto
  const [newProduct, setNewProduct] = useState({
    nombre: '',
    descripcion: '',
    marca: '',
    categoria: 'hombre',
    subcategoria: '',
    tipo_arete: '',
    precio: '',
    precio_oferta: '',
    en_oferta: false,
    stock: '',
    talla: '',
    color: '',
    colores_disponibles: [] as string[],
    imagen: '',
    imagenes_adicionales: [] as string[],
    videos: [] as string[],
    cantidad_mayoreo_1: '',
    precio_mayoreo_1: '',
    cantidad_mayoreo_2: '',
    precio_mayoreo_2: '',
    cantidad_mayoreo_3: '',
    precio_mayoreo_3: ''
  });

  // Estado para el input de color
  const [colorInput, setColorInput] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    Promise.all([
      axios.get("/api/hero"),
      axios.get("/api/editorial"),
      axios.get("/api/productos"),
      axios.get("/api/config")
    ]).then(([heroRes, editorialRes, productsRes, configRes]) => {
      setHero(heroRes.data);
      setEditorial(editorialRes.data);
      setProducts(productsRes.data);
      setSiteConfig(configRes.data || {
        logo_texto: 'BLACKS',
        eslogan: 'NUEVA COLECCION / 2026',
        subtitulo: 'PIEZAS ESENCIALES'
      });
      setLoading(false);
    }).catch(() => {
        toast.error("Error al cargar los datos iniciales");
        setLoading(false);
    });
  }, []);

  const handleSaveHero = async () => {
    setSaving(true);
    try {
      await axios.patch("/api/hero", hero);
      toast.success('Hero actualizado correctamente');
    } catch (error) {
      toast.error('No se pudo guardar la sección Hero');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEditorial = async () => {
    setSaving(true);
    try {
      await axios.patch("/api/editorial", editorial);
      toast.success('Editorial guardado con éxito');
    } catch (error) {
      toast.error('Error al actualizar Editorial');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await axios.patch("/api/config", siteConfig);
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (newProduct.subcategoria === 'Aretes' && !newProduct.tipo_arete) {
        toast.error('Debes seleccionar un tipo de arete');
        setSaving(false);
        return;
      }

      console.log('Enviando producto:', newProduct);
      await axios.post("/api/productos", newProduct);
      toast.success('Producto creado correctamente');
      
      const productsRes = await axios.get("/api/productos");
      setProducts(productsRes.data);
      
      setNewProduct({
        nombre: '',
        descripcion: '',
        marca: '',
        categoria: 'hombre',
        subcategoria: '',
        tipo_arete: '',
        precio: '',
        precio_oferta: '',
        en_oferta: false,
        stock: '',
        talla: '',
        color: '',
        colores_disponibles: [],
        imagen: '',
        imagenes_adicionales: [],
        videos: [],
        cantidad_mayoreo_1: '',
        precio_mayoreo_1: '',
        cantidad_mayoreo_2: '',
        precio_mayoreo_2: '',
        cantidad_mayoreo_3: '',
        precio_mayoreo_3: ''
      });

      setProductTab('lista');
    } catch (error: any) {
      console.error('Error al crear producto:', error);
      toast.error(error.response?.data?.error || 'Error al crear el producto');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingProduct.subcategoria === 'Aretes' && !editingProduct.tipo_arete) {
        toast.error('Debes seleccionar un tipo de arete');
        setSaving(false);
        return;
      }

      // Función para quitar la barra inicial antes de guardar
      const quitarBarraInicial = (url: string) => {
        if (!url) return url;
        return url.startsWith('/') ? url.substring(1) : url;
      };

      // Preparar el producto para guardar (sin barras iniciales)
      const productToUpdate = {
        ...editingProduct,
        imagen: quitarBarraInicial(editingProduct.imagen),
        imagenes_adicionales: (editingProduct.imagenes_adicionales || []).map((url: string) => quitarBarraInicial(url)),
        videos: editingProduct.videos || []
      };

      console.log('Actualizando producto:', productToUpdate);
      
      const response = await axios.put(
        `/api/productos/${editingProduct.id}`,
        productToUpdate
      );

      console.log('Respuesta del PUT:', response.data);
      toast.success("Producto actualizado correctamente");

      const productsRes = await axios.get("/api/productos");
      setProducts(productsRes.data);
      setEditingProduct(null);

    } catch (error: any) {
      console.error("Error al actualizar producto:", error);
      toast.error(error.response?.data?.error || "Error al actualizar producto");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      await axios.delete(`/api/productos/${id}`);
      toast.success('Producto eliminado');
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      toast.error('Error al eliminar el producto');
    }
  };

  const handleImageNotice = (field: string) => {
    toast.info(`Imagen de ${field} actualizada en el borrador`);
  };

  const getSubcategoriasPorCategoria = (categoria: CategoriaPrincipal) => {
    return [...new Set(SUBCATEGORIAS[categoria] ?? [])];
  };

  const handleAddColor = () => {
    if (colorInput.trim()) {
      if (editingProduct) {
        setEditingProduct({
          ...editingProduct,
          colores_disponibles: [...(editingProduct.colores_disponibles || []), colorInput.trim()]
        });
      } else {
        setNewProduct({
          ...newProduct,
          colores_disponibles: [...newProduct.colores_disponibles, colorInput.trim()]
        });
      }
      setColorInput('');
    }
  };

  const handleRemoveColor = (index: number) => {
    if (editingProduct) {
      const newColors = [...(editingProduct.colores_disponibles || [])];
      newColors.splice(index, 1);
      setEditingProduct({ ...editingProduct, colores_disponibles: newColors });
    } else {
      const newColors = [...newProduct.colores_disponibles];
      newColors.splice(index, 1);
      setNewProduct({ ...newProduct, colores_disponibles: newColors });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <Toaster position="top-right" richColors closeButton />

      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col sm:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight italic">BLACKS <span className="font-light not-italic text-gray-400 text-2xl">/ Administrador</span></h1>
            <p className="mt-1 text-gray-500 text-sm font-medium">Panel de control de contenido</p>
          </div>
        </header>

        <nav className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 p-1 bg-gray-200/60 rounded-xl">
            <button
              onClick={() => setActiveTab('hero')}
              className={`px-2 sm:px-3 py-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'hero' 
                  ? 'bg-white shadow-sm text-black' 
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
              }`}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span className="hidden sm:inline">INICIO</span>
              <span className="sm:hidden">HOME</span>
            </button>
            
            <button
              onClick={() => setActiveTab('editorial')}
              className={`px-2 sm:px-3 py-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'editorial' 
                  ? 'bg-white shadow-sm text-black' 
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
              }`}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="18" rx="2" ry="2" />
                <line x1="8" y1="9" x2="16" y2="9" />
                <line x1="8" y1="13" x2="16" y2="13" />
                <line x1="8" y1="17" x2="12" y2="17" />
              </svg>
              <span className="hidden sm:inline">EDITORIAL</span>
              <span className="sm:hidden">EDT</span>
            </button>
            
            <button
              onClick={() => setActiveTab('productos')}
              className={`px-2 sm:px-3 py-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'productos' 
                  ? 'bg-white shadow-sm text-black' 
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
              }`}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                <line x1="16" y1="3" x2="16" y2="7" />
                <line x1="8" y1="3" x2="8" y2="7" />
              </svg>
              <span className="hidden sm:inline">PRODUCTOS</span>
              <span className="sm:hidden">PROD</span>
            </button>
            
            <button
              onClick={() => setActiveTab('config')}
              className={`px-2 sm:px-3 py-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'config' 
                  ? 'bg-white shadow-sm text-black' 
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
              }`}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H5.78a1.65 1.65 0 0 0-1.51 1 1.65 1.65 0 0 0 .33 1.82l.07.09a10 10 0 0 0 14.66 0z" />
              </svg>
              <span className="hidden sm:inline">CONFIG</span>
              <span className="sm:hidden">CFG</span>
            </button>
            
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`col-span-2 sm:col-span-1 px-2 sm:px-3 py-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'pedidos' 
                  ? 'bg-white shadow-sm text-black' 
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
              }`}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              <span className="hidden sm:inline">PEDIDOS</span>
              <span className="sm:hidden">PED</span>
            </button>
          </div>
        </nav>

        <main className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          {/* SECCIÓN HERO */}
          {activeTab === 'hero' && (
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ImageUploader 
                            currentImage={hero?.imagen} 
                            onImageUpload={(url) => {
                                const newData = { ...hero, imagen: url };
                                setHero(newData);
                                handleImageNotice('Desktop');
                            }} 
                            label="Desktop View" 
                        />
                        <ImageUploader 
                            currentImage={hero?.imagen_mobile} 
                            onImageUpload={(url) => {
                                const newData = { ...hero, imagen_mobile: url };
                                setHero(newData);
                                handleImageNotice('Mobile');
                            }} 
                            label="Mobile View" 
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="group space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Título</label>
                            <input 
                                name="titulo" 
                                value={hero?.titulo || ''} 
                                onChange={(e) => setHero({...hero, titulo: e.target.value})} 
                                className="w-full bg-gray-50 border-transparent border-2 p-4 rounded-2xl focus:bg-white focus:border-black transition-all outline-none font-medium" 
                            />
                        </div>
                        <div className="group space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Subtítulo</label>
                            <input 
                                name="subtitulo" 
                                value={hero?.subtitulo || ''} 
                                onChange={(e) => setHero({...hero, subtitulo: e.target.value})} 
                                className="w-full bg-gray-50 border-transparent border-2 p-4 rounded-2xl focus:bg-white focus:border-black transition-all outline-none font-medium" 
                            />
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 flex justify-end">
                    <button 
                        onClick={handleSaveHero} 
                        disabled={saving} 
                        className="bg-black text-white px-12 py-4 rounded-2xl font-black text-xs tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {saving ? 'PROCESANDO...' : 'GUARDAR CAMBIOS'}
                    </button>
                </div>
            </div>
          )}

          {/* SECCIÓN EDITORIAL */}
          {activeTab === 'editorial' && (
            <div className="space-y-6">
                {[1, 2, 3].map((bloque) => (
                    <div key={bloque} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-full md:w-1/3">
                            <ImageUploader 
                                currentImage={editorial?.[`bloque${bloque}_imagen`]} 
                                onImageUpload={(url) => {
                                    setEditorial({...editorial, [`bloque${bloque}_imagen`]: url});
                                    handleImageNotice(`Bloque ${bloque}`);
                                }} 
                                label={`Imagen 0${bloque}`} 
                            />
                        </div>
                        <div className="w-full md:w-2/3 space-y-4">
                            <input 
                                value={editorial?.[`bloque${bloque}_titulo`] || ''} 
                                onChange={(e) => setEditorial({...editorial, [`bloque${bloque}_titulo`]: e.target.value})}
                                placeholder="Título del bloque" 
                                className="w-full border-b-2 border-gray-100 py-2 focus:border-black outline-none text-xl font-bold transition-all" 
                            />
                            <textarea 
                                value={editorial?.[`bloque${bloque}_descripcion`] || ''} 
                                onChange={(e) => setEditorial({...editorial, [`bloque${bloque}_descripcion`]: e.target.value})}
                                placeholder="Descripción..." 
                                className="w-full bg-gray-50 p-4 rounded-xl outline-none min-h-[100px] text-sm text-gray-600 focus:ring-1 ring-black transition-all"
                            />
                        </div>
                    </div>
                ))}
                <div className="flex justify-center pt-6">
                    <button 
                        onClick={handleSaveEditorial} 
                        disabled={saving} 
                        className="bg-black text-white px-16 py-5 rounded-3xl font-black text-sm tracking-[0.2em] shadow-2xl hover:bg-gray-900 transition-all"
                    >
                        {saving ? 'ACTUALIZANDO...' : 'PUBLICAR EDITORIAL'}
                    </button>
                </div>
            </div>
          )}

          {/* SECCIÓN CONFIGURACIÓN */}
          {activeTab === 'config' && (
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-black mb-8">CONFIGURACIÓN DE SHOP</h2>
                
                <div className="space-y-6 max-w-2xl">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase">Eslogan / Año</label>
                    <input
                      value={siteConfig?.eslogan || ''}
                      onChange={(e) => setSiteConfig({...siteConfig, eslogan: e.target.value})}
                      placeholder="NUEVA COLECCION / 2026"
                      className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase">Subtítulo</label>
                    <input
                      value={siteConfig?.subtitulo || ''}
                      onChange={(e) => setSiteConfig({...siteConfig, subtitulo: e.target.value})}
                      placeholder="PIEZAS ESENCIALES"
                      className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 flex justify-end">
                <button 
                  onClick={handleSaveConfig} 
                  disabled={saving} 
                  className="bg-black text-white px-12 py-4 rounded-2xl font-black text-xs tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {saving ? 'GUARDANDO...' : 'GUARDAR CONFIGURACIÓN'}
                </button>
              </div>
            </div>
          )}

          {/* SECCIÓN PRODUCTOS */}
          {activeTab === 'productos' && (
            <div className="space-y-8">
              {/* Navegación interna de productos */}
              <nav className="flex gap-1 bg-gray-200/60 p-1 rounded-xl w-fit">
                <button
                  onClick={() => setProductTab('lista')}
                  className={`px-8 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    productTab === 'lista' ? 'bg-white shadow-sm scale-100' : 'text-gray-500 hover:text-gray-800 scale-95'
                  }`}
                >
                  LISTA DE PRODUCTOS
                </button>
                <button
                  onClick={() => setProductTab('crear')}
                  className={`px-8 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    productTab === 'crear' ? 'bg-white shadow-sm scale-100' : 'text-gray-500 hover:text-gray-800 scale-95'
                  }`}
                >
                  CREAR PRODUCTO
                </button>
              </nav>

              {/* Lista de productos existentes */}
              {productTab === 'lista' && (
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <h2 className="text-2xl font-black mb-6">PRODUCTOS EXISTENTES</h2>
                  
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <img 
                          src={product.imagen ? normalizeUrl(product.imagen) : 'https://via.placeholder.com/50'} 
                          alt={product.nombre}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            console.error('Error cargando imagen:', product.imagen);
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50';
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="font-bold">{product.nombre}</h3>
                          <p className="text-sm text-gray-500">
                            ${product.precio} | Stock: {product.stock}
                            {product.subcategoria && ` | ${product.subcategoria}`}
                            {product.tipo_arete && ` - ${product.tipo_arete}`}
                          </p>
                          {product.colores_disponibles && product.colores_disponibles.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                              Colores: {product.colores_disponibles.join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setProductTab('lista');
                            }}
                            className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {products.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No hay productos creados</p>
                    )}
                  </div>

                  {/* Formulario de edición */}
                  {editingProduct && (
                    <div className="bg-white rounded-3xl p-8 border border-gray-200 mt-8">
                      <h2 className="text-xl font-black mb-6">EDITAR PRODUCTO</h2>

                      <form onSubmit={handleUpdateProduct} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            value={editingProduct.nombre}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, nombre: e.target.value })
                            }
                            placeholder="Nombre"
                            className="w-full p-3 border rounded-xl"
                          />

                          <input
                            value={editingProduct.marca || ''}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, marca: e.target.value })
                            }
                            placeholder="Marca"
                            className="w-full p-3 border rounded-xl"
                          />

                          <select
                            value={editingProduct.categoria}
                            onChange={(e) => {
                              setEditingProduct({ 
                                ...editingProduct, 
                                categoria: e.target.value,
                                subcategoria: '',
                                tipo_arete: ''
                              });
                            }}
                            className="w-full p-3 border rounded-xl"
                          >
                            <option value="hombre">Hombre</option>
                            <option value="mujer">Mujer</option>
                            <option value="accesorios">Accesorios</option>
                          </select>

                          <select
                            value={editingProduct.subcategoria || ''}
                            onChange={(e) =>
                              setEditingProduct({ 
                                ...editingProduct, 
                                subcategoria: e.target.value,
                                tipo_arete: ''
                              })
                            }
                            className="w-full p-3 border rounded-xl"
                          >
                            <option value="">Seleccionar subcategoría...</option>
                            {getSubcategoriasPorCategoria(editingProduct.categoria).map((sub) => (
                              <option key={sub} value={sub}>
                                {sub}
                              </option>
                            ))}
                          </select>

                          {editingProduct.subcategoria === 'Aretes' && (
                            <select
                              value={editingProduct.tipo_arete || ''}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, tipo_arete: e.target.value })
                              }
                              className="w-full p-3 border rounded-xl"
                            >
                              <option value="">Seleccionar tipo de arete...</option>
                              {TIPOS_ARETES.map((tipo) => (
                                <option key={tipo} value={tipo}>
                                  {tipo}
                                </option>
                              ))}
                            </select>
                          )}

                          <input
                            type="number"
                            step="0.01"
                            value={editingProduct.precio}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, precio: e.target.value })
                            }
                            placeholder="Precio"
                            className="w-full p-3 border rounded-xl"
                          />

                          <input
                            type="number"
                            step="0.01"
                            value={editingProduct.precio_oferta || ''}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, precio_oferta: e.target.value })
                            }
                            placeholder="Precio de oferta"
                            className="w-full p-3 border rounded-xl"
                          />

                          {/* SECCIÓN DE COLORES */}
                          <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
                            <h3 className="text-sm font-black text-gray-700 mb-4">COLORES DISPONIBLES</h3>
                            
                            <div className="flex gap-2 mb-3">
                              <input
                                type="text"
                                value={colorInput}
                                onChange={(e) => setColorInput(e.target.value)}
                                placeholder="Ej: Negro, Rojo, Azul..."
                                className="flex-1 p-3 border rounded-xl"
                              />
                              <button
                                type="button"
                                onClick={handleAddColor}
                                className="bg-black text-white px-6 py-3 rounded-xl text-sm hover:bg-gray-800 transition"
                              >
                                Agregar Color
                              </button>
                            </div>

                            {editingProduct.colores_disponibles && editingProduct.colores_disponibles.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {editingProduct.colores_disponibles.map((color: string, idx: number) => (
                                  <div key={idx} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                                    <span className="text-sm">{color}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveColor(idx)}
                                      className="text-red-500 hover:text-red-700 text-lg leading-none"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* CAMPOS DE MAYOREO */}
                          <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
                            <h3 className="text-sm font-black text-gray-700 mb-4">PRECIOS POR MAYOREO</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* NIVEL 1 */}
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1">CANTIDAD MÍNIMA 1</label>
                                <input
                                  type="number"
                                  min="2"
                                  value={editingProduct.cantidad_mayoreo_1 || ''}
                                  onChange={(e) =>
                                    setEditingProduct({ ...editingProduct, cantidad_mayoreo_1: e.target.value })
                                  }
                                  placeholder="Ej: 3"
                                  className="w-full p-3 border rounded-xl"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1">PRECIO MAYOREO 1</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editingProduct.precio_mayoreo_1 || ''}
                                  onChange={(e) =>
                                    setEditingProduct({ ...editingProduct, precio_mayoreo_1: e.target.value })
                                  }
                                  placeholder="Ej: 250"
                                  className="w-full p-3 border rounded-xl"
                                />
                              </div>

                              {/* NIVEL 2 */}
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1">CANTIDAD MÍNIMA 2</label>
                                <input
                                  type="number"
                                  min="2"
                                  value={editingProduct.cantidad_mayoreo_2 || ''}
                                  onChange={(e) =>
                                    setEditingProduct({ ...editingProduct, cantidad_mayoreo_2: e.target.value })
                                  }
                                  placeholder="Ej: 6"
                                  className="w-full p-3 border rounded-xl"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1">PRECIO MAYOREO 2</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editingProduct.precio_mayoreo_2 || ''}
                                  onChange={(e) =>
                                    setEditingProduct({ ...editingProduct, precio_mayoreo_2: e.target.value })
                                  }
                                  placeholder="Ej: 200"
                                  className="w-full p-3 border rounded-xl"
                                />
                              </div>

                              {/* NIVEL 3 */}
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1">CANTIDAD MÍNIMA 3</label>
                                <input
                                  type="number"
                                  min="2"
                                  value={editingProduct.cantidad_mayoreo_3 || ''}
                                  onChange={(e) =>
                                    setEditingProduct({ ...editingProduct, cantidad_mayoreo_3: e.target.value })
                                  }
                                  placeholder="Ej: 12"
                                  className="w-full p-3 border rounded-xl"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1">PRECIO MAYOREO 3</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editingProduct.precio_mayoreo_3 || ''}
                                  onChange={(e) =>
                                    setEditingProduct({ ...editingProduct, precio_mayoreo_3: e.target.value })
                                  }
                                  placeholder="Ej: 150"
                                  className="w-full p-3 border rounded-xl"
                                />
                              </div>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">
                              * Deja en blanco si no aplica descuento por mayoreo
                            </p>
                          </div>

                          <input
                            type="number"
                            value={editingProduct.stock}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, stock: e.target.value })
                            }
                            placeholder="Stock"
                            className="w-full p-3 border rounded-xl"
                          />

                          <input
                            value={editingProduct.talla || ''}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, talla: e.target.value })
                            }
                            placeholder="Talla"
                            className="w-full p-3 border rounded-xl"
                          />

                          <input
                            value={editingProduct.color || ''}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, color: e.target.value })
                            }
                            placeholder="Color principal"
                            className="w-full p-3 border rounded-xl"
                          />

                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id="edit_en_oferta"
                              checked={editingProduct.en_oferta}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, en_oferta: e.target.checked })
                              }
                              className="w-5 h-5"
                            />
                            <label htmlFor="edit_en_oferta" className="text-sm font-medium text-gray-700">
                              En oferta
                            </label>
                          </div>
                        </div>

                        <textarea
                          value={editingProduct.descripcion || ''}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, descripcion: e.target.value })
                          }
                          placeholder="Descripción"
                          rows={3}
                          className="w-full p-3 border rounded-xl"
                        />

                        {/* Media Manager con imagen principal incluida */}
                        <MediaManager
                          mainImage={editingProduct.imagen}
                          images={editingProduct.imagenes_adicionales || []}
                          videos={editingProduct.videos || []}
                          onMainImageChange={(url) => {
                            console.log('Cambiando imagen principal a:', url);
                            setEditingProduct({ ...editingProduct, imagen: url });
                          }}
                          onImagesChange={(urls) => {
                            console.log('Cambiando imágenes adicionales a:', urls);
                            setEditingProduct({ ...editingProduct, imagenes_adicionales: urls });
                          }}
                          onVideosChange={(urls) => {
                            console.log('Cambiando videos a:', urls);
                            setEditingProduct({ ...editingProduct, videos: urls });
                          }}
                          label="GESTOR DE MEDIOS"
                        />

                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={saving}
                            className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50"
                          >
                            {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingProduct(null)}
                            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-medium hover:bg-gray-300 transition"
                          >
                            CANCELAR
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* Formulario para crear producto */}
              {productTab === 'crear' && (
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <h2 className="text-2xl font-black mb-6">CREAR NUEVO PRODUCTO</h2>
                  
                  <form onSubmit={handleCreateProduct} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Nombre */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500">NOMBRE *</label>
                        <input
                          required
                          value={newProduct.nombre}
                          onChange={(e) => setNewProduct({...newProduct, nombre: e.target.value})}
                          className="w-full bg-gray-50 p-3 rounded-xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none"
                        />
                      </div>

                      {/* Marca */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500">MARCA</label>
                        <input
                          value={newProduct.marca}
                          onChange={(e) => setNewProduct({...newProduct, marca: e.target.value})}
                          className="w-full bg-gray-50 p-3 rounded-xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none"
                        />
                      </div>

                      {/* Categoría */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500">CATEGORÍA *</label>
                        <select
                          required
                          value={newProduct.categoria}
                          onChange={(e) => {
                            setNewProduct({
                              ...newProduct, 
                              categoria: e.target.value,
                              subcategoria: '',
                              tipo_arete: ''
                            });
                          }}
                          className="w-full bg-gray-50 p-3 rounded-xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none"
                        >
                          <option value="hombre">Hombre</option>
                          <option value="mujer">Mujer</option>
                          <option value="accesorios">Accesorios</option>
                        </select>
                      </div>

                      {/* Subcategoría */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500">SUBCATEGORÍA</label>
                        <select
                          value={newProduct.subcategoria}
                          onChange={(e) => {
                            setNewProduct({
                              ...newProduct, 
                              subcategoria: e.target.value,
                              tipo_arete: ''
                            });
                          }}
                          className="w-full bg-gray-50 p-3 rounded-xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none"
                        >
                          <option value="">Seleccionar subcategoría...</option>
                          {getSubcategoriasPorCategoria(newProduct.categoria).map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Tipos de aretes */}
                      {newProduct.subcategoria === 'Aretes' && (
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500">TIPO DE ARETE</label>
                          <select
                            value={newProduct.tipo_arete}
                            onChange={(e) => setNewProduct({...newProduct, tipo_arete: e.target.value})}
                            className="w-full bg-gray-50 p-3 rounded-xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none"
                          >
                            <option value="">Seleccionar tipo...</option>
                            {TIPOS_ARETES.map((tipo) => (
                              <option key={tipo} value={tipo}>
                                {tipo}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Precio */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500">PRECIO *</label>
                        <input
                          required
                          type="number"
                          step="0.01"
                          value={newProduct.precio}
                          onChange={(e) => setNewProduct({...newProduct, precio: e.target.value})}
                          className="w-full bg-gray-50 p-3 rounded-xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none"
                        />
                      </div>

                      {/* Precio oferta */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500">PRECIO OFERTA</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newProduct.precio_oferta}
                          onChange={(e) => setNewProduct({...newProduct, precio_oferta: e.target.value})}
                          className="w-full bg-gray-50 p-3 rounded-xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none"
                        />
                      </div>

                      {/* SECCIÓN DE COLORES */}
                      <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
                        <h3 className="text-sm font-black text-gray-700 mb-4">COLORES DISPONIBLES</h3>
                        
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={colorInput}
                            onChange={(e) => setColorInput(e.target.value)}
                            placeholder="Ej: Negro, Rojo, Azul..."
                            className="flex-1 p-3 border rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={handleAddColor}
                            className="bg-black text-white px-6 py-3 rounded-xl text-sm hover:bg-gray-800 transition"
                          >
                            Agregar Color
                          </button>
                        </div>

                        {newProduct.colores_disponibles.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {newProduct.colores_disponibles.map((color, idx) => (
                              <div key={idx} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                                <span className="text-sm">{color}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveColor(idx)}
                                  className="text-red-500 hover:text-red-700 text-lg leading-none"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* CAMPOS DE MAYOREO */}
                      <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
                        <h3 className="text-sm font-black text-gray-700 mb-4">PRECIOS POR MAYOREO</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* NIVEL 1 */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500">CANTIDAD MÍNIMA 1</label>
                            <input
                              type="number"
                              min="2"
                              value={newProduct.cantidad_mayoreo_1}
                              onChange={(e) => setNewProduct({...newProduct, cantidad_mayoreo_1: e.target.value})}
                              placeholder="Ej: 3"
                              className="w-full bg-gray-50 p-3 rounded-xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500">PRECIO MAYOREO 1</label>
                            <input
                              type="number"
                              step="0.01"
                              value={newProduct.precio_mayoreo_1}
                              onChange={(e) => setNewProduct({...newProduct, precio_mayoreo_1: e.target.value})}
                              placeholder="Ej: 250"
                              className="w-full bg-gray-50 p-3 rounded-xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none"
                            />
                          </div>

                          {/* NIVEL 2 */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500">CANTIDAD MÍNIMA 2</label>
                            <input
                              type="number"
                              min="2"
                              value={newProduct.cantidad_mayoreo_2}
                              onChange={(e) => setNewProduct({...newProduct, cantidad_mayoreo_2: e.target.value})}
                              placeholder="Ej: 6"
                              className="w-full bg-gray-50 p-3 rounded-xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500">PRECIO MAYOREO 2</label>
                            <input
                              type="number"
                              step="0.01"
                              value={newProduct.precio_mayoreo_2}
                              onChange={(e) => setNewProduct({...newProduct, precio_mayoreo_2: e.target.value})}
                              placeholder="Ej: 200"
                              className="w-full bg-gray-50 p-3 rounded-xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none"
                            />
                          </div>

                          {/* NIVEL 3 */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500">CANTIDAD MÍNIMA 3</label>
                            <input
                              type="number"
                              min="2"
                              value={newProduct.cantidad_mayoreo_3}
                              onChange={(e) => setNewProduct({...newProduct, cantidad_mayoreo_3: e.target.value})}
                              placeholder="Ej: 12"
                              className="w-full bg-gray-50 p-3 rounded-xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500">PRECIO MAYOREO 3</label>
                            <input
                              type="number"
                              step="0.01"
                              value={newProduct.precio_mayoreo_3}
                              onChange={(e) => setNewProduct({...newProduct, precio_mayoreo_3: e.target.value})}
                              placeholder="Ej: 150"
                              className="w-full bg-gray-50 p-3 rounded-xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none"
                            />
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2">
                          * Deja en blanco si no aplica descuento por mayoreo
                        </p>
                      </div>

                      {/* Stock */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500">STOCK *</label>
                        <input
                          required
                          type="number"
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                          className="w-full bg-gray-50 p-3 rounded-xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none"
                        />
                      </div>

                      {/* Talla */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500">TALLA</label>
                        <input
                          value={newProduct.talla}
                          onChange={(e) => setNewProduct({...newProduct, talla: e.target.value})}
                          placeholder="Ej: S,M,L o 38,39,40"
                          className="w-full bg-gray-50 p-3 rounded-xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none"
                        />
                      </div>

                      {/* Color principal */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500">COLOR PRINCIPAL</label>
                        <input
                          value={newProduct.color}
                          onChange={(e) => setNewProduct({...newProduct, color: e.target.value})}
                          placeholder="Ej: Negro"
                          className="w-full bg-gray-50 p-3 rounded-xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none"
                        />
                      </div>

                      {/* En oferta */}
                      <div className="space-y-2 flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="en_oferta"
                          checked={newProduct.en_oferta}
                          onChange={(e) => setNewProduct({...newProduct, en_oferta: e.target.checked})}
                          className="w-5 h-5"
                        />
                        <label htmlFor="en_oferta" className="text-xs font-bold text-gray-500">
                          PRODUCTO EN OFERTA
                        </label>
                      </div>
                    </div>

                    {/* Descripción */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500">DESCRIPCIÓN</label>
                      <textarea
                        value={newProduct.descripcion}
                        onChange={(e) => setNewProduct({...newProduct, descripcion: e.target.value})}
                        rows={4}
                        className="w-full bg-gray-50 p-3 rounded-xl border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none"
                      />
                    </div>

                    {/* Media Manager para crear producto */}
                    <MediaManager
                      mainImage={newProduct.imagen}
                      images={newProduct.imagenes_adicionales}
                      videos={newProduct.videos}
                      onMainImageChange={(url) => setNewProduct({...newProduct, imagen: url})}
                      onImagesChange={(urls) => setNewProduct({...newProduct, imagenes_adicionales: urls})}
                      onVideosChange={(urls) => setNewProduct({...newProduct, videos: urls})}
                      label="GESTOR DE MEDIOS"
                    />

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full bg-black text-white py-4 rounded-2xl font-black text-sm tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50"
                    >
                      {saving ? 'CREANDO...' : 'CREAR PRODUCTO'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN DE PEDIDOS */}
          {activeTab === 'pedidos' && (
            <PedidosPanel />
          )}
        </main>
      </div>
    </div>
  );
}