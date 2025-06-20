Highcharts.chart('container1', {
    chart: { type: 'line' },
    title: { text: 'Prediksi Curah Hujan 7 Hari ke Depan' },
    subtitle: { text: 'Berdasarkan Model LSTM' },
    xAxis: {
        title: { text: 'Hari ke-' },
        categories: []
    },
    yAxis: {
        title: { text: 'Persentase Curah Hujan (%)' },
        max: 100
    },
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
    },
    plotOptions: {
        series: { label: { connectorAllowed: false } }
    },
    series: [{
        name: '% Curah Hujan',
        data: []
    }],
    noData: {
        style: { fontWeight: 'bold', fontSize: '16px', color: '#303030' }
    },
    lang: {
        noData: "Tidak ada data untuk ditampilkan"
    },
    responsive: [{
        condition: { maxWidth: 500 },
        chartOptions: {
            legend: {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom'
            }
        }
    }]
});

let chart = Highcharts.charts[0];

// Fungsi untuk membaca CSV dari S3
function getForecastCSV() {
    $.ajax({
        url: 'https://lstm-model-predict.s3.amazonaws.com/output/hasil_predict.csv',
        type: 'GET',
        dataType: 'text',
        success: function (csvText) {
            const parsedData = parseCSV(csvText);
            drawForecast(parsedData);
            drawTable(parsedData);
        },
        error: function (xhr, status, error) {
            console.error('Gagal memuat CSV:', status, error);
        }
    });
}

// Parse CSV manual ke array objek
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const [hari, persen] = lines[i].split(',');
        result.push({
            "Hari ke": parseInt(hari.trim()),
            "Persentase Curah Hujan (%)": parseFloat(persen.trim())
        });
    }

    return result;
}

function drawForecast(data) {
    const hariKe = data.map(item => item["Hari ke"]);
    const persenCurahHujan = data.map(item => item["Persentase Curah Hujan (%)"]);

    chart.xAxis[0].setCategories(hariKe);
    chart.series[0].setData(persenCurahHujan, true);
}

function drawTable(data) {
    const tableContainer = document.getElementById('table-container');
    tableContainer.innerHTML = '';

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Hari ke-', 'Persentase Curah Hujan (%)'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        th.style.border = '1px solid #ddd';
        th.style.padding = '8px';
        th.style.backgroundColor = '#f2f2f2';
        th.style.textAlign = 'center';
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach(item => {
        const tr = document.createElement('tr');

        const tdHari = document.createElement('td');
        tdHari.textContent = item["Hari ke"];
        tdHari.style.border = '1px solid #ddd';
        tdHari.style.padding = '8px';
        tdHari.style.textAlign = 'center';

        const tdPersen = document.createElement('td');
        tdPersen.textContent = item["Persentase Curah Hujan (%)"].toFixed(2) + " %";
        tdPersen.style.border = '1px solid #ddd';
        tdPersen.style.padding = '8px';
        tdPersen.style.textAlign = 'center';

        tr.appendChild(tdHari);
        tr.appendChild(tdPersen);
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);
}

// Panggil saat halaman siap
$(document).ready(() => {
    getForecastCSV();
});
