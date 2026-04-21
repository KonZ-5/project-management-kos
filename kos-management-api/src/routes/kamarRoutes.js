const express = require('express');
const router = express.Router();
const kamarController = require('../controllers/kamarController');

router.get('/', kamarController.getAllKamar);
router.get('/:id', kamarController.getKamarById);
router.post('/', kamarController.createKamar);
router.put('/:id', kamarController.updateKamar);
router.delete('/:id', kamarController.deleteKamar);

module.exports = router;