import fs from 'fs';
import path from 'path';

/**
 * Clase Logger para registrar mensajes de error, información, depuración y advertencias en archivos de texto.
 * Los mensajes se guardan en archivos con un formato específico que incluye la fecha, hora, tipo de mensaje y el contenido del mensaje.
 * Los archivos de log se organizan por fecha y hora, creando un nuevo archivo cada 6 horas.
 * Cambiar a futuro por Bark o buscar otra manera de tener un logger
 */
export default class Logger
{
    constructor()
    {
        if (Logger.instance) return Logger.instance;
        Logger.instance = this;
    }

    #log(msg, type)
    {
        if (!fs.existsSync('./logfiles/')) fs.mkdirSync('./logfiles/');
        const date = new Date();
        const hour = date.getHours();
        const fileName = `log_${date.toISOString().slice(0, 10)}_${hour < 6 ? '00' : hour < 12 ? '06' : hour < 18 ? '12' : '18'}.txt`;
        const filePath = path.join('./logfiles/', fileName);
        let message = `
    ************************************
    TYPE: ${type}
    MSG: ${msg}
    DATE: ${date.toDateString()}
    TIME: ${date.toLocaleTimeString('es-ES')}
    ************************************
        `;
        console.log(message);
        fs.appendFileSync(filePath, message);
    }

    error(msg) {this.#log(msg, 'ERROR')}
    info(msg) {this.#log(msg, 'INFO')}
    debug(msg) {this.#log(msg, 'DEBUG')}
    warning(msg) {this.#log(msg, 'WARNING')}
}