(() => {
    const currentUrl = window.location.href
    if (currentUrl !== 'http://saudeweb/hygiaweb/UPA/ListaRecep_Consulta.aspx') {
        return
    }
    const trList = document.querySelectorAll('tr')
    const atList = []

    const canceladosList = []
    const desistentesList = []
    const emAtendimentoList = []

    const classificacao = (prioridade) => {
        var text = []
        switch (prioridade) {
            case 'BRANCO':
                text = ['BRANCA', '#FFF']
                break;
            case 'NÃO URGENTE':
                text = ['AZUL', '#00F']
                break;
            case 'POUCO URGENTE':
                text = ['VERDE', '#0F0']
                break;
            case 'URGENTE':
                text = ['AMARELO', '#FF0']
                break;
            case 'MUITO URGENTE':
                text = ['LARANJA', '#FFA500']
                break;
            case 'EMERGENTE':
                text = ['VERMELHO', '#F00']
                break;
        }
        return text
    }

    trList.forEach(tr => {
        if (tr.children.length >= 22 && tr.children[9].textContent.includes('AT')) {
            const at = Number(tr.children[9].textContent.replace(/\D/g, ''))
            const textContent = tr.children[18].querySelector('span').textContent
            const name = tr.children[10].children[1].textContent

            if (name.includes('SENHA') && textContent === 'Encerrado') {
                canceladosList.push(`<p>${at} - Cancelamento</p>`)
            }

            if (textContent === `Desistente`) {
                desistentesList.push(`<p>${at} - Desistente</p>`)
            } else if (textContent !== `Encerrado`) {
                const prontuario = tr.children[16].textContent
                const prioridade = classificacao(tr.children[1].children[0].textContent)
                emAtendimentoList.push(`
                <p>${at} - <span style="background-color:${prioridade[1]}; border: 1px solid black;">${prioridade[0]}</span> - 
                    <a href='http://saudeweb/hygiaweb/Ambulatorio/AtendimentoPac_Registro.aspx?numatend=${prontuario}' target='_blank'>${name}</a> -
                    <span>[${prontuario}]</button>
                    <span><input type="checkbox">I</span>
                    <span><input type="checkbox">IA</span>
                    <span><input type="checkbox">?</span>
                </p>`)
            }
            atList.push(at)
        }
    })

    for (let i = atList[0]; i >= atList.at(-1); i--) {
        if (!atList.includes(i)) {
            canceladosList.push(`<p>${i} - Cancelamento</p>`)
        }
    }

    const newWindow = window.open()

    const html = `
    <head>
        <style>
            .desistentes {
                display: inline-flex;
                gap: 5rem;
            }
            .atendimento {
                margin-bottom: 2rem;
            }
        </style>
    </head>
    <div class='atendimento'>
        ${emAtendimentoList.join('')}
    </div>
    <hr>
    <div class='desistentes'>
        <div>${desistentesList.join('')}</div>
        <div>${canceladosList.join('')}</div>
    </div>
`
    /* newWindow.document.write(`
        <pre>${jsonDesistentes}</pre>
        <pre>${jsonEmAtendimento}</pre>
        <pre>${jsonCancelados}</pre>
    `) */

    newWindow.document.write(html)

})()