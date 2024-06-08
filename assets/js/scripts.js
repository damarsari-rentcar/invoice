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
         if (validateForm()) {
            handleInvoice();
         }
      });
   }

   document.getElementById("carModel").addEventListener("change", updatePrice);
   document
      .getElementById("rentalDuration")
      .addEventListener("input", updatePrice);
   document.getElementById("name").addEventListener("input", validateName);
   document
      .getElementById("recipientPhone")
      .addEventListener("input", validatePhone);

   function displayError(element, message) {
      element.textContent = message;
      element.style.display = "block";
      element.style.fontFamily = "Arial, sans-serif";
      element.style.fontSize = "12px";
      element.style.color = "red";
      element.style.marginTop = "10px";
      element.style.textAlign = "center";
      element.style.fontWeight = "bold";
   }

   function clearError(element) {
      element.style.display = "none";
   }

   function validateName() {
      const name = document.getElementById("name").value;
      const errorMessageName = document.getElementById("error-message");

      if (!name) {
         clearError(errorMessageName);
      } else if (!/^[A-Za-z\s]+$/.test(name)) {
         displayError(errorMessageName, "Nama hanya boleh mengandung huruf.");
      } else {
         clearError(errorMessageName);
      }
   }

   function validatePhone() {
      const recipientPhone = document.getElementById("recipientPhone").value;
      const errorMessage = document.getElementById("error-message");

      if (!recipientPhone) {
         clearError(errorMessage);
         return false;
      } else if (
         recipientPhone.match(/^0|^\+62/) &&
         recipientPhone.match(/^\d{9,14}$/)
      ) {
         clearError(errorMessage);
         return true;
      } else {
         displayError(
            errorMessage,
            "Nomor telepon harus dimulai dengan '0' atau '+62' dan memiliki panjang antara 9 hingga 14 digit."
         );
         return false;
      }
   }

   function validateForm() {
      const name = document.getElementById("name").value;
      const carModel = document.getElementById("carModel").value;
      const rentalDate = document.getElementById("rentalDate").value;
      const rentalDuration = document.getElementById("rentalDuration").value;
      const recipientPhoneValid = validatePhone();
      const errorMessage = document.getElementById("error-message");

      if (
         name &&
         carModel &&
         rentalDate &&
         rentalDuration &&
         recipientPhoneValid
      ) {
         clearError(errorMessage);
         return true;
      } else {
         displayError(
            errorMessage,
            "Mohon lengkapi semua input sebelum mengirimkan invoice."
         );
         return false;
      }
   }

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
      const formattedRentalDate = formatDate(rentalDate);
      const rentalDuration = document.getElementById("rentalDuration").value;
      const totalCost = document.getElementById("totalCost").value;
      const pricePerDay = carPrices[carModel];
      const recipientPhone = document.getElementById("recipientPhone").value;
      const formattedRecipientPhone = recipientPhone.replace(/^0/, "62");

      const message = `*Damarsari Rent Car*\n
========================
*e-INVOICE RENTAL MOBIL*
========================
\nNama Pelanggan : *${name}*
\nModel Mobil : *${carModel}*
\nTanggal Rental : *${formattedRentalDate}* 
\nDurasi Rental : *${rentalDuration}* *hari*
\nHarga Sewa per Hari : *Rp* *${pricePerDay.toLocaleString()}*
\n========================
Total Biaya : *${totalCost}*
========================
\nTerima kasih telah menggunakan layanan kami.
Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami.

Hubungi kami di: +62 877-8833-2232

Best regards,
*Damarsari Rent Car*`;

      const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedRecipientPhone}&text=${encodeURIComponent(
         message
      )}`;

      window.open(whatsappUrl, "_blank");
   }

   function formatDate(date) {
      const options = {
         weekday: "long",
         year: "numeric",
         month: "long",
         day: "numeric",
      };
      const [year, month, day] = date.split("-");
      const formattedDate = new Date(year, month - 1, day).toLocaleDateString(
         "id-ID",
         options
      );
      return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
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

         let greeting = "";
         if (username === "aldo") {
            greeting = "Hallo, Geraldo";
         } else if (username === "dias") {
            greeting = "Hallo, Dias";
         }

         if (greeting !== "") {
            const greetingElement = document.createElement("p");
            greetingElement.textContent = greeting;
            greetingElement.style.fontWeight = "bold";
            greetingElement.style.fontSize = "1.2em";
            greetingElement.style.marginBottom = "4px";
            document
               .getElementById("invoicePage")
               .insertBefore(
                  greetingElement,
                  document.getElementById("invoiceForm")
               );

            const inputDataMessage = document.createElement("p");
            inputDataMessage.textContent = "Silahkan input data";
            document
               .getElementById("invoicePage")
               .insertBefore(
                  inputDataMessage,
                  document.getElementById("invoiceForm")
               );
         }
      } else {
         alert("Login gagal. Username atau password salah.");
      }
   }
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
