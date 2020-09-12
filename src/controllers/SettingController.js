const Setting = require('../models/Setting');
const AbstractController = require('../library/AbstractController');
class SettingController extends AbstractController {

    constructor() {
        super();
        super.class = new Setting();
    }

}
module.exports = SettingController;