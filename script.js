
const binKey = "66a2105facd3cb34a86b0992";
const url = `https://api.jsonbin.io/v3/b/${binKey}`;
const masterKey = "$2a$10$5ZAzX/lKUBNARJDm/6x91uq7TqMfzZYhiu/TwIjK9nWOazJ28lhCK";

document.addEventListener("DOMContentLoaded", async function() {
  const customers = await loadCustomers();
  renderCustomerList(customers);
});

async function loadCustomers() {
  try {
    const response = await axios.get(`${url}/latest`, {
      headers: {
        'X-Master-Key': masterKey
      }
    });
    return response.data.record.customers;
  } catch (error) {
    console.error('Error loading customers:', error.response ? error.response.data : error.message);
    return [];
  }
}

function renderCustomerList(customers) {
  const customersDiv = document.getElementById('customers');
  customersDiv.innerHTML = customers.map((customer, index) => `
    <div id="customer-${index}" class="customer-card col-12 col-md-6 mb-4" style="padding-left: 20px;">
      <h2>${customer.name}</h2>
      <p style="padding-left: 20px;">Email: ${customer.email}</p>
      <p style="padding-left: 20px;">Phone: ${customer.phone}</p>
      <p style="padding-left: 20px;">Address: ${customer.address.street}, ${customer.address.city}, ${customer.address.postal_code}</p>
      <h3 style="padding-left: 20px;">Orders:</h3>
      <ul style="padding-left: 20px;">
        ${customer.orders && Array.isArray(customer.orders) && customer.orders.length > 0 
          ? customer.orders.map(order => `
            <li>
              ${order.product} - Quantity: ${order.quantity} - Price per unit: $${order.price_per_unit} - Date: ${order.order_date}
            </li>
          `).join('')
          : '<li>No orders</li>'
        }
      </ul>
      <div style="padding-left: 20px;">
      <button class="btn btn-warning edit" data-customerid="${index}">Edit</button>
      <button class="btn btn-warning delete" data-customerid="${index}">Delete</button>
    </div>
      </div>
  `).join('');

  attachCustomerEventListeners(customers);
  console.log(customers)
}

function attachCustomerEventListeners(customers) {
  let allEditButtons = document.querySelectorAll(".edit");
  for (let button of allEditButtons) {
    button.addEventListener("click", function(event) {
      let customerId = Number(event.target.dataset.customerid);
      editCustomer(customers, customerId);
    });
  }

  let allDeleteButtons = document.querySelectorAll(".delete");
  for (let button of allDeleteButtons) {
    button.addEventListener("click", async function(event) {
      let customerId = Number(event.target.dataset.customerid);
      await deleteCustomer(customerId);
      const customers = await loadCustomers(); // Fetch latest customers
      renderCustomerList(customers);
    });
  }
}

document.getElementById('customerForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const formData = {
    id: document.getElementById('customerIndex').value || generateUniqueId(),
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    address: {
      street: document.getElementById('street').value,
      city: document.getElementById('city').value,
      postal_code: document.getElementById('postal_code').value
    },
    orders: [] // Assuming initially no orders
  };

  let customers = await loadCustomers();
  const customerIndex = document.getElementById('customerIndex').value;
  if (customerIndex) {
    customers[customerIndex] = formData;
  } else {
    customers.push(formData);
  }

  await saveCustomers(customers);

  document.getElementById('customerForm').reset();
  document.getElementById('customerIndex').value = '';
  customers = await loadCustomers(); // Fetch latest customers
  renderCustomerList(customers);
});

function generateUniqueId() {
  return '_' + Math.floor(Math.random() * 1000 + 1);
}

function editCustomer(customers, index) {
  const customer = customers[index];
  document.getElementById('customerIndex').value = index;
  document.getElementById('name').value = customer.name;
  document.getElementById('email').value = customer.email;
  document.getElementById('phone').value = customer.phone;
  document.getElementById('street').value = customer.address.street;
  document.getElementById('city').value = customer.address.city;
  document.getElementById('postal_code').value = customer.address.postal_code;
  document.getElementById('newCustomerForm').scrollIntoView({ behavior: 'smooth' });
}

async function deleteCustomer(index) {
  let customers = await loadCustomers();
  const confirmDelete = confirm('Are you sure you want to delete this customer?');
  if (!confirmDelete) return;

  customers.splice(index, 1);
  await saveCustomers(customers);
}

async function saveCustomers(customers) {
  try {
    const response = await axios.put(url, { customers: customers }, {
      headers: {
        'X-Master-Key': masterKey,
        'Content-Type': 'application/json'
      }
    });

    console.log('Customers saved:', response.data);
  } catch (error) {
    console.error('Error saving customers:', error.response ? error.response.data : error.message);
  }
}
