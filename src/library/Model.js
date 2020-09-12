var Mongoose = require('mongoose');

class Model {

    collection = null;
    db = null;
    schema = null;

    constructor() {
        this.conexao();
        this.init();
    }

    init() {}
    conexao() {
        this.db = Mongoose.connection;
        // db.on('error', console.error);
        // db.once('open', function () {
        //     console.log('Conectado ao MongoDB.')
        //     // Vamos adicionar nossos Esquemas, Modelos e consultas aqui
        // });

        Mongoose.connect(`mongodb+srv://${process.env.DB_SERVER}/${process.env.DB_NAME}`, { useNewUrlParser: true });
        // Mongoose.connect('mongodb://localhost/framnet');
        this.db = Mongoose;
    }

    list(callback) {
        var model = this.db.model(this.collection, this.schema);
        return model.find({}, callback)
    }
    remove(id, callback) {
        this.db.collection(this.document).deleteOne({ _id: new ObjectId(id) }, callback);
    }
}
module.exports = Model;