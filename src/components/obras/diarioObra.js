import React, { useState, useEffect } from 'react';

const DiarioObra = ({ obra, obraId, materiais, carregarMateriais }) => {
    const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
    const [diarioAtual, setDiarioAtual] = useState({ hora_inicio: '', hora_fim: '', clima: '', interferencia_clima: '' });
    const [atividadeDescricao, setAtividadeDescricao] = useState('');
    const [atividadeStatus, setAtividadeStatus] = useState('Pendente');
    const [ocorrenciaTexto, setOcorrenciaTexto] = useState('');
    const [materialRecebido, setMaterialRecebido] = useState('');
    const [quantidadeRecebida, setQuantidadeRecebida] = useState('');
    const [materialConsumido, setMaterialConsumido] = useState('');
    const [quantidadeConsumida, setQuantidadeConsumida] = useState('');
    const [atividades, setAtividades] = useState([]);
    const [materiaisDiario, setMateriaisDiario] = useState([]);
    const [ocorrencias, setOcorrencias] = useState([]);
    const [alertas, setAlertas] = useState([]);

    const carregarDiario = async (data) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/diario/${obraId}/${data}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const dados = await res.json();
        if (dados) {
            setDiarioAtual(dados);
            setAtividades(dados.atividades || []);
            setMateriaisDiario(dados.materiais || []);
            setOcorrencias(dados.ocorrencias || []);
        } else {
            setDiarioAtual({ hora_inicio: '', hora_fim: '', clima: '', interferencia_clima: '' });
            setAtividades([]);
            setMateriaisDiario([]);
            setOcorrencias([]);
        }
    };

    const salvarDiario = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/diario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                obra_id: obraId, data_diario: dataSelecionada,
                hora_inicio: diarioAtual?.hora_inicio || '',
                hora_fim: diarioAtual?.hora_fim || '',
                clima: diarioAtual?.clima || '',
                interferencia_clima: diarioAtual?.interferencia_clima || ''
            })
        });
        const resultado = await res.json();
        carregarDiario(dataSelecionada);
        return resultado.id;
    };

    useEffect(() => { carregarDiario(dataSelecionada); }, [dataSelecionada]);

    const adicionarAtividade = async () => {
        if (!atividadeDescricao.trim()) return;
        let diarioId = diarioAtual?.id;
        if (!diarioId) diarioId = await salvarDiario();
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/diario/${diarioId}/atividade`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ descricao: atividadeDescricao, status: atividadeStatus })
        });
        setAtividadeDescricao('');
        setAtividadeStatus('Pendente');
        carregarDiario(dataSelecionada);
    };

    const adicionarMaterial = async (tipo) => {
        let materialId = tipo === 'recebido' ? materialRecebido : materialConsumido;
        let quantidade = tipo === 'recebido' ? quantidadeRecebida : quantidadeConsumida;
        if (!materialId || !quantidade) return;
        let diarioId = diarioAtual?.id;
        if (!diarioId) diarioId = await salvarDiario();
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/diario/${diarioId}/material`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ material_id: materialId, quantidade, tipo })
        });
        const data = await res.json();
        if (data.alerta) {
            alert(data.alerta);
            setAlertas(prev => [...prev, data.alerta]);
        }
        setMaterialRecebido('');
        setQuantidadeRecebida('');
        setMaterialConsumido('');
        setQuantidadeConsumida('');
        carregarDiario(dataSelecionada);
        if (carregarMateriais) carregarMateriais();
    };

    const adicionarOcorrencia = async () => {
        if (!ocorrenciaTexto.trim()) return;
        let diarioId = diarioAtual?.id;
        if (!diarioId) diarioId = await salvarDiario();
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/diario/${diarioId}/ocorrencia`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ descricao: ocorrenciaTexto })
        });
        setOcorrenciaTexto('');
        carregarDiario(dataSelecionada);
    };

    const enviarParaRevisao = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/diario/revisao', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ obraId, data_diario: dataSelecionada })
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Erro ao enviar.');
            alert('Relatório enviado para o gestor!');
        } catch (err) { alert(err.message); }
    };

    return (
        <div className="card">
            <div className="card-body">
                {alertas.length > 0 && (
                    <div className="alert alert-warning">
                        <strong>⚠️ Alertas de estoque:</strong>
                        <ul className="mb-0 mt-2">
                            {alertas.map((a, i) => <li key={i}>{a}</li>)}
                        </ul>
                    </div>
                )}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5>Diário de Obra</h5>
                    <input type="date" className="form-control" style={{ maxWidth: '250px' }} value={dataSelecionada} onChange={(e) => setDataSelecionada(e.target.value)} />
                </div>
                <div className="row">
                    <div className="col-md-6 mb-3"><label>Data</label><input className="form-control" value={dataSelecionada} disabled /></div>
                    <div className="col-md-3 mb-3"><label>Hora Início</label><input type="time" className="form-control" value={diarioAtual?.hora_inicio || ''} onChange={(e) => setDiarioAtual({ ...diarioAtual, hora_inicio: e.target.value })} /></div>
                    <div className="col-md-3 mb-3"><label>Hora Fim</label><input type="time" className="form-control" value={diarioAtual?.hora_fim || ''} onChange={(e) => setDiarioAtual({ ...diarioAtual, hora_fim: e.target.value })} /></div>
                </div>
                <div className="mb-3"><label>Mestre de Obras</label><input className="form-control" value={obra.mestre_obra || ''} disabled /></div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label>Condição Climática</label>
                        <select className="form-select" value={diarioAtual?.clima || ''} onChange={(e) => setDiarioAtual({ ...diarioAtual, clima: e.target.value })}>
                            <option value="">Selecione</option>
                            <option>☀️ Ensolarado</option><option>🌤️ Parcialmente nublado</option><option>☁️ Nublado</option>
                            <option>🌦️ Chuva fraca</option><option>🌧️ Chuva moderada</option><option>⛈️ Chuva forte / tempestade</option>
                        </select>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label>Clima interferiu nas atividades?</label>
                        <select className="form-select" value={diarioAtual?.interferencia_clima || ''} onChange={(e) => setDiarioAtual({ ...diarioAtual, interferencia_clima: e.target.value })}>
                            <option value="">Selecione</option><option>Não</option><option>Sim, parcialmente</option><option>Sim, totalmente</option>
                        </select>
                    </div>
                </div>
                <button className="btn btn-success" onClick={salvarDiario}>Salvar Informações Gerais</button>
                <hr className="my-4" />
                <h5>Atividades Executadas</h5>
                <div className="row">
                    <div className="col-md-8"><input className="form-control" placeholder="Descrição da atividade" value={atividadeDescricao} onChange={(e) => setAtividadeDescricao(e.target.value)} /></div>
                    <div className="col-md-2"><select className="form-select" value={atividadeStatus} onChange={(e) => setAtividadeStatus(e.target.value)}><option>Pendente</option><option>Concluída</option></select></div>
                    <div className="col-md-2"><button className="btn btn-primary w-100" onClick={adicionarAtividade}>+ Nova Atividade</button></div>
                </div>
                <div className="mt-3">
                    {atividades.length === 0 ? <p className="text-muted">Nenhuma atividade cadastrada.</p> :
                        <ul className="list-group">{atividades.map((a) => <li key={a.id} className="list-group-item d-flex justify-content-between"><span>{a.descricao}</span><span className={a.status === 'Concluída' ? 'badge bg-success' : 'badge bg-warning text-dark'}>{a.status}</span></li>)}</ul>}
                </div>
                <hr className="my-4" />
                <h5>Materiais Recebidos</h5>
                <div className="row mb-3">
                    <div className="col-md-6"><select className="form-select" value={materialRecebido} onChange={(e) => setMaterialRecebido(e.target.value)}><option value="">Selecione</option>{materiais.map(m => <option key={m.id} value={m.id}>{m.material} {m.estoque_minimo > 0 ? `(mín: ${m.estoque_minimo})` : ''}</option>)}</select></div>
                    <div className="col-md-3"><input type="number" className="form-control" placeholder="Quantidade" value={quantidadeRecebida} onChange={(e) => setQuantidadeRecebida(e.target.value)} /></div>
                    <div className="col-md-3"><button className="btn btn-primary w-100" onClick={() => adicionarMaterial('recebido')}>+ Recebido</button></div>
                </div>
                <h5 className="mt-4">Materiais Consumidos</h5>
                <div className="row mb-3">
                    <div className="col-md-6"><select className="form-select" value={materialConsumido} onChange={(e) => setMaterialConsumido(e.target.value)}><option value="">Selecione</option>{materiais.map(m => <option key={m.id} value={m.id}>{m.material} {m.estoque_minimo > 0 ? `(mín: ${m.estoque_minimo})` : ''}</option>)}</select></div>
                    <div className="col-md-3"><input type="number" className="form-control" placeholder="Quantidade" value={quantidadeConsumida} onChange={(e) => setQuantidadeConsumida(e.target.value)} /></div>
                    <div className="col-md-3"><button className="btn btn-primary w-100" onClick={() => adicionarMaterial('consumido')}>+ Consumido</button></div>
                </div>
                <div className="mt-3">
                    <ul className="list-group">{materiaisDiario.map(m => <li key={m.id} className="list-group-item d-flex justify-content-between"><span>{m.material} - {m.quantidade} {m.unidade_medida}</span><span className={m.tipo === 'recebido' ? 'badge bg-success' : 'badge bg-danger'}>{m.tipo}</span></li>)}</ul>
                </div>
                <hr className="my-4" />
                <h5>Ocorrências e Problemas</h5>
                <div className="row mb-3">
                    <div className="col-md-10"><textarea className="form-control" rows="3" placeholder="Descreva a ocorrência" value={ocorrenciaTexto} onChange={(e) => setOcorrenciaTexto(e.target.value)} /></div>
                    <div className="col-md-2 d-flex align-items-end"><button className="btn btn-primary w-100" onClick={adicionarOcorrencia}>+ Ocorrência</button></div>
                </div>
                <div className="mt-3">
                    {ocorrencias.length === 0 ? <p className="text-muted">Nenhuma ocorrência registrada.</p> :
                        <ul className="list-group">{ocorrencias.map(o => <li key={o.id} className="list-group-item">{o.descricao}</li>)}</ul>}
                </div>
                <hr className="my-4" />
                <div className="text-center">
                    <button className="btn btn-warning btn-lg" onClick={() => { if (window.confirm('Deseja enviar este relatório? O relatório será revisado pelo gestor encarregado.')) enviarParaRevisao(); }}>
                        <i className="bi bi-send"></i> Enviar para Revisão
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DiarioObra;