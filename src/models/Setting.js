var Model = require('../library/Model');
let SettingSchema = require('../models/schemas/Setting');

class Setting extends Model {
    init() {
        this.schema = SettingSchema;
        this.collection = 'setting';
    }
}

module.exports = Setting;