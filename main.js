document.addEventListener("DOMContentLoaded", function() {
    const costoBrutoInput = document.getElementById("costoBruto")
    const precioVentaInput = document.getElementById("precioVenta")
    const calcularBtn = document.getElementById("calcularBtn")
    const buscarProductoBtn = document.getElementById("buscarProductoBtn")
    const costoTotalOutput = document.getElementById("costoTotal")
    const margenBrutoOutput = document.getElementById("margenBruto")
    const margenVentaOutput = document.getElementById("margenVenta")
    const plataformaInput = document.getElementById("plataforma")
    const comisionesPlataforma = {
        "Mercado Libre": 0.17,
        "Mercado Shops": 0.027,
    };
    const rangosColores = [
        { limiteSuperior: 10, color: 'red' },
        { limiteInferior: 10, limiteSuperior: 20, color: 'yellow' },
        { limiteInferior: 20, color: 'green' }
    ];

    let productos = []
    let myChart

    function cargarProductos() {
        fetch('productos.json')
            .then(response => response.json())
            .then(data => productos = data)
            .catch(error => console.error('Error al cargar los productos:', error))
    }

    function buscarProductoPorCodigo(codigo) {
        return productos.find(p => p.codigo === codigo)
    }

    function mostrarInformacionProducto(producto) {
        let resultadoDiv = document.getElementById('resultado')
        let margen = producto.costoBruto - producto.costoNeto
        let contenido = `
            <h3>Producto Encontrado: ${producto.detalle}</h3>
            <p>Código: ${producto.codigo}</p>
            <p>Costo Neto: $${producto.costoNeto}</p>
            <p>Costo Bruto: $${producto.costoBruto}</p>
            <p>Margen: $${margen}</p>
        `
        resultadoDiv.innerHTML = contenido
    }

    function mostrarMensajeProductoNuevo() {
        let resultadoDiv = document.getElementById('resultado')
        resultadoDiv.innerHTML = '<h3>Producto Nuevo</h3>'
    }

    function verificarProducto() {
        const codigo = document.getElementById('codigoProducto').value
        const producto = buscarProductoPorCodigo(codigo)
        if (producto) {
            mostrarInformacionProducto(producto)
        } else {
            mostrarMensajeProductoNuevo()
        }
    }

    function calcularMargen() {
        let costoBruto = parseFloat(costoBrutoInput.value) || 0
        let precioVenta = parseFloat(precioVentaInput.value) || 0
        let nombrePlataforma = plataformaInput.value
        let comision = comisionesPlataforma[nombrePlataforma] || 0
        let despacho = precioVenta >= 16990 ? 3500 : 0
        let additionalAmount = precioVenta - 16990

        if (additionalAmount > 0) {
            let increaseSteps = Math.floor(additionalAmount / 10000);
            despacho += 500 * increaseSteps
        }

        let costoTotal = costoBruto + despacho + (precioVenta * comision)
        let margenBruto = precioVenta - costoTotal
        let margenVenta = (margenBruto / precioVenta) * 100

        costoTotalOutput.textContent = formatNumber(costoTotal.toFixed(2))
        margenBrutoOutput.textContent = formatNumber(margenBruto.toFixed(2))
        margenVentaOutput.textContent = formatNumber(margenVenta.toFixed(2)) + '%'

        actualizarColoresMargen(margenVenta)
        crearGrafico(costoBruto, precioVenta, margenBruto)
    }

    function actualizarColoresMargen(margenVenta) {
        let colorSeleccionado = 'black'
        for (let rango of rangosColores) {
            if (margenVenta < rango.limiteSuperior || (rango.limiteInferior && margenVenta >= rango.limiteInferior)) {
                colorSeleccionado = rango.color
                break
            }
        }
        margenVentaOutput.style.color = colorSeleccionado
    }

    function crearGrafico(costoBruto, precioVenta, margenBruto) {
        var ctx = document.getElementById('margenGrafico').getContext('2d')
        if (myChart) {
            myChart.destroy()
        }
        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Costo Bruto', 'Precio Venta', 'Margen Bruto'],
                datasets: [{
                    label: 'Análisis de Margen',
                    backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(75, 192, 192)'],
                    borderColor: 'rgb(255, 255, 255)',
                    data: [costoBruto, precioVenta, margenBruto],
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function formatNumber(num) {
        return '$' + parseFloat(num).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    }

    calcularBtn.addEventListener("click", calcularMargen)
    buscarProductoBtn.addEventListener("click", verificarProducto)
    cargarProductos()
})