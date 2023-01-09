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
const setElementAttribute = function (element,attribute,value,type) {
	const a = attribute
	let property, result
	if (/([a-z])([A-Z])/.test(attribute)) {	// Property provided
		property = attribute
		attribute = attribute.replace(/\-([A-z])/g,(m, g1) => g1.toUpperCase())
	}
	else {	// Attribute provided
		property = attribute.replace(/([a-z])([A-Z])/g,(m, g1, g2) => g1+'-'+g2).toLowerCase()
	}
	if (value === undefined || (type === 'boolean' && (value === false || value === null)) || (type === 'number' && !isNumeric(value))) {
		result = 'deleted'
		delete element.removeAttribute(attribute)
	}
	else {
		result = 'set'
		element.setAttribute(attribute,(type === 'boolean' && value === true) ? '' : (type === 'number' ? parseFloat(value) : value))
	}
	//console.debug('setElementAttribute',element,a,value,type,'->',attribute,property,result,'->',element.getAttribute(attribute),element[property],'->',getElementAttribute(element,attribute,type))
	return getElementAttribute(element,attribute,type)
}
const getElementAttribute = function (element,attribute,type) {
	//const a = attribute
	let property, value
	if (/([a-z])([A-Z])/.test(attribute)) {	// Property provided
		property = attribute
		attribute = attribute.replace(/\-([A-z])/g,(m, g1) => g1.toUpperCase())
	}
	else {	// Attribute provided
		property = attribute.replace(/([a-z])([A-Z])/g,(m, g1, g2) => g1+'-'+g2).toLowerCase()
	}
	value = element.getAttribute(attribute)
	if (type === 'boolean') {
		value = value === '' && true || false
	}
	else if (type === 'number') {
		value = isNumeric(value) ? parseFloat(value) : undefined
	}
	else {
		value = value === 'null' ? null : (value === 'false' ? false : value)
	}
	//console.debug('getElementAttribute',element,a,type,'->',attribute,property,'->',element.getAttribute(attribute),element[property],'->',value)
	return value
}
const setElementData = function (element,property,value,type) {
	//const p = property
	const data = element.dataset
	let attribute, result
	if (property.indexOf('-') !== -1) {	// Attribute provided
		attribute = 'data-'+property.replace(/^data\-/,'')
		property = property.replace(/^data\-/,'').replace(/\-([A-z])/g,(m, g1) => g1.toUpperCase())
	}
	else {
		attribute = 'data-'+property.replace(/([a-z])([A-Z])/g,(m, g1, g2) => g1+'-'+g2).toLowerCase()
	}
	if (value === undefined || (type === 'boolean' && (value === false || value === null)) || (type === 'number' && !isNumeric(value))) {
		result = 'deleted'
		delete data[property]
	}
	else {
		result = 'set'
		data[property] = (type === 'boolean' && value === true) ? '' : (type === 'number' ? parseFloat(value) : value)
	}
	//console.debug('setElementData',element,p,value,type,'->',data,property,attribute,result,'->',data[property],element.getAttribute(attribute),'->',getElementData(element,property,type))
	return getElementData(element,property,type)
}
const getElementData = function (element,property,type) {
	//const p = property
	const data = element.dataset
	let attribute, value
	if (property.indexOf('-') !== -1) {	// Attribute provided
		attribute = 'data-'+property.replace(/^data\-/,'')
		property = property.replace(/^data\-/,'').replace(/\-([A-z])/g,(m, g1) => g1.toUpperCase())
	}
	else {
		attribute = 'data-'+property.replace(/([a-z])([A-Z])/g,(m, g1, g2) => g1+'-'+g2).toLowerCase()
	}
	value = data[property]
	if (type === 'boolean') {
		value = value === '' && true || false
	}
	else if (type === 'number') {
		value = isNumeric(value) ? parseFloat(value) : undefined
	}
	else {
		value = value === 'null' ? null : (value === 'false' ? false : value)
	}
	//console.debug('getElementData',element,p,type,'->',data,property,attribute,'->',data[property],element.getAttribute(attribute),'->',value)
	return value
}
const getComputedStyleValue = function (element,pseudoElement,property) {
	//const p = property
	const computedStyle = getComputedStyle(element,pseudoElement)
	let camelCaseProperty, value
	if (property.indexOf('-') === -1) {	// Camel-case property provided
		camelCaseProperty = property
		property = property.replace(/([a-z])([A-Z])/g,(m, g1, g2) => g1+'-'+g2).toLowerCase()
	}
	else {	// Hyphenated property provided
		camelCaseProperty = property.replace(/\-([A-z])/g,(m, g1) => g1.toUpperCase())
	}
	value = computedStyle[property]
	//console.debug('getComputedStyleValue',element,pseudoElement,p,'->',computedStyle,property,camelCaseProperty,'->',computedStyle[property],computedStyle[camelCaseProperty],computedStyle.getPropertyValue(property),'->',value)
	return value
}
const hideAfterEventHandler = function (event) {
	const t = event.target
	if (t === event.currentTarget) {
		t.hidden = true
		return true
	}
}
const hideAfterEvent = function (element,events,handlerController) {
	handlerController = handlerController || new AbortController();
	(Array.isArray(events) ? events : [events]).forEach(e => {
		element.addEventListener(e,(event) => hideAfterEventHandler(event) && handlerController.abort(),{
			'signal': handlerController.signal
		})
	})
}
const setElementVisibility = function (element,show,events,handlerController) {
	if (getElementData(element,'hidden','boolean') === show) {
		if (!show) {
			hideAfterEvent(element,events || ['animationend','animationcancel'],handlerController)
		}
		else {
			element.hidden = !show
		}
		setElementData(element,'hidden',!show,'boolean')
	}
}
var overflowContainerPattern = /^(?!visible).*$/
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
	const overflowContainerPosition = getOverflowContainer(tooltip.parentNode).getBoundingClientRect()
	// Horizontal positioning (left is anchored to offsetParent's left)
	let tooltipPosition = tooltip.getBoundingClientRect()
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
	tooltipPosition = updatePosition ? tooltip.getBoundingClientRect() : tooltipPosition
	let translateY = 0
	let topDiff = tooltipPosition.top - overflowContainerPosition.top
	let bottomDiff = tooltipPosition.bottom - overflowContainerPosition.bottom
	if (bottomDiff > 0) {
		if (topDiff > 0) {
			// Anchor bottom to offsetParent's top via the top difference (assumes offsetParent is the owner element, and it's much smaller than the overflowContainer)
			const offsetParentPosition = tooltip.offsetParent.getBoundingClientRect()
			translateY -= tooltipPosition.bottom - offsetParentPosition.top
			bottomDiff -= translateY
			// If it still overflows, then the overflowContainer is too small, or the tooltip too big, so change one of those instead
		}
	}
	tooltip.style.transform = `translate(${translateX}px,${translateY}px)`
}
let tooltipVisibilityHandlerController = new AbortController()
const resetTooltipVisibilityHandlerController = function () {
	tooltipVisibilityHandlerController.abort()	// Abort any pending visibility changes to hidden
	tooltipVisibilityHandlerController = new AbortController()
	return tooltipVisibilityHandlerController
}
const setTooltip = function (event) {
	const ct = event.currentTarget
	setElementAttribute(tooltip.parentElement,'aria-describedby','','string')
	setElementVisibility(tooltip,false,null,resetTooltipVisibilityHandlerController())
	if (!ct.contains(tooltip)) {
		ct.append(tooltip)
		tooltip.innerHTML = `<p>${getElementData(ct,'tooltip','string')}</p>`
		tooltip.hidden = false	// Must be displayed for clamp calculations
		clampTooltipPosition()
	}
	setElementVisibility(tooltip,true,null,resetTooltipVisibilityHandlerController())
	setElementAttribute(ct,'aria-describedby','tooltip','string')
}
const unsetTooltip = function (event) {
	setElementAttribute(tooltip.parentElement,'aria-describedby','','string')
	setElementVisibility(tooltip,false,null,resetTooltipVisibilityHandlerController())
}
document.addEventListener('keydown',(event) => {
	if (event.key === 'Escape') {
		unsetTooltip(event)
	}
})
const doAction = function (event,actionType) {
	const ct = event.currentTarget
	actionType = actionType ? actionType+'-' : '';
	const actions = getElementData(ct,actionType+'action','string').split(';')
	const targets = (getElementData(ct,actionType+'target','string') || '').split(';')
	const targetIgnores = (getElementData(ct,actionType+'target-ignore','string') || '').split(';')
	actions.forEach((action,i) => {
		const args = action.split('.')
		let target = (!targets[i] || targets[i] === 'this') ? [ct] : document.querySelectorAll(targets[i])
		const targetIgnore = targetIgnores[i] ? ((targetIgnores[i] === 'this') ? [ct] : document.querySelectorAll(targetIgnores[i])) : null
		target = targetIgnore ? [...target].filter(t => ![...targetIgnore].reduce((ignore,ti) => ignore ||  t === ti,false)) : target
		switch (args[0]) {
			case 'visibility':
				if (args[1] === 'toggle') {
					target.forEach(t => setElementVisibility(t,getElementData(element,'hidden','boolean')))
				}
				else if (args[1] === 'show' || args[1] === 'hide') {
					target.forEach(t => setElementVisibility(t,args[1] === 'show'))
				}
				break
			case 'expandable':
				args[1] = args[1] === 'toggle' ? (getElementAttribute(ct,'aria-expanded','string') === 'true' ? 'collapse' : 'expand') : args[1]
				if (args[1] === 'expand' || args[1] === 'collapse') {
					const expand = (args[1] === 'expand').toString()
					target.forEach(t => {
						setElementAttribute(t,'aria-expanded',expand,'string')
						document.querySelectorAll(`[aria-controls="${t.id}"]`).forEach(c => {
							setElementAttribute(c,'aria-expanded',expand,'string')
						})
					})
					setElementAttribute(ct,'aria-expanded',expand,'string')
				}
				break
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
const doClickAction = function (event) {
	const selection = getSelection()
	if (!selection.isCollapsed && selection.containsNode(event.currentTarget,true)) { return }
	return doAction(event)
}
const doFocusAction = function (event) {
	return doAction(event,'focus')
}
const doUnfocusAction = function (event) {
	return doAction(event,'unfocus')
}
const isCurrentlyAvailable = function (start,end) {
	const now = Date.now()
	return (start ? new Date(start) <= now : true) && (end ? new Date(end) >= now : true)
}
const filtersChanged = function (event) {
	const show = [...skinArticles].filter(filterSkins).length === 0 ? true : false
	setElementVisibility(noSkins,show)
}
const filterSkins = function (skin) {
	const show = !((navAvailabilityCheckbox.checked && !getElementData(skin,'available','boolean')) || (navHeroSelect.value !== '' && navHeroSelect.value !== getElementData(skin,'hero','string')) || (navSearch.value !== '' && getElementData(skin,'name','string').toLowerCase().indexOf(navSearch.value.toLowerCase()) < 0))
	setElementVisibility(skin,show)
	return show
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
document.querySelectorAll('[data-action]').forEach(e => e.addEventListener('click',doClickAction))

// Hookup tooltips
document.querySelectorAll('[data-tooltip]').forEach(e => {
	e.addEventListener('focus',setTooltip)
	e.addEventListener('mouseenter',setTooltip)
	e.addEventListener('blur',unsetTooltip)
	e.addEventListener('mouseleave',unsetTooltip)
})