
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Search, Store, Filter, Building, Smartphone, Clock, Calendar, ChevronDown, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Partner {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  region: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  services: string[];
  openingHours: {
    days: string;
    hours: string;
  }[];
  metrics: {
    documents: number;
    transactions: number;
    rating: number;
  };
}

interface MapScriptProps {
  onLoad: () => void;
}

// This component loads the Google Maps script
const MapScript: React.FC<MapScriptProps> = ({ onLoad }) => {
  useEffect(() => {
    if (window.google && window.google.maps) {
      onLoad();
      return;
    }

    // In a real application, you would use an actual API key
    const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = onLoad;
    
    document.head.appendChild(script);
    
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [onLoad]);

  return null;
};

const VecinosPartnerMap: React.FC = () => {
  const { toast } = useToast();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [activeInfoWindow, setActiveInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const mapRef = React.useRef<HTMLDivElement>(null);

  // Sample partner data
  const partners: Partner[] = [
    {
      id: "1",
      name: "Minimarket El Sol",
      type: "tienda",
      address: "Av. Providencia 1234",
      city: "Providencia",
      region: "RM",
      coordinates: { lat: -33.4356, lng: -70.6298 },
      phone: "+56912345678",
      status: "active",
      services: ["Documentos", "Pagos", "Entregas"],
      openingHours: [
        { days: "Lunes a Viernes", hours: "08:00 - 20:00" },
        { days: "Sábados", hours: "09:00 - 15:00" }
      ],
      metrics: {
        documents: 156,
        transactions: 1250,
        rating: 4.8
      }
    },
    {
      id: "2",
      name: "Farmacia Vida",
      type: "farmacia",
      address: "Calle Las Condes 567",
      city: "Las Condes",
      region: "RM",
      coordinates: { lat: -33.4183, lng: -70.5957 },
      phone: "+56987654321",
      status: "active",
      services: ["Documentos", "Pagos", "Verificación biométrica"],
      openingHours: [
        { days: "Lunes a Domingo", hours: "08:00 - 21:00" }
      ],
      metrics: {
        documents: 203,
        transactions: 1780,
        rating: 4.6
      }
    },
    {
      id: "3",
      name: "Librería Santiago",
      type: "libreria",
      address: "Calle Estado 123",
      city: "Santiago",
      region: "RM",
      coordinates: { lat: -33.4433, lng: -70.6539 },
      phone: "+56912345678",
      status: "active",
      services: ["Documentos", "Pagos"],
      openingHours: [
        { days: "Lunes a Viernes", hours: "09:00 - 19:00" },
        { days: "Sábados", hours: "10:00 - 14:00" }
      ],
      metrics: {
        documents: 98,
        transactions: 750,
        rating: 4.5
      }
    },
    {
      id: "4",
      name: "Café Internet Express",
      type: "cafe",
      address: "Av. Vicuña Mackenna 456",
      city: "Ñuñoa",
      region: "RM",
      coordinates: { lat: -33.4569, lng: -70.6259 },
      phone: "+56987654321",
      status: "active",
      services: ["Documentos", "Pagos", "Internet"],
      openingHours: [
        { days: "Lunes a Sábado", hours: "08:00 - 20:00" }
      ],
      metrics: {
        documents: 76,
        transactions: 650,
        rating: 4.2
      }
    },
    {
      id: "5",
      name: "Ferretería Don Pedro",
      type: "ferreteria",
      address: "Av. Independencia 789",
      city: "Independencia",
      region: "RM",
      coordinates: { lat: -33.4200, lng: -70.6543 },
      phone: "+56912345678",
      status: "active",
      services: ["Documentos", "Pagos"],
      openingHours: [
        { days: "Lunes a Viernes", hours: "08:30 - 19:00" },
        { days: "Sábados", hours: "09:00 - 16:00" }
      ],
      metrics: {
        documents: 45,
        transactions: 380,
        rating: 4.7
      }
    }
  ];

  // Initialize map when script is loaded
  const initializeMap = () => {
    if (!mapRef.current) return;
    
    // In a real application, this would be centered on user's location
    const initialPosition = { lat: -33.44, lng: -70.65 };
    const mapOptions: google.maps.MapOptions = {
      center: initialPosition,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          "featureType": "administrative",
          "elementType": "geometry",
          "stylers": [{ "visibility": "off" }]
        },
        {
          "featureType": "poi",
          "stylers": [{ "visibility": "off" }]
        },
        {
          "featureType": "transit",
          "stylers": [{ "visibility": "off" }]
        }
      ]
    };
    
    const newMap = new google.maps.Map(mapRef.current, mapOptions);
    setMap(newMap);
    
    // Add markers for each partner
    addPartnerMarkers(newMap, partners);
    
    // Initialize with all partners
    setFilteredPartners(partners);
  };

  // Add markers to the map
  const addPartnerMarkers = (map: google.maps.Map, partners: Partner[]) => {
    const newMarkers: google.maps.Marker[] = [];
    
    partners.forEach(partner => {
      const icon = getPartnerIcon(partner.type);
      
      const marker = new google.maps.Marker({
        position: partner.coordinates,
        map: map,
        title: partner.name,
        icon: {
          url: icon,
          scaledSize: new google.maps.Size(30, 30)
        }
      });
      
      marker.addListener('click', () => {
        // Close existing info window
        if (activeInfoWindow) {
          activeInfoWindow.close();
        }
        
        // Create content for info window
        const contentString = `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 5px; font-size: 16px;">${partner.name}</h3>
            <p style="margin: 0 0 5px; font-size: 12px; color: #666;">${partner.address}</p>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <div style="background: #e2f8e2; color: #16a34a; padding: 2px 6px; border-radius: 4px; font-size: 11px;">Activo</div>
            </div>
            <button id="details-btn" style="background: #2d219b; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer;">Ver detalles</button>
          </div>
        `;
        
        // Create new info window
        const infoWindow = new google.maps.InfoWindow({
          content: contentString,
          maxWidth: 250
        });
        
        infoWindow.open(map, marker);
        setActiveInfoWindow(infoWindow);
        
        // Add event listener for the "Details" button
        google.maps.event.addListener(infoWindow, 'domready', () => {
          const detailsBtn = document.getElementById('details-btn');
          if (detailsBtn) {
            detailsBtn.addEventListener('click', () => {
              setSelectedPartner(partner);
              if (activeInfoWindow) {
                activeInfoWindow.close();
              }
            });
          }
        });
      });
      
      newMarkers.push(marker);
    });
    
    setMarkers(newMarkers);
  };

  // Get icon based on partner type
  const getPartnerIcon = (type: string): string => {
    // In a real application, these would be actual icon URLs
    const icons: Record<string, string> = {
      tienda: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      farmacia: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
      libreria: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png",
      cafe: "https://maps.google.com/mapfiles/ms/icons/purple-dot.png",
      ferreteria: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
      default: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
    };
    
    return icons[type] || icons.default;
  };

  // Filter partners based on search query and filters
  useEffect(() => {
    let filtered = partners;
    
    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(partner => 
        partner.name.toLowerCase().includes(query) || 
        partner.address.toLowerCase().includes(query) ||
        partner.city.toLowerCase().includes(query)
      );
    }
    
    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(partner => partner.type === filterType);
    }
    
    // Filter by region
    if (filterRegion !== "all") {
      filtered = filtered.filter(partner => partner.region === filterRegion);
    }
    
    setFilteredPartners(filtered);
    
    // Update markers on the map
    if (map) {
      // Remove existing markers
      markers.forEach(marker => marker.setMap(null));
      
      // Add filtered markers
      addPartnerMarkers(map, filtered);
    }
  }, [searchQuery, filterType, filterRegion, map]);

  // Get partner type label
  const getPartnerTypeLabel = (type: string): string => {
    const types: Record<string, string> = {
      tienda: "Tienda/Minimarket",
      farmacia: "Farmacia",
      libreria: "Librería/Papelería",
      cafe: "Café Internet",
      ferreteria: "Ferretería",
    };
    
    return types[type] || type;
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tienda':
        return <Store className="h-4 w-4 text-blue-600" />;
      case 'farmacia':
        return <Building className="h-4 w-4 text-green-600" />;
      default:
        return <Store className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Mapa de Socios Vecinos Xpress</CardTitle>
          <CardDescription>Visualiza la ubicación de los socios registrados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Buscar por nombre o dirección..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <div className="w-full md:w-40">
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">Todos los tipos</option>
                  <option value="tienda">Tienda/Minimarket</option>
                  <option value="farmacia">Farmacia</option>
                  <option value="libreria">Librería</option>
                  <option value="cafe">Café Internet</option>
                  <option value="ferreteria">Ferretería</option>
                </select>
              </div>
              
              <div className="w-full md:w-40">
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                >
                  <option value="all">Todas las regiones</option>
                  <option value="RM">Región Metropolitana</option>
                  <option value="V">Valparaíso</option>
                  <option value="VIII">Biobío</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2">
              <div 
                ref={mapRef} 
                className="h-[400px] rounded-lg border border-gray-200 overflow-hidden relative"
              >
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <p className="text-gray-500">Cargando mapa...</p>
                  </div>
                )}
                <MapScript onLoad={() => { setMapLoaded(true); initializeMap(); }} />
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="text-sm text-gray-500">
                  {filteredPartners.length} 
                  {filteredPartners.length === 1 ? ' socio encontrado' : ' socios encontrados'}
                </div>
                
                <div className="flex gap-2 items-center text-xs">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500 mr-1"></div>
                    <span>Tiendas</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-1"></div>
                    <span>Farmacias</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-orange-500 mr-1"></div>
                    <span>Librerías</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Partner List */}
            <div className="h-[400px] overflow-y-auto border border-gray-200 rounded-lg">
              {selectedPartner ? (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 gap-1"
                      onClick={() => setSelectedPartner(null)}
                    >
                      <ChevronRight className="h-4 w-4" />
                      Volver
                    </Button>
                    <Badge className={`${
                      selectedPartner.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedPartner.status === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedPartner.status === 'active' ? 'Activo' :
                       selectedPartner.status === 'inactive' ? 'Inactivo' :
                       'Pendiente'}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-1">{selectedPartner.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    {getTypeIcon(selectedPartner.type)}
                    <span className="ml-1">{getPartnerTypeLabel(selectedPartner.type)}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm">{selectedPartner.address}</p>
                        <p className="text-sm">{selectedPartner.city}, {selectedPartner.region}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Smartphone className="h-4 w-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-sm">{selectedPartner.phone}</p>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock className="h-4 w-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        {selectedPartner.openingHours.map((hour, idx) => (
                          <p key={idx} className="text-sm">
                            <span className="font-medium">{hour.days}:</span> {hour.hours}
                          </p>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Servicios disponibles</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedPartner.services.map((service, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs font-normal">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Métricas</h4>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-gray-50 rounded-md">
                          <p className="text-xs text-gray-500">Documentos</p>
                          <p className="font-medium">{selectedPartner.metrics.documents}</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-md">
                          <p className="text-xs text-gray-500">Transacciones</p>
                          <p className="font-medium">{selectedPartner.metrics.transactions}</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-md">
                          <p className="text-xs text-gray-500">Calificación</p>
                          <p className="font-medium">{selectedPartner.metrics.rating}/5</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {filteredPartners.length > 0 ? (
                    <ul className="divide-y">
                      {filteredPartners.map(partner => (
                        <li 
                          key={partner.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setSelectedPartner(partner);
                            // Center map on this partner
                            if (map) {
                              map.setCenter(partner.coordinates);
                              map.setZoom(15);
                            }
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-sm">{partner.name}</h3>
                              <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                {getTypeIcon(partner.type)}
                                <span className="ml-1">{getPartnerTypeLabel(partner.type)}</span>
                              </div>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>{partner.city}, {partner.region}</span>
                              </div>
                            </div>
                            <Badge className={`${
                              partner.status === 'active' ? 'bg-green-100 text-green-800' :
                              partner.status === 'inactive' ? 'bg-red-100 text-red-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {partner.status === 'active' ? 'Activo' :
                              partner.status === 'inactive' ? 'Inactivo' :
                              'Pendiente'}
                            </Badge>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No se encontraron socios</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VecinosPartnerMap;
