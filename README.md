# SaaS de Facturación para Freelancers y PYMES Latinoamericanas

Una aplicación web full-stack para facturación y seguimiento de pagos diseñada específicamente para freelancers y pequeñas y medianas empresas en América Latina. Incluye facturación multi-divisa, seguimiento del estado de pagos e integración con pasarelas de pago simuladas como NOWPayments (cripto), PayPal, SWIFT y Zinli ACH Xpress.

## Características

- **Autenticación de Usuarios**: Autenticación segura basada en JWT
- **Gestión de Facturas**: Operaciones CRUD completas para facturas
- **Seguimiento de Pagos**: Registro y seguimiento de pagos con múltiples métodos
- **Soporte Multi-Divisa**: Manejo de facturas y pagos en varias monedas (USD, EUR, GBP, VES, BRL, MXN, ARS, CLP, PEN, COP)
- **Integración con Pasarelas de Pago**: 
  - NOWPayments (criptomonedas)
  - PayPal
  - Transferencias bancarias SWIFT
  - Zinli ACH Xpress (específicamente para el mercado latinoamericano)
- **Reportes**: Generación de informes financieros y exportación a PDF
- **Diseño Responsive**: Funciona en dispositivos de escritorio y móviles

## Stack Tecnológico

### Backend
- Node.js con Express.js
- Base de datos PostgreSQL con Sequelize ORM
- JWT para autenticación
- Winston para registro de logs
- Swagger para documentación de API

### Frontend
- React.js
- React Router para navegación
- Context API para gestión de estado
- Axios para solicitudes HTTP
- CSS personalizado inspirado en Bootstrap

### DevOps
- Contenedores Docker para frontend y backend
- Docker Compose para orquestación
- Contenedor de base de datos PostgreSQL

## Estructura del Proyecto

```
invoicing-saas/
├── backend/                  # Backend Node.js/Express
│   ├── controllers/          # Manejadores de solicitudes
│   ├── middleware/           # Middleware personalizado
│   ├── models/               # Modelos de base de datos
│   ├── routes/               # Rutas de API
│   ├── config/               # Archivos de configuración
│   ├── .env.example          # Ejemplo de variables de entorno
│   ├── Dockerfile            # Dockerfile del backend
│   ├── package.json          # Dependencias del backend
│   └── server.js             # Punto de entrada
├── frontend/                 # Frontend React
│   ├── public/               # Recursos estáticos
│   ├── src/                  # Código fuente
│   │   ├── components/       # Componentes reutilizables
│   │   ├── pages/            # Componentes de página
│   │   ├── contexts/         # Proveedores de contexto React
│   │   ├── services/         # Módulos de servicio
│   │   ├── utils/            # Funciones de utilidad
│   │   ├── App.js            # Componente principal de la app
│   │   ├── index.js          # Punto de entrada
│   │   └── index.css         # Estilos globales
│   ├── Dockerfile            # Dockerfile del frontend
│   └── package.json          # Dependencias del frontend
├── docker-compose.yml        # Configuración de Docker Compose
└── README.md                 # Este archivo
```

## Inicio Rápido

### Requisitos Previos
- Docker y Docker Compose
- Node.js (para desarrollo local sin Docker)
- PostgreSQL (para desarrollo local sin Docker)

### Ejecutar con Docker (Recomendado)

1. Clonar el repositorio
2. Copiar el archivo de ejemplo de variables de entorno:
   ```bash
   cp backend/.env.example backend/.env
   ```
   (Opcional: Editar el archivo .env para personalizar la configuración)

3. Iniciar la aplicación:
   ```bash
   docker-compose up --build
   ```

4. Acceder a la aplicación:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Documentación de API: http://localhost:5000/api-docs

### Ejecutar Localmente (Desarrollo)

#### Backend
1. Navegar al directorio del backend:
   ```bash
   cd backend
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno:
   ```bash
   cp .env.example .env
   ```
   (Editar .env según sea necesario)
4. Iniciar el servidor:
   ```bash
   npm run dev
   ```

#### Frontend
1. Navegar al directorio del frontend:
   ```bash
   cd frontend
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Iniciar el servidor de desarrollo:
   ```bash
   npm start
   ```

## Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registrar un nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener información del usuario actual

### Facturas
- `GET /api/invoices` - Obtener todas las facturas del usuario
- `GET /api/invoices/:id` - Obtener factura por ID
- `POST /api/invoices` - Crear nueva factura
- `PUT /api/invoices/:id` - Actualizar factura
- `DELETE /api/invoices/:id` - Eliminar factura
- `PUT /api/invoices/:id/send` - Marcar factura como enviada
- `PUT /api/invoices/:id/pay` - Marcar factura como pagada

### Pagos
- `GET /api/payments` - Obtener todos los pagos del usuario
- `GET /api/payments/:id` - Obtener pago por ID
- `POST /api/payments` - Registrar nuevo pago
- `PUT /api/payments/:id` - Actualizar pago
- `POST /api/payments/simulate/nowpayments` - Simular NOWPayments
- `POST /api/payments/simulate/paypal` - Simular PayPal
- `POST /api/payments/simulate/swift` - Simular SWIFT
- `POST /api/payments/simulate/zinli-ach` - Simular Zinli ACH Xpress
- `GET /api/payments/stats/summary` - Obtener estadísticas de pagos

### Reportes
- `GET /api/reports/summary` - Obtener informe de resumen financiero
- `GET /api/reports/invoices/pdf` - Exportar facturas a PDF
- `GET /api/reports/payments/pdf` - Exportar pagos a PDF

## Soporte de Monedas

La aplicación soporta las siguientes monedas comúnmente usadas en América Latina e internacionalmente:
- USD (Dólar estadounidense)
- EUR (Euro)
- GBP (Libra esterlina)
- VES (Bolívar venezolano)
- BRL (Real brasileño)
- MXN (Peso mexicano)
- ARS (Peso argentino)
- CLP (Peso chileno)
- PEN (Sol peruano)
- COP (Peso colombiano)

## Métodos de Pago

- Transferencia bancaria
- Tarjeta de crédito
- PayPal
- Criptomonedas (vía simulación NOWPayments)
- Transferencia bancaria SWIFT
- Zinli ACH Xpress (diseñado específicamente para mercados latinoamericanos)

## Variables de Entorno

Crear un archivo `.env` en el directorio del backend basado en `.env.example`:

```
NODE_ENV=development
PORT=5000
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=invoicing_saas
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your_jwt_secret_change_in_production
```

## Despliegue

La aplicación está containerizada usando Docker y puede desplegarse en cualquier plataforma que soporte contenedores Docker (AWS ECS, Google Cloud Run, Azure Container Instances, etc.) o en un VPS tradicional con Docker instalado.

Para producción, recuerda:
1. Cambiar el JWT_SECRET por un valor único y seguro
2. Usar credenciales PostgreSQL adecuadas
3. Configurar las claves de API reales de las pasarelas de pago (no solo simulaciones)
4. Establecer NODE_ENV=production
5. Considerar usar un proxy inverso (NGINX) para terminación SSL

## Licencia

Licencia MIT - eres libre de usar este código para tus propios proyectos.

## Agradecimientos

- Construido para freelancers y PYMES latinoamericanas que necesitan soluciones de facturación accesibles
- Consideración especial para regiones con acceso limitado a servicios bancarios tradicionales
- Integración con métodos de pago locales populares como Zinli ACH Xpress
