const translations = {
  en: {
    // Nav
    "nav.about": "About",
    "nav.experience": "Experience",
    "nav.projects": "Projects",
    "nav.skills": "Skills",
    "nav.education": "Education",
    "nav.publications": "Publications",
    "nav.certifications": "Certifications",
    "nav.contact": "Contact",

    // Hero
    "hero.name": "Alejandro Sanchez Ferrer",
    "hero.title": "Senior AI Solutions Architect & PhD Researcher",
    "hero.tagline": "Building production-ready computer vision systems from edge devices to the cloud",
    "hero.cta_projects": "View Projects",
    "hero.cta_cv": "Download CV",
    "hero.cta_contact": "Get in Touch",

    // About
    "about.title": "About Me",
    "about.p1": "Senior AI Solutions Architect and PhD researcher with 5+ years delivering Computer Vision and Deep Learning solutions for urban infrastructure, public transport, traffic management, and environmental safety.",
    "about.p2": "Hands-on expertise across the full AI lifecycle — from VLM fine-tuning (SFT, LoRA, QLoRA) and production optimization (TensorRT, Triton) to edge, cloud, and on-prem deployments. Proven track record building AI-powered solutions at city and regional scale across Spain, Europe, and the United States.",
    "about.p3": "Customer-facing technical expert, effective in partnering with Sales, Product, and Engineering stakeholders to translate mission goals into successful AI-enabled deliveries. Adjunct Professor of AI and active technical contributor through publications, open-source projects, and community engagement.",
    "about.stat_deployments": "Production Deployments",
    "about.stat_teams": "Engineering Teams Led",
    "about.stat_products": "CV Products Shipped",
    "about.stat_latency": "Latency Reduction",

    // Experience
    "experience.title": "Experience",
    "experience.present": "Present",
    "experience.minsait_role": "Senior AI Solutions Architect & Technical Lead",
    "experience.minsait_1": "Defined technical roadmap and methodology for up to 5 engineering teams (Backend, Data, Deployment), establishing best practices for development and testing.",
    "experience.minsait_2": "Led design and deployment of 8+ Computer Vision products across urban, transport, energy, and environmental sectors in Spain, Europe, and the US.",
    "experience.minsait_3": "Architected scalable, low-latency pipelines for 24/7 vision inference; reduced inference latency by over 80% (from +1s to sub-200ms).",
    "experience.minsait_4": "Led technical engagement with enterprise clients, building PoCs, demos, and advising on successful solution delivery.",
    "experience.iffe_role": "Adjunct Professor (Master in AI)",
    "experience.iffe_1": 'Instructed graduate-level course on "Principles of Robotic Autonomy," covering perception, navigation, computer vision, and multimodal AI.',
    "experience.iffe_2": "Developed and delivered technical presentations and educational materials on complex AI topics.",
    "experience.uware_role": "Robotics Engineer (Intern)",
    "experience.uware_1": "Developed and optimized real-time control modules in Python and ROS for autonomous underwater vehicles (AUVs).",
    "experience.embention_role": "Software Verification Engineer (Intern)",
    "experience.embention_1": "Implemented and verified safety-critical drone flight control algorithms in C/C++14/17 on a real-time Linux-based embedded system.",

    // Projects
    "projects.title": "Projects",
    "projects.filter_all": "All",
    "projects.filter_pro": "Professional",
    "projects.filter_acad": "Academic",
    "projects.badge_pro": "Professional",
    "projects.badge_acad": "Academic",
    "projects.view_details": "View Details",
    "projects.qspam_title": "Q-SPAM | Quadruped Surveillance Platform",
    "projects.qspam_desc": "Quadruped robot with AI for real-time detection, tracking, pose estimation and multimodal reasoning.",
    "projects.qspam_details": "This project, created in partnership with Minsait, integrates a quantized VLM into a quadruped robot for real-time query-based reasoning, tracking, and behavior recognition, demonstrating Physical AI in edge-constrained environments. The robot is equipped with a high-resolution camera enabling seamless detection, tracking, pose estimation, and behavior analysis of individuals.",
    "projects.windeye_title": "WindEye | Vision Integrated Radar Detection",
    "projects.windeye_desc": "Multi-sensor bird detection in wind farms integrating vision and radar. 8+ wind farms deployed.",
    "projects.windeye_details": "Multi-sensor detection system integrating vision and radar to classify endangered bird species and trigger automatic turbine shutdown. Deployed in 8+ wind farms across Spain, supporting environmental regulation compliance. Utilizes 3D radar technologies and high-resolution video capture to detect and classify birds in real time.",
    "projects.grideye_title": "GridEye | Smart Wildfire Detection",
    "projects.grideye_desc": "Solar-powered early wildfire detection with Transformers on Jetson Nano/Orin. 20+ devices deployed.",
    "projects.grideye_details": "Compact, solar-powered early wildfire detection system using Transformer models optimized with TensorRT for Jetson Nano/Orin Nano. Deployed in 20+ devices across Spain for public safety and environmental protection. Winner of the Enertic Award for predictive maintenance innovation.",
    "projects.besos_title": "BESOS | Smart Emissions Monitoring",
    "projects.besos_desc": "Real-time emissions monitoring for power plants using Computer Vision and IoT.",
    "projects.besos_details": "Intelligent surveillance platform for Endesa/Enel, monitoring power plant emissions with advanced Computer Vision algorithms detecting anomalies such as smoke, foam, debris, and thermal irregularities. Critical for maintaining ecological balance and ensuring regulatory compliance in energy production facilities.",
    "projects.seat_title": "Automated Quality Assurance — SEAT",
    "projects.seat_desc": "Computer vision inspection for electric track systems in vehicle assembly lines.",
    "projects.seat_details": "Developed for SEAT, this project applies computer vision to enhance reliability of electric track systems in vehicle assembly lines. Advanced image processing algorithms provide real-time surveillance over transport rails, proactively identifying defects and deviations from standards.",
    "projects.mobeye_title": "Mobeye | Metro Access Control",
    "projects.mobeye_desc": "Real-time person tracking and tailgating detection embedded in metro access gates.",
    "projects.mobeye_details": "Real-time person tracking and tailgating detection system embedded in metro access gates for a major transport operator, enhancing public transport safety and access control. Uses computer vision to detect unauthorized entries and ensure passenger flow management.",
    "projects.copilot_title": "Traffic Control Copilot",
    "projects.copilot_desc": "AI-powered traffic sign detection and compliance verification on Azure. Deployed in Texas, USA.",
    "projects.copilot_details": "AI-powered traffic sign detection, tracking, classification, and automated compliance verification against construction blueprints. Deployed on Azure cloud with Computer Vision and Generative AI for a leading infrastructure company in Texas, USA.",
    "projects.fisheye_title": "FishEye | Retail Analytics",
    "projects.fisheye_desc": "Real-time person monitoring with ceiling-mounted fisheye cameras for telecom retail.",
    "projects.fisheye_details": "Real-time person monitoring using ceiling-mounted fisheye cameras for a major telecom retailer, extracting operational KPIs (foot traffic, wait times, heatmaps) to improve service delivery and citizen experience. Provides actionable insights for store optimization.",
    "projects.ocean_title": "OceanGuard AI — Marine Pollution Monitoring",
    "projects.ocean_desc": "AI-powered platform for on-device marine pollution analysis using fine-tuned Gemma3n VLM.",
    "projects.ocean_details": "Comprehensive platform for monitoring marine pollution using on-device AI. Automatically detects and classifies debris from images, visualizes data on an interactive map, and generates detailed reports with mitigation strategies. Built with a fine-tuned Gemma3n VLM for the Google Gemma3n Hackathon.",
    "projects.myo_title": "Myoelectric Mobile Robot Control",
    "projects.myo_desc": "Robot control using myoelectric signals with dynamic obstacle avoidance and person tracking.",
    "projects.myo_details": "Control system for a mobile robot combining myoelectric control with proximity sensors for obstacle avoidance and active tracking of people in real time. A robust algorithm was implemented to ensure safe navigation in dynamic environments.",
    "projects.ur3_title": "UI Design for Collaborative UR3 Robot",
    "projects.ur3_desc": "Intuitive interface for comprehensive control of a collaborative UR3 robot.",
    "projects.ur3_details": "Designed an intuitive and functional UI for comprehensive control of a collaborative UR3 robot. The interface allows real-time monitoring and execution of various functions, facilitating seamless interaction between operator and robot.",
    "projects.chess_title": "Real-Time Chess with IRB120 and AI",
    "projects.chess_desc": "AI-powered chess system with an IRB120 industrial robot playing in real time.",
    "projects.chess_details": "System where an IRB120 robot, assisted by AI algorithms, plays chess in real time. It can control both sides or enable remote play, offering an interactive and challenging experience in human-robot interaction.",
    "projects.bomb_title": "Multi-Robot Bomb Extraction Simulation",
    "projects.bomb_desc": "Collaborative multi-robot strategies for bomb extraction and safe transportation.",
    "projects.bomb_details": "Multi-robot system simulating collaborative strategies for bomb extraction and safe transportation. Coordination and simulation algorithms replicate team behavior in high-risk scenarios.",
    "projects.warehouse_title": "Intelligent Warehouse System Simulation",
    "projects.warehouse_desc": "Multi-robot product collection system for intelligent warehouse logistics.",
    "projects.warehouse_details": "System of collaborative robots for collecting and transporting products within an intelligent warehouse. Optimizes internal logistics and improves operational efficiency through real-time planning and control algorithms.",
    "projects.line_title": "Multi-Robot Line Following System",
    "projects.line_desc": "Coordinated multi-robot line-following on a circuit track.",
    "projects.line_details": "Multiple robots coordinating to perform a line-following task on a circuit. Collaborative control and communication algorithms ensure precise and coordinated execution.",
    "projects.candy_title": "Candy Crush Bot — Classical Vision",
    "projects.candy_desc": "Automated gameplay bot using classical computer vision algorithms.",
    "projects.candy_details": "Bot that uses classical computer vision methods to interpret game state and make real-time decisions for playing Candy Crush. Automates gameplay providing an innovative solution in game automation.",

    // Demos
    "nav.demos": "Demos",
    "demos.title": "Live Demos",
    "demos.subtitle": "Real-time Computer Vision models running entirely in your browser — no server required",
    "demos.tab_detection": "Object Detection",
    "demos.tab_pose": "Pose Estimation",
    "demos.tab_depth": "Depth Estimation",
    "demos.det_title": "Real-Time Object Detection",
    "demos.det_meta": "80 object classes | ~2MB model | 30-60 FPS",
    "demos.pose_title": "Real-Time Pose Estimation",
    "demos.pose_meta": "33 body keypoints | ~16MB runtime+model | 20-30 FPS",
    "demos.depth_title": "Monocular Depth Estimation",
    "demos.depth_meta": "~27MB model (first load only) | Image upload",
    "demos.start": "Start Webcam",
    "demos.stop": "Stop",
    "demos.upload": "Upload Image",
    "demos.upload_image": "Upload Image",
    "demos.placeholder": "Click \"Start Webcam\" or upload an image to begin",
    "demos.placeholder_pose": "Click \"Start Webcam\" to begin pose detection",
    "demos.placeholder_depth": "Upload an image to generate a depth map",
    "demos.loading_lib": "Loading library...",
    "demos.loading_model": "Loading model...",
    "demos.loading_depth": "Loading Depth Anything model (~27MB, first time only)...",
    "demos.starting_cam": "Starting camera...",
    "demos.running": "Running — detecting in real time",
    "demos.detecting": "Detecting...",
    "demos.processing": "Processing depth map...",
    "demos.depth_done": "Depth estimation complete",
    "demos.streamlit_link": "For VLM demos (Moondream2 Vision-Language Model), visit the full",

    // Skills
    "skills.title": "Skills",
    "skills.multimodal": "Multimodal AI",
    "skills.dl": "Deep Learning Frameworks",
    "skills.tuning": "Model Tuning & Optimization",
    "skills.integration": "System Integration",
    "skills.cloud": "Cloud & MLOps",
    "skills.deployment": "Deployment",
    "skills.languages": "Languages",

    // Education
    "education.title": "Education",
    "education.present": "Present",
    "education.phd_title": "PhD in Computer Vision",
    "education.phd_desc": "Research on synthetic data generation and diffusion models for robust vision systems in complex underwater environments. PRAIG Research Group.",
    "education.msc_title": "MSc in Automation & Robotics",
    "education.honors": "Honors — Best Final Project",
    "education.bsc_title": "BSc in Robotic Engineering",
    "education.honors_bsc": "Honors — Best Final Degree Project",
    "education.exchange_title": "Exchange Program",
    "education.exchange_desc": "Mechatronics, Robotics & Automation Engineering — Tempe, AZ, USA",

    // Publications
    "publications.title": "Publications & Awards",
    "publications.paper1_title": "An Experimental Study on Marine Debris Location and Recognition using Object Detection",
    "publications.paper2_title": "The CleanSea Set: A Benchmark Corpus for Underwater Debris Detection and Recognition",
    "publications.read_paper": "Read Paper",
    "publications.award_title": "Best Paper Award",
    "publications.hackathon_desc": "Google Gemma3n Hackathon",
    "publications.ferrovial_title": "AI Hackathon Winner",
    "publications.ferrovial_desc": "Best Solution — Ferrovial & Microsoft",
    "publications.podcast_title": "PhD Research Podcast",

    // Certifications
    "certifications.title": "Certifications",

    // Contact
    "contact.title": "Get in Touch",
    "contact.heading": "Let's work together",
    "contact.subtitle": "I'm always open to discussing new projects, research collaborations, or opportunities in AI and Computer Vision.",
    "contact.label_name": "Full Name *",
    "contact.label_email": "Email *",
    "contact.label_company": "Company (optional)",
    "contact.label_message": "Message *",
    "contact.ph_name": "Your name",
    "contact.ph_email": "your@email.com",
    "contact.ph_company": "Company name",
    "contact.ph_message": "Tell me about your project...",
    "contact.send": "Send Message",
    "contact.success": "Message sent successfully! I'll get back to you soon.",
    "contact.error": "Something went wrong. Please try again or email me directly.",

    // Footer
    "footer.rights": "All rights reserved."
  },

  es: {
    // Nav
    "nav.about": "Sobre Mi",
    "nav.experience": "Experiencia",
    "nav.projects": "Proyectos",
    "nav.skills": "Habilidades",
    "nav.education": "Formacion",
    "nav.publications": "Publicaciones",
    "nav.certifications": "Certificaciones",
    "nav.contact": "Contacto",

    // Hero
    "hero.name": "Alejandro Sanchez Ferrer",
    "hero.title": "Senior AI Solutions Architect & Investigador PhD",
    "hero.tagline": "Construyendo sistemas de vision artificial listos para produccion, del edge al cloud",
    "hero.cta_projects": "Ver Proyectos",
    "hero.cta_cv": "Descargar CV",
    "hero.cta_contact": "Contactar",

    // About
    "about.title": "Sobre Mi",
    "about.p1": "Senior AI Solutions Architect e investigador de doctorado con mas de 5 anos entregando soluciones de Vision Artificial y Deep Learning para infraestructura urbana, transporte publico, gestion de trafico y seguridad medioambiental.",
    "about.p2": "Experiencia practica en todo el ciclo de vida de la IA — desde el fine-tuning de VLMs (SFT, LoRA, QLoRA) y la optimizacion para produccion (TensorRT, Triton) hasta despliegues en edge, cloud y on-premise. Historial demostrado construyendo soluciones de IA a escala regional y de ciudad en Espana, Europa y Estados Unidos.",
    "about.p3": "Experto tecnico orientado al cliente, eficaz colaborando con equipos de Ventas, Producto e Ingenieria para traducir objetivos de mision en entregas exitosas de IA. Profesor adjunto de IA y contribuidor tecnico activo a traves de publicaciones, proyectos open-source y participacion en la comunidad.",
    "about.stat_deployments": "Despliegues en Produccion",
    "about.stat_teams": "Equipos de Ingenieria",
    "about.stat_products": "Productos de CV",
    "about.stat_latency": "Reduccion de Latencia",

    // Experience
    "experience.title": "Experiencia",
    "experience.present": "Actualidad",
    "experience.minsait_role": "Senior AI Solutions Architect & Technical Lead",
    "experience.minsait_1": "Defini la hoja de ruta tecnica y metodologia para hasta 5 equipos de ingenieria (Backend, Datos, Despliegue), estableciendo mejores practicas de desarrollo y testing.",
    "experience.minsait_2": "Lidere el diseno y despliegue de mas de 8 productos de Vision Artificial en sectores urbano, transporte, energia y medioambiental en Espana, Europa y EEUU.",
    "experience.minsait_3": "Disene pipelines escalables y de baja latencia para inferencia de vision 24/7; reduje la latencia de inferencia en mas del 80% (de +1s a sub-200ms).",
    "experience.minsait_4": "Lidere el engagement tecnico con clientes enterprise, construyendo PoCs, demos y asesorando en entregas exitosas.",
    "experience.iffe_role": "Profesor Adjunto (Master en IA)",
    "experience.iffe_1": 'Imparti curso de posgrado sobre "Principios de Autonomia Robotica," cubriendo percepcion, navegacion, vision artificial e IA multimodal.',
    "experience.iffe_2": "Desarrolle y presente presentaciones tecnicas y materiales educativos sobre temas complejos de IA.",
    "experience.uware_role": "Ingeniero de Robotica (Practicas)",
    "experience.uware_1": "Desarrolle y optimice modulos de control en tiempo real en Python y ROS para vehiculos autonomos submarinos (AUVs).",
    "experience.embention_role": "Ingeniero de Verificacion de Software (Practicas)",
    "experience.embention_1": "Implemente y verifique algoritmos criticos de control de vuelo de drones en C/C++14/17 en un sistema embebido Linux de tiempo real.",

    // Projects
    "projects.title": "Proyectos",
    "projects.filter_all": "Todos",
    "projects.filter_pro": "Profesionales",
    "projects.filter_acad": "Academicos",
    "projects.badge_pro": "Profesional",
    "projects.badge_acad": "Academico",
    "projects.view_details": "Ver Detalles",
    "projects.qspam_title": "Q-SPAM | Plataforma de Vigilancia Cuadrupeda",
    "projects.qspam_desc": "Robot cuadrupedo con IA para deteccion, tracking, estimacion de pose y razonamiento multimodal en tiempo real.",
    "projects.qspam_details": "Proyecto creado en colaboracion con Minsait que integra un VLM cuantizado en un robot cuadrupedo para razonamiento basado en consultas en tiempo real, tracking y reconocimiento de comportamiento, demostrando Physical AI en entornos edge con recursos limitados.",
    "projects.windeye_title": "WindEye | Deteccion de Aves con Radar y Vision",
    "projects.windeye_desc": "Deteccion multisensor de aves en parques eolicos integrando vision y radar. 8+ parques desplegados.",
    "projects.windeye_details": "Sistema de deteccion multisensor que integra vision y radar para clasificar especies de aves protegidas y activar la parada automatica de turbinas. Desplegado en mas de 8 parques eolicos en Espana, apoyando el cumplimiento normativo medioambiental.",
    "projects.grideye_title": "GridEye | Deteccion Inteligente de Incendios",
    "projects.grideye_desc": "Deteccion temprana de incendios con alimentacion solar, Transformers en Jetson Nano/Orin. 20+ dispositivos.",
    "projects.grideye_details": "Sistema compacto de deteccion temprana de incendios forestales con alimentacion solar usando modelos Transformer optimizados con TensorRT para Jetson Nano/Orin Nano. Desplegado en mas de 20 dispositivos en Espana. Ganador del premio Enertic.",
    "projects.besos_title": "BESOS | Monitorizacion Inteligente de Emisiones",
    "projects.besos_desc": "Monitorizacion de emisiones en centrales electricas en tiempo real con Vision Artificial e IoT.",
    "projects.besos_details": "Plataforma de vigilancia inteligente para Endesa/Enel que monitoriza emisiones en centrales electricas con algoritmos avanzados de Vision Artificial, detectando anomalias como humo, espuma, escombros e irregularidades termicas.",
    "projects.seat_title": "Control de Calidad Automatizado — SEAT",
    "projects.seat_desc": "Inspeccion por vision artificial de pistas electricas en lineas de montaje de vehiculos.",
    "projects.seat_details": "Desarrollado para SEAT, aplica vision artificial para mejorar la fiabilidad de los sistemas de pistas electricas en lineas de montaje. Algoritmos avanzados de procesamiento de imagen proporcionan vigilancia en tiempo real.",
    "projects.mobeye_title": "Mobeye | Control de Acceso en Metro",
    "projects.mobeye_desc": "Tracking de personas y deteccion de tailgating integrado en puertas de acceso de metro.",
    "projects.mobeye_details": "Sistema de tracking de personas y deteccion de tailgating en tiempo real integrado en puertas de acceso de metro para un operador de transporte, mejorando la seguridad del transporte publico.",
    "projects.copilot_title": "Traffic Control Copilot",
    "projects.copilot_desc": "Deteccion de senales de trafico con IA y verificacion de cumplimiento en Azure. Desplegado en Texas, EEUU.",
    "projects.copilot_details": "Deteccion, tracking, clasificacion de senales de trafico y verificacion automatica de cumplimiento contra planos de construccion. Desplegado en Azure con Vision Artificial e IA Generativa para una empresa de infraestructura en Texas, EEUU.",
    "projects.fisheye_title": "FishEye | Analitica Retail",
    "projects.fisheye_desc": "Monitorizacion de personas en tiempo real con camaras fisheye en techo para retail de telecomunicaciones.",
    "projects.fisheye_details": "Monitorizacion en tiempo real de personas usando camaras fisheye montadas en techo para un gran retailer de telecomunicaciones, extrayendo KPIs operacionales (trafico de personas, tiempos de espera, mapas de calor).",
    "projects.ocean_title": "OceanGuard AI — Monitorizacion de Contaminacion Marina",
    "projects.ocean_desc": "Plataforma con IA para analisis on-device de contaminacion marina usando Gemma3n VLM fine-tuned.",
    "projects.ocean_details": "Plataforma integral para monitorizacion de contaminacion marina usando IA on-device. Detecta y clasifica automaticamente residuos, visualiza datos en un mapa interactivo y genera informes con estrategias de mitigacion. Desarrollado con Gemma3n VLM para el Google Gemma3n Hackathon.",
    "projects.myo_title": "Control Mioelectrico de Robot Movil",
    "projects.myo_desc": "Control de robot con senales mioelectricas, evasion de obstaculos y seguimiento de personas.",
    "projects.myo_details": "Sistema de control para un robot movil que combina control mioelectrico con sensores de proximidad para evasion de obstaculos y seguimiento activo de personas en tiempo real.",
    "projects.ur3_title": "Interfaz para Robot Colaborativo UR3",
    "projects.ur3_desc": "Interfaz intuitiva para el control integral de un robot colaborativo UR3.",
    "projects.ur3_details": "Diseno de una interfaz intuitiva y funcional para el control completo de un robot colaborativo UR3. Permite monitorizacion en tiempo real y ejecucion de diversas funciones.",
    "projects.chess_title": "Ajedrez en Tiempo Real con IRB120 e IA",
    "projects.chess_desc": "Sistema de ajedrez con IA y un robot industrial IRB120 jugando en tiempo real.",
    "projects.chess_details": "Sistema donde un robot IRB120, asistido por algoritmos de IA, juega ajedrez en tiempo real. Puede controlar ambos bandos o habilitar juego remoto.",
    "projects.bomb_title": "Simulacion Multi-Robot de Extraccion de Bomba",
    "projects.bomb_desc": "Estrategias colaborativas multi-robot para extraccion y transporte seguro de bomba.",
    "projects.bomb_details": "Sistema multi-robot que simula estrategias colaborativas para extraccion y transporte seguro de bombas. Algoritmos de coordinacion y simulacion replican comportamiento de equipo en escenarios de alto riesgo.",
    "projects.warehouse_title": "Simulacion de Almacen Inteligente",
    "projects.warehouse_desc": "Sistema multi-robot de recogida de productos para logistica de almacen inteligente.",
    "projects.warehouse_details": "Sistema de robots colaborativos para recoger y transportar productos en un almacen inteligente. Optimiza la logistica interna mediante algoritmos de planificacion y control en tiempo real.",
    "projects.line_title": "Sistema Multi-Robot de Seguimiento de Linea",
    "projects.line_desc": "Seguimiento coordinado de linea multi-robot en un circuito.",
    "projects.line_details": "Multiples robots coordinandose para realizar seguimiento de linea en un circuito. Algoritmos de control colaborativo y comunicacion aseguran ejecucion precisa y coordinada.",
    "projects.candy_title": "Bot de Candy Crush — Vision Clasica",
    "projects.candy_desc": "Bot de juego automatizado usando algoritmos clasicos de vision artificial.",
    "projects.candy_details": "Bot que usa metodos clasicos de vision artificial para interpretar el estado del juego y tomar decisiones en tiempo real para jugar Candy Crush.",

    // Demos
    "nav.demos": "Demos",
    "demos.title": "Demos en Vivo",
    "demos.subtitle": "Modelos de Vision Artificial en tiempo real ejecutandose directamente en tu navegador — sin servidor",
    "demos.tab_detection": "Deteccion de Objetos",
    "demos.tab_pose": "Estimacion de Pose",
    "demos.tab_depth": "Estimacion de Profundidad",
    "demos.det_title": "Deteccion de Objetos en Tiempo Real",
    "demos.det_meta": "80 clases de objetos | ~2MB modelo | 30-60 FPS",
    "demos.pose_title": "Estimacion de Pose en Tiempo Real",
    "demos.pose_meta": "33 puntos corporales | ~16MB runtime+modelo | 20-30 FPS",
    "demos.depth_title": "Estimacion de Profundidad Monocular",
    "demos.depth_meta": "~27MB modelo (solo primera carga) | Subida de imagen",
    "demos.start": "Iniciar Camara",
    "demos.stop": "Parar",
    "demos.upload": "Subir Imagen",
    "demos.upload_image": "Subir Imagen",
    "demos.placeholder": "Pulsa \"Iniciar Camara\" o sube una imagen para empezar",
    "demos.placeholder_pose": "Pulsa \"Iniciar Camara\" para iniciar la deteccion de pose",
    "demos.placeholder_depth": "Sube una imagen para generar un mapa de profundidad",
    "demos.loading_lib": "Cargando libreria...",
    "demos.loading_model": "Cargando modelo...",
    "demos.loading_depth": "Cargando modelo Depth Anything (~27MB, solo la primera vez)...",
    "demos.starting_cam": "Iniciando camara...",
    "demos.running": "Ejecutando — detectando en tiempo real",
    "demos.detecting": "Detectando...",
    "demos.processing": "Procesando mapa de profundidad...",
    "demos.depth_done": "Estimacion de profundidad completada",
    "demos.streamlit_link": "Para demos de VLM (Moondream2 Vision-Language Model), visita el",

    // Skills
    "skills.title": "Habilidades",
    "skills.multimodal": "IA Multimodal",
    "skills.dl": "Frameworks de Deep Learning",
    "skills.tuning": "Ajuste y Optimizacion de Modelos",
    "skills.integration": "Integracion de Sistemas",
    "skills.cloud": "Cloud y MLOps",
    "skills.deployment": "Despliegue",
    "skills.languages": "Idiomas",

    // Education
    "education.title": "Formacion",
    "education.present": "Actualidad",
    "education.phd_title": "Doctorado en Vision Artificial",
    "education.phd_desc": "Investigacion en generacion de datos sinteticos y modelos de difusion para sistemas de vision robustos en entornos submarinos complejos.",
    "education.msc_title": "Master en Automatica y Robotica",
    "education.honors": "Matricula de Honor — Mejor Proyecto Final",
    "education.bsc_title": "Grado en Ingenieria Robotica",
    "education.honors_bsc": "Matricula de Honor — Mejor Trabajo de Fin de Grado",
    "education.exchange_title": "Programa de Intercambio",
    "education.exchange_desc": "Ingenieria Mecatronica, Robotica y Automatizacion — Tempe, AZ, EEUU",

    // Publications
    "publications.title": "Publicaciones y Premios",
    "publications.paper1_title": "Un Estudio Experimental sobre Localizacion y Reconocimiento de Residuos Marinos mediante Deteccion de Objetos",
    "publications.paper2_title": "The CleanSea Set: Un Corpus de Referencia para Deteccion y Reconocimiento de Residuos Submarinos",
    "publications.read_paper": "Leer Paper",
    "publications.award_title": "Mejor Paper",
    "publications.hackathon_desc": "Google Gemma3n Hackathon",
    "publications.ferrovial_title": "Ganador AI Hackathon",
    "publications.ferrovial_desc": "Mejor Solucion — Ferrovial & Microsoft",
    "publications.podcast_title": "Podcast de Investigacion Doctoral",

    // Certifications
    "certifications.title": "Certificaciones",

    // Contact
    "contact.title": "Contacto",
    "contact.heading": "Trabajemos juntos",
    "contact.subtitle": "Siempre estoy abierto a discutir nuevos proyectos, colaboraciones de investigacion u oportunidades en IA y Vision Artificial.",
    "contact.label_name": "Nombre completo *",
    "contact.label_email": "Email *",
    "contact.label_company": "Empresa (opcional)",
    "contact.label_message": "Mensaje *",
    "contact.ph_name": "Tu nombre",
    "contact.ph_email": "tu@email.com",
    "contact.ph_company": "Nombre de la empresa",
    "contact.ph_message": "Cuentame sobre tu proyecto...",
    "contact.send": "Enviar Mensaje",
    "contact.success": "Mensaje enviado con exito! Te respondere pronto.",
    "contact.error": "Algo salio mal. Intentalo de nuevo o escribeme directamente.",

    // Footer
    "footer.rights": "Todos los derechos reservados."
  }
};

let currentLang = "en";

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);

  document.documentElement.lang = lang;
  document.getElementById("langToggle").querySelector(".lang-flag").textContent = lang.toUpperCase();

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (translations[lang] && translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });
}

function initLanguage() {
  const saved = localStorage.getItem("lang");
  if (saved && translations[saved]) {
    setLanguage(saved);
  } else {
    const browserLang = navigator.language.slice(0, 2);
    setLanguage(browserLang === "es" ? "es" : "en");
  }
}
