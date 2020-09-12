const md5 = require('md5');
const axios = require('axios');
const utils = require('../src/utilities/utils');
const JWT = require('../src/middleware/jwt-gen');

var CronJob = require('cron').CronJob;

const getModeloRelatorioDiario = async() => {

    let template = await utils.configurador('relatorio_diario_agendamentos_pendentes');

    const Objeto = Parse.Object.extend('agendamento');
    let query = new Parse.Query(Objeto);
    query.equalTo('status', 0);
    let agendamentos_pendentes = await query.find();
    agendamentos_pendentes = utils.fetchAll(agendamentos_pendentes);

    if (agendamentos_pendentes.length === 0) {
        return false;
    }

    let temp = await utils.readFile(__dirname + '/modelo_rel.html');

    promissTemplate = agendamentos_pendentes.map(async ap => {

        let rsPreent = await utils.getPreentrada(ap.pre_entrada);

        let fornecedor = await utils.getTransportador(ap.pessoa);
        let td_fornecedor = "<td>Fornecedor nao cadastrado</td>";

        if (fornecedor !== false) {
            td_fornecedor = `<td>${fornecedor.nome}</td>`;
        }

        return `<tr>${td_fornecedor}<td>${ap.pre_entrada}</td><td>${rsPreent.numnota}</td><td><b>${utils.formataData(ap.data)}</b></td>`;
    });

    const results = await Promise.all(promissTemplate);

    template = template.replace('{{AGENDAMENTOS}}', temp.replace("{{TBODY}}", results.toString().replace(',', "")));

    return template.toString();
}

const onJobCompleted = () => {
    console.log("Cron executada");
}

const job = new CronJob('05 01 14 * * *', async() => {
        var destinatarios = await utils.getDestinatarios("email_novo_agendamento");
        var template = await getModeloRelatorioDiario();

        utils.enviarEmail(destinatarios, 'Recebimentos Sodine - Relatorio diario (Agendamentos Pendentes)', template);
    },
    onJobCompleted, false, 'America/Los_Angeles');

job.start();

const testar = async() => {
    var teste = await utils.getDestinatarios("aceitar_agendamento")
    console.log(teste)
}


const enviarEmailNovoAgendamento = async(object) => {

    try {

        let destinatarios = await utils.getDestinatarios("email_novo_agendamento")
        let template = await utils.configurador('email_novo_agendamento');
        let rsPessoa = await utils.getTransportador(object.pessoa);
        let rsPreent = await utils.getPreentrada(object.pre_entrada);

        if (rsPessoa !== false) {
            let contatoPadrao = rsPessoa.contato;
            contatoPadrao = contatoPadrao.filter(a => a.contato_padrao === true).map(
                a => a.contato
            );

            if (contatoPadrao !== undefined) {
                destinatarios = `${destinatarios}, ${contatoPadrao}`; // + ', "' + rsPessoa.nome + '"' + '<' + contatoPadrao + '>';
            }

            template = template.replace('{{TRANSPORTADOR}}', rsPessoa.nome)
        } else {
            template = template.replace('{{TRANSPORTADOR}}', 'Usuário interno');
        }

        template = template.replace('{{TURNO}}', object.turno == 1 ? 'Tarde' : 'Manhã')
        template = template.replace('{{PREENTRADA}}', object.pre_entrada)

        if (rsPreent !== false) {
            template = template.replace('{{NFE}}', rsPreent.numnota)
            template = template.replace('{{CODFORNEC}}', rsPreent.codfornec)
        }

        template = template.replace('{{VOLUMES}}', object.volumes)
        template = template.replace('{{DATA}}', utils.formataData(object.data))
        utils.enviarEmail(destinatarios, 'Novo Agendamento de Carga Cadastrado', template)
    } catch (error) {
        console.log(error)
        console.log("########## DATA ##############")
        console.log(object);
    }
}

// export enum TurnoAgendamento {
//     MANHA = 0,
//         TARDE = 1,
//         NOITE = 2
// }

const enviarEmailStatusAgendamento = async(object, original) => {

    try {
        let destinatarios = await utils.getDestinatarios("aceitar_agendamento")
        let template = await utils.configurador(StatusAgendamento[object.status] + '_agendamento');
        let rsPessoa = await utils.getTransportador(object.pessoa);
        let rsPreent = await utils.getPreentrada(object.pre_entrada);

        if (rsPessoa) {
            let contatoPadrao = rsPessoa.contato;
            contatoPadrao = contatoPadrao.filter(a => a.contato_padrao === true).map(
                a => a.contato
            );

            if (contatoPadrao !== undefined) {
                destinatarios = `${destinatarios}, ${contatoPadrao}`; // + ', "' + rsPessoa.nome + '"' + '<' + contatoPadrao + '>';
            }

            template = template.replace('{{TRANSPORTADOR}}', rsPessoa.nome)
        } else {
            template = template.replace('{{TRANSPORTADOR}}', 'Usuário interno');
        }

        template = template.replace('{{TURNO}}', object.turno == 1 ? 'Tarde' : 'Manhã')
        template = template.replace('{{STATUS}}', StatusAgendamento[original.status] + ' para ' + StatusAgendamento[object.status])
        template = template.replace('{{PREENTRADA}}', object.pre_entrada)

        if (rsPreent !== undefined) {
            template = template.replace('{{NFE}}', rsPreent.numnota)
            template = template.replace('{{CODFORNEC}}', rsPreent.codfornec)
        }

        template = template.replace('{{VOLUMES}}', object.volumes)
        template = template.replace('{{DATA}}', utils.formataData(object.data))

        utils.enviarEmail(destinatarios, 'Mudança de situação - Agendamento de Carga', template)

    } catch (error) {
        console.log(error)
    }

}

