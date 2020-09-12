class AbstractController {

    class = null;

    async get(req, res) {

        let response = {};
        try {
            let data = [];
            await this.class.list((err, results) => {
                data.push(results)
            });
            response.message = "Listagem";
            response.data = data;
            res.status(200);
        } catch (e) {
            console.log(e)
            response.message = 'Erro' + e;
            res.status(400);
        }
        return res.send(JSON.stringify(response));
    }

    async post(req, res) {
        return res.send('post configuradorw');
    }
    async put(req, res) {
        return res.send('put configuradorw');
    }
    async delete(req, res) {
        try {
            this.class.remove(req.params.id, function(err) {
                if (err) return next(err);
                response.message = "Excluido com sucesso";
                response.data = {};
                res.status(200);
            })
        } catch (e) {
            response.message = 'Erro' + e;
            res.status(400);
        }
        return res.send(JSON.stringify(response));
    }
}
module.exports = AbstractController;