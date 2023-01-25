const formulario = document.querySelector("#formulario")
const monto = document.querySelector("#monto")
const selectMoneda = document.querySelector("#selectMoneda")
const resultado = document.querySelector("#resultado")
const cargando = document.querySelector("#cargando")
const google = document.querySelector("#google")
const icon = document.getElementById("icon")
const title = document.getElementById("title")

let chart

// mostrar resultado en la pagina
resultado.innerHTML = "'Esperando conversión...'"

// Hacer submit en el formulario
formulario.addEventListener("submit", (e) => {
  e.preventDefault()
  getMonedas()
})

async function getMonedas() {
  const montoUsuario = monto.value;
  const monedaUsuario = selectMoneda.value;
  try {
    const apiURL = "https://mindicador.cl/api/";
    const res = await fetch(apiURL);
    const dataMonedas = await res.json();
    console.log(dataMonedas)
    const operacion = (montoUsuario / dataMonedas[monedaUsuario].valor).toString()
    resultadoAcortado = operacion.slice(0,8)

    resultado.innerHTML = "Resultado: $" + resultadoAcortado + " " + monedaUsuario
    if (montoUsuario == "") throw "is Empty";
    return dataMonedas;
  }
  catch (error) {
    resultado.classList.add("text-danger")
    resultado.innerHTML = error;
    resultado.innerHTML = "Error en conversión: No ha seleccionado moneda de cambio  ";
    icon.classList.add("fa-solid", "fa-circle-xmark", "fa-shake", "text-danger", "px-2")

  } finally {
    cargando.innerHTML = "";
    if (selectMoneda.value) {
      renderGrafica()
      resultado.classList.remove("text-danger", "text-secondary")
      resultado.classList.add("text-primary", "p-4")

      icon.classList.remove("fa-solid", "fa-circle-xmark", "fa-shake", "text-danger", "px-2")
      icon.classList.add("fa-solid", "fa-circle-check", "fa-beat", "text-primary")

      let titleMoneda = monedaUsuario
      title.innerHTML = "Gráfico de moneda: " + titleMoneda.toUpperCase();
    }
  }
}

// Resetear el formulario
formulario.addEventListener("reset", (e) => {
  resultado.innerHTML = "'Esperando conversión...'"

  resultado.classList.remove("text-primary", "text-danger", "text-warning")
  icon.classList.remove("fa-solid", "fa-circle-check", "fa-beat", "text-primary")
  icon.classList.remove("fa-solid", "fa-circle-xmark", "fa-shake", "text-danger", "px-2")

  resultado.classList.add("text-secondary")
  title.innerHTML = ""

  if (chart) {
    chart.destroy();
  }
})

async function getValues() {
  try {
    const apiURL = "https://mindicador.cl/api/" + selectMoneda.value;
    const res = await fetch(apiURL);
    const dataValues = await res.json();
    console.log(dataValues)
    return dataValues;
  }
  catch (e) {
    alert(e.message);
  }
}

function prepararConfiguracionParaLaGrafica(dataValues) {
  const data = dataValues['serie']?.reverse()
  // Creamos las variables necesarias para el objeto de configuración
  const tipoDeGrafica = "line";
  const fechasEstaditicas = data.map((fechas) => {
    const fecha = fechas.fecha
    const dia = (new Date(fecha).getDate()) < 10 ? "0" + (new Date(fecha).getDate()) : (new Date(fecha).getDate())
    const mes = (new Date(fecha).getMonth() + 1) < 10 ? "0" + (new Date(fecha).getMonth() + 1) : (new Date(fecha).getMonth() + 1)
    const año = new Date(fecha).getFullYear()

    return dia + "/" + mes + "/" + año
  });
  const cantidadFechas = fechasEstaditicas.slice(21, 31);

  const titulo = "Historial últimas 10 fechas de " + selectMoneda.value;
  const colorDeLinea = "blue";

  const valores = data.map((valores) => {
    return valores.valor;
  });
  const cantidadValores = valores.slice(21, 31);

  // Creamos el objeto de configuración usando las variables anteriores
  const config = {
    type: tipoDeGrafica,
    data: {
      labels: cantidadFechas,
      datasets: [
        {
          label: titulo,
          data: cantidadValores,
          backgroundColor: colorDeLinea,
          pointStyle: 'circle',
          pointRadius: 10,
          pointHoverRadius: 15
        }
      ]
    },
    options: {
      plugins: {
          legend: {
              labels: {
                  // This more specific font property overrides the global property
                  font: {
                      size: 18
                  }
              }
          }
      }
  }
  };
  return config;
}

async function renderGrafica() {

  const dataValues = await getValues();
  const config = prepararConfiguracionParaLaGrafica(dataValues);
  const chartDOM = document.getElementById("myChart");

  console.log(chart)
  if (chart) {
    chart.destroy();
  }

  chart = new Chart(chartDOM, config);
  console.log(chart.id)
}
// renderGrafica();

selectMoneda.addEventListener("change", (e) => {
  console.log(e.target.value)
})