Parse.Cloud.define("solicitacao_avulsa", async(request) => {
    let destinatarios = await utils.getDestinatarios("emails_solicitacao_avulsa")
    let template = await utils.configurador('emails_solicitacao_avulsa');

    var regExp = /\{{.*?\}}/g;
    var campos_magicos = [];

    while (match = regExp.exec(template)) {
        campos_magicos.push(match[0])
    }

    let params = request.params.parametros
    campos_magicos.map(cm => {
        let fieldIndex = cm.replace("{{", "").replace("}}", "").toLowerCase();
        template = template.replace(cm, params[fieldIndex]);
    });

    utils.enviarEmail(destinatarios, 'Solicitação de agendamento avulso (Recsodine.com.br)', template)
});


Parse.Cloud.define("enviar_email_geral", async(request) => {
    let params = request.params.parametros

    let destinatarios = params.email_destino;
    let template = await utils.configurador(params.modelo);

    var regExp = /\{{.*?\}}/g;
    var campos_magicos = [];

    while (match = regExp.exec(template)) {
        campos_magicos.push(match[0])
    }

    campos_magicos.map(cm => {
        let fieldIndex = cm.replace("{{", "").replace("}}", "").toLowerCase();
        template = template.replace(cm, params[fieldIndex]);
    });

    utils.enviarEmail(destinatarios, params.assunto, template)
});

Parse.Cloud.afterSave("agendamento", async(request) => {

    try {

        if (request.original === undefined) {
            enviarEmailNovoAgendamento(request.object.attributes)
        } else if (request.original !== undefined) {
            enviarEmailStatusAgendamento(request.object.attributes, request.original.attributes)
        }

        sendNotification();
    } catch (error) {
        console.log(error);
    }
});

const sendNotification = async() => {
    notification = {
        "app_id": '21815e0c-6f9d-43b6-b3ef-85f53673d74b',
        "contents": { "en": "Olá, verifique o calendário de agendamentos!" },
        "headings": { "en": "Notificação - RECSodine" },
        "send_after": new Date(),
        "included_segments": ["Active Users", "Inactive Users", 'Subscribed Users']
    }

    url = 'https://onesignal.com/api/v1/notifications';

    response = axios.post(url, notification, {
            headers: {
                Authorization: `Basic YmI4Y2Y2YjAtZTE1Ny00ODE1LTkwZjYtOTA2NTBiN2EyYjMw`
            }
        }).then(function(response) {
            // console.log(response);
        })
        .catch(function(error) {
            // console.log(error);
        });
}

Parse.Cloud.beforeSave("usuario", (request) => {

    const sendedPassword = request.object.get("senha");

    if (sendedPassword !== null && sendedPassword !== 'undefined') {
        var salt = md5(new Date().getTime());
        var hash = md5(`${salt}@${sendedPassword}`);

        request.object.set("salt", salt);
        request.object.set("senha", hash);
    }
});

Parse.Cloud.define("importar_preents", async(request) => {

    let headers = request.params.rows.shift();
    let keys_accept = ["SERIE", 'NUMNOTA', 'CODFORNEC', 'CHAVENFE', 'STATUS'];

    let Objeto = Parse.Object.extend('preents')
    let data = request.params.rows.map(array => {
        let obj = {}
        headers.forEach((key, index) => {

            const crypto = require("crypto");
            const uuid = crypto.randomBytes(32).toString("hex");
            obj['uuid'] = uuid;
            obj['status'] = 'L';

            if (keys_accept.indexOf(key) !== -1) {
                obj[key.toLowerCase()] = array[index];
            }
        })

        let objeto = new Objeto()
        objeto.set(obj)
        return objeto
    })

    const query = new Parse.Query("preents");
    query.limit(10000);
    let data_from_db = await query.find();

    data_from_db = data_from_db.map(d => d.get('chavenfe'))
    data = data.filter(d => data_from_db.indexOf(d.get('chavenfe')) === -1)

    if (data !== undefined)
        if (data !== null)
            if (data.length > 0)
                Parse.Object.saveAll(data)

    return JSON.stringify(data);
});

