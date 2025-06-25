(() => {
    const currentUrl = window.location.href
    if (currentUrl !== 'http://saudeweb/hygiaweb/Exames/PacientesAgendados.aspx') {
        return
    }
    const trList = document.querySelectorAll('tr')
    const paciente = {}
    const pacientes = {
        presente: 0,
        faltoso: 0
    }
    const exames = {
        realizados: 0,
        naoRealizados: 0
    }

    trList.forEach(tr => {
        const trChildren = tr.children
        if (trChildren.length >= 12 && trChildren[1].textContent.trim() !== '') {
            const hygia = Number(trChildren[0].textContent)
            const nome = trChildren[1].textContent
            const situacao = trChildren[10].textContent
            const exame = trChildren[2].textContent

            if (!Object.hasOwn(paciente, hygia)) {
                paciente[hygia] = {
                    nome,
                    exames: {
                        [exame]: situacao
                    },
                    fezAlgumExame: situacao === 'Enviado Lab.'
                }
            } else {
                paciente[hygia].exames[exame] = situacao

                // Se ainda não tinha feito nenhum exame e agora fez
                if (!paciente[hygia].fezAlgumExame && situacao === 'Enviado Lab.') {
                    paciente[hygia].fezAlgumExame = true
                }
            }

            // Contagem de exames
            if (situacao === 'Enviado Lab.') {
                exames.realizados++
            } else {
                exames.naoRealizados++
            }
        }
    })

    // Contagem de pacientes
    Object.values(paciente).forEach(p => {
        if (p.fezAlgumExame) {
            pacientes.presente++
        } else {
            pacientes.faltoso++
        }
    })

    console.log('Pacientes:', pacientes)
    console.log('Exames:', exames)
    console.log('Detalhes:', paciente)

    // Função utilitária para baixar arquivos
    function downloadFile(filename, content, type) {
        const blob = new Blob([content], { type })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
    }

    // Abrir nova aba e gerar relatório
    const win = window.open('', '_blank')
    const html = /*html*/`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Relatório de Exames</title>
    <style>
        body { font-family: sans-serif; padding: 20px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; vertical-align: top; }
        th { background: #eee; }
        .buttons { margin-bottom: 20px; }
        button { margin-right: 10px; padding: 6px 12px; }

        .exame-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
        }

        .verde { color: green; font-weight: bold; }
        .vermelho { color: red; font-weight: bold; }
    </style>
</head>
<body>
    <h1>Relatório de Exames</h1>
    <div class="buttons">
        <button onclick="downloadJSON()">Baixar JSON</button>
        <button onclick="downloadCSV()">Baixar CSV</button>
        <button onclick="copiarParaWhatsapp()">Copiar para WhatsApp</button>
    </div>

    <h2>Resumo Geral</h2>
    <table>
        <tr><th>Pacientes Presentes</th><td id="presente"></td></tr>
        <tr><th>Pacientes Faltosos</th><td id="faltoso"></td></tr>
        <tr><th>Exames Realizados</th><td id="realizados"></td></tr>
        <tr><th>Exames Não Realizados</th><td id="naoRealizados"></td></tr>
    </table>

    <h2>Detalhamento por Paciente</h2>
    <table id="pacienteTable">
        <thead>
            <tr>
                <th>Hygia</th>
                <th>Nome</th>
                <th>Exames</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>

    <script>
        const pacientes = ${JSON.stringify(pacientes, null, 2)}
        const exames = ${JSON.stringify(exames, null, 2)}
        const pacienteData = ${JSON.stringify(paciente, null, 2)}

        document.getElementById('presente').textContent = pacientes.presente
        document.getElementById('faltoso').textContent = pacientes.faltoso
        document.getElementById('realizados').textContent = exames.realizados
        document.getElementById('naoRealizados').textContent = exames.naoRealizados

        const tbody = document.querySelector('#pacienteTable tbody')
        for (const [hygia, data] of Object.entries(pacienteData)) {
            const tr = document.createElement('tr')
            const examesHTML = Object.entries(data.exames).map(([exame, status]) => {
                const statusClass = status === 'Enviado Lab.' ? 'verde' : 'vermelho'
                return \`<div class="exame-item"><span>\${exame}</span><span class="\${statusClass}">\${status}</span></div>\`
            }).join('')
            tr.innerHTML = \`
                <td>\${hygia}</td>
                <td>\${data.nome}</td>
                <td>\${examesHTML}</td>
            \`
            tbody.appendChild(tr)
        }

        function downloadJSON() {
            const content = JSON.stringify({ pacientes, exames, pacienteData }, null, 2)
            downloadFile('relatorio.json', content, 'application/json')
        }

        function downloadCSV() {
            let csv = 'Hygia,Nome,Exame,Situacao\\n'
            for (const [hygia, data] of Object.entries(pacienteData)) {
                for (const [exame, situacao] of Object.entries(data.exames)) {
                    csv += \`\${hygia},\${data.nome},\${exame},\${situacao}\\n\`
                }
            }
            downloadFile('relatorio.csv', csv, 'text/csv')
        }

        function downloadFile(filename, content, type) {
            const blob = new Blob([content], { type })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            a.click()
            URL.revokeObjectURL(url)
        }

        function copiarParaWhatsapp() {
    const texto = \`
Raio-X
Por *Paciente*:
    *PRESENTE*: \${pacientes.presente}
    *FALTOSOS*: \${pacientes.faltoso}

Por *EXAME*:
    *REALIZADOS*: \${exames.realizados}
    *NÃO REALIZADOS*: \${exames.naoRealizados}
\`.trim()

    navigator.clipboard.writeText(texto).then(() => {
        alert('Texto copiado para a área de transferência!')
    }).catch(err => {
        alert('Erro ao copiar: ' + err)
    })
}
    </script>
</body>
</html>
`

    win.document.write(html)
    win.document.close()
})()
