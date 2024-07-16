import express from 'express';
import { getProfilbyusernameHandler, editProfilHandler } from '../controllers/profilController.js';
import uploadProfile from "../config/multerprofil.js";

const router = express.Router();

router.get('/:username', getProfilbyusernameHandler);
router.post('/change/profil', uploadProfile.single('image'),editProfilHandler);

export default router;