const fs = require('fs');
const nodemailer = require('nodemailer');


this.fetch = (document) => {
    return {...document.attributes, id: document.id };
}

this.fetchAll = (documents) => {
    return documents.map(r => this.fetch(r));
}

this.getPreentrada = async(chavenfe) => {

    let ObjPreent = Parse.Object.extend("preents");
    let query_preent = new Parse.Query(ObjPreent);
    query_preent.equalTo("chavenfe", chavenfe);
    let rsPreent = await query_preent.first();

    if (rsPreent) {
        return this.fetch(rsPreent);
    }

    return false;
}

this.getDestinatarios = async(tipo_email = "email_novo_agendamento") => {

    let destinatarios = await this.configurador('emails_destinatarios');

    destinatarios = destinatarios[tipo_email]
        .map(d => `"${d.nome}" <${d.email}>,`)
        .join('')
        .slice(0, -1);

    return destinatarios;
}

this.getTransportador = async(pessoa_uuid) => {

    const Objeto = Parse.Object.extend('pessoa');
    let query = new Parse.Query(Objeto);
    query.equalTo("uuid", pessoa_uuid);
    let rsPessoa = await query.first();

    if (rsPessoa) {
        let contatoPadrao = rsPessoa.get('contato');
        contatoPadrao = contatoPadrao.filter(a => a.contato_padrao === true).map(
            a => a.contato
        );

        return this.fetch(rsPessoa);
    }

    return false;
}

this.configurador = async(alias) => {
    const Objeto = Parse.Object.extend('configuracao');
    let query = new Parse.Query(Objeto);

    if (alias == 'cadastrado_agendamento') {
        alias = 'realocado_agendamento';
    }

    query.equalTo('nome', alias);
    query.equalTo('ativo', true);
    let configurador = await query.first();
    return configurador.attributes[`valor_${configurador.attributes.tipo}`];
}

this.readFile = async(path) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', function(err, data) {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

this.enviarEmail = (to, subject, html) => {

    const transporter = nodemailer.createTransport({
        host: "smtp.recsodine.com.br",
        port: 465,
        auth: {
            user: "administracao@recsodine.com.br",
            pass: "947wgknbekq"
        }
    });

    let mailOptions = {
        from: '"Administracao Sodine" <administracao@recsodine.com.br>',
        to, //: '"Xikão Junior" <xk.junior63@gmail.com>', // Recepient email address. Multiple emails can send separated by commas
        subject,
        html
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) return console.log(error);
        console.log('Message sent: %s', info.messageId);
    });
}

this.formataData = (data) => {

    var date = new Date(data);
    var options = { year: 'numeric', month: '2-digit', day: '2-digit' };

    data = date.toLocaleDateString('pt-BR', options);

    console.log(data)

    let formatDatte = data.split('/');
    let data_formatada = formatDatte[1].padStart(2, '0') + '/' + formatDatte[0].padStart(2, '0') + '/' + formatDatte[2];

    return data_formatada.toString();
}