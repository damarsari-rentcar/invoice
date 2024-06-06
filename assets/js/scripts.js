document.addEventListener("DOMContentLoaded", function () {
   const loginForm = document.getElementById("loginForm");
   const loginButton = document.getElementById("loginButton");
   const invoiceForm = document.getElementById("invoiceForm");
   const sendInvoiceButton = document.getElementById("sendInvoiceButton");

   if (loginForm && loginButton) {
      loginButton.addEventListener("click", function (event) {
         event.preventDefault();
         handleLogin();
      });
   }

   if (invoiceForm && sendInvoiceButton) {
      sendInvoiceButton.addEventListener("click", function (event) {
         event.preventDefault();
         handleInvoice();
      });
   }

   document.getElementById("carModel").addEventListener("change", updatePrice);
   document
      .getElementById("rentalDuration")
      .addEventListener("input", updatePrice);
});

const carPrices = {
   Alphard: 2500000,
   Fortuner: 1500000,
   Pajero: 1500000,
   "Innova zenix": 800000,
   "Innova reborn": 600000,
   Xpander: 500000,
   Terios: 500000,
   Rush: 500000,
   "Avanza Matic": 450000,
   "Avanza Manual": 350000,
   "Xenia Manual": 350000,
};

function updatePrice() {
   calculateTotal();
}

function calculateTotal() {
   const carModel = document.getElementById("carModel").value;
   const rentalDuration = document.getElementById("rentalDuration").value;

   if (carModel && rentalDuration) {
      const pricePerDay = carPrices[carModel];
      const totalCost = pricePerDay * rentalDuration;
      document.getElementById(
         "totalCost"
      ).value = `Rp${totalCost.toLocaleString()}`;
   } else {
      document.getElementById("totalCost").value = "";
   }
}

function handleInvoice() {
   const name = document.getElementById("name").value;
   const carModel = document.getElementById("carModel").value;
   const rentalDate = document.getElementById("rentalDate").value;
   const rentalDuration = document.getElementById("rentalDuration").value;
   const totalCost = document.getElementById("totalCost").value;
   const pricePerDay = carPrices[carModel];
   const recipientPhone = document.getElementById("recipientPhone").value;
   const formattedRecipientPhone = recipientPhone.replace(/^0/, "62");

   const mainMessage = `*Damarsari Rent Car*\n
========================
*INVOICE RENTAL MOBIL*
========================
\n*Nama Pelanggan*: ${name}
\n*Model Mobil*: ${carModel}
\n*Tanggal Rental*: ${rentalDate}
\n*Durasi Rental*: ${rentalDuration} hari
\n*Harga Sewa per Hari*: Rp${pricePerDay.toLocaleString()}
========================
\n*Total Biaya*: ${totalCost}
========================
Terima kasih telah menggunakan layanan kami.
Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami.

Best regards,
*Damarsari Rent Car*`;

   const contactInfo = `\n> Hubungi kami di: +62 877-8833-2232`;

   const message = mainMessage + contactInfo;

   const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedRecipientPhone}&text=${encodeURIComponent(
      message
   )}`;

   window.open(whatsappUrl, "_blank");
}

function handleLogin() {
   const username = document.getElementById("username").value;
   const password = document.getElementById("password").value;
   const hashedPassword = CryptoJS.SHA256(password).toString();

   const validUsers = {
      aldo: "c469aed97adf5d2bd3d2c0900e5b66ce114bcdd425f60bee72d78385048cf1bb",
      dias: "1ae09c800f9ba5c71fec37a91be3c23a65dfb666d1386c3dc1ab23415cdf51b4",
   };

   if (validUsers[username] && validUsers[username] === hashedPassword) {
      document.getElementById("loginPage").style.display = "none";
      document.getElementById("invoicePage").style.display = "block";
   } else {
      alert("Login gagal. Username atau password salah.");
   }
}
