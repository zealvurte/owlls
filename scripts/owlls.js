const isNumeric = function (value) {
	if (typeof(value) === 'number' || typeof(value) === 'bigint' || (typeof(value) === 'string' && value == 0)) {
		//console.debug('isNumeric',value,'->',true,'fast')
		return true
	}
	else if (value === true || !value || typeof(value) === 'object' || typeof(value) === 'function' || typeof(value) === 'symbol' || (typeof(value) === 'string' && value.match(/^\s+$/))) {
		//console.debug('isNumeric',value,'->',false,'fast')
		return false
	}
	//console.debug('isNumeric',value,'->',!isNaN(value))
	return !isNaN(value)
}
const setElementData = function (element,property,value,type) {
	const d = element.dataset
	let pa = property, r
	if (property.indexOf('-') === -1) {
		pa = 'data-'+property.replace(/([a-z])([A-Z])/g,(m, g1, g2) => g1+'-'+g2).toLowerCase()
	}
	else {
		property = property.replace(/^data\-/,'').replace(/\-([A-z])/g,(m, g1) => g1.toUpperCase())
	}
	if (value === undefined || (type === 'boolean' && (value === false || value === null)) || (type === 'number' && !isNumeric(value))) {
		r = 'deleted'
		delete d[property]
	}
	else {
		r = 'set'
		d[property] = (type === 'boolean' && value === true) ? '' : (type === 'number' ? parseFloat(value) : value)
	}
	if (type === undefined) {
		//console.debug('setElementData',element,property,pa,value,'->',r,'->',getElementData(element,property),getElementData(element,pa))
	}
	else {
		//console.debug('setElementData',element,property,pa,value,'('+type+')','->',r,'->',getElementData(element,property,type),getElementData(element,pa,type))
	}
	return d[property]
}
const getElementData = function (element,property,type) {
	const d = element.dataset
	let pa = property, v
	if (property.indexOf('-') === -1) {
		v = d[property]
		pa = 'data-'+property.replace(/([a-z])([A-Z])/g,(m, g1, g2) => g1+'-'+g2).toLowerCase()
	}
	else {
		property = property.replace(/^data\-/,'')
		v = element.getAttribute('data-'+property)
		property = property.replace(/\-([A-z])/g,(m, g1) => g1.toUpperCase())
	}
	if (type === 'boolean') {
		v = v === '' && true || false
	}
	else if (type === 'number') {
		v = isNumeric(v) ? parseFloat(v) : undefined
	}
	else {
		v = v === 'null' ? null : (v === 'false' ? false : v)
	}
	return v
}
const getElementScrolledPosition = function (element) {
	const p = element.getBoundingClientRect()
	return {
		top: p.top + window.scrollY,
		left: p.left + window.scrollX,
		bottom: p.bottom + window.scrollY,
		right: p.right + window.scrollX
	}
}
var overflowContainerPattern = /^(?!visible).*$/
const getComputedStyleValue = function (element,pseudoElement,property) {
	return getComputedStyle(element,pseudoElement)[property]
}
const isOverflowContainer = function (element) {
	return overflowContainerPattern.test(getComputedStyleValue(element,null,'overflow-x')) || overflowContainerPattern.test(getComputedStyleValue(element,null,'overflow-y'))
}
const getOverflowContainer = function (element) {
	if (!(element instanceof HTMLElement)) { return document.body }
	if (isOverflowContainer(element)) { return element }
	else { return getOverflowContainer(element.parentNode) }
}
const tooltip = document.getElementById('tooltip')
const clampTooltipPosition = function () {
	tooltip.style.transform = ''
	const overflowContainer = getOverflowContainer(tooltip.parentNode)
	const overflowContainerPosition = getElementScrolledPosition(overflowContainer)
	// Horizontal positioning (left is anchored to offsetParent's left)
	let tooltipPosition = getElementScrolledPosition(tooltip)
	let updatePosition = false
	let translateX = 0
	let leftDiff = tooltipPosition.left - overflowContainerPosition.left
	let rightDiff = tooltipPosition.right - overflowContainerPosition.right
	if (rightDiff > 0) {
		if (leftDiff > 0) {
			// Clamp to the right edge of the overflowContainer
			translateX -= leftDiff >= rightDiff ? rightDiff : leftDiff
			rightDiff -= translateX
		}
		if (rightDiff > 0) {
			// Wrap width to fit the overflowContainer
			tooltip.style.width = `${leftDiff - overflowContainerPosition.right}px`
			updatePosition = true
		}
	}
	// Vertical positioning (top is anchored to offsetParent's bottom)
	tooltipPosition = updatePosition ? getElementScrolledPosition(tooltip) : tooltipPosition
	let translateY = 0
	let topDiff = tooltipPosition.top - overflowContainerPosition.top
	let bottomDiff = tooltipPosition.bottom - overflowContainerPosition.bottom
	if (bottomDiff > 0) {
		if (topDiff > 0) {
			// Anchor bottom to offsetParent's top via the top difference
			const offsetParentPosition = getElementScrolledPosition(tooltip.offsetParent)
			translateY -= tooltipPosition.bottom - offsetParentPosition.top
			bottomDiff -= translateY
			// If it still overflows, then the overflowContainer is too small, or the tooltip too big, so change one of those instead
		}
	}
	tooltip.style.transform = `translate(${translateX}px,${translateY}px)`
}
const doAction = function (event) {
	if (!getSelection().isCollapsed) { return }
	const ct = event.currentTarget
	const actions = getElementData(ct,'action','string').split(';')
	const targets = (getElementData(ct,'target','string') || '').split(';')
	const targetIgnores = (getElementData(ct,'target-ignore','string') || '').split(';')
	actions.forEach((action,i) => {
		const args = action.split('.')
		let target = (!targets[i] || targets[i] === 'this') ? [ct] : document.querySelectorAll(targets[i])
		const targetIgnore = targetIgnores[i] ? ((targetIgnores[i] === 'this') ? [ct] : document.querySelectorAll(targetIgnores[i])) : null
		target = targetIgnore ? [...target].filter(t => ![...targetIgnore].reduce((ignore,ti) => ignore ||  t === ti,false)) : target
		switch (args[0]) {
			case 'state':
				if (args[1] === 'toggle') {
					target.forEach(t => setElementData(t,args[0],getElementData(t,args[0],'string') === 'active' ? 'inert' : 'active','string'))
				}
				else if (args[1] === 'active' || args[1] === 'inert') {
					target.forEach(t => setElementData(t,args[0],args[1],'string'))
				}
				break
			case 'expandable':
				if (args[1] === 'toggle') {
					target.forEach(t => setElementData(t,args[0],getElementData(t,'expanded','boolean') ? false : true,'boolean'))
				}
				else if (args[1] === 'expand' || args[1] === 'collapse') {
					target.forEach(t => setElementData(t,'expanded',args[1] === 'expand' ? true : false,'boolean'))
				}
				break
			case 'tooltip':
				const sameTooltip = ct.contains(tooltip)
				const state = getElementData(tooltip,'state','string')
				args[1] = args[1] === 'toggle' ? ((sameTooltip && state === 'active') ? 'hide' : 'show') : args[1]
				if (args[1] === 'show') {
					if (state === 'active') {
						setElementData(tooltip,'state','inert','string')
					}
					if (!sameTooltip) {
						ct.append(tooltip)
						tooltip.innerHTML = [...target].reduce((content,t) => content+`<p>${t.title}</p>`,'')
						clampTooltipPosition()
					}
					setElementData(tooltip,'state','active','string')
				}
				else if (args[1] === 'hide' && state === 'active') {
					setElementData(tooltip,'state','inert','string')
				}
			case 'scrollTo':
				args[1] = (args[1] && (typeof(args[1]) === 'number' || /^[1-9]\d*(?:\.\d+)?%$/.test(args[1]) || /^(start|center|end|top|middle|bottom)$/.test(args[1]))) ? args[1] : 0
				args[2] = (args[2] && (typeof(args[2]) === 'number' || /^[1-9]\d*(?:\.\d+)?%$/.test(args[2]) || /^(start|center|end|left|middle|right)$/.test(args[2]))) ? args[2] : ( /^(start|center|end)$/.test(args[1]) ? args[1] : 0)
				target.forEach(t => t.scroll({
					'top': typeof(args[1]) === 'number' ? args[1] : ((args[1] === 'end' || args[1] === 'bottom') ? t.scrollHeight : ((args[1] === 'center' || args[1] === 'middle') ? Math.round(t.scrollHeight/2) : (/^[1-9]\d*(?:\.\d+)?%$/.test(args[1]) ? Math.round(parseInt(/^([1-9]\d*(?:\.\d+)?)%$/.match(args[1])[1])/100*t.scrollHeight) : 0 ))),
					'left': typeof(args[2]) === 'number' ? args[2] : ((args[2] === 'end' || args[2] === 'right') ? t.scrollWidth : ((args[2] === 'center' || args[2] === 'middle') ? Math.round(t.scrollWidth/2) : (/^[1-9]\d*(?:\.\d+)?%$/.test(args[2]) ? Math.round(parseInt(/^([1-9]\d*(?:\.\d+)?)%$/.match(args[2])[1])/100*t.scrollWidth) : 0))),
					'behaviour': args[3] === 'auto' ? args[3] : 'smooth'
				}))
				break
			case 'scrollIntoView':
				args[1] = (args[1] && (args[1] === 'start' || args[1] === 'center' || args[1] === 'end')) ? args[1] : 'nearest'
				target.forEach(t => t.scrollIntoView({
					'block': args[1],
					'inline': (args[2] && (args[2] === 'start' || args[2] === 'center' || args[2] === 'end')) ? args[2] : args[1],
					'behaviour': args[3] === 'auto' ? args[3] : 'smooth'
				}))
				break
		}
	})
}
const hideAfterEventHandler = function (event) {
	const t = event.target
	if (t === event.currentTarget) {
		t.hidden = true
		return true
	}
}
const hideAfterEvent = function (element,events) {
	const handlerController = new AbortController();
	(Array.isArray(events) ? events : [events]).forEach(e => {
		element.addEventListener(e,(event) => hideAfterEventHandler(event) && handlerController.abort(),{
			'signal': handlerController.signal
		})
	})
}
const isCurrentlyAvailable = function (start,end) {
	const now = Date.now()
	return (start ? new Date(start) <= now : true) && (end ? new Date(end) >= now : true)
}
const filtersChanged = function (event) {
	const noSkinsState = [...skinArticles].filter(filterSkins).length === 0 ? 'active' : 'inert'
	if (getElementData(noSkins,'state','string') !== noSkinsState) {
		setElementData(noSkins,'state',noSkinsState,'string')
	}
}
const filterSkins = function (skin) {
	const newState = ((navAvailabilityCheckbox.checked && !getElementData(skin,'available','boolean')) || (navHeroSelect.value !== '' && navHeroSelect.value !== getElementData(skin,'hero','string')) || (navSearch.value !== '' && getElementData(skin,'name','string').toLowerCase().indexOf(navSearch.value.toLowerCase()) < 0)) ? 'inert' : 'active'
	if (getElementData(skin,'state','string') !== newState) {
		if (newState === 'inert') {
			hideAfterEvent(skin,['animationend','animationcancel'])
		}
		else {
			skin.hidden = false
		}
		setElementData(skin,'state',newState,'string')
	}
	return newState === 'active'
}

// Set element references
const navHeroSelect = document.getElementById('nav_hero')
const navSearch = document.getElementById('nav_search')
const navSearchDatalist = document.getElementById('nav_search-data')
const navAvailabilityCheckbox = document.getElementById('nav_availability')
const contentMain = document.getElementById('content')
const noSkins = document.getElementById('no-skins')
const skinArticles = document.querySelectorAll('article.skin')

// Process skin availability
skinArticles.forEach(s => {
	const available = isCurrentlyAvailable(getElementData(s,'availability-start','string'),getElementData(s,'availability-end','string'))
	setElementData(s,'available',available,'boolean')
	if (!available) {
		s.querySelectorAll('section.skin-info main div.group:last-child :is(dt,dd):not(.historic)').forEach(hp => hp.classList.add('historic'))
	}
})

// Hookup filtering & searching
const navFilters = [navHeroSelect,navAvailabilityCheckbox]
navFilters.forEach(f => f.addEventListener('change',filtersChanged))
navSearch.addEventListener('input',filtersChanged)
filtersChanged()

// Hookup actions
document.querySelectorAll(`[data-action]`).forEach(e => e.addEventListener('click',doAction))