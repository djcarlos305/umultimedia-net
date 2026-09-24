const vehicles = [
  {slug:'ford-f150',year:2022,make:'Ford',model:'F-150 XLT',type:'Truck',price:32900},
  {slug:'ford-transit',year:2021,make:'Ford',model:'Transit 250 Cargo',type:'Van',price:28900},
  {slug:'mercedes-sprinter',year:2020,make:'Mercedes-Benz',model:'Sprinter Passenger',type:'Van',price:38900},
  {slug:'honda-civic',year:2022,make:'Honda',model:'Civic Sedan',type:'Sedan',price:21900},
  {slug:'lexus-es350',year:2021,make:'Lexus',model:'ES 350',type:'Sedan',price:29900}
];
const $ = id => document.getElementById(id);
const copy = {
  en: {
    demo:'WEBSITE CONCEPT · INVENTORY, PRICES AND FINANCING FIGURES ARE EXAMPLES',brandSub:'DEALERSHIP',navInventory:'Inventory',eyebrow:'EXPLORE YOUR OPTIONS',pageTitle:'Vehicle payment calculator',intro:'Change the numbers to see an estimated monthly payment. No application or credit check is involved.',inputsTitle:'Estimate a payment',exampleTag:'Example figures',selectedVehicle:'Start with an example price, or choose a vehicle below.',priceLabel:'Vehicle price',downLabel:'Down payment',tradeLabel:'Trade-in value',owedLabel:'Amount owed on trade-in',feesLabel:'Estimated taxes & fees',aprLabel:'Estimated APR',termLabel:'Loan term',resultEyebrow:'YOUR ESTIMATE',perMonth:'Estimated per month',financedLabel:'Amount financed',interestLabel:'Total interest',totalLabel:'Total loan payments',disclaimer:'For illustration only. APR is entered by you, not an offer or approval from JKK. Taxes and fees are not included unless you enter them. Insurance, maintenance and other costs are not included. Confirm all terms with a lender or dealer.',callButton:'Call JKK · 786-405-5416',browseEyebrow:'KEEP EXPLORING',browseTitle:'Find another vehicle',browseCopy:'Search the sample inventory, then use a vehicle’s price in the calculator.',searchLabel:'Search vehicles',searchPlaceholder:'Search make, model, or type…',makeLabel:'Make',typeLabel:'Type',allMakes:'All makes',allTypes:'All types',clear:'Clear',empty:'No vehicles match your search.',footerText:'© 2026 JKK Auto Group · Website concept',count:n=>`${n} sample vehicle${n===1?'':'s'}`,term:n=>`${n} months`,typeNames:{Truck:'Truck',Van:'Van',Sedan:'Sedan'},view:'View details',usePrice:'Use this price',chosen:name=>`Estimating for: ${name} (sample listing)`,invalid:'Enter valid, nonnegative amounts and an APR from 0% to 40%.',negativeAmount:'The down payment and trade-in exceed the purchase amount. Please adjust the figures.'
  },
  es: {
    demo:'CONCEPTO DE SITIO WEB · INVENTARIO, PRECIOS Y CIFRAS FINANCIERAS SON EJEMPLOS',brandSub:'CONCESIONARIO',navInventory:'Inventario',eyebrow:'EXPLORA TUS OPCIONES',pageTitle:'Calculadora de pagos de auto',intro:'Cambia los números para ver un pago mensual estimado. No se envía solicitud ni se consulta tu crédito.',inputsTitle:'Calcula un pago',exampleTag:'Cifras de ejemplo',selectedVehicle:'Comienza con un precio de ejemplo o elige un vehículo abajo.',priceLabel:'Precio del vehículo',downLabel:'Pago inicial',tradeLabel:'Valor de tu auto a cambio',owedLabel:'Saldo pendiente del auto a cambio',feesLabel:'Impuestos y cargos estimados',aprLabel:'APR estimada',termLabel:'Plazo del préstamo',resultEyebrow:'TU ESTIMADO',perMonth:'Pago mensual estimado',financedLabel:'Monto a financiar',interestLabel:'Intereses totales',totalLabel:'Total de pagos del préstamo',disclaimer:'Solo para fines ilustrativos. Tú ingresas la APR; no representa una oferta ni aprobación de JKK. No se incluyen impuestos ni cargos a menos que los ingreses. Tampoco incluye seguro, mantenimiento u otros costos. Confirma todos los términos con el prestamista o concesionario.',callButton:'Llama a JKK · 786-405-5416',browseEyebrow:'SIGUE EXPLORANDO',browseTitle:'Busca otro vehículo',browseCopy:'Busca en el inventario de muestra y usa el precio de otro vehículo en la calculadora.',searchLabel:'Buscar vehículos',searchPlaceholder:'Busca por marca, modelo o tipo…',makeLabel:'Marca',typeLabel:'Tipo',allMakes:'Todas las marcas',allTypes:'Todos los tipos',clear:'Borrar filtros',empty:'Ningún vehículo coincide con la búsqueda.',footerText:'© 2026 JKK Auto Group · Concepto de sitio web',count:n=>`${n} vehículo${n===1?'':'s'} de muestra`,term:n=>`${n} meses`,typeNames:{Truck:'Camioneta',Van:'Van',Sedan:'Sedán'},view:'Ver detalles',usePrice:'Usar este precio',chosen:name=>`Estimado para: ${name} (vehículo de muestra)`,invalid:'Ingresa montos válidos que no sean negativos y una APR entre 0 % y 40 %.',negativeAmount:'El pago inicial y el valor del auto a cambio superan el importe de compra. Ajusta las cifras.'
  }
};
const params = new URLSearchParams(location.search);
let language = params.get('lang') === 'es' ? 'es' : 'en';
let selected = vehicles.find(v => v.slug === params.get('vehicle')) || null;
const money = n => new Intl.NumberFormat(language === 'es' ? 'es-US' : 'en-US', {style:'currency',currency:'USD'}).format(n);
const fields = ['price','down','trade','tradeOwed','taxFees','apr'];

