# Strategic Insights API

Este servicio entrega recomendaciones comerciales y operativas generadas automaticamente a partir de las métricas de la plataforma.

### Endpoint

`GET /api/strategic-insights`

Devuelve un objeto JSON con la fecha de generación, las métricas utilizadas y una lista de sugerencias.

```json
{
  "generatedAt": "2025-06-28T00:00:00.000Z",
  "metrics": {
    "users": { "totalUsers": 100, ... },
    "documents": { "totalDocuments": 50, ... },
    "revenue": { "totalRevenue": 12345, ... }
  },
  "insights": [
    { "title": "Baja captación de usuarios", "description": "..." }
  ]
}
```

Este endpoint puede integrarse en el Panel Maestro para mostrar sugerencias rápidas de acción.
