import re

EMAIL_ALLOWED_DOMAINS = ("@est.ups.edu.ec", "@ups.edu.ec")

CARGO_OPTIONS = {
    "ESTUDIANTE": "Estudiante",
    "DOCENTE": "Docente",
    "EGRESADO": "Egresado",
}

CARRERA_OPTIONS = {
    "COMPUTACION": "Computacion",
    "SISTEMAS": "Sistemas",
    "ELECTRICIDAD / ELECTRICA": "Electricidad / Electrica",
    "ELECTRONICA": "Electronica",
    "TELECOMUNICACIONES": "Telecomunicaciones",
    "AMBIENTAL": "Ambiental",
    "CIVIL": "Civil",
    "MECANICA": "Mecanica",
    "AUTOMOTRIZ": "Automotriz",
    "MAESTRIA": "Maestria",
    "CECASIS": "CECASIS",
}

NIVEL_OPTIONS = {
    "1RO": "1ro",
    "2DO": "2do",
    "3RO": "3ro",
    "4TO": "4to",
    "5TO": "5to",
    "6TO": "6to",
    "7MO": "7mo",
    "8VO": "8vo",
    "9NO": "9no",
    "10MO": "10mo",
    "EGRESADO": "Egresado",
    "DOCENTE": "Docente",
}

DISCAPACIDAD_OPTIONS = {"SI": "SI", "NO": "NO"}

LABORATORIO_OPTIONS = {
    "LABORATORIO NETWORKING 1": "Laboratorio Networking 1",
    "LABORATORIO NETWORKING 2": "Laboratorio Networking 2",
    "LABORATORIO NETWORKING 3": "Laboratorio Networking 3",
    "LABORATORIO COMPUTACION AVANZADA": "Laboratorio Computacion Avanzada",
    "LABORATORIO IHM": "Laboratorio IHM",
}

EQUIPO_OPTIONS = {
    "ROUTER 2800": "Router 2800",
    "SWITCH 2960": "Switch 2960",
    "HUB 240": "HUB 240",
    "ROUTER 1941": "Router 1941",
    "SWITCH 3560": "Switch 3560",
    "KIT ARDUINO": "Kit Arduino",
    "KIT RASPBERRY": "Kit Raspberry",
    "NINGUNO": "Ninguno",
}

HORARIO_PATTERN = re.compile(r"^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$")
DATE_FORMAT = "%d/%m/%Y"
MAX_ESTUDIANTES = 35
