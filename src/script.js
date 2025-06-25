(() => {
	const trList = document.querySelectorAll('tr')
	const currentUrl = window.location.href
	if (currentUrl !== 'http://saudeweb/hygiaweb/UPA/ManutFilaAt.aspx') {
		return
	}
	trList.forEach(tr => {
		if (tr.children.length > 5) {
			if (tr.id === 'gridAtend_gridAtend_head') return
			const id = tr.children[5].textContent.trim()
			const link = `http://saudeweb/hygiaweb/Ambulatorio/AtendimentoPac_Registro.aspx?numatend=${id}`
			const tagA = document.createElement('a')
			tagA.innerText = '[PRONTUARIO]'
			tagA.setAttribute('href', link)
			tagA.setAttribute('target', '_blank')
			const td = document.createElement('td')
			td.appendChild(tagA)
			tr.appendChild(td)
		}
	})
})()