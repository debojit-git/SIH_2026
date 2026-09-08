document.addEventListener('DOMContentLoaded', () => {

  // 1. Retrieve User GPS Coordinates via Browser Geolocation API
  const locationInput = document.getElementById('location');
  if (locationInput && 'geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Pre-fill location field with GPS coordinates for proximity calculation
        locationInput.value = `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`;
      },
      (error) => {
        console.warn('Geolocation position unavailable:', error.message);
      }
    );
  }

  // 2. Submit Consultation Form to Python API without Page Reload
  const healthForm = document.querySelector('.health-form');
  if (healthForm) {
    healthForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const payload = {
        fullName: document.getElementById('fullName').value,
        location: document.getElementById('location').value,
        urgency: document.getElementById('urgency').value,
        records: document.getElementById('records').value
      };

      try {
        // Sends request to Python endpoint e.g., Flask route @app.route('/api/consultations', methods=['POST'])
        const response = await fetch('/api/consultations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          alert('Consultation registered successfully. Priority assigned.');
          healthForm.reset();
        } else {
          alert('Server error processing registration.');
        }
      } catch (error) {
        console.error('Network error:', error);
        alert('Could not connect to Python backend server.');
      }
    });
  }

  // 3. Dynamic Medicine Search Fetching Data from Backend
  const medicineInput = document.querySelector('#medicines input');
  const medicineBtn = document.querySelector('#medicines .btn-primary');
  const medicineTableBody = document.querySelector('#medicines tbody');

  const fetchMedicines = async () => {
    const query = medicineInput.value.trim();
    if (!query) return;

    try {
      // Sends request to Python endpoint e.g., Flask route @app.route('/api/medicines')
      const response = await fetch(`/api/medicines?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');

      const results = await response.json();
      
      // Clear standard fallback table content
      medicineTableBody.innerHTML = '';

      if (results.length === 0) {
        medicineTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No matching records found.</td></tr>';
        return;
      }

      // Render updated database rows dynamically
      results.forEach(item => {
        const row = document.createElement('tr');
        const badgeClass = item.in_stock ? 'in-stock' : 'out-of-stock';
        const badgeLabel = item.in_stock ? 'In Stock' : 'Out of Stock';

        row.innerHTML = `
          <td>${item.name}</td>
          <td>${item.generic_name}</td>
          <td><span class="badge ${badgeClass}">${badgeLabel}</span></td>
          <td>${item.facility}</td>
        `;
        medicineTableBody.appendChild(row);
      });
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  if (medicineBtn && medicineInput) {
    medicineBtn.addEventListener('click', fetchMedicines);
    medicineInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') fetchMedicines();
    });
  }

  // 4. Client-side Search Filter for Government Schemes
  const schemeInput = document.querySelector('#schemes input');
  const schemeCards = document.querySelectorAll('#schemes .card');

  if (schemeInput) {
    schemeInput.addEventListener('input', () => {
      const filter = schemeInput.value.toLowerCase();
      schemeCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(filter) ? 'block' : 'none';
      });
    });
  }

});