document.addEventListener('DOMContentLoaded', function() {
  const annualEl = document.getElementById('annualDonations')
  if (annualEl) {
    if (annualEl.dataset.donations) {
      const annualData = JSON.parse(annualEl.dataset.donations)

  new Chart(annualEl, {
    type: 'line',
    data: {
      labels: Object.keys(annualData),
      datasets: [{
        label: 'Annual Donations',
        data: Object.values(annualData),
        fill: false,
        borderColor: '#008c9e',
        tension: 0.1
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
  }
})
