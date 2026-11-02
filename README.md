# Machine Sentinel

Crea una aplicación web completa llamada "Sistema de Gestión de Mantenimiento de Máquinas", en español, con estilo industrial, sencillo y ordenado. Debe ser responsiva (computadora, tableta y celular), con botones grandes y alto contraste.

OBJETIVO

Organizar la información de las máquinas de un taller o área industrial y facilitar su mantenimiento. El personal reporta y da seguimiento al mantenimiento de sus máquinas. No es un sitio de citas ni de presupuestos.

USUARIOS Y ROLES (autenticación con correo y clave, roles guardados en una tabla aparte)

- Operador: consulta el estado de las máquinas y crea solicitudes de mantenimiento.

- Técnico: atiende solicitudes, actualiza su estado y registra el servicio realizado.

- Supervisor: todo lo anterior, además de asignar tareas, ver reportes y administrar usuarios.

BASE DE DATOS (con datos de ejemplo ya cargados: 6 máquinas, 4 componentes por máquina, 10 solicitudes y 3 usuarios, uno por rol)

Tablas: usuarios y roles, máquinas (nombre, modelo, número de serie, ubicación, última revisión, próxima revisión), componentes (máquina, nombre, estado), lecturas de vibración y condiciones, solicitudes (máquina, componente, descripción, prioridad, turno, estado, foto opcional, técnico asignado, tiempo de paro) y servicios del historial.

SITIO PÚBLICO (sin iniciar sesión)

- Portada: título, frase breve sobre qué es el sistema, botón naranja "Iniciar sesión" y botón "Solicitar demostración".

- Qué es, beneficios y para quién es (operadores, técnicos y supervisores en áreas industriales o talleres).

- Cómo funciona en 5 pasos: iniciar sesión, elegir máquina, revisar su estado, solicitar mantenimiento, dar seguimiento.

- Preguntas frecuentes: cómo funciona el semáforo, qué roles existen y cómo solicitar acceso.

- Sección de tips de mantenimiento: mantenimiento preventivo, señales de falla (vibración, temperatura) y buenas prácticas.

- Formulario de contacto: nombre, empresa, correo y mensaje.

- No incluir testimonios, precios, equipo ni casos de éxito.

APLICACIÓN INTERNA (requiere iniciar sesión)

Menú lateral (superior en móvil): Inicio, Máquinas, Solicitudes, Historial, Perfil. Siempre visibles el nombre del usuario y su rol.

Modelo conceptual: Máquina → Componentes → Estado → Solicitud de mantenimiento → Historial.

1. Inicio de sesión: usuario, clave, botón "Entrar" y mensaje de error claro.

2. Selección de máquina: tarjetas con nombre, modelo, ubicación y semáforo general, con búsqueda y filtro por área o estado.

3. Panel de la máquina: datos generales y gráficas de vibración y condiciones de operación (día, semana, mes) con línea de umbral de alerta.

4. Estado de componentes: lista con semáforo. Verde = normal, amarillo = pendiente o advertencia, rojo = falla crítica o máquina detenida.

5. Formulario de solicitud: máquina y componente preseleccionados, descripción, prioridad (baja, media, alta, crítica), turno laboral (matutino, vespertino, nocturno) y foto opcional.

6. Seguimiento de solicitudes: filtros por estado y prioridad. Estados: Enviada, En revisión, Asignada, En proceso, Completada. Al completar, el técnico registra el tiempo de paro de producción.

7. Historial: por máquina y componente, con fecha, técnico, turno, trabajo realizado, resultado y tiempo de paro. Total de paro por máquina y exportación a PDF o Excel.

8. Panel del supervisor: asignación de tareas, reportes, paro total por máquina y administración de usuarios.

ALERTAS

Avisos dentro de la app cuando una máquina pasa a rojo, cuando cambia el estado de una solicitud o cuando se acerca un mantenimiento preventivo.

ESTILO

Industrial y consistente: botones, textos e iconos en las mismas posiciones en todas las pantallas. Tarjetas blancas sobre fondo gris claro. Metáforas: semáforo para el estado, tarjeta para cada máquina, ficha para el historial de cada componente y bandeja de entrada para las solicitudes.

PALETA DE COLORES

- Azul industrial oscuro #173B57: encabezados y botones principales

- Azul acero #2F6B8A: botones secundarios e iconos

- Gris claro #F4F6F8: fondo

- Blanco #FFFFFF: tarjetas y formularios

- Gris carbón #252A2E: texto principal

- Naranja #F28C28: prioridades y acciones importantes

- Verde #2E8B57: mantenimiento completado

- Amarillo #F2C94C: pendiente o advertencia

- Rojo #C0392B: falla crítica o máquina detenida

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7068000d-9d54-5c15-a105-ebbfed000275).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
