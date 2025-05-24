document.addEventListener('DOMContentLoaded', function() {
  // Load API keys on page load
  loadApiKeys();

  // Handle form submission
  const addApiKeyForm = document.getElementById('addApiKeyForm');
  if (addApiKeyForm) {
    addApiKeyForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const data = {
        key: formData.get('key'),
        description: formData.get('description')
      };
      
      fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error); });
        }
        return response.json();
      })
      .then(() => {
        loadApiKeys();
        addApiKeyForm.reset();
      })
      .catch(error => {
        alert('Error: ' + error.message);
      });
    });
  }
});

function loadApiKeys() {
  const apiKeysList = document.getElementById('apiKeysList');
  if (!apiKeysList) return;

  apiKeysList.innerHTML = '<p>Loading API keys...</p>';

  fetch('/api/keys', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to load API keys');
    }
    return response.json();
  })
  .then(data => {
    if (data.keys.length === 0) {
      apiKeysList.innerHTML = '<p>No API keys found.</p>';
      return;
    }

    let html = `
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>API Key</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
    `;

    data.keys.forEach(apiKey => {
      html += `
        <tr>
          <td><code>${apiKey.key}</code></td>
          <td>${apiKey.description}</td>
          <td>
            <button class="btn btn-danger btn-sm delete-btn" data-key="${apiKey.key}">Delete</button>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    apiKeysList.innerHTML = html;

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', function() {
        const key = this.getAttribute('data-key');
        if (confirm(`Are you sure you want to delete the API key: ${key}?`)) {
          fetch(`/api/keys/${key}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to delete API key');
            }
            loadApiKeys();
          })
          .catch(error => {
            alert('Error: ' + error.message);
          });
        }
      });
    });
  })
  .catch(error => {
    apiKeysList.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
  });
}