Parse.Cloud.define("importar_fornecs", async(request) => {

    let headers = request.params.rows.shift();
    let keys_accept = ["CODFORNEC", 'FORNECEDOR', 'CGC', 'CONTATO', 'EMAIL', 'EMAILNFE', 'REP_EMAIL', 'SUP_EMAIL', 'REVENDA'];

    let Objeto = Parse.Object.extend('pessoa')
    let data = request.params.rows.map(array => {
        let obj = {}
        headers.forEach((key, index) => {
            const crypto = require("crypto");
            const uuid = crypto.randomBytes(32).toString("hex");
            obj['uuid'] = uuid;
            obj['empresa'] = true;
            obj['tipo_pessoa'] = ["bc5be523-d23a-b81f-76a1-4af9db5d6166"];

            if (keys_accept.indexOf(key) !== -1) {
                if (key.toLowerCase() == 'fornecedor') {
                    key = 'nome';
                    obj['razao_social'] = array[index];
                }

                if (key.toLowerCase() == 'cgc') {
                    key = 'documento';
                }


                if (key.toLowerCase() == 'revenda') {
                    if (array[index] == 'S') {
                        obj['tipo_pessoa'] = ["cc543780-51d9-35e3-e063-11b02fecccfe"];
                        return false;
                    } else if (array[index] == 'T') {
                        obj['tipo_pessoa'] = ["bc5be523-d23a-b81f-76a1-4af9db5d6166"];
                    }
                }

                if (key.toLowerCase() == 'email') {
                    if (array[index] !== undefined) {
                        key = 'contato';
                        array[index] = [{ "tipo_contato": 1, "contato_padrao": true, "contato": array[index], "observacao": "Contato Importado!" }];
                    }
                }

                obj[key.toLowerCase()] = array[index];
            }
        })

        let objeto = new Objeto()
        objeto.set(obj)
        return objeto
    });

    const query = new Parse.Query("pessoa");
    query.limit(10000);
    let data_from_db = await query.find();

    data_from_db = data_from_db.map(d => d.get('codfornec'))
    data = data.filter(d => data_from_db.indexOf(d.get('codfornec')) === -1)

    if (data !== undefined)
        if (data !== null)
            if (data.length > 0) {

                Parse.Object.saveAll(data)

                let ObjetoUsuario = Parse.Object.extend('usuario')
                const crypto = require("crypto");

                let dataUser = data.map(p => {

                    let objUser = {}
                    const uuid = crypto.randomBytes(16).toString("hex");
                    objUser['uuid'] = uuid;
                    objUser['pessoa'] = p.get('uuid');
                    objUser['nome'] = `fornec_${p.get('codfornec')}`;
                    objUser['perfil'] = "24652a37-d627-59e0-a361-d64abd7478dd";
                    objUser['senha'] = "123mudar"
                    objUser['ativo'] = true

                    let objeto = new ObjetoUsuario()
                    objeto.set(objUser)
                    return objeto
                });

                if (dataUser !== undefined && dataUser !== null) {
                    const queryUser = new Parse.Query("usuario");
                    queryUser.limit(10000);

                    let data_from_db_user = await query.find();

                    data_from_db_user = data_from_db_user.map(d => d.get('nome'));
                    dataUser = dataUser.filter(d => data_from_db_user.indexOf(d.get('nome')) === -1);

                    Parse.Object.saveAll(dataUser);
                }

            }

    return JSON.stringify(data);
});

Parse.Cloud.define("login", async(request) => {

    try {

        const query = new Parse.Query("usuario");
        query.equalTo("nome", request.params.username);
        const rsUsuario = await query.first();

        if (rsUsuario == undefined) {
            throw "Dados inválidos, verifique e envie novamente!"
        }

        // var hash = bcrypt.hashSync(request.params.password, rsUsuario.get('salt'))
        let hash = md5(`${rsUsuario.get('salt')}@${request.params.password}`);
        const compare = hash === rsUsuario.get('senha');

        if (compare !== true) {
            throw "Dados inválidos, verique e envie novamente!"
        }

        if (rsUsuario.attributes.ativo !== true) {
            throw "Usuário inativo, procure o administrador!"
        }

        const queryPerfil = new Parse.Query("perfil");
        queryPerfil.equalTo("uuid", rsUsuario.attributes.perfil);
        const rsPerfil = await queryPerfil.first();

        const queryPessoa = new Parse.Query("pessoa");
        queryPessoa.equalTo("uuid", rsUsuario.attributes.pessoa);
        const rsPessoa = await queryPessoa.first();
        let avatar = "assets/images/no-avatar.png";

        if (rsPessoa != undefined) {
            avatar = rsPessoa.get("logo") !== undefined ? rsPessoa.get("logo") : "assets/images/no-avatar.png";
        }

        const uuid = rsUsuario.attributes.uuid;

        return {
            user: {
                uuid: rsUsuario.get("uuid"),
                nome: rsUsuario.get("nome"),
                perfil: rsPerfil.get("nome"),
                pessoa_uuid: rsUsuario.get("pessoa"),
                avatar: avatar,
                permissoes: rsPerfil.get("permission")
            },
            token: JWT.sign({ uuid })
        };

    } catch (error) {
        return { error: error };
    }
});

let StatusAgendamento = {
    '0': 'cadastrado',
    '1': 'aceitar',
    '2': 'rejeitar',
    '3': 'executado',
    '4': 'nao_executado',
    '5': 'cancelado',
    '99': 'realocado'
};