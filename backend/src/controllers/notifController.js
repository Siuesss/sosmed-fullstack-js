import { getNotif } from '../services/notifService.js';

const getNotifHandler = async (req, res) => {
    const { userId } = req.session;

    try {
        const notif = await getNotif(userId);
        res.status(200).json(notif);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export { getNotifHandler }