import { Router } from "express";
import {
    countryByCode,
    rates,
    geocode,
    weather,
} from "../controllers/integrationsController.mjs";
const r = Router();
r.get("/country/:code", countryByCode);
r.get("/rates", rates);
r.get("/geocode", geocode);
r.get("/weather", weather);
export default r;