function calculate() {
  const values = Object.fromEntries(fields.map(id => [id, $(id).value.trim() === '' ? NaN : Number($(id).value)]));
  values.months = Number($('months').value);
  let error = '';
  if (fields.some(id => !Number.isFinite(values[id]) || values[id] < 0 || values[id] > (id === 'apr' ? 40 : 1000000))) error = copy[language].invalid;
  const result = error ? null : estimateLoan(values);
  if (!error && result.error) error = copy[language][result.error];
  $('error').hidden = !error;
  $('error').textContent = error;
  $('payment').textContent = error ? '—' : money(result.monthly);
  $('financed').textContent = error ? '—' : money(result.amount);
  $('interest').textContent = error ? '—' : money(result.interest);
  $('total').textContent = error ? '—' : money(result.total);
}

function searchCars() {
  const t = copy[language], q = $('search').value.trim().toLocaleLowerCase(), make = $('make').value, type = $('type').value;
  const matches = vehicles.filter(v => (!make || v.make === make) && (!type || v.type === type) && (!q || `${v.year} ${v.make} ${v.model} ${v.type} ${t.typeNames[v.type]}`.toLocaleLowerCase().includes(q)));
  $('count').textContent = t.count(matches.length);
  $('empty').hidden = matches.length > 0;
  $('carGrid').innerHTML = matches.map(v => `<article class="carCard"><a href="vehicles/${v.slug}.html${language==='es'?'?lang=es':''}" aria-label="${t.view}: ${v.year} ${v.make} ${v.model}"><img src="assets/vehicles/${v.slug}-front.webp" alt="${v.year} ${v.make} ${v.model}" loading="lazy"></a><div class="carBody"><h3>${v.year} ${v.make} ${v.model}</h3><p>${money(v.price)}</p><div class="carActions"><a href="vehicles/${v.slug}.html${language==='es'?'?lang=es':''}">${t.view}</a><button type="button" data-slug="${v.slug}">${t.usePrice}</button></div></div></article>`).join('');
}

function choose(v) {
  selected = v;
  $('price').value = String(v.price);
  params.set('vehicle',v.slug);
  history.replaceState(null,'',`${location.pathname}?${params.toString()}#calculator`);
  $('selectedVehicle').textContent = copy[language].chosen(`${v.year} ${v.make} ${v.model}`);
  calculate();
  $('calculator').scrollIntoView({behavior:'smooth',block:'start'});
}

function translate() {
  const t = copy[language];
  document.documentElement.lang = language;
  document.title = `${t.pageTitle} | JKK Auto Group`;
  document.querySelector('meta[name="description"]').content = language === 'es' ? 'Calcula pagos estimados y busca vehículos de muestra de JKK Auto Group.' : 'Explore estimated payments and sample JKK Auto Group vehicles.';
  for (const [id,text] of Object.entries(t)) if (typeof text === 'string' && $(id)) $(id).textContent = text;
  $('selectedVehicle').textContent = selected ? t.chosen(`${selected.year} ${selected.make} ${selected.model}`) : t.selectedVehicle;
  $('search').placeholder = t.searchPlaceholder;
  $('make').options[0].textContent = t.allMakes;
  $('type').options[0].textContent = t.allTypes;
  [...$('type').options].slice(1).forEach(option => option.textContent = t.typeNames[option.value]);
  [...$('months').options].forEach(option => option.textContent = t.term(option.value));
  $('langToggle').textContent = language === 'es' ? 'ENGLISH' : 'ESPAÑOL';
  $('langToggle').setAttribute('aria-label', language === 'es' ? 'View in English' : 'Ver en español');
  const home = `./${language === 'es' ? '?lang=es' : ''}`;
  $('brand').href = home;
  $('navInventory').href = `${home}#inventory`;
  calculate();searchCars();
}

[...new Set(vehicles.map(v => v.make))].sort().forEach(make => $('make').add(new Option(make,make)));
if (selected) $('price').value = String(selected.price);
$('calculator').addEventListener('input', calculate);
$('months').addEventListener('change', calculate);
$('search').addEventListener('input', searchCars);
$('make').addEventListener('change', searchCars);
$('type').addEventListener('change', searchCars);
$('clear').addEventListener('click', () => { $('search').value = ''; $('make').value = ''; $('type').value = ''; searchCars(); });
$('carGrid').addEventListener('click', event => { const button = event.target.closest('button[data-slug]'); if (button) choose(vehicles.find(v => v.slug === button.dataset.slug)); });
$('langToggle').addEventListener('click', () => { language = language === 'en' ? 'es' : 'en'; if (language === 'es') params.set('lang','es'); else params.delete('lang'); history.replaceState(null,'',`${location.pathname}${params.toString()?'?'+params.toString():''}${location.hash}`); translate(); });
translate();
