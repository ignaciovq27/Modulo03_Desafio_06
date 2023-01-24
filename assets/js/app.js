const formulario = document.querySelector("#formulario")
const monto = document.querySelector("#monto")
const selectMoneda = document.querySelector("#selectMoneda")
const resultado = document.querySelector("#resultado")
const cargando = document.querySelector("#cargando")
const google = document.querySelector("#google")

let chart

// mostrar resultado en la pagina
resultado.innerHTML = "'Esperando conversión...'"

// Crear una Promise de prueba, con timer
// const fakeLoading = () =>
// new Promise((resolve) => setTimeout(() => resolve(), 3000))

// Hacer submit en el formulario
formulario.addEventListener("submit", (e) => {
  e.preventDefault()
  getMonedas()
})

async function getMonedas() {
  const montoUsuario = monto.value;
  const monedaUsuario = selectMoneda.value;
  try {
    // llamar a la promise y luego realizar la consulta a la API
    // await (fakeLoading())
    // cargando.innerHTML = "Cargando..."
    const apiURL = "https://mindicador.cl/api/";
    const res = await fetch(apiURL);
    const dataMonedas = await res.json();
    console.log(dataMonedas)

    resultado.innerHTML = "Resultado: $" + montoUsuario * dataMonedas[monedaUsuario].valor
    if (montoUsuario == "") throw "is Empty";
    return dataMonedas;
  }
  catch (error) {
    // console.log(error);
    // console.log("error en getMonedas");
    resultado.innerHTML = error;
    resultado.innerHTML = "Error en conversión: No ha seleccionado moneda de cambio.";

  } finally {
    cargando.innerHTML = "";
    if(selectMoneda.value){
      renderGrafica()
    }
  }
}

// Resetear el formulario
formulario.addEventListener("reset", (e) => {
  resultado.innerHTML = "'Esperando conversión...'"
  console.log("me diste click al reset")
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
  // Creamos las variables necesarias para el objeto de configuración
  const tipoDeGrafica = "line";
  const fechasEstaditicas = dataValues['serie'].map((fechas) => {
    const fecha = fechas.fecha
    const dia = (new Date(fecha).getDate()) < 10 ? "0"+(new Date(fecha).getDate()) : (new Date(fecha).getDate())
    const mes = (new Date(fecha).getMonth() + 1) < 10 ? "0"+(new Date(fecha).getMonth() + 1) : (new Date(fecha).getMonth() + 1)
    const año = new Date(fecha).getFullYear()

    return  dia + "/" + mes + "/" + año
  });
  const cantidadFechas = fechasEstaditicas.slice(0, 10);

  const titulo = "Historial Values últimas 10 fechas de " + selectMoneda.value;
  const colorDeLinea = "blue";

  const valores = dataValues['serie'].map((valores) => {
    return valores.valor;
  });
  const cantidadValores = valores.slice(0, 10);

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
          pointRadius: 6,
          pointHoverRadius: 15
        }
      ]
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