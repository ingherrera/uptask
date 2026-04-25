import { CorsOptions } from "cors";

export const corsConfig: CorsOptions = {
	origin: function (origin, callback) {
		// Lista de orígenes permitidos - AGREGAR LA EXTENSION
		const whitelist = [
			process.env.FRONTEND_URL, // Aplicación cliente principal
			"chrome-extension://oienkoejnhkbcibhdnpjoemdnmiokgah", // Extensión de Brave
		];
		if (!origin || whitelist.includes(origin)) {
			console.log("LA PETICION VIENE DE UN MEDIO AUTORIZADO");
			callback(null, true);
		} else {
			// Si el origen no está en la lista, el servidor lanza un Error 500
			console.log("LA PETICION ES RECHAZADA");
			callback(new Error("Error de Cors"));
		}
	},
